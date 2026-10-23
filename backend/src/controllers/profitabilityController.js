import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import FuelRecord from '../models/FuelRecord.js';
import Maintenance from '../models/Maintenance.js';
import Expense from '../models/Expense.js';
import { sendSuccess } from '../utils/response.js';

export const getProfitabilityOverview = async (req, res, next) => {
  try {
    const filter = req.user.role === 'super_admin' ? {} : { organizationId: req.organizationId };

    // 1. Overall Aggregates from Completed Trips
    const tripMetrics = await Trip.aggregate([
      { $match: { ...filter, status: 'COMPLETED' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' },
          totalFuelCost: { $sum: '$fuelCost' },
          totalTollCost: { $sum: '$tollCost' },
          totalDriverCost: { $sum: '$driverCost' },
          totalMaintenanceAlloc: { $sum: '$maintenanceAllocation' },
          totalOtherCost: { $sum: '$otherCosts' },
          totalCost: { $sum: '$totalCost' },
          totalNetProfit: { $sum: '$netProfit' },
          totalDistanceKm: { $sum: '$distanceKm' },
          tripCount: { $sum: 1 },
        },
      },
    ]);

    const m = tripMetrics[0] || {
      totalRevenue: 0,
      totalFuelCost: 0,
      totalTollCost: 0,
      totalDriverCost: 0,
      totalMaintenanceAlloc: 0,
      totalOtherCost: 0,
      totalCost: 0,
      totalNetProfit: 0,
      totalDistanceKm: 0,
      tripCount: 0,
    };

    const overallMargin = m.totalRevenue > 0 ? Number(((m.totalNetProfit / m.totalRevenue) * 100).toFixed(1)) : 0;
    const revPerKm = m.totalDistanceKm > 0 ? Number((m.totalRevenue / m.totalDistanceKm).toFixed(2)) : 0;
    const costPerKm = m.totalDistanceKm > 0 ? Number((m.totalCost / m.totalDistanceKm).toFixed(2)) : 0;
    const profitPerKm = m.totalDistanceKm > 0 ? Number((m.totalNetProfit / m.totalDistanceKm).toFixed(2)) : 0;

    // 2. Vehicle-Level Profitability Breakdown
    const vehicles = await Vehicle.find(filter).select('registrationNumber make model type currentOdometer purchaseCost purchaseDate status');
    const vehiclePnl = [];

    for (const v of vehicles) {
      const [vTrips, vFuel, vMaint] = await Promise.all([
        Trip.aggregate([
          { $match: { vehicleId: v._id, status: 'COMPLETED' } },
          { $group: { _id: null, rev: { $sum: '$revenue' }, dist: { $sum: '$distanceKm' }, toll: { $sum: '$tollCost' }, driver: { $sum: '$driverCost' } } },
        ]),
        FuelRecord.aggregate([
          { $match: { vehicleId: v._id } },
          { $group: { _id: null, totalFuel: { $sum: '$totalCost' }, liters: { $sum: '$quantityLiters' } } },
        ]),
        Maintenance.aggregate([
          { $match: { vehicleId: v._id, status: 'COMPLETED' } },
          { $group: { _id: null, totalMaint: { $sum: '$cost' } } },
        ]),
      ]);

      const rev = vTrips[0]?.rev || 0;
      const dist = vTrips[0]?.dist || (v.currentOdometer > 0 ? v.currentOdometer : 1);
      const fuel = vFuel[0]?.totalFuel || Math.round(dist * 34);
      const maint = vMaint[0]?.totalMaint || Math.round(dist * 4.5);
      const toll = vTrips[0]?.toll || Math.round(dist * 5);
      const driver = vTrips[0]?.driver || Math.round(dist * 6);
      const insurance = 45000; // annual apportioned
      const totalOpCost = fuel + maint + toll + driver + insurance;
      const netProfit = rev - totalOpCost;
      const margin = rev > 0 ? Number(((netProfit / rev) * 100).toFixed(1)) : 0;

      // TCO Calculation: Purchase Cost + Lifetime Fuel + Lifetime Maintenance + Insurance/Tolls
      const tco = (v.purchaseCost || 2500000) + fuel + maint + (toll * 1.5) + (insurance * 2);
      const lifetimeROI = tco > 0 ? Number(((rev / tco) * 100).toFixed(1)) : 0;

      vehiclePnl.push({
        vehicleId: v._id,
        registrationNumber: v.registrationNumber,
        model: `${v.make} ${v.model}`,
        type: v.type,
        distanceKm: dist,
        revenue: rev,
        fuelCost: fuel,
        maintenanceCost: maint,
        tollCost: toll,
        totalCost: totalOpCost,
        netProfit,
        profitMarginPercent: margin,
        costPerKm: Number((totalOpCost / dist).toFixed(2)),
        profitPerKm: Number((netProfit / dist).toFixed(2)),
        fuelCostPerKm: Number((fuel / dist).toFixed(2)),
        maintenanceCostPerKm: Number((maint / dist).toFixed(2)),
        tco,
        lifetimeROI,
      });
    }

    return sendSuccess(res, {
      kpis: {
        totalRevenue: m.totalRevenue,
        totalCost: m.totalCost,
        netProfit: m.totalNetProfit,
        profitMarginPercent: overallMargin,
        totalDistanceKm: m.totalDistanceKm,
        completedTrips: m.tripCount,
        revenuePerKm: revPerKm,
        costPerKm,
        profitPerKm,
      },
      costBreakdown: [
        { name: 'Fuel', value: m.totalFuelCost },
        { name: 'Toll & Taxes', value: m.totalTollCost },
        { name: 'Driver Compensation', value: m.totalDriverCost },
        { name: 'Maintenance Allocation', value: m.totalMaintenanceAlloc },
        { name: 'Other Incidental Costs', value: m.totalOtherCost },
      ],
      vehiclePnl,
    });
  } catch (err) {
    next(err);
  }
};
