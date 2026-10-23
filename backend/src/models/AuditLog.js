import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userEmail: { type: String },
    userRole: { type: String },
    action: {
      type: String,
      required: true,
      // e.g. 'user.login', 'vehicle.create', 'trip.complete'
    },
    resource: { type: String },      // 'vehicle', 'trip', etc.
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    description: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed }, // extra context, never secrets
    ipAddress: { type: String },
    userAgent: { type: String },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ organizationId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
