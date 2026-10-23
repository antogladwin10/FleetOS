import express from 'express';
import {
  getPayrolls,
  generateMonthlyPayroll,
  markPayrollPaid,
} from '../controllers/payrollController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(...ROLES.ALL), getPayrolls);
router.post('/generate', authorize('super_admin', 'org_admin', 'fleet_manager'), generateMonthlyPayroll);
router.patch('/:id/pay', authorize('super_admin', 'org_admin'), markPayrollPaid);

export default router;
