import Attendance from '../models/Attendance.js';
import Driver from '../models/Driver.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAttendance = async (req, res, next) => {
  try {
    const { date, driverId, page = 1, limit = 50 } = req.query;
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

    if (date) filter.date = date;

    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate('driverId', 'name phone licenseNumber dailyRate baseSalary')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Attendance.countDocuments(filter),
    ]);

    return sendSuccess(res, { records, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    let driverId = req.body.driverId;
    if (req.user.role === 'driver') {
      const d = await Driver.findOne({ userId: req.user._id });
      if (!d) return sendError(res, 'Driver profile not linked to user', 404);
      driverId = d._id;
    }

    if (!driverId) return sendError(res, 'Driver ID is required', 400);

    const todayStr = req.body.date || new Date().toISOString().split('T')[0];
    const existing = await Attendance.findOne({
      organizationId: req.organizationId,
      driverId,
      date: todayStr,
    });

    if (existing && existing.checkInTime) {
      return sendError(res, 'Already checked in for today', 400);
    }

    const checkInData = {
      organizationId: req.organizationId,
      driverId,
      date: todayStr,
      checkInTime: new Date(),
      checkInLocation: req.body.location || { address: 'Checked in via Driver Portal' },
      status: 'PRESENT',
    };

    const record = existing
      ? await Attendance.findByIdAndUpdate(existing._id, checkInData, { new: true })
      : await Attendance.create(checkInData);

    await Driver.findByIdAndUpdate(driverId, { status: 'ON_DUTY' });
    return sendSuccess(res, record, 'Checked in successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    let driverId = req.body.driverId;
    if (req.user.role === 'driver') {
      const d = await Driver.findOne({ userId: req.user._id });
      if (!d) return sendError(res, 'Driver profile not linked to user', 404);
      driverId = d._id;
    }

    const todayStr = req.body.date || new Date().toISOString().split('T')[0];
    const record = await Attendance.findOne({
      organizationId: req.organizationId,
      driverId,
      date: todayStr,
    });

    if (!record || !record.checkInTime) {
      return sendError(res, 'Must check in before checking out', 400);
    }

    const checkOutTime = new Date();
    const diffMs = checkOutTime - new Date(record.checkInTime);
    const hoursWorked = Number((diffMs / 3600000).toFixed(1));
    const overtimeHours = hoursWorked > 8 ? Number((hoursWorked - 8).toFixed(1)) : 0;

    const driver = await Driver.findById(driverId);
    const dailyRate = driver?.dailyRate || 1000;
    const overtimeRate = Math.round((dailyRate / 8) * 1.5);
    const dailyEarningsCalculated = dailyRate + (overtimeHours * overtimeRate);

    record.checkOutTime = checkOutTime;
    record.checkOutLocation = req.body.location || { address: 'Checked out via Driver Portal' };
    record.hoursWorked = hoursWorked;
    record.overtimeHours = overtimeHours;
    record.dailyEarningsCalculated = dailyEarningsCalculated;
    await record.save();

    await Driver.findByIdAndUpdate(driverId, { status: 'AVAILABLE' });
    return sendSuccess(res, record, 'Checked out successfully');
  } catch (err) {
    next(err);
  }
};
