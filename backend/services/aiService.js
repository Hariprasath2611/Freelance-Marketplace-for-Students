import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API if key exists
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini AI Service initialized successfully.');
  } catch (error) {
    console.warn('Failed to initialize Gemini API, using local fallback:', error.message);
  }
} else {
  console.log('No GEMINI_API_KEY found. Running with local rule-based fallback AI services.');
}

/**
 * 1. AI Proposal Generator: Writes a cover letter based on project details and freelancer info.
 */
export const generateProposal = async (projectTitle, projectDescription, freelancerName, freelancerSkills, freelancerBio) => {
  const prompt = `
    You are an expert student freelancer. Write a professional, concise, and persuasive cover letter/proposal for a freelance gig.
    
    Project Title: ${projectTitle}
    Project Description: ${projectDescription}
    
    Freelancer Name: ${freelancerName}
    Freelancer Skills: ${freelancerSkills.join(', ')}
    Freelancer Bio/Background: ${freelancerBio}
    
    Guidelines:
    - Keep it under 250 words.
    - Be polite, highlight relevant skills, and show enthusiasm.
    - Do not make up fake experience, but play up student eagerness to learn and adaptability.
    - End with a call to action.
  `;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Gemini generateProposal error, falling back to local:', error);
    }
  }

  // Local rule-based fallback
  const greetings = [
    `Dear Hiring Manager,`,
    `Hi there!`,
    `Hello,`
  ];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  
  const intro = `I noticed your posting for "${projectTitle}" and would love to assist you. As a student freelancer possessing key expertise in ${freelancerSkills.slice(0, 3).join(', ')}, I am highly motivated to deliver top-notch results.`;
  
  const body = freelancerBio 
    ? `My background is: "${freelancerBio}". I understand you need help with "${projectDescription.substring(0, 150)}...". I have worked on similar academic and personal projects and am confident in my ability to execute this successfully and on time.`
    : `I specialize in ${freelancerSkills.join(', ')}. I read through your requirements and can execute this project successfully. Even though I am a student, I bring fresh energy, strong dedication, and up-to-date knowledge to this assignment.`;
    
  const outro = `I'm eager to discuss how I can help you succeed. Let's connect on chat to discuss the milestones and timeline. Thanks for your time!\n\nBest regards,\n${freelancerName}`;

  return `${greeting}\n\n${intro}\n\n${body}\n\n${outro}`;
};

/**
 * 2. AI Skill Matcher: Compares project requirements against freelancer skills.
 */
export const matchSkills = (projectSkills = [], freelancerSkills = []) => {
  if (!projectSkills.length) return { score: 100, reason: 'No specific skills required for this project.' };
  
  const fsLower = freelancerSkills.map(s => s.toLowerCase());
  const psLower = projectSkills.map(s => s.toLowerCase());
  
  const matched = psLower.filter(skill => fsLower.includes(skill));
  const missing = psLower.filter(skill => !fsLower.includes(skill));
  
  const matchRatio = matched.length / psLower.length;
  const score = Math.round(matchRatio * 100);
  
  let reason = '';
  if (score === 100) {
    reason = `Perfect match! You have all ${projectSkills.length} required skills: ${projectSkills.join(', ')}.`;
  } else if (score >= 70) {
    reason = `Great match! You have ${matched.length} of the ${projectSkills.length} required skills: ${matched.map(s => projectSkills[psLower.indexOf(s)]).join(', ')}. You could pick up the remaining: ${missing.join(', ')} quickly.`;
  } else if (score >= 40) {
    reason = `Good match. You have ${matched.length} matching skills. Consider learning: ${missing.join(', ')} to boost your suitability.`;
  } else if (score > 0) {
    reason = `Basic fit. You only match ${matched.length} skill (${matched.join(', ')}). We recommend brushing up on ${missing.slice(0, 3).join(', ')}.`;
  } else {
    reason = `No direct skill match. The client requires: ${projectSkills.join(', ')}. You might need to add these to your profile to stand out.`;
  }

  return { score, reason, matched, missing };
};

/**
 * 3. AI Resume Analyzer: Evaluates resume content (represented as text content).
 */
export const analyzeResume = async (resumeText) => {
  const prompt = `
    You are an AI Resume Analyzer. Analyze the following resume text:
    
    Resume Text:
    ${resumeText}
    
    Output a JSON object exactly with these fields (no markdown, just parseable JSON):
    {
      "score": number (0-100),
      "extractedSkills": ["skill1", "skill2"],
      "extractedEducation": [{"school": "school name", "degree": "degree"}],
      "improvements": ["improvement1", "improvement2"]
    }
  `;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const cleanedText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Gemini resume analysis error, using local fallback:', error);
    }
  }

  // Local fallback parser
  const commonSkills = ['react', 'node', 'javascript', 'python', 'java', 'html', 'css', 'tailwind', 'mongodb', 'express', 'sql', 'git', 'figma', 'ui', 'ux', 'photoshop', 'excel', 'word', 'marketing', 'seo', 'copywriting', 'writing'];
  const extractedSkills = [];
  const lowerText = resumeText.toLowerCase();

  commonSkills.forEach(skill => {
    if (lowerText.includes(skill)) {
      // capitalize skill name nicely
      extractedSkills.push(skill === 'ui' || skill === 'ux' || skill === 'seo' || skill === 'sql' || skill === 'css' || skill === 'html' ? skill.toUpperCase() : skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });

  // Simple education detection
  const education = [];
  const universityKeywords = ['university', 'college', 'school', 'institute', 'polytechnic'];
  const degreeKeywords = ['bachelor', 'b.tech', 'b.sc', 'm.tech', 'm.sc', 'diploma', 'degree', 'major', 'minor'];
  
  const lines = resumeText.split('\n');
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    const hasUni = universityKeywords.some(kw => lowerLine.includes(kw));
    const hasDeg = degreeKeywords.some(kw => lowerLine.includes(kw));
    
    if (hasUni || hasDeg) {
      education.push({
        school: line.trim().substring(0, 80),
        degree: hasDeg ? 'Discovered Degree Details' : 'Student/Graduate'
      });
    }
  });

  if (education.length === 0) {
    education.push({ school: 'Not clearly specified', degree: 'Not detected' });
  }

  const improvements = [];
  if (extractedSkills.length < 5) {
    improvements.push('Add more technical skills and keywords to align with modern job boards.');
  }
  if (!lowerText.includes('github') && !lowerText.includes('portfolio')) {
    improvements.push('Include links to your GitHub or digital portfolio to show real projects.');
  }
  if (!lowerText.includes('experience') && !lowerText.includes('project')) {
    improvements.push('List academic projects, hackathons, or open-source work if you do not have professional experience.');
  }
  if (improvements.length === 0) {
    improvements.push('Your resume looks solid! Focus on tailoring it to specific project descriptions when bidding.');
  }

  const baseScore = 50 + (extractedSkills.length * 5) + (education.length * 10);
  const score = Math.min(Math.max(baseScore, 30), 95);

  return {
    score,
    extractedSkills: extractedSkills.slice(0, 10),
    extractedEducation: education.slice(0, 2),
    improvements
  };
};

/**
 * 4. AI Portfolio Score: Rates the portfolio page quality and completeness.
 */
export const calculatePortfolioScore = (portfolioItems = [], userSkills = []) => {
  let score = 30; // base score
  const recommendations = [];

  if (portfolioItems.length === 0) {
    recommendations.push('Create your first portfolio item. Portfolios are critical for securing bids!');
    return { score: 10, recommendations };
  }

  // Score count of items
  score += Math.min(portfolioItems.length * 10, 30); // Max 30 points for quantity (3 items)
  
  if (portfolioItems.length < 3) {
    recommendations.push(`Upload at least ${3 - portfolioItems.length} more project(s) to showcase your versatility.`);
  }

  let hasGitHub = false;
  let hasLiveLink = false;
  let hasImages = false;
  let matchesUserSkills = false;

  portfolioItems.forEach(item => {
    if (item.githubLink) hasGitHub = true;
    if (item.liveLink) hasLiveLink = true;
    if (item.images && item.images.length > 0) hasImages = true;
    
    // Check if portfolio technologies match any user skills
    const techLower = (item.technologies || []).map(t => t.toLowerCase());
    const matches = userSkills.some(s => techLower.includes(s.toLowerCase()));
    if (matches) matchesUserSkills = true;
  });

  if (hasGitHub) score += 15;
  else recommendations.push('Add GitHub repository links to your projects to show your code quality.');

  if (hasLiveLink) score += 15;
  else recommendations.push('Provide live demo links (e.g. Vercel, Netlify) so clients can test your work instantly.');

  if (hasImages) score += 10;
  else recommendations.push('Upload high-quality screenshots or covers for your portfolio items.');

  if (matchesUserSkills) score += 10;
  else recommendations.push('Tag your portfolio items with technologies that match your profile skills.');

  return {
    score: Math.min(score, 100),
    recommendations
  };
};

/**
 * 5. Recommend Projects: Takes a list of projects and sorts them by match score for a freelancer.
 */
export const recommendProjects = (projects = [], freelancerSkills = []) => {
  return projects.map(project => {
    const match = matchSkills(project.skillsRequired, freelancerSkills);
    return {
      project,
      matchScore: match.score,
      matchReason: match.reason
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};
