import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
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
    serviceType: {
      type: String,
      enum: ['ROUTINE_SERVICE', 'OIL_CHANGE', 'BRAKE_REPAIR', 'TIRE_ROTATION', 'ENGINE_OVERHAUL', 'ELECTRICAL', 'ACCIDENT_REPAIR', 'INSPECTION', 'OTHER'],
      default: 'ROUTINE_SERVICE',
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'],
      default: 'SCHEDULED',
      index: true,
    },
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    cost: { type: Number, default: 0 },
    odometerAtService: { type: Number, default: 0 },
    assignedStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    vendorName: { type: String, default: 'Authorized Tata Workshop' },
    invoiceNumber: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

maintenanceSchema.index({ organizationId: 1, status: 1 });
maintenanceSchema.index({ organizationId: 1, vehicleId: 1, scheduledDate: -1 });

export default mongoose.model('Maintenance', maintenanceSchema);
