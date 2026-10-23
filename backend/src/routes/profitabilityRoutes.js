import express from 'express';
import { getProfitabilityOverview } from '../controllers/profitabilityController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/overview', authorize('super_admin', 'org_admin', 'fleet_manager', 'analyst'), getProfitabilityOverview);
router.get('/tco', authorize('super_admin', 'org_admin', 'fleet_manager', 'analyst'), getProfitabilityOverview);

export default router;
