import { Router } from 'express';
import { getAuditLogs, getAuditLog } from '../controllers/auditLogController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize(...ROLES.READ_ONLY), getAuditLogs);
router.get('/:id', authorize(...ROLES.READ_ONLY), getAuditLog);

export default router;
