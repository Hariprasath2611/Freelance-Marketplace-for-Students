import Project from '../models/Project.js';
import User from '../models/User.js';
import { recommendProjects } from '../services/aiService.js';

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Client
export const createProject = async (req, res, next) => {
  const { title, description, category, skillsRequired, budget, deadline, status } = req.body;

  try {
    const project = await Project.create({
      title,
      description,
      category,
      skillsRequired: skillsRequired || [],
      budget,
      deadline,
      clientId: req.user._id,
      status: status || 'published'
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Get projects with filters (search, category, budget, skills, deadline, sorting)
// @route   GET /api/projects
// @access  Public
export const getProjects = async (req, res, next) => {
  const { category, minBudget, maxBudget, skill, search, sort } = req.query;

  try {
    let query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    if (skill) {
      query.skillsRequired = { $in: [new RegExp(skill, 'i')] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 }; // newest by default
    if (sort === 'budget-asc') {
      sortOption = { budget: 1 };
    } else if (sort === 'budget-desc') {
      sortOption = { budget: -1 };
    } else if (sort === 'deadline') {
      sortOption = { deadline: 1 };
    }

    const projects = await Project.find(query)
      .populate('clientId', 'name email profileImage rating')
      .sort(sortOption);

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('clientId', 'name email profileImage rating bio')
      .populate('freelancerId', 'name email profileImage rating skills bio');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Client
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this project' });
    }

    project.title = req.body.title || project.title;
    project.description = req.body.description || project.description;
    project.category = req.body.category || project.category;
    project.skillsRequired = req.body.skillsRequired || project.skillsRequired;
    project.budget = req.body.budget || project.budget;
    project.deadline = req.body.deadline || project.deadline;
    project.status = req.body.status || project.status;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Client
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Project.deleteOne({ _id: project._id });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Close project
// @route   POST /api/projects/:id/close
// @access  Private/Client
export const closeProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to close this project' });
    }

    project.status = 'closed';
    await project.save();

    res.json({ message: 'Project closed successfully', project });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended projects for student freelancer
// @route   GET /api/projects/recommendations
// @access  Private/Student
export const getRecommendedProjects = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all published projects
    const projects = await Project.find({ status: 'published' }).populate('clientId', 'name email profileImage rating');
    
    // Sort and score via AI Service
    const recommendations = recommendProjects(projects, student.skills || []);

    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};

// WORKSPACE API CALLS

// @desc    Add milestone to workspace
// @route   POST /api/projects/:id/milestones
// @access  Private/Client
export const addMilestone = async (req, res, next) => {
  const { title, amount, deadline } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    project.milestones.push({ title, amount, deadline, status: 'pending' });
    await project.save();

    res.status(201).json(project.milestones);
  } catch (error) {
    next(error);
  }
};

// @desc    Update milestone status (complete milestone)
// @route   PUT /api/projects/:id/milestones/:milestoneId
// @access  Private/Client
export const updateMilestoneStatus = async (req, res, next) => {
  const { status } = req.body; // 'pending' or 'completed'

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only clients can approve milestone payouts' });
    }

    const milestone = project.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    milestone.status = status;
    await project.save();

    res.json(project.milestones);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit deliverable to workspace
// @route   POST /api/projects/:id/deliverables
// @access  Private/Student
export const submitDeliverable = async (req, res, next) => {
  const { title, description, fileUrl } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.freelancerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only hired freelancer can submit deliverables' });
    }

    project.deliverables.push({
      title,
      description,
      fileUrl,
      status: 'pending'
    });

    await project.save();
    res.status(201).json(project.deliverables);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject deliverable
// @route   PUT /api/projects/:id/deliverables/:deliverableId
// @access  Private/Client
export const updateDeliverableStatus = async (req, res, next) => {
  const { status } = req.body; // 'accepted' or 'rejected'

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only client can update deliverable review status' });
    }

    const deliverable = project.deliverables.id(req.params.deliverableId);
    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }

    deliverable.status = status;
    await project.save();

    res.json(project.deliverables);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload workspace file
// @route   POST /api/projects/:id/files
// @access  Private
export const uploadWorkspaceFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify user is either client or freelancer
    const isClient = project.clientId.toString() === req.user._id.toString();
    const isFreelancer = project.freelancerId && project.freelancerId.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ message: 'Unauthorized workspace access' });
    }

    project.files.push({
      name: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id
    });

    await project.save();
    
    // Retrieve fully populated file list
    const updatedProject = await Project.findById(project._id)
      .populate('files.uploadedBy', 'name role');

    res.status(201).json(updatedProject.files);
  } catch (error) {
    next(error);
  }
};
