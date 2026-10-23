import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    tripNumber: { type: String, required: true, uppercase: true },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      index: true,
    },
    origin: {
      name: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    destination: {
      name: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    cargoDetails: {
      description: { type: String, default: 'General Freight' },
      weightKg: { type: Number, default: 4500 },
      clientName: { type: String, default: 'Acme Corp' },
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED'],
      default: 'SCHEDULED',
      index: true,
    },
    scheduledDeparture: { type: Date, default: Date.now },
    scheduledArrival: { type: Date },
    actualDeparture: { type: Date },
    actualArrival: { type: Date },
    startOdometer: { type: Number, default: 0 },
    endOdometer: { type: Number, default: 0 },
    distanceKm: { type: Number, default: 0 },

    // Financial Engine Fields
    revenue: { type: Number, default: 0 },
    fuelCost: { type: Number, default: 0 },
    tollCost: { type: Number, default: 0 },
    driverCost: { type: Number, default: 0 },
    maintenanceAllocation: { type: Number, default: 0 },
    otherCosts: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    profitMarginPercent: { type: Number, default: 0 },

    // Waypoints / GPS Trail
    waypoints: [
      {
        latitude: Number,
        longitude: Number,
        timestamp: { type: Date, default: Date.now },
        speed: Number,
      },
    ],
  },
  { timestamps: true }
);

tripSchema.index({ organizationId: 1, tripNumber: 1 }, { unique: true });
tripSchema.index({ organizationId: 1, status: 1 });
tripSchema.index({ organizationId: 1, createdAt: -1 });

export default mongoose.model('Trip', tripSchema);
