import FuelRecord from '../models/FuelRecord.js';
import Vehicle from '../models/Vehicle.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getFuelRecords = async (req, res, next) => {
  try {
    const { vehicleId, driverId, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role !== 'super_admin') {
      filter.organizationId = req.organizationId;
    }

    if (vehicleId) filter.vehicleId = vehicleId;
    if (driverId) filter.driverId = driverId;

    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      FuelRecord.find(filter)
        .populate('vehicleId', 'registrationNumber make model')
        .populate('driverId', 'name phone')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      FuelRecord.countDocuments(filter),
    ]);

    // Fuel metrics summary
    const summaryAgg = await FuelRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalLiters: { $sum: '$quantityLiters' },
          totalCost: { $sum: '$totalCost' },
          avgEfficiency: { $avg: '$efficiencyKmPerL' },
        },
      },
    ]);

    const summary = summaryAgg[0] || { totalLiters: 0, totalCost: 0, avgEfficiency: 0 };
    summary.avgCostPerLiter = summary.totalLiters > 0 ? (summary.totalCost / summary.totalLiters).toFixed(2) : 0;
    summary.avgEfficiency = summary.avgEfficiency ? Number(summary.avgEfficiency.toFixed(2)) : 0;

    return sendSuccess(res, { records, total, page: Number(page), pages: Math.ceil(total / limit), summary });
  } catch (err) {
    next(err);
  }
};

export const createFuelRecord = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'super_admin' ? (req.body.organizationId || req.organizationId) : req.organizationId;
    if (!orgId) return sendError(res, 'Organization ID is required', 400);

    const { vehicleId, quantityLiters, costPerLiter, totalCost, odometerReading } = req.body;
    const finalTotal = totalCost || (Number(quantityLiters) * Number(costPerLiter));

    // Calculate efficiency against previous odometer
    const previousRecord = await FuelRecord.findOne({ vehicleId }).sort({ date: -1 });
    let efficiencyKmPerL = 4.2; // default
    if (previousRecord && Number(odometerReading) > previousRecord.odometerReading) {
      const distance = Number(odometerReading) - previousRecord.odometerReading;
      efficiencyKmPerL = Number((distance / Number(quantityLiters)).toFixed(2));
    }

    const record = await FuelRecord.create({
      ...req.body,
      organizationId: orgId,
      totalCost: finalTotal,
      efficiencyKmPerL,
    });

    if (odometerReading) {
      await Vehicle.findByIdAndUpdate(vehicleId, { currentOdometer: Number(odometerReading) });
    }

    return sendSuccess(res, record, 'Fuel entry logged successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const deleteFuelRecord = async (req, res, next) => {
  try {
    const record = await FuelRecord.findById(req.params.id);
    if (!record) return sendError(res, 'Fuel record not found', 404);

    if (req.user.role !== 'super_admin' && record.organizationId.toString() !== req.organizationId.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    await FuelRecord.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Fuel record deleted');
  } catch (err) {
    next(err);
  }
};
