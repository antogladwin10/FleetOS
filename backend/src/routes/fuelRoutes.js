import express from 'express';
import {
  getFuelRecords,
  createFuelRecord,
  deleteFuelRecord,
} from '../controllers/fuelController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(...ROLES.ALL), getFuelRecords);
router.post('/', authorize('super_admin', 'org_admin', 'fleet_manager', 'driver'), createFuelRecord);
router.delete('/:id', authorize('super_admin', 'org_admin', 'fleet_manager'), deleteFuelRecord);

export default router;
