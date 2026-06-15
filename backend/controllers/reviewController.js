import Review from '../models/Review.js';
import User from '../models/User.js';
import Project from '../models/Project.js';

// @desc    Submit review for client or student freelancer
// @route   POST /api/reviews
// @access  Private
export const submitReview = async (req, res, next) => {
  const { reviewedUserId, projectId, rating, review } = req.body;
  const reviewerId = req.user._id;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if reviewer is either client or freelancer on this project
    const isClient = project.clientId.toString() === reviewerId.toString();
    const isFreelancer = project.freelancerId && project.freelancerId.toString() === reviewerId.toString();

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ message: 'You are not authorized to review this project' });
    }

    // Verify reviewed user is indeed part of the project
    const targetIsClient = project.clientId.toString() === reviewedUserId.toString();
    const targetIsFreelancer = project.freelancerId && project.freelancerId.toString() === reviewedUserId.toString();

    if (!targetIsClient && !targetIsFreelancer) {
      return res.status(400).json({ message: 'Target user is not a participant in this project' });
    }

    // Check if already reviewed
    const alreadyReviewed = await Review.findOne({ reviewerId, reviewedUserId, projectId });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this project user' });
    }

    const newReview = await Review.create({
      reviewerId,
      reviewedUserId,
      projectId,
      rating: Number(rating),
      review
    });

    // Recalculate average rating for the reviewed user
    const reviews = await Review.find({ reviewedUserId });
    const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);
    const avgRating = totalRating / reviews.length;

    await User.findByIdAndUpdate(reviewedUserId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length
    });

    // If both parties review or client marks project as completed, we update project status
    // Here we can also mark project status as completed if it wasn't already
    if (isClient) {
      project.status = 'completed';
      await project.save();
    }

    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
export const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewedUserId: req.params.userId })
      .populate('reviewerId', 'name email profileImage role')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};
