import express from 'express';
import {
  getExpenses,
  createExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(...ROLES.ALL), getExpenses);
router.post('/', authorize('super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance'), createExpense);
router.delete('/:id', authorize('super_admin', 'org_admin', 'fleet_manager'), deleteExpense);

export default router;
