import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    checkInLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    checkOutLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    hoursWorked: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PRESENT', 'HALF_DAY', 'ABSENT', 'ON_LEAVE'],
      default: 'PRESENT',
    },
    dailyEarningsCalculated: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

attendanceSchema.index({ organizationId: 1, driverId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ organizationId: 1, date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
