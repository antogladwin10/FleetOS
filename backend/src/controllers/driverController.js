import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import Attendance from '../models/Attendance.js';
import Payroll from '../models/Payroll.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getDrivers = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role !== 'super_admin') {
      filter.organizationId = req.organizationId;
    }

    // If driver role, restrict to own profile
    if (req.user.role === 'driver') {
      filter.userId = req.user._id;
    }

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [drivers, total] = await Promise.all([
      Driver.find(filter)
        .populate('assignedVehicleId', 'registrationNumber make model status type')
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Driver.countDocuments(filter),
    ]);

    const statsFilter = req.user.role === 'super_admin' ? {} : { organizationId: req.organizationId };
    const stats = await Driver.aggregate([
      { $match: statsFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const summary = { TOTAL: total, AVAILABLE: 0, ON_DUTY: 0, ON_TRIP: 0, ON_LEAVE: 0 };
    stats.forEach((s) => {
      if (summary[s._id] !== undefined) summary[s._id] = s.count;
    });

    return sendSuccess(res, { drivers, total, page: Number(page), pages: Math.ceil(total / limit), summary });
  } catch (err) {
    next(err);
  }
};

export const getDriverMe = async (req, res, next) => {
  try {
    let driver = await Driver.findOne({ userId: req.user._id }).populate('assignedVehicleId');
    if (!driver && req.user.driverProfileId) {
      driver = await Driver.findById(req.user.driverProfileId).populate('assignedVehicleId');
    }
    if (!driver) {
      // Return first driver of organization if not explicitly linked in dev
      driver = await Driver.findOne({ organizationId: req.organizationId }).populate('assignedVehicleId');
    }
    if (!driver) return sendError(res, 'Driver profile not found', 404);

    const todayStr = new Date().toISOString().split('T')[0];
    const [activeTrip, todayAttendance, recentTrips, latestPayroll] = await Promise.all([
      Trip.findOne({ driverId: driver._id, status: { $in: ['IN_PROGRESS', 'SCHEDULED'] } }).populate('vehicleId'),
      Attendance.findOne({ driverId: driver._id, date: todayStr }),
      Trip.find({ driverId: driver._id }).sort({ scheduledDeparture: -1 }).limit(5).populate('vehicleId'),
      Payroll.findOne({ driverId: driver._id }).sort({ year: -1, month: -1 }),
    ]);

    return sendSuccess(res, { driver, activeTrip, todayAttendance, recentTrips, latestPayroll });
  } catch (err) {
    next(err);
  }
};

export const getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('assignedVehicleId');
    if (!driver) return sendError(res, 'Driver not found', 404);

    if (req.user.role !== 'super_admin' && driver.organizationId.toString() !== req.organizationId.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    const [recentTrips, recentAttendance, recentPayrolls] = await Promise.all([
      Trip.find({ driverId: driver._id }).sort({ scheduledDeparture: -1 }).limit(5).populate('vehicleId'),
      Attendance.find({ driverId: driver._id }).sort({ date: -1 }).limit(10),
      Payroll.find({ driverId: driver._id }).sort({ year: -1, month: -1 }).limit(3),
    ]);

    return sendSuccess(res, { driver, recentTrips, recentAttendance, recentPayrolls });
  } catch (err) {
    next(err);
  }
};

export const createDriver = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'super_admin' ? (req.body.organizationId || req.organizationId) : req.organizationId;
    if (!orgId) return sendError(res, 'Organization ID is required', 400);

    const driver = await Driver.create({
      ...req.body,
      organizationId: orgId,
    });

    if (driver.assignedVehicleId) {
      await Vehicle.findByIdAndUpdate(driver.assignedVehicleId, { assignedDriverId: driver._id });
    }

    return sendSuccess(res, driver, 'Driver registered successfully', 201);
  } catch (err) {
    if (err.code === 11000) {
      return sendError(res, 'A driver with this license number already exists', 409);
    }
    next(err);
  }
};

export const updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return sendError(res, 'Driver not found', 404);

    if (req.user.role !== 'super_admin' && driver.organizationId.toString() !== req.organizationId.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    const prevVehicleId = driver.assignedVehicleId?.toString();
    Object.assign(driver, req.body);
    await driver.save();

    if (req.body.assignedVehicleId !== undefined) {
      const newVehicleId = req.body.assignedVehicleId ? req.body.assignedVehicleId.toString() : null;
      if (prevVehicleId && prevVehicleId !== newVehicleId) {
        await Vehicle.findByIdAndUpdate(prevVehicleId, { assignedDriverId: null });
      }
      if (newVehicleId) {
        await Vehicle.findByIdAndUpdate(newVehicleId, { assignedDriverId: driver._id });
      }
    }

    return sendSuccess(res, driver, 'Driver profile updated');
  } catch (err) {
    next(err);
  }
};

export const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return sendError(res, 'Driver not found', 404);

    if (req.user.role !== 'super_admin' && driver.organizationId.toString() !== req.organizationId.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    if (driver.assignedVehicleId) {
      await Vehicle.findByIdAndUpdate(driver.assignedVehicleId, { assignedDriverId: null });
    }

    await Driver.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Driver removed successfully');
  } catch (err) {
    next(err);
  }
};
