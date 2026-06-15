import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  processPayment,
  getProjectPayments,
  getFreelancerEarnings,
  getClientSpending
} from '../controllers/paymentController.js';

const router = express.Router();

router.use(protect); // All payment routes are protected

router.post('/', authorize('client'), processPayment);
router.get('/project/:projectId', getProjectPayments);

// Dashboard stats aggregation routes
router.get('/earnings', authorize('student'), getFreelancerEarnings);
router.get('/spending', authorize('client'), getClientSpending);

export default router;
