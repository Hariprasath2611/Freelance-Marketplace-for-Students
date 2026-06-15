import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';
import { 
  getUserProfile, 
  updateUserProfile, 
  uploadResume, 
  addPortfolioItem, 
  deletePortfolioItem, 
  getPortfolioScore, 
  getFreelancers 
} from '../controllers/userController.js';

const router = express.Router();

// Public route to search freelancers
router.get('/freelancers', getFreelancers);

// Protected profile routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Portfolio builder routes
router.post('/portfolio', protect, authorize('student'), addPortfolioItem);
router.delete('/portfolio/:id', protect, authorize('student'), deletePortfolioItem);
router.get('/portfolio-score', protect, authorize('student'), getPortfolioScore);

// Resume upload and AI analysis
router.post('/resume', protect, authorize('student'), upload.single('resume'), uploadResume);

export default router;
