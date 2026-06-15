import Proposal from '../models/Proposal.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { matchSkills, generateProposal } from '../services/aiService.js';

// @desc    Submit a proposal (bid) on a project
// @route   POST /api/proposals
// @access  Private/Student
export const submitProposal = async (req, res, next) => {
  const { projectId, coverLetter, bidAmount, deliveryDays } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.status !== 'published') {
      return res.status(400).json({ message: 'Project is not open for bidding' });
    }

    // Check if user already bid
    const alreadyBid = await Proposal.findOne({ projectId, freelancerId: req.user._id });
    if (alreadyBid) {
      return res.status(400).json({ message: 'You have already submitted a proposal for this project' });
    }

    // AI Skill Match calculation
    const student = await User.findById(req.user._id);
    const match = matchSkills(project.skillsRequired || [], student.skills || []);

    const proposal = await Proposal.create({
      projectId,
      freelancerId: req.user._id,
      coverLetter,
      bidAmount,
      deliveryDays,
      aiMatchScore: match.score,
      aiMatchReason: match.reason
    });

    res.status(201).json(proposal);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all proposals for a specific project
// @route   GET /api/proposals/project/:projectId
// @access  Private/Client
export const getProjectProposals = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if request user is client who posted
    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these proposals' });
    }

    const proposals = await Proposal.find({ projectId: req.params.projectId })
      .populate('freelancerId', 'name email profileImage skills rating reviewCount bio')
      .sort({ aiMatchScore: -1 }); // Rank by AI Match Score!

    res.json(proposals);
  } catch (error) {
    next(error);
  }
};

// @desc    Get proposals submitted by current freelancer user
// @route   GET /api/proposals/my
// @access  Private/Student
export const getMyProposals = async (req, res, next) => {
  try {
    const proposals = await Proposal.find({ freelancerId: req.user._id })
      .populate('projectId', 'title budget deadline clientId status');
    res.json(proposals);
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a proposal (Hire freelancer)
// @route   POST /api/proposals/:id/accept
// @access  Private/Client
export const acceptProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const project = await Project.findById(proposal.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to hire for this project' });
    }

    if (project.status !== 'published') {
      return res.status(400).json({ message: 'Project is already in progress or completed' });
    }

    // Start project workspace
    project.status = 'in-progress';
    project.freelancerId = proposal.freelancerId;
    // Create initial milestone automatically
    project.milestones = [{
      title: 'Full project delivery',
      amount: proposal.bidAmount,
      status: 'pending',
      deadline: new Date(Date.now() + proposal.deliveryDays * 24 * 60 * 60 * 1000)
    }];
    await project.save();

    // Update accepted proposal status
    proposal.status = 'accepted';
    await proposal.save();

    // Reject other proposals
    await Proposal.updateMany(
      { projectId: project._id, _id: { $ne: proposal._id } },
      { $set: { status: 'rejected' } }
    );

    // Increment freelancer total project count
    await User.findByIdAndUpdate(proposal.freelancerId, { $inc: { totalProjects: 1 } });

    res.json({ message: 'Proposal accepted. Workspace initialized!', project });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a proposal
// @route   POST /api/proposals/:id/reject
// @access  Private/Client
export const rejectProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const project = await Project.findById(proposal.projectId);
    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject proposals' });
    }

    proposal.status = 'rejected';
    await proposal.save();

    res.json({ message: 'Proposal rejected successfully', proposal });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate cover letter with AI
// @route   POST /api/proposals/generate-cover-letter
// @access  Private/Student
export const generateAICoverLetter = async (req, res, next) => {
  const { projectId } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const student = await User.findById(req.user._id);

    const letter = await generateProposal(
      project.title,
      project.description,
      student.name,
      student.skills || [],
      student.bio || ''
    );

    res.json({ coverLetter: letter });
  } catch (error) {
    next(error);
  }
};
