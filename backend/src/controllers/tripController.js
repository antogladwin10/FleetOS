import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Expense from '../models/Expense.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getTrips = async (req, res, next) => {
  try {
    const { status, vehicleId, driverId, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role !== 'super_admin') {
      filter.organizationId = req.organizationId;
    }

    if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ userId: req.user._id });
      if (driver) filter.driverId = driver._id;
    } else if (driverId) {
      filter.driverId = driverId;
    }

    if (status) filter.status = status;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (search) {
      filter.$or = [
        { tripNumber: { $regex: search, $options: 'i' } },
        { 'origin.name': { $regex: search, $options: 'i' } },
        { 'destination.name': { $regex: search, $options: 'i' } },
        { 'cargoDetails.clientName': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .populate('vehicleId', 'registrationNumber make model status type')
        .populate('driverId', 'name phone licenseNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Trip.countDocuments(filter),
    ]);

    const statsFilter = req.user.role === 'super_admin' ? {} : { organizationId: req.organizationId };
    const stats = await Trip.aggregate([
      { $match: statsFilter },
      { $group: { _id: '$status', count: { $sum: 1 }, totalRevenue: { $sum: '$revenue' }, totalProfit: { $sum: '$netProfit' } } },
    ]);
    const summary = { TOTAL: total, SCHEDULED: 0, IN_PROGRESS: 0, COMPLETED: 0, DELAYED: 0, CANCELLED: 0, revenue: 0, profit: 0 };
    stats.forEach((s) => {
      if (summary[s._id] !== undefined) summary[s._id] = s.count;
      summary.revenue += s.totalRevenue || 0;
      summary.profit += s.totalProfit || 0;
    });

    return sendSuccess(res, { trips, total, page: Number(page), pages: Math.ceil(total / limit), summary });
  } catch (err) {
    next(err);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicleId')
      .populate('driverId');
    if (!trip) return sendError(res, 'Trip not found', 404);

    if (req.user.role !== 'super_admin' && trip.organizationId.toString() !== req.organizationId.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    const expenses = await Expense.find({ tripId: trip._id });
    return sendSuccess(res, { trip, expenses });
  } catch (err) {
    next(err);
  }
};

export const createTrip = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'super_admin' ? (req.body.organizationId || req.organizationId) : req.organizationId;
    if (!orgId) return sendError(res, 'Organization ID is required', 400);

    const count = await Trip.countDocuments({ organizationId: orgId });
    const tripNumber = `TRP-2026-${String(1001 + count).padStart(4, '0')}`;

    const trip = await Trip.create({
      ...req.body,
      tripNumber: req.body.tripNumber || tripNumber,
      organizationId: orgId,
    });

    return sendSuccess(res, trip, 'Trip scheduled successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const startTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return sendError(res, 'Trip not found', 404);

    trip.status = 'IN_PROGRESS';
    trip.actualDeparture = new Date();
    await trip.save();

    await Promise.all([
      Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'ON_TRIP' }),
      Driver.findByIdAndUpdate(trip.driverId, { status: 'ON_TRIP' }),
    ]);

    return sendSuccess(res, trip, 'Trip started and fleet status updated to ON_TRIP');
  } catch (err) {
    next(err);
  }
};

export const completeTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return sendError(res, 'Trip not found', 404);

    const { endOdometer, actualDistanceKm, revenue, fuelCost, tollCost, otherCosts } = req.body;

    const distance = Number(actualDistanceKm) || trip.distanceKm || 250;
    const finalRevenue = Number(revenue) || trip.revenue || 28000;
    const finalFuel = Number(fuelCost) || trip.fuelCost || Math.round(distance * 36);
    const finalToll = Number(tollCost) || trip.tollCost || Math.round(distance * 5);
    const driverCost = trip.driverCost || 1500;
    const maintenanceAlloc = Math.round(distance * 4);
    const finalOther = Number(otherCosts) || trip.otherCosts || 400;

    const totalCost = finalFuel + finalToll + driverCost + maintenanceAlloc + finalOther;
    const netProfit = finalRevenue - totalCost;
    const profitMargin = Math.round((netProfit / finalRevenue) * 100);

    trip.status = 'COMPLETED';
    trip.actualArrival = new Date();
    trip.endOdometer = Number(endOdometer) || (trip.startOdometer + distance);
    trip.distanceKm = distance;
    trip.revenue = finalRevenue;
    trip.fuelCost = finalFuel;
    trip.tollCost = finalToll;
    trip.maintenanceAllocation = maintenanceAlloc;
    trip.otherCosts = finalOther;
    trip.totalCost = totalCost;
    trip.netProfit = netProfit;
    trip.profitMarginPercent = profitMargin;
    await trip.save();

    // Release vehicle and driver back to AVAILABLE
    await Promise.all([
      Vehicle.findByIdAndUpdate(trip.vehicleId, {
        status: 'AVAILABLE',
        currentOdometer: trip.endOdometer,
      }),
      Driver.findByIdAndUpdate(trip.driverId, {
        status: 'AVAILABLE',
        $inc: { totalTripsCompleted: 1 },
      }),
    ]);

    return sendSuccess(res, trip, 'Trip marked completed and financial profitability calculated');
  } catch (err) {
    next(err);
  }
};

export const cancelTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return sendError(res, 'Trip not found', 404);

    trip.status = 'CANCELLED';
    await trip.save();

    await Promise.all([
      Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'AVAILABLE' }),
      Driver.findByIdAndUpdate(trip.driverId, { status: 'AVAILABLE' }),
    ]);

    return sendSuccess(res, trip, 'Trip cancelled');
  } catch (err) {
    next(err);
  }
};
