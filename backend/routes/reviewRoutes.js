import express from 'express';
import { protect } from '../middleware/auth.js';
import { submitReview, getUserReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/user/:userId', getUserReviews);
router.post('/', protect, submitReview);

export default router;
