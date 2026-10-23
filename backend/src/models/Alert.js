import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'MAINTENANCE_DUE',
        'MAINTENANCE_OVERDUE',
        'LOW_FUEL',
        'VEHICLE_OFFLINE',
        'TRIP_DELAYED',
        'LICENSE_EXPIRING',
        'INSURANCE_EXPIRING',
        'OVERSPEEDING',
        'HARSH_BRAKING',
        'GEOFENCE_BREACH',
        'DRIVER_ABSENT',
      ],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      default: 'WARNING',
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    entityType: { type: String, enum: ['VEHICLE', 'DRIVER', 'TRIP', 'SYSTEM'], default: 'VEHICLE' },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

alertSchema.index({ organizationId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Alert', alertSchema);
