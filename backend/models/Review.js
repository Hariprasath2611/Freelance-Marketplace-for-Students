import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, required: true }
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
