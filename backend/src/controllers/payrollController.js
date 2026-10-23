import Payroll from '../models/Payroll.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import Attendance from '../models/Attendance.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getPayrolls = async (req, res, next) => {
  try {
    const { period, driverId, status, page = 1, limit = 50 } = req.query;
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

    if (period) filter.period = period;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [payrolls, total] = await Promise.all([
      Payroll.find(filter)
        .populate('driverId', 'name phone licenseNumber salaryType baseSalary dailyRate')
        .sort({ period: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payroll.countDocuments(filter),
    ]);

    const summaryAgg = await Payroll.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$netSalary' },
          count: { $sum: 1 },
        },
      },
    ]);
    const summary = { TOTAL: total, DRAFT: 0, PROCESSED: 0, PAID: 0, totalNetSalary: 0 };
    summaryAgg.forEach((s) => {
      if (summary[s._id] !== undefined) summary[s._id] = s.count;
      summary.totalNetSalary += s.totalAmount || 0;
    });

    return sendSuccess(res, { payrolls, total, page: Number(page), pages: Math.ceil(total / limit), summary });
  } catch (err) {
    next(err);
  }
};

export const generateMonthlyPayroll = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) return sendError(res, 'Month and year are required', 400);

    const period = `${year}-${String(month).padStart(2, '0')}`;
    const drivers = await Driver.find({ organizationId: req.organizationId, status: { $ne: 'INACTIVE' } });

    const created = [];
    for (const d of drivers) {
      const existing = await Payroll.findOne({ organizationId: req.organizationId, driverId: d._id, period });
      if (existing) continue; // prevent duplicate payroll generation

      const tripsCount = await Trip.countDocuments({
        driverId: d._id,
        status: 'COMPLETED',
      });

      const baseSalary = d.baseSalary || 25000;
      const tripIncentives = Math.round(tripsCount * 300);
      const overtimePay = 1500;
      const deductions = 1800; // PF / Insurance
      const netSalary = baseSalary + tripIncentives + overtimePay - deductions;

      const p = await Payroll.create({
        organizationId: req.organizationId,
        driverId: d._id,
        month: Number(month),
        year: Number(year),
        period,
        baseSalary,
        tripIncentives,
        overtimePay,
        bonuses: 0,
        deductions,
        netSalary,
        daysWorked: 26,
        tripsCompleted: tripsCount,
        status: 'PROCESSED',
      });
      created.push(p);
    }

    return sendSuccess(res, { generatedCount: created.length, payrolls: created }, 'Monthly payroll generated');
  } catch (err) {
    next(err);
  }
};

export const markPayrollPaid = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return sendError(res, 'Payroll record not found', 404);

    payroll.status = 'PAID';
    payroll.paymentDate = new Date();
    payroll.paymentMethod = req.body.paymentMethod || 'NEFT_BANK_TRANSFER';
    payroll.transactionRef = req.body.transactionRef || `TXN-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    await payroll.save();

    return sendSuccess(res, payroll, 'Payroll marked as paid');
  } catch (err) {
    next(err);
  }
};
