import express from 'express';
import { generateReport } from '../controllers/reportsController.js';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/generate', authorize(...ROLES.ALL), generateReport);

export default router;
