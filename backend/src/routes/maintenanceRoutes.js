import express from 'express';
import {
  getMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
} from '../controllers/maintenanceController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(...ROLES.ALL), getMaintenanceRecords);
router.post('/', authorize('super_admin', 'org_admin', 'fleet_manager', 'maintenance_staff', 'maintenance'), createMaintenanceRecord);
router.put('/:id', authorize('super_admin', 'org_admin', 'fleet_manager', 'maintenance_staff', 'maintenance'), updateMaintenanceRecord);
router.delete('/:id', authorize('super_admin', 'org_admin', 'fleet_manager'), deleteMaintenanceRecord);

export default router;
