import Maintenance from '../models/Maintenance.js';
import Vehicle from '../models/Vehicle.js';
import Expense from '../models/Expense.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getMaintenanceRecords = async (req, res, next) => {
  try {
    const { status, vehicleId, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role !== 'super_admin') {
      filter.organizationId = req.organizationId;
    }

    if (status) filter.status = status;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      Maintenance.find(filter)
        .populate('vehicleId', 'registrationNumber make model currentOdometer status')
        .populate('assignedStaffId', 'name email role')
        .sort({ scheduledDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Maintenance.countDocuments(filter),
    ]);

    const statsAgg = await Maintenance.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 }, totalCost: { $sum: '$cost' } } },
    ]);
    const summary = { TOTAL: total, SCHEDULED: 0, IN_PROGRESS: 0, COMPLETED: 0, OVERDUE: 0, totalSpend: 0 };
    statsAgg.forEach((s) => {
      if (summary[s._id] !== undefined) summary[s._id] = s.count;
      summary.totalSpend += s.totalCost || 0;
    });

    return sendSuccess(res, { records, total, page: Number(page), pages: Math.ceil(total / limit), summary });
  } catch (err) {
    next(err);
  }
};

export const createMaintenanceRecord = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'super_admin' ? (req.body.organizationId || req.organizationId) : req.organizationId;
    if (!orgId) return sendError(res, 'Organization ID is required', 400);

    const record = await Maintenance.create({
      ...req.body,
      organizationId: orgId,
    });

    // If marked IN_PROGRESS, set vehicle status to MAINTENANCE
    if (record.status === 'IN_PROGRESS') {
      await Vehicle.findByIdAndUpdate(record.vehicleId, { status: 'MAINTENANCE' });
    }

    return sendSuccess(res, record, 'Maintenance order scheduled', 201);
  } catch (err) {
    next(err);
  }
};

export const updateMaintenanceRecord = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) return sendError(res, 'Maintenance record not found', 404);

    if (req.user.role !== 'super_admin' && record.organizationId.toString() !== req.organizationId.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    const prevStatus = record.status;
    Object.assign(record, req.body);

    if (req.body.status === 'COMPLETED' && !record.completedDate) {
      record.completedDate = new Date();
      // Restore vehicle status back to AVAILABLE
      await Vehicle.findByIdAndUpdate(record.vehicleId, { status: 'AVAILABLE' });

      // Automatically post to Expense ledger if cost > 0
      if (record.cost > 0) {
        await Expense.create({
          organizationId: record.organizationId,
          category: 'MAINTENANCE',
          amount: record.cost,
          date: record.completedDate,
          vehicleId: record.vehicleId,
          description: `Maintenance: ${record.description} (${record.serviceType})`,
          receiptNumber: record.invoiceNumber || `INV-MNT-${Date.now()}`,
          status: 'APPROVED',
        });
      }
    } else if (req.body.status === 'IN_PROGRESS') {
      await Vehicle.findByIdAndUpdate(record.vehicleId, { status: 'MAINTENANCE' });
    }

    await record.save();
    return sendSuccess(res, record, 'Maintenance record updated');
  } catch (err) {
    next(err);
  }
};

export const deleteMaintenanceRecord = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) return sendError(res, 'Maintenance record not found', 404);

    if (req.user.role !== 'super_admin' && record.organizationId.toString() !== req.organizationId.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    await Maintenance.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Maintenance record deleted');
  } catch (err) {
    next(err);
  }
};
