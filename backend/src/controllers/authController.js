import User from '../models/User.js';
import Organization from '../models/Organization.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  cookieOptions,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE,
} from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';
import { createAuditLog, getClientIp } from '../utils/audit.js';

// ─── Helper ──────────────────────────────────────────────────────────────────
const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('access_token', accessToken, cookieOptions(ACCESS_COOKIE_MAX_AGE));
  res.cookie('refresh_token', refreshToken, cookieOptions(REFRESH_COOKIE_MAX_AGE));
};

const clearAuthCookies = (res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
};

const buildTokenPayload = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  organizationId: user.organizationId,
});

// ─── POST /auth/register ──────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  if (handleValidationErrors(req, res)) return;
  try {
    const { name, email, password, role, organizationId } = req.body;

    // Only super_admin can create super_admin or org_admin without an org
    const requestingUser = req.user; // may be undefined (public registration)

    if (role === 'super_admin') {
      if (!requestingUser || requestingUser.role !== 'super_admin') {
        return sendError(res, 'Only super admins can create super admin accounts', 403);
      }
    }

    // If organizationId provided, verify it exists
    if (organizationId) {
      const org = await Organization.findById(organizationId);
      if (!org) return sendError(res, 'Organization not found', 404);
      if (org.status !== 'active') return sendError(res, 'Organization is not active', 403);

      // Non-super-admins can only create users in their own org
      if (requestingUser && requestingUser.role !== 'super_admin') {
        if (requestingUser.organizationId?.toString() !== organizationId) {
          return sendError(res, 'Cannot create users in another organization', 403);
        }
      }
    }

    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 'Email already registered', 409);

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'fleet_manager',
      organizationId: organizationId || null,
    });

    const accessToken = signAccessToken(buildTokenPayload(user));
    const refreshToken = signRefreshToken({ id: user._id });

    // Store refresh token hash (store raw for simplicity; rotate on each use)
    user.refreshTokens = [refreshToken];
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    setAuthCookies(res, accessToken, refreshToken);

    await createAuditLog({
      organizationId: user.organizationId,
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'user.register',
      resource: 'user',
      resourceId: user._id,
      description: `User registered: ${user.email}`,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
    });

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
        accessToken,
      },
      'Registration successful',
      201
    );
  } catch (err) {
    next(err);
  }
};

// ─── POST /auth/login ─────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  if (handleValidationErrors(req, res)) return;
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user) return sendError(res, 'Invalid email or password', 401);

    if (user.status !== 'active') {
      return sendError(res, 'Account is not active. Contact your administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await createAuditLog({
        organizationId: user.organizationId,
        userId: user._id,
        userEmail: user.email,
        action: 'user.login.failed',
        description: 'Invalid password attempt',
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
        status: 'failure',
      });
      return sendError(res, 'Invalid email or password', 401);
    }

    const accessToken = signAccessToken(buildTokenPayload(user));
    const refreshToken = signRefreshToken({ id: user._id });

    // Keep up to 5 refresh tokens (multi-device)
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    setAuthCookies(res, accessToken, refreshToken);

    await createAuditLog({
      organizationId: user.organizationId,
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'user.login',
      description: `User logged in: ${user.email}`,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
    });

    return sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        lastLogin: user.lastLogin,
      },
      accessToken,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// ─── POST /auth/logout ────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.signedCookies?.refresh_token;

    if (req.user && refreshToken) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: refreshToken },
      });
    }

    clearAuthCookies(res);

    if (req.user) {
      await createAuditLog({
        organizationId: req.user.organizationId,
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'user.logout',
        description: `User logged out: ${req.user.email}`,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
      });
    }

    return sendSuccess(res, {}, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

// ─── POST /auth/refresh ───────────────────────────────────────────────────────
export const refreshTokens = async (req, res, next) => {
  try {
    const token = req.signedCookies?.refresh_token || req.body?.refreshToken;
    if (!token) return sendError(res, 'Refresh token required', 401);

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      clearAuthCookies(res);
      return sendError(res, 'Invalid or expired refresh token', 401);
    }

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user) {
      clearAuthCookies(res);
      return sendError(res, 'User not found', 401);
    }

    // Token rotation — verify token is in user's list
    if (!user.refreshTokens.includes(token)) {
      // Possible token reuse attack — revoke all
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      clearAuthCookies(res);
      return sendError(res, 'Token reuse detected. All sessions revoked.', 401);
    }

    if (user.status !== 'active') {
      clearAuthCookies(res);
      return sendError(res, 'Account is not active', 403);
    }

    const newAccessToken = signAccessToken(buildTokenPayload(user));
    const newRefreshToken = signRefreshToken({ id: user._id });

    // Rotate: remove old, add new
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens = [...user.refreshTokens.slice(-4), newRefreshToken];
    await user.save({ validateBeforeSave: false });

    setAuthCookies(res, newAccessToken, newRefreshToken);

    return sendSuccess(res, { accessToken: newAccessToken }, 'Tokens refreshed');
  } catch (err) {
    next(err);
  }
};

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('organizationId', 'name slug subscriptionPlan status');
    if (!user) return sendError(res, 'User not found', 404);

    return sendSuccess(res, { user }, 'User profile');
  } catch (err) {
    next(err);
  }
};

// ─── PUT /auth/me ─────────────────────────────────────────────────────────────
export const updateMe = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    return sendSuccess(res, { user }, 'Profile updated');
  } catch (err) {
    next(err);
  }
};

// ─── PUT /auth/change-password ────────────────────────────────────────────────
export const changePassword = async (req, res, next) => {
  if (handleValidationErrors(req, res)) return;
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password +refreshTokens');
    if (!user) return sendError(res, 'User not found', 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return sendError(res, 'Current password is incorrect', 401);

    user.password = newPassword;
    user.refreshTokens = []; // invalidate all sessions
    await user.save();

    clearAuthCookies(res);

    await createAuditLog({
      organizationId: user.organizationId,
      userId: user._id,
      userEmail: user.email,
      action: 'user.password_changed',
      description: 'Password changed — all sessions invalidated',
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
    });

    return sendSuccess(res, {}, 'Password changed. Please log in again.');
  } catch (err) {
    next(err);
  }
};
