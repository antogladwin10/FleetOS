import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['FUEL', 'MAINTENANCE', 'TOLL', 'DRIVER', 'INSURANCE', 'TAX', 'REPAIR', 'PARKING', 'OTHER'],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
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
    description: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'NET_BANKING', 'UPI', 'COMPANY_ACCOUNT', 'FASTAG'],
      default: 'UPI',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
    },
    receiptNumber: { type: String, default: '' },
  },
  { timestamps: true }
);

expenseSchema.index({ organizationId: 1, date: -1 });
expenseSchema.index({ organizationId: 1, category: 1 });

export default mongoose.model('Expense', expenseSchema);
