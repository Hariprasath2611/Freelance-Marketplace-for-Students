import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  githubLink: { type: String, default: '' },
  liveLink: { type: String, default: '' },
  images: [{ type: String }]
}, {
  timestamps: true
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;
