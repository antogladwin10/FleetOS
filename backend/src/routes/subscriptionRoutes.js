import express from 'express';
import { getSubscriptionUsage } from '../controllers/subscriptionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/usage', authorize('super_admin', 'org_admin', 'fleet_manager'), getSubscriptionUsage);
router.get('/current', authorize('super_admin', 'org_admin', 'fleet_manager'), getSubscriptionUsage);

export default router;
