import express from 'express';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(...ROLES.ALL), getVehicles);
router.get('/:id', authorize(...ROLES.ALL), getVehicleById);
router.post('/', authorize('super_admin', 'org_admin', 'fleet_manager'), createVehicle);
router.put('/:id', authorize('super_admin', 'org_admin', 'fleet_manager', 'maintenance_staff', 'maintenance'), updateVehicle);
router.delete('/:id', authorize('super_admin', 'org_admin'), deleteVehicle);

export default router;
