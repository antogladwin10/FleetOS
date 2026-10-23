import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import FuelRecord from '../models/FuelRecord.js';
import Maintenance from '../models/Maintenance.js';
import Expense from '../models/Expense.js';
import Payroll from '../models/Payroll.js';
import { sendSuccess } from '../utils/response.js';

export const generateReport = async (req, res, next) => {
  try {
    const { type = 'FLEET_SUMMARY', startDate, endDate, format = 'json' } = req.query;
    const filter = req.user.role === 'super_admin' ? {} : { organizationId: req.organizationId };

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let reportTitle = 'Fleet Operational Summary';
    let columns = [];
    let rows = [];

    switch (type.toUpperCase()) {
      case 'TRIP':
      case 'TRIPS': {
        reportTitle = 'Trip Performance & Revenue Report';
        const trips = await Trip.find({ ...filter, ...dateFilter })
          .populate('vehicleId', 'registrationNumber')
          .populate('driverId', 'name')
          .sort({ createdAt: -1 });

        columns = ['Trip Number', 'Date', 'Vehicle', 'Driver', 'Origin', 'Destination', 'Distance (km)', 'Revenue (₹)', 'Fuel (₹)', 'Net Profit (₹)', 'Margin (%)', 'Status'];
        rows = trips.map((t) => [
          t.tripNumber,
          new Date(t.createdAt).toLocaleDateString(),
          t.vehicleId?.registrationNumber || 'N/A',
          t.driverId?.name || 'N/A',
          t.origin?.name || '',
          t.destination?.name || '',
          t.distanceKm || 0,
          t.revenue || 0,
          t.fuelCost || 0,
          t.netProfit || 0,
          `${t.profitMarginPercent || 0}%`,
          t.status,
        ]);
        break;
      }

      case 'FUEL': {
        reportTitle = 'Fuel Consumption & Cost Ledger';
        const fuels = await FuelRecord.find({ ...filter, ...dateFilter })
          .populate('vehicleId', 'registrationNumber')
          .populate('driverId', 'name')
          .sort({ date: -1 });

        columns = ['Date', 'Vehicle', 'Driver', 'Liters', 'Rate (₹/L)', 'Total (₹)', 'Odometer', 'Efficiency (km/L)', 'Station'];
        rows = fuels.map((f) => [
          new Date(f.date).toLocaleDateString(),
          f.vehicleId?.registrationNumber || 'N/A',
          f.driverId?.name || 'N/A',
          f.quantityLiters,
          f.costPerLiter,
          f.totalCost,
          f.odometerReading,
          f.efficiencyKmPerL,
          f.fuelStation,
        ]);
        break;
      }

      case 'MAINTENANCE': {
        reportTitle = 'Maintenance & Repair Logs';
        const maints = await Maintenance.find({ ...filter, ...dateFilter })
          .populate('vehicleId', 'registrationNumber model')
          .sort({ scheduledDate: -1 });

        columns = ['Date', 'Vehicle', 'Service Type', 'Description', 'Cost (₹)', 'Status', 'Vendor', 'Invoice #'];
        rows = maints.map((m) => [
          new Date(m.scheduledDate).toLocaleDateString(),
          m.vehicleId?.registrationNumber || 'N/A',
          m.serviceType,
          m.description,
          m.cost,
          m.status,
          m.vendorName,
          m.invoiceNumber,
        ]);
        break;
      }

      case 'PAYROLL': {
        reportTitle = 'Driver Payroll Disbursal Register';
        const payrolls = await Payroll.find({ ...filter, ...dateFilter })
          .populate('driverId', 'name licenseNumber')
          .sort({ period: -1 });

        columns = ['Period', 'Driver', 'Base (₹)', 'Incentives (₹)', 'Overtime (₹)', 'Deductions (₹)', 'Net Salary (₹)', 'Status', 'Ref'];
        rows = payrolls.map((p) => [
          p.period,
          p.driverId?.name || 'N/A',
          p.baseSalary,
          p.tripIncentives,
          p.overtimePay,
          p.deductions,
          p.netSalary,
          p.status,
          p.transactionRef || 'N/A',
        ]);
        break;
      }

      case 'EXPENSE':
      case 'EXPENSES': {
        reportTitle = 'Consolidated Expense Ledger';
        const expenses = await Expense.find({ ...filter, ...dateFilter })
          .populate('vehicleId', 'registrationNumber')
          .sort({ date: -1 });

        columns = ['Date', 'Category', 'Description', 'Amount (₹)', 'Vehicle', 'Payment Mode', 'Status', 'Receipt #'];
        rows = expenses.map((e) => [
          new Date(e.date).toLocaleDateString(),
          e.category,
          e.description,
          e.amount,
          e.vehicleId?.registrationNumber || 'N/A',
          e.paymentMethod,
          e.status,
          e.receiptNumber,
        ]);
        break;
      }

      default: {
        // Consolidated Fleet Summary
        reportTitle = 'Fleet Asset & Utilization Summary';
        const vehicles = await Vehicle.find(filter).populate('assignedDriverId', 'name');
        columns = ['Registration', 'Make & Model', 'Year', 'Type', 'Fuel Type', 'Odometer (km)', 'Driver', 'Status'];
        rows = vehicles.map((v) => [
          v.registrationNumber,
          `${v.make} ${v.model}`,
          v.year,
          v.type,
          v.fuelType,
          v.currentOdometer,
          v.assignedDriverId?.name || 'Unassigned',
          v.status,
        ]);
      }
    }

    // CSV format export
    if (format.toLowerCase() === 'csv') {
      const csvHeader = columns.join(',');
      const csvRows = rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','));
      const csvContent = [csvHeader, ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=FleetOS-${type.toLowerCase()}-report.csv`);
      return res.status(200).send(csvContent);
    }

    return sendSuccess(res, { reportTitle, type, generatedAt: new Date(), columns, rows });
  } catch (err) {
    next(err);
  }
};
