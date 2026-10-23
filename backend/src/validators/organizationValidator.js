import { body } from 'express-validator';

export const createOrganizationValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Organization name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .isLength({ min: 2, max: 50 }).withMessage('Slug must be 2–50 characters')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),

  body('email')
    .trim()
    .notEmpty().withMessage('Organization email is required')
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),

  body('phone').optional().trim(),

  body('subscriptionPlan')
    .optional()
    .isIn(['free', 'starter', 'professional', 'enterprise'])
    .withMessage('Invalid subscription plan'),

  body('settings.timezone').optional().trim(),
  body('settings.currency').optional().trim().isLength({ min: 3, max: 3 }),
  body('settings.distanceUnit').optional().isIn(['km', 'miles']),
  body('settings.fuelUnit').optional().isIn(['liters', 'gallons']),
];

export const updateOrganizationValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),

  body('phone').optional().trim(),

  body('subscriptionPlan')
    .optional()
    .isIn(['free', 'starter', 'professional', 'enterprise'])
    .withMessage('Invalid subscription plan'),
];
