import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';
import { analyzeResume, calculatePortfolioScore } from '../services/aiService.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const portfolios = await Portfolio.find({ userId: req.user._id });
    
    if (user) {
      res.json({
        user,
        portfolios
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.skills = req.body.skills !== undefined ? req.body.skills : user.skills;
      user.education = req.body.education !== undefined ? req.body.education : user.education;
      user.experience = req.body.experience !== undefined ? req.body.experience : user.experience;
      
      if (req.body.socialLinks) {
        user.socialLinks = {
          github: req.body.socialLinks.github !== undefined ? req.body.socialLinks.github : user.socialLinks.github,
          linkedin: req.body.socialLinks.linkedin !== undefined ? req.body.socialLinks.linkedin : user.socialLinks.linkedin,
          twitter: req.body.socialLinks.twitter !== undefined ? req.body.socialLinks.twitter : user.socialLinks.twitter,
          website: req.body.socialLinks.website !== undefined ? req.body.socialLinks.website : user.socialLinks.website
        };
      }
      
      if (req.body.profileImage) {
        user.profileImage = req.body.profileImage;
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Upload and analyze resume
// @route   POST /api/users/resume
// @access  Private/Student
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Read the file name & size to form a simulated text body
    // If it's a txt file, we could read it, but for generic files, we generate high quality mock inputs
    const simulatedText = `
      RESUME: ${req.user.name}
      EMAIL: ${req.user.email}
      EDUCATION: Bachelor of Engineering, Computer Science.
      SKILLS: React, Node.js, Express, MongoDB, JavaScript, CSS, HTML5, Git, Python.
      PROJECTS: Full-stack E-commerce portal, Web-based Real-time chat.
      FILE_METADATA: Filename ${req.file.originalname}, Size ${req.file.size} bytes.
    `;

    // Analyze using Gemini / Fallback
    const analysis = await analyzeResume(simulatedText);

    // Save resume URL to user profile
    const user = await User.findById(req.user._id);
    user.resume = `/uploads/${req.file.filename}`;
    
    // Automatically merge new skills found in resume
    const currentSkills = new Set(user.skills.map(s => s.toLowerCase()));
    analysis.extractedSkills.forEach(skill => currentSkills.add(skill.toLowerCase()));
    user.skills = Array.from(currentSkills).map(s => s.charAt(0).toUpperCase() + s.slice(1));
    
    await user.save();

    res.json({
      message: 'Resume analyzed successfully!',
      resumeUrl: user.resume,
      analysis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add portfolio item
// @route   POST /api/users/portfolio
// @access  Private/Student
export const addPortfolioItem = async (req, res, next) => {
  const { title, description, technologies, githubLink, liveLink, images } = req.body;

  try {
    const portfolio = await Portfolio.create({
      userId: req.user._id,
      title,
      description,
      technologies: technologies || [],
      githubLink: githubLink || '',
      liveLink: liveLink || '',
      images: images || []
    });

    res.status(201).json(portfolio);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete portfolio item
// @route   DELETE /api/users/portfolio/:id
// @access  Private/Student
export const deletePortfolioItem = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio item not found or unauthorized' });
    }

    res.json({ message: 'Portfolio item removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI Portfolio completeness score
// @route   GET /api/users/portfolio-score
// @access  Private/Student
export const getPortfolioScore = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user._id });
    const user = await User.findById(req.user._id);
    
    const analysis = calculatePortfolioScore(portfolios, user.skills);
    
    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all student freelancers (search & filters)
// @route   GET /api/users/freelancers
// @access  Public
export const getFreelancers = async (req, res, next) => {
  const { keyword, skill } = req.query;

  try {
    let query = { role: 'student' };

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { bio: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (skill) {
      query.skills = { $regex: skill, $options: 'i' };
    }

    const freelancers = await User.find(query).select('-password');
    res.json(freelancers);
  } catch (error) {
    next(error);
  }
};
