import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';
import { createAuditLog, getClientIp } from '../utils/audit.js';

// ─── POST /api/v1/organizations ──────────────────────────────────────────────
export const createOrganization = async (req, res, next) => {
  if (handleValidationErrors(req, res)) return;
  try {
    const org = await Organization.create({
      ...req.body,
      createdBy: req.user._id,
    });

    await createAuditLog({
      organizationId: org._id,
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'organization.create',
      resource: 'organization',
      resourceId: org._id,
      description: `Organization created: ${org.name}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, { organization: org }, 'Organization created', 201);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/organizations ────────────────────────────────────────────────
export const getOrganizations = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.plan) filter.subscriptionPlan = req.query.plan;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { slug: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [organizations, total] = await Promise.all([
      Organization.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Organization.countDocuments(filter),
    ]);

    return sendPaginated(res, organizations, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/organizations/:id ───────────────────────────────────────────
export const getOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return sendError(res, 'Organization not found', 404);

    // Non-super admins can only view their own org
    if (req.user.role !== 'super_admin') {
      if (org._id.toString() !== req.organizationId?.toString()) {
        return sendError(res, 'Access denied', 403);
      }
    }

    return sendSuccess(res, { organization: org });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/v1/organizations/:id ───────────────────────────────────────────
export const updateOrganization = async (req, res, next) => {
  if (handleValidationErrors(req, res)) return;
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return sendError(res, 'Organization not found', 404);

    if (req.user.role !== 'super_admin') {
      if (org._id.toString() !== req.organizationId?.toString()) {
        return sendError(res, 'Access denied', 403);
      }
    }

    // Prevent non-super-admins from changing subscription fields
    if (req.user.role !== 'super_admin') {
      delete req.body.subscriptionPlan;
      delete req.body.subscriptionStatus;
      delete req.body.subscriptionExpiry;
      delete req.body.maxVehicles;
      delete req.body.maxDrivers;
      delete req.body.maxUsers;
      delete req.body.status;
    }

    const updated = await Organization.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      organizationId: org._id,
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'organization.update',
      resource: 'organization',
      resourceId: org._id,
      description: `Organization updated: ${org.name}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, { organization: updated }, 'Organization updated');
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/v1/organizations/:id ────────────────────────────────────────
export const deleteOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return sendError(res, 'Organization not found', 404);

    // Soft-delete — set status to cancelled
    org.status = 'cancelled';
    await org.save();

    await createAuditLog({
      organizationId: org._id,
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'organization.delete',
      resource: 'organization',
      resourceId: org._id,
      description: `Organization soft-deleted: ${org.name}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {}, 'Organization deactivated');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/organizations/:id/users ─────────────────────────────────────
export const getOrganizationUsers = async (req, res, next) => {
  try {
    const orgId = req.params.id;

    if (req.user.role !== 'super_admin') {
      if (orgId !== req.organizationId?.toString()) {
        return sendError(res, 'Access denied', 403);
      }
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { organizationId: orgId };
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return sendPaginated(res, users, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};
