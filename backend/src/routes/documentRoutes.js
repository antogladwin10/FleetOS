import express from 'express';
import {
  getDocuments,
  createDocument,
  deleteDocument,
} from '../controllers/documentController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(...ROLES.ALL), getDocuments);
router.post('/', authorize('super_admin', 'org_admin', 'fleet_manager', 'maintenance_staff', 'maintenance'), createDocument);
router.delete('/:id', authorize('super_admin', 'org_admin', 'fleet_manager'), deleteDocument);

export default router;
