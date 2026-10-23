import express from 'express';
import {
  getLiveFleet,
  updateTelemetry,
  getVehicleRouteHistory,
} from '../controllers/trackingController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/live', authorize(...ROLES.ALL), getLiveFleet);
router.post('/telemetry', authorize(...ROLES.ALL), updateTelemetry);
router.get('/history/:vehicleId', authorize(...ROLES.ALL), getVehicleRouteHistory);

export default router;
