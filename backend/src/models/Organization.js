import mongoose from 'mongoose';

const subscriptionPlanEnum = ['free', 'starter', 'professional', 'enterprise'];
const statusEnum = ['active', 'suspended', 'cancelled'];

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and hyphens'],
    },
    email: {
      type: String,
      required: [true, 'Organization email is required'],
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    logo: { type: String },
    website: { type: String },
    industry: { type: String, default: 'Fleet Management' },

    subscriptionPlan: {
      type: String,
      enum: subscriptionPlanEnum,
      default: 'free',
    },
    subscriptionStatus: {
      type: String,
      enum: statusEnum,
      default: 'active',
    },
    subscriptionExpiry: { type: Date },
    maxVehicles: { type: Number, default: 10 },
    maxDrivers: { type: Number, default: 20 },
    maxUsers: { type: Number, default: 5 },

    status: {
      type: String,
      enum: statusEnum,
      default: 'active',
    },

    settings: {
      timezone: { type: String, default: 'Asia/Kolkata' },
      currency: { type: String, default: 'INR' },
      distanceUnit: { type: String, enum: ['km', 'miles', 'mi'], default: 'km' },
      fuelUnit: { type: String, enum: ['liters', 'gallons'], default: 'liters' },
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
      fiscalYearStart: { type: Number, default: 4, min: 1, max: 12 },
      telemetryIntervalSeconds: { type: Number, default: 5, min: 1, max: 60 },
      speedingThresholdKmH: { type: Number, default: 80, min: 40, max: 200 },
      emailAlertsEnabled: { type: Boolean, default: true },
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// slug unique index is declared on the field; only add additional indexes here
organizationSchema.index({ status: 1 });

export default mongoose.model('Organization', organizationSchema);
