import Organization from '../models/Organization.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';

const TIER_CONFIG = {
  starter: { maxVehicles: 20, maxDrivers: 40, maxUsers: 10, features: ['Real-Time GPS', 'Basic Maintenance', 'Trip Management', 'Standard Reports'] },
  professional: { maxVehicles: 50, maxDrivers: 100, maxUsers: 25, features: ['Real-Time GPS', 'Full Maintenance', 'Fuel Analytics', 'Trip Profitability Engine', 'Payroll Generation', 'Driver Mobile Portal', 'CSV/PDF Exports'] },
  enterprise: { maxVehicles: 250, maxDrivers: 500, maxUsers: 100, features: ['All Professional Features', 'Unlimited Vehicle Telemetry', 'TCO Optimization', 'Dedicated Account Manager', 'Custom API Integrations', 'Automated Scheduled Jobs'] },
};

export const getSubscriptionUsage = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'super_admin' ? (req.query.organizationId || req.organizationId) : req.organizationId;
    if (!orgId) return sendError(res, 'Organization ID is required', 400);

    const org = await Organization.findById(orgId);
    if (!org) return sendError(res, 'Organization not found', 404);

    const [vehicleCount, driverCount, userCount] = await Promise.all([
      Vehicle.countDocuments({ organizationId: org._id }),
      Driver.countDocuments({ organizationId: org._id }),
      User.countDocuments({ organizationId: org._id }),
    ]);

    const plan = org.subscriptionPlan || 'professional';
    const tier = TIER_CONFIG[plan] || TIER_CONFIG.professional;

    const usage = {
      plan,
      status: org.subscriptionStatus || 'active',
      validUntil: new Date('2027-12-31'),
      limits: {
        maxVehicles: org.maxVehicles || tier.maxVehicles,
        maxDrivers: org.maxDrivers || tier.maxDrivers,
        maxUsers: org.maxUsers || tier.maxUsers,
      },
      current: {
        vehicles: vehicleCount,
        drivers: driverCount,
        users: userCount,
      },
      utilizationPercent: {
        vehicles: Math.round((vehicleCount / (org.maxVehicles || tier.maxVehicles)) * 100),
        drivers: Math.round((driverCount / (org.maxDrivers || tier.maxDrivers)) * 100),
        users: Math.round((userCount / (org.maxUsers || tier.maxUsers)) * 100),
      },
      features: tier.features,
    };

    return sendSuccess(res, usage);
  } catch (err) {
    next(err);
  }
};
