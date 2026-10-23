import User from '../models/User.js';
import Driver from '../models/Driver.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createAuditLog, getClientIp } from '../utils/audit.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role !== 'super_admin') {
      filter.organizationId = req.organizationId;
    }

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('organizationId', 'name slug subscriptionPlan')
        .populate('driverProfileId', 'licenseNumber assignedVehicleId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('organizationId', 'name slug subscriptionPlan')
      .populate('driverProfileId');
    if (!user) return sendError(res, 'User not found', 404);

    if (req.user.role !== 'super_admin' && user.organizationId?.toString() !== req.organizationId?.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, organizationId } = req.body;

    const orgId = req.user.role === 'super_admin' ? (organizationId || req.organizationId) : req.organizationId;
    if (!orgId && role !== 'super_admin') {
      return sendError(res, 'Organization is required for tenant users', 400);
    }

    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 'User with this email already exists', 409);

    const user = await User.create({
      name,
      email,
      password: password || 'FleetOS@1234',
      role: role || 'fleet_manager',
      phone,
      organizationId: orgId || null,
      status: 'active',
    });

    await createAuditLog({
      organizationId: user.organizationId,
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'USER_CREATED',
      resource: 'User',
      resourceId: user._id,
      description: `Created new user ${user.email} (${user.role})`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, user, 'User account provisioned successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);

    if (req.user.role !== 'super_admin' && user.organizationId?.toString() !== req.organizationId?.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    const { name, phone, role, status } = req.body;
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role && (req.user.role === 'super_admin' || req.user.role === 'org_admin')) user.role = role;
    if (status) user.status = status;

    await user.save();

    await createAuditLog({
      organizationId: user.organizationId,
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'USER_UPDATED',
      resource: 'User',
      resourceId: user._id,
      description: `Updated user profile ${user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, user, 'User updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);

    if (req.user.role !== 'super_admin' && user.organizationId?.toString() !== req.organizationId?.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'Cannot delete your own active session account', 400);
    }

    await User.findByIdAndDelete(req.params.id);

    await createAuditLog({
      organizationId: user.organizationId,
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'USER_DELETED',
      resource: 'User',
      resourceId: user._id,
      description: `Deleted user ${user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, null, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
};
