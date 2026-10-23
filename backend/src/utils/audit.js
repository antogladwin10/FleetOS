import AuditLog from '../models/AuditLog.js';

/**
 * Creates an audit log entry.
 * Never throws — audit failures should not break request flow.
 */
export const createAuditLog = async ({
  organizationId = null,
  userId = null,
  userEmail = null,
  userRole = null,
  action,
  resource = null,
  resourceId = null,
  description = null,
  meta = null,
  ipAddress = null,
  userAgent = null,
  status = 'success',
}) => {
  try {
    await AuditLog.create({
      organizationId,
      userId,
      userEmail,
      userRole,
      action,
      resource,
      resourceId,
      description,
      meta,
      ipAddress,
      userAgent,
      status,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to create audit log:', err.message);
  }
};

/**
 * Extract IP from request (handles proxies)
 */
export const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.socket?.remoteAddress ||
  null;
