import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const roleEnum = ['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance', 'maintenance_staff', 'analyst'];
const statusEnum = ['active', 'inactive', 'suspended'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: roleEnum,
      default: 'fleet_manager',
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null, // null for super_admin
    },
    status: {
      type: String,
      enum: statusEnum,
      default: 'active',
    },
    phone: { type: String, trim: true },
    avatar: { type: String },
    lastLogin: { type: Date },
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpiry: { type: Date, select: false },

    // Driver-specific link
    driverProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpiry;
        return ret;
      },
    },
  }
);

// Indexes (email unique index is declared on the field; only add compound indexes here)
userSchema.index({ organizationId: 1, role: 1 });
userSchema.index({ organizationId: 1, status: 1 });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: check if password changed after a JWT was issued
userSchema.methods.passwordChangedAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return changedTimestamp > jwtIssuedAt;
  }
  return false;
};

export default mongoose.model('User', userSchema);
