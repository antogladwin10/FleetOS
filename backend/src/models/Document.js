import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['LICENSE', 'INSURANCE', 'RC', 'PUC', 'PERMIT', 'FITNESS', 'INVOICE', 'RECEIPT', 'OTHER'],
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['VEHICLE', 'DRIVER', 'ORGANIZATION'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    documentNumber: { type: String, default: '' },
    issueDate: { type: Date },
    expiryDate: { type: Date, index: true },
    fileUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['VALID', 'EXPIRING_SOON', 'EXPIRED'],
      default: 'VALID',
      index: true,
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

documentSchema.index({ organizationId: 1, type: 1 });
documentSchema.index({ organizationId: 1, expiryDate: 1 });

export default mongoose.model('Document', documentSchema);
