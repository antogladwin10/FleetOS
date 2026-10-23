import AuditLog from '../models/AuditLog.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

// ─── GET /api/v1/audit-logs ───────────────────────────────────────────────────
export const getAuditLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    // Non-super-admins only see their org's logs
    if (req.user.role !== 'super_admin') {
      filter.organizationId = req.organizationId;
    } else if (req.query.organizationId) {
      filter.organizationId = req.query.organizationId;
    }

    if (req.query.action) filter.action = req.query.action;
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.resource) filter.resource = req.query.resource;

    // Date range
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email role'),
      AuditLog.countDocuments(filter),
    ]);

    return sendPaginated(res, logs, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/audit-logs/:id ──────────────────────────────────────────────
export const getAuditLog = async (req, res, next) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate('userId', 'name email role');
    if (!log) return sendError(res, 'Audit log not found', 404);

    if (req.user.role !== 'super_admin') {
      if (log.organizationId?.toString() !== req.organizationId?.toString()) {
        return sendError(res, 'Access denied', 403);
      }
    }

    return sendSuccess(res, { log });
  } catch (err) {
    next(err);
  }
};
