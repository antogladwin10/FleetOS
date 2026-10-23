import express from 'express';
import {
  getTrips,
  getTripById,
  createTrip,
  startTrip,
  completeTrip,
  cancelTrip,
} from '../controllers/tripController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(...ROLES.ALL), getTrips);
router.get('/:id', authorize(...ROLES.ALL), getTripById);
router.post('/', authorize('super_admin', 'org_admin', 'fleet_manager'), createTrip);
router.patch('/:id/start', authorize('super_admin', 'org_admin', 'fleet_manager', 'driver'), startTrip);
router.patch('/:id/complete', authorize('super_admin', 'org_admin', 'fleet_manager', 'driver'), completeTrip);
router.patch('/:id/cancel', authorize('super_admin', 'org_admin', 'fleet_manager'), cancelTrip);

export default router;
