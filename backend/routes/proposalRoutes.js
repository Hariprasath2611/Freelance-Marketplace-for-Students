import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  submitProposal,
  getProjectProposals,
  getMyProposals,
  acceptProposal,
  rejectProposal,
  generateAICoverLetter
} from '../controllers/proposalController.js';

const router = express.Router();

router.use(protect); // All proposals routes are protected

// Freelancer proposal routes
router.post('/', authorize('student'), submitProposal);
router.get('/my', authorize('student'), getMyProposals);
router.post('/generate-cover-letter', authorize('student'), generateAICoverLetter);

// Client proposal routes
router.get('/project/:projectId', authorize('client'), getProjectProposals);
router.post('/:id/accept', authorize('client'), acceptProposal);
router.post('/:id/reject', authorize('client'), rejectProposal);

export default router;
