import express from 'express';
import {
  getAlerts,
  markAlertRead,
  markAllAlertsRead,
} from '../controllers/alertController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(...ROLES.ALL), getAlerts);
router.patch('/read-all', authorize(...ROLES.ALL), markAllAlertsRead);
router.patch('/:id/read', authorize(...ROLES.ALL), markAlertRead);

export default router;
