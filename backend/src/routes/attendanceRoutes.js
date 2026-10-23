import express from 'express';
import {
  getAttendance,
  checkIn,
  checkOut,
} from '../controllers/attendanceController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(...ROLES.ALL), getAttendance);
router.post('/check-in', authorize(...ROLES.ALL), checkIn);
router.post('/check-out', authorize(...ROLES.ALL), checkOut);

export default router;
