import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      trim: true,
      uppercase: true,
    },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    type: {
      type: String,
      enum: ['TRUCK', 'VAN', 'TRAILER', 'BUS', 'CAR', 'TANKER'],
      default: 'TRUCK',
    },
    vin: { type: String, trim: true, uppercase: true },
    fuelType: {
      type: String,
      enum: ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC', 'HYBRID'],
      default: 'DIESEL',
    },
    tankCapacityLiters: { type: Number, default: 200 },
    maxPayloadKg: { type: Number, default: 10000 },
    currentOdometer: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'INACTIVE', 'OFFLINE'],
      default: 'AVAILABLE',
      index: true,
    },
    assignedDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    // Real-time telemetry snapshot
    lastLocation: {
      latitude: { type: Number, default: 28.6139 },
      longitude: { type: Number, default: 77.209 },
      speed: { type: Number, default: 0 },
      heading: { type: Number, default: 0 },
      fuelLevelPercent: { type: Number, default: 85 },
      address: { type: String, default: 'Warehouse Depot, Delhi' },
      updatedAt: { type: Date, default: Date.now },
    },
    // TCO & Acquisition
    purchaseDate: { type: Date, default: () => new Date('2023-01-15') },
    purchaseCost: { type: Number, default: 2500000 },
    insuranceExpiry: { type: Date, default: () => new Date('2026-12-31') },
    fitnessExpiry: { type: Date, default: () => new Date('2026-11-30') },
    permitExpiry: { type: Date, default: () => new Date('2027-03-31') },
  },
  { timestamps: true }
);

vehicleSchema.index({ organizationId: 1, registrationNumber: 1 }, { unique: true });
vehicleSchema.index({ organizationId: 1, status: 1 });

export default mongoose.model('Vehicle', vehicleSchema);
