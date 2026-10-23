import mongoose from 'mongoose';

const fuelRecordSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },
    date: { type: Date, default: Date.now },
    quantityLiters: { type: Number, required: true },
    costPerLiter: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    odometerReading: { type: Number, required: true },
    fuelStation: { type: String, default: 'Bharat Petroleum' },
    receiptNumber: { type: String, default: '' },
    fullTank: { type: Boolean, default: true },
    efficiencyKmPerL: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

fuelRecordSchema.index({ organizationId: 1, vehicleId: 1, date: -1 });

export default mongoose.model('FuelRecord', fuelRecordSchema);
