import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Maintenance from '../models/Maintenance.js';
import FuelRecord from '../models/FuelRecord.js';
import Trip from '../models/Trip.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getVehicles = async (req, res, next) => {
  try {
    const { status, type, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role !== 'super_admin') {
      filter.organizationId = req.organizationId;
    }

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter)
        .populate('assignedDriverId', 'name phone licenseNumber status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Vehicle.countDocuments(filter),
    ]);

    // Summary statistics
    const statsFilter = req.user.role === 'super_admin' ? {} : { organizationId: req.organizationId };
    const stats = await Vehicle.aggregate([
      { $match: statsFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const summary = {
      TOTAL: total,
      AVAILABLE: 0,
      ON_TRIP: 0,
      MAINTENANCE: 0,
      INACTIVE: 0,
    };
    stats.forEach((s) => {
      if (summary[s._id] !== undefined) summary[s._id] = s.count;
    });

    return sendSuccess(res, { vehicles, total, page: Number(page), pages: Math.ceil(total / limit), summary });
  } catch (err) {
    next(err);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('assignedDriverId', 'name phone licenseNumber status rating');
    if (!vehicle) return sendError(res, 'Vehicle not found', 404);

    if (req.user.role !== 'super_admin' && vehicle.organizationId.toString() !== req.organizationId.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    // Attach recent maintenance, fuel, and trip histories
    const [recentMaintenance, recentFuel, recentTrips] = await Promise.all([
      Maintenance.find({ vehicleId: vehicle._id }).sort({ scheduledDate: -1 }).limit(5),
      FuelRecord.find({ vehicleId: vehicle._id }).sort({ date: -1 }).limit(5),
      Trip.find({ vehicleId: vehicle._id }).sort({ scheduledDeparture: -1 }).limit(5),
    ]);

    return sendSuccess(res, { vehicle, recentMaintenance, recentFuel, recentTrips });
  } catch (err) {
    next(err);
  }
};

export const createVehicle = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'super_admin' ? (req.body.organizationId || req.organizationId) : req.organizationId;
    if (!orgId) return sendError(res, 'Organization ID is required', 400);

    const vehicle = await Vehicle.create({
      ...req.body,
      organizationId: orgId,
    });

    // If driver is assigned, link bidirectional
    if (vehicle.assignedDriverId) {
      await Driver.findByIdAndUpdate(vehicle.assignedDriverId, { assignedVehicleId: vehicle._id });
    }

    return sendSuccess(res, vehicle, 'Vehicle created successfully', 201);
  } catch (err) {
    if (err.code === 11000) {
      return sendError(res, 'A vehicle with this registration number already exists', 409);
    }
    next(err);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return sendError(res, 'Vehicle not found', 404);

    if (req.user.role !== 'super_admin' && vehicle.organizationId.toString() !== req.organizationId.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    const previousDriverId = vehicle.assignedDriverId?.toString();
    Object.assign(vehicle, req.body);
    await vehicle.save();

    // Handle driver assignment changes
    if (req.body.assignedDriverId !== undefined) {
      const newDriverId = req.body.assignedDriverId ? req.body.assignedDriverId.toString() : null;
      if (previousDriverId && previousDriverId !== newDriverId) {
        await Driver.findByIdAndUpdate(previousDriverId, { assignedVehicleId: null });
      }
      if (newDriverId) {
        await Driver.findByIdAndUpdate(newDriverId, { assignedVehicleId: vehicle._id });
      }
    }

    return sendSuccess(res, vehicle, 'Vehicle updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return sendError(res, 'Vehicle not found', 404);

    if (req.user.role !== 'super_admin' && vehicle.organizationId.toString() !== req.organizationId.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    if (vehicle.assignedDriverId) {
      await Driver.findByIdAndUpdate(vehicle.assignedDriverId, { assignedVehicleId: null });
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Vehicle deleted successfully');
  } catch (err) {
    next(err);
  }
};
