import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, uppercase: true, trim: true },
    licenseCategory: { type: String, default: 'HEAVY_COMMERCIAL' },
    licenseExpiry: { type: Date, required: true },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ON_DUTY', 'ON_TRIP', 'ON_LEAVE', 'SUSPENDED', 'INACTIVE'],
      default: 'AVAILABLE',
      index: true,
    },
    assignedVehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    salaryType: {
      type: String,
      enum: ['MONTHLY', 'DAILY', 'PER_TRIP'],
      default: 'MONTHLY',
    },
    baseSalary: { type: Number, default: 25000 },
    dailyRate: { type: Number, default: 1000 },
    perTripCommissionRate: { type: Number, default: 5 }, // 5%
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    rating: { type: Number, default: 4.8, min: 1, max: 5 },
    totalTripsCompleted: { type: Number, default: 0 },
    safetyScorePercent: { type: Number, default: 96 },
  },
  { timestamps: true }
);

driverSchema.index({ organizationId: 1, licenseNumber: 1 }, { unique: true });
driverSchema.index({ organizationId: 1, status: 1 });

export default mongoose.model('Driver', driverSchema);
