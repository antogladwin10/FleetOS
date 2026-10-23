import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { sendError } from '../utils/response.js';

/**
 * authenticate — verifies access token from signed cookie or Authorization header.
 * Attaches req.user and req.organizationId.
 */
export const authenticate = async (req, res, next) => {
  // Preflight OPTIONS requests never include authentication credentials
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    let token = null;

    // 1. Signed cookie (preferred)
    if (req.signedCookies?.access_token) {
      token = req.signedCookies.access_token;
    }
    // 2. Bearer header fallback
    else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required', 401);
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!user) {
      return sendError(res, 'User not found', 401);
    }

    if (user.status !== 'active') {
      return sendError(res, 'Account is not active', 403);
    }

    // Check if password changed after token was issued
    if (user.passwordChangedAfter(decoded.iat)) {
      return sendError(res, 'Password recently changed. Please log in again.', 401);
    }

    req.user = user;
    req.organizationId = user.organizationId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Access token expired', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid access token', 401);
    }
    next(err);
  }
};

/**
 * authorize — checks that req.user has one of the allowed roles.
 * Must be called after authenticate.
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions', 403);
    }
    next();
  };
};

/**
 * requireSameOrg — ensures the requesting user belongs to the same organization
 * as the resource being accessed (identified by req.params.orgId or req.body.organizationId).
 * Super admins bypass this check.
 */
export const requireSameOrg = (req, res, next) => {
  if (req.user.role === 'super_admin') return next();

  const targetOrgId =
    req.params.orgId || req.params.organizationId || req.body.organizationId;

  if (targetOrgId && targetOrgId.toString() !== req.organizationId?.toString()) {
    return sendError(res, 'Access denied: cross-organization request', 403);
  }
  next();
};

/**
 * Shorthand role sets
 */
export const ROLES = {
  ALL: ['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance', 'analyst'],
  ADMINS: ['super_admin', 'org_admin'],
  MANAGERS: ['super_admin', 'org_admin', 'fleet_manager'],
  OPERATIONS: ['super_admin', 'org_admin', 'fleet_manager', 'maintenance_staff', 'maintenance'],
  READ_ONLY: ['super_admin', 'org_admin', 'fleet_manager', 'analyst'],
};
