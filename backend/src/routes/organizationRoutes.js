import { Router } from 'express';
import {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationUsers,
} from '../controllers/organizationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createOrganizationValidator,
  updateOrganizationValidator,
} from '../validators/organizationValidator.js';

const router = Router();

router.use(authenticate);

// Super admin: full platform control
router.post('/', authorize('super_admin'), createOrganizationValidator, createOrganization);
router.get('/', authorize('super_admin'), getOrganizations);

// Org-level: admins can view/edit their own org
router.get('/:id', authorize('super_admin', 'org_admin', 'fleet_manager'), getOrganization);
router.put('/:id', authorize('super_admin', 'org_admin'), updateOrganizationValidator, updateOrganization);
router.delete('/:id', authorize('super_admin'), deleteOrganization);

// Users within an org
router.get('/:id/users', authorize('super_admin', 'org_admin'), getOrganizationUsers);

export default router;
