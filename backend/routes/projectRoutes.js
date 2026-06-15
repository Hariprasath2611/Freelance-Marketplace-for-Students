import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  closeProject,
  getRecommendedProjects,
  addMilestone,
  updateMilestoneStatus,
  submitDeliverable,
  updateDeliverableStatus,
  uploadWorkspaceFile
} from '../controllers/projectController.js';

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Protected routes
router.post('/', protect, authorize('client'), createProject);
router.put('/:id', protect, authorize('client'), updateProject);
router.delete('/:id', protect, authorize('client'), deleteProject);
router.post('/:id/close', protect, authorize('client'), closeProject);

// AI Recommendation routes
router.get('/student/recommendations', protect, authorize('student'), getRecommendedProjects);

// Workspace routes
router.post('/:id/milestones', protect, authorize('client'), addMilestone);
router.put('/:id/milestones/:milestoneId', protect, authorize('client'), updateMilestoneStatus);
router.post('/:id/deliverables', protect, authorize('student'), submitDeliverable);
router.put('/:id/deliverables/:deliverableId', protect, authorize('client'), updateDeliverableStatus);
router.post('/:id/files', protect, upload.single('file'), uploadWorkspaceFile);

export default router;
