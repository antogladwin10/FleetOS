import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
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
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    period: { type: String, required: true }, // e.g., "2026-09"
    baseSalary: { type: Number, default: 0 },
    tripIncentives: { type: Number, default: 0 },
    overtimePay: { type: Number, default: 0 },
    bonuses: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    daysWorked: { type: Number, default: 26 },
    tripsCompleted: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'PROCESSED', 'PAID'],
      default: 'PROCESSED',
      index: true,
    },
    paymentDate: { type: Date },
    paymentMethod: { type: String, default: 'BANK_TRANSFER' },
    transactionRef: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

payrollSchema.index({ organizationId: 1, driverId: 1, period: 1 }, { unique: true });

export default mongoose.model('Payroll', payrollSchema);
