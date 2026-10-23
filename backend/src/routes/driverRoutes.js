import express from 'express';
import {
  getDrivers,
  getDriverMe,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
} from '../controllers/driverController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/me', authorize(...ROLES.ALL), getDriverMe);
router.get('/', authorize(...ROLES.ALL), getDrivers);
router.get('/:id', authorize(...ROLES.ALL), getDriverById);
router.post('/', authorize('super_admin', 'org_admin', 'fleet_manager'), createDriver);
router.put('/:id', authorize('super_admin', 'org_admin', 'fleet_manager'), updateDriver);
router.delete('/:id', authorize('super_admin', 'org_admin'), deleteDriver);

export default router;
