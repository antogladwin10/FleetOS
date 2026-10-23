import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('super_admin', 'org_admin'), getUsers);
router.get('/:id', authorize('super_admin', 'org_admin'), getUserById);
router.post('/', authorize('super_admin', 'org_admin'), createUser);
router.put('/:id', authorize('super_admin', 'org_admin'), updateUser);
router.delete('/:id', authorize('super_admin', 'org_admin'), deleteUser);

export default router;
