import { SurveyAnswer, CareerPath, Phase, Task, DailyChallenge } from '@/context/AppContext';
import { askGemini } from './gemini';

const CAREER_DATABASE: Record<string, { title: string; skills: string[]; phases: string[] }> = {
  'frontend-dev': {
    title: 'Frontend Developer',
    skills: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript', 'UI/UX'],
    phases: ['HTML & CSS Foundations', 'JavaScript Mastery', 'React & Modern Frameworks', 'TypeScript & Testing', 'Portfolio & Job Prep'],
  },
  'backend-dev': {
    title: 'Backend Developer',
    skills: ['Node.js', 'Databases', 'APIs', 'Security', 'DevOps'],
    phases: ['Programming Fundamentals', 'Server & APIs', 'Database Design', 'Security & Auth', 'Deployment & Scaling'],
  },
  'data-scientist': {
    title: 'Data Scientist',
    skills: ['Python', 'Statistics', 'ML', 'Data Viz', 'SQL'],
    phases: ['Python & Math Foundations', 'Statistics & Probability', 'Machine Learning Basics', 'Deep Learning & NLP', 'Real-World Projects'],
  },
  'ui-ux-designer': {
    title: 'UI/UX Designer',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility'],
    phases: ['Design Principles', 'User Research Methods', 'Wireframing & Prototyping', 'Visual Design & Systems', 'Portfolio Building'],
  },
  'devops-engineer': {
    title: 'DevOps Engineer',
    skills: ['Linux', 'Docker', 'CI/CD', 'Cloud', 'Monitoring'],
    phases: ['Linux & Networking', 'Containers & Docker', 'CI/CD Pipelines', 'Cloud Infrastructure', 'Monitoring & SRE'],
  },
  'mobile-dev': {
    title: 'Mobile App Developer',
    skills: ['React Native', 'Flutter', 'iOS', 'Android', 'App Design'],
    phases: ['Mobile Fundamentals', 'React Native Basics', 'Navigation & State', 'Native Features', 'Publishing & Marketing'],
  },
  'cybersecurity': {
    title: 'Cybersecurity Analyst',
    skills: ['Networking', 'Ethical Hacking', 'Forensics', 'Compliance', 'Incident Response'],
    phases: ['Network Security Basics', 'Ethical Hacking Tools', 'Vulnerability Assessment', 'Incident Response', 'Compliance & Governance'],
  },
  'product-manager': {
    title: 'Product Manager',
    skills: ['Strategy', 'Analytics', 'Roadmapping', 'User Stories', 'Agile'],
    phases: ['Product Thinking', 'Market Research', 'Agile & Scrum', 'Data-Driven Decisions', 'Leadership & Stakeholders'],
  },
  'ai-ml-engineer': {
    title: 'AI/ML Engineer',
    skills: ['Python', 'TensorFlow', 'NLP', 'Computer Vision', 'MLOps'],
    phases: ['Python & Linear Algebra', 'Classical ML Algorithms', 'Deep Learning Frameworks', 'NLP & Computer Vision', 'MLOps & Deployment'],
  },
  'cloud-architect': {
    title: 'Cloud Architect',
    skills: ['AWS', 'Azure', 'Terraform', 'Microservices', 'Cost Optimization'],
    phases: ['Cloud Fundamentals', 'AWS Core Services', 'Infrastructure as Code', 'Microservices Architecture', 'Cost & Performance'],
  },
  'blockchain-dev': {
    title: 'Blockchain Developer',
    skills: ['Solidity', 'Smart Contracts', 'DeFi', 'Web3', 'Cryptography'],
    phases: ['Blockchain Basics', 'Solidity & Smart Contracts', 'DeFi Protocols', 'Web3 Frontend', 'Security Auditing'],
  },
  'game-dev': {
    title: 'Game Developer',
    skills: ['Unity', 'C#', 'Game Design', '3D Modeling', 'Physics'],
    phases: ['Game Design Principles', 'Unity Fundamentals', 'C# for Games', '3D & Physics', 'Publishing Games'],
  },
};

const CAREER_KEYS = Object.keys(CAREER_DATABASE);

function hashAnswers(answers: SurveyAnswer[]): number {
  return answers.reduce((acc, a) => acc + a.answer.length * (a.questionIndex + 1), 0);
}

export async function generateCareerMatches(answers: SurveyAnswer[]): Promise<{ title: string; matchPercentage: number; justification: string; id: string }[]> {
  const interestText = answers.map(a => `${a.questionIndex}: ${a.answer}`).join(' | ');

  const prompt = `
    Based on these 11 detailed survey answers representing a user's personality, goals, and constraints: "${interestText}", 
    suggest the absolute best top 3 tech careers from this list: ${CAREER_KEYS.join(", ")}.
    
    CRITICAL: Analyze the user's specific constraints and drivers (the 11th input) deeply. 
    Return ONLY a JSON array of objects with this structure:
    [{ "id": "career-id", "title": "Career Title", "matchPercentage": 95.5, "justification": "Short 2 sentence explanation" }]
    Ensure matchPercentage is a number between 0-100 and rounded to 2 decimal points.
  `;

  const geminiResult = await askGemini(prompt);
  if (geminiResult && Array.isArray(geminiResult)) return geminiResult;

  // Fallback to local logic (already exists below)
  return localGenerateCareerMatches(answers);
}

function localGenerateCareerMatches(answers: SurveyAnswer[]): { title: string; matchPercentage: number; justification: string; id: string }[] {
  const interestText = answers.map(a => a.answer.toLowerCase()).join(' ');
  const scored = CAREER_KEYS.map(key => {
    const career = CAREER_DATABASE[key];
    let score = 50;
    career.skills.forEach(skill => {
      if (interestText.includes(skill.toLowerCase())) score += 15;
    });
    if (interestText.includes(career.title.toLowerCase())) score += 20;
    if (interestText.includes('design') && key.includes('design')) score += 25;
    if (interestText.includes('code') || interestText.includes('program')) {
      if (key.includes('dev') || key.includes('engineer')) score += 20;
    }
    return { key, score: Number(Math.min(98, score).toFixed(2)) };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);
  return sorted.slice(0, 3).map((item, i) => {
    const career = CAREER_DATABASE[item.key];
    const matchPercentage = item.score;
    const justifications = [
      `Your deep interest in ${career.skills[0]} and related technologies makes ${career.title} an ideal match for your creative and technical profile.`,
      `The survey indicates you have a strong affinity for ${career.skills[2] || 'problem solving'}, which is a core pillar of the ${career.title} role.`,
      `We detected a significant overlap between your goals and the ${career.title} path, particularly in how you approach ${career.skills[1] || 'learning'}.`,
    ];
    return {
      id: item.key,
      title: career.title,
      matchPercentage,
      justification: justifications[i] || `Based on your profile, ${career.title} aligns with your career trajectory.`,
    };
  });
}

export function generateMoreCareers(exclude: string[]): { title: string; matchPercentage: number; justification: string; id: string }[] {
  const available = CAREER_KEYS.filter(k => !exclude.includes(k));
  const selected = available.slice(0, 3);

  return selected.map((key, i) => ({
    id: key,
    title: CAREER_DATABASE[key].title,
    matchPercentage: 78 - i * 5 + Math.floor(Math.random() * 8),
    justification: `${CAREER_DATABASE[key].title} is an exciting field with strong demand. Your profile shows potential for success in this direction.`,
  }));
}

export function searchCareers(query: string): { title: string; id: string }[] {
  const q = query.toLowerCase();
  return CAREER_KEYS
    .filter(k => CAREER_DATABASE[k].title.toLowerCase().includes(q) || CAREER_DATABASE[k].skills.some(s => s.toLowerCase().includes(q)))
    .map(k => ({ id: k, title: CAREER_DATABASE[k].title }));
}

const QUESTION_BANK: Record<string, { question: string, options: string[], correctIndex: number }[]> = {
  basic: [
    { question: "Which of the following describes the fundamental purpose of this skill?", options: ["To manage complex states", "To define the core structure", "To style outer layers only", "To compile binary code"], correctIndex: 1 },
    { question: "What is typically the first step when initializing a project using this technology?", options: ["Setting up the environment variables", "Deploying to production", "Creating the entry configuration file", "Writing end-to-end tests"], correctIndex: 2 },
    { question: "Which term is most commonly associated with the basics of this field?", options: ["Machine Learning", "Syntax/Declaration", "Microservices", "Continuous Integration"], correctIndex: 1 },
    { question: "How is a simple 'Hello World' concept usually represented here?", options: ["By exporting a complex module", "By printing or returning a basic string", "Through a database migration", "By setting up a message queue"], correctIndex: 1 }
  ],
  intermediate: [
    { question: "How do you handle asynchronous operations or side effects efficiently?", options: ["Using global synchronous locks", "Through Promises, Callbacks, or Async/Await", "By ignoring the event loop", "Multithreading the main process"], correctIndex: 1 },
    { question: "Which pattern is standard for managing data flow between components?", options: ["Uni-directional data flow", "Chaotic coupling", "Direct DOM manipulation everywhere", "No data flow management required"], correctIndex: 0 },
    { question: "What is the best way to optimize performance when dealing with large datasets?", options: ["Load everything into RAM at once", "Pagination, Lazy Loading, or Indexing", "Increase screen resolution", "Use synchronous blocking calls"], correctIndex: 1 },
    { question: "How do you ensure code reusability across the application?", options: ["Copy and pasting blocks", "Using global variables extensively", "Creating modular, composable functions/classes", "Rewriting from scratch per requirement"], correctIndex: 2 }
  ],
  advanced: [
    { question: "What constitutes a scalable architecture for this technology?", options: ["A single massive monolithic file", "Micro-frontends or Microservices with clear boundaries", "Removing all third-party libraries", "Storing all data locally in cookies"], correctIndex: 1 },
    { question: "How do you resolve memory leaks in a long-running process?", options: ["Restarting the server every hour", "Profiling heap snapshots and removing detached listeners", "Ignoring them completely", "Adding more RAM to the server"], correctIndex: 1 },
    { question: "Which is the most robust strategy for testing and CI/CD integration?", options: ["Manual testing by one person", "Automated unit, integration, and E2E testing in pipelines", "Testing directly on the production database", "No testing, just fast deployments"], correctIndex: 1 },
    { question: "How do you securely handle sensitive user authorization?", options: ["Sending passwords in plain text", "Storing JWT tokens in exposed local storage", "Using secure HttpOnly cookies and proper hashing algorithms", "Hardcoding admin credentials in the source code"], correctIndex: 2 }
  ]
};

export async function generateSkillQuestions(careerId: string): Promise<{ question: string; options: string[]; correctIndex: number; level: string }[]> {
  const career = CAREER_DATABASE[careerId];
  if (!career) return [];

  const prompt = `
    Generate 9 multiple choice questions for a skill assessment in ${career.title}.
    Structure: 3 basic, 3 intermediate, 3 advanced.
    Return ONLY a JSON array: [{ "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "level": "basic" }]
    Make them technical and professional.
  `;

  const geminiResult = await askGemini(prompt);
  if (geminiResult && Array.isArray(geminiResult)) return geminiResult;

  // Local fallback
  return localGenerateSkillQuestions(careerId);
}

function localGenerateSkillQuestions(careerId: string): { question: string; options: string[]; correctIndex: number; level: string }[] {
  const career = CAREER_DATABASE[careerId];
  if (!career) return [];
  const levels = ['basic', 'basic', 'basic', 'intermediate', 'intermediate', 'intermediate', 'advanced', 'advanced', 'advanced'];
  const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);
  const basicQ = shuffle(QUESTION_BANK.basic);
  const intQ = shuffle(QUESTION_BANK.intermediate);
  const advQ = shuffle(QUESTION_BANK.advanced);

  return career.skills.slice(0, 3).flatMap((skill, si) =>
    levels.slice(si * 3, si * 3 + 3).map((level, qi) => {
      let qObj;
      if (level === 'basic') qObj = basicQ[qi % basicQ.length];
      if (level === 'intermediate') qObj = intQ[qi % intQ.length];
      if (level === 'advanced') qObj = advQ[qi % advQ.length];
      return {
        question: `[${level.toUpperCase()}] Regarding ${skill}: ${qObj!.question}`,
        options: qObj!.options,
        correctIndex: qObj!.correctIndex,
        level,
      };
    })
  );
}

export function calculateSkillScore(lastCorrectIndex: number, total: number): { score: number; level: 'beginner' | 'intermediate' | 'advanced' } {
  // If they stopped at index N, it means they got N questions right before failing.
  // 0-2 correct: Beginner
  // 3-5 correct: Intermediate
  // 6-9 correct: Advanced
  const score = Number(((lastCorrectIndex / total) * 100).toFixed(2));

  if (lastCorrectIndex <= 2) return { score, level: 'beginner' };
  if (lastCorrectIndex <= 5) return { score, level: 'intermediate' };
  return { score, level: 'advanced' };
}

export async function generateRoadmap(careerId: string, daysRemaining: number, level: string, goal: string): Promise<Phase[]> {
  const career = CAREER_DATABASE[careerId];
  if (!career) return [];

  const prompt = `
    Generate a 100% custom, non-predefined learning roadmap for ${career.title} specifically for a ${level} level student aiming for a ${goal} outcome.
    Available time: ${daysRemaining} days.
    
    Structure:
    - 5 Phases with distinct thematic objectives.
    - Daily micro-tasks that are actionable and specific.
    - At least 2 "Mini-Project" milestones that build a specific tool/feature.
    - 1 final "Capstone Project" that is complex and portfolio-ready.
    
    CRITICAL: Each task description must be unique and pedagogical. 
    YouTube links must be relevant search queries.
    Return ONLY valid JSON: [{ "id": "phase-0", "title": "...", "tasks": [{ "id": "t1", "day": 1, "title": "...", "description": "...", "objective": "...", "youtubeLink": "...", "completed": false, "phaseId": "phase-0", "isProject": false }] }]
  `;

  const geminiResult = await askGemini(prompt);
  if (geminiResult && Array.isArray(geminiResult)) return geminiResult;

  // Local fallback
  return localGenerateRoadmap(careerId, daysRemaining);
}

function localGenerateRoadmap(careerId: string, daysRemaining: number): Phase[] {
  const career = CAREER_DATABASE[careerId];
  if (!career) return [];
  const phaseCount = career.phases.length;
  const daysPerPhase = Math.max(1, Math.floor(daysRemaining / phaseCount));
  let dayCounter = 1;

  return career.phases.map((phaseName, pi) => {
    const taskCount = pi === phaseCount - 1 ? daysRemaining - dayCounter + 1 : daysPerPhase;
    const tasks: Task[] = [];
    const actions = [
      { action: "Learn principles of", details: "Focus on theoretical concepts and background." },
      { action: "Set up tools for", details: "Configure your development environment and necessary dependencies." },
      { action: "Build basic structures using", details: "Create initial components and verify they compile/run correctly." },
      { action: "Practice advanced techniques in", details: "Implement complex features to deepen your understanding." },
      { action: "Review and refactor", details: "Improve code efficiency, readability, and overall quality." },
      { action: "Complete mini-project on", details: "Deliver a small, functional solution utilizing recent lessons." },
      { action: "Debug and test", details: "Ensure high reliability through edge-case testing and debugging." },
      { action: "Project presentation", details: "Document your approach and make it accessible for presentation." }
    ];
    for (let ti = 0; ti < taskCount && dayCounter <= daysRemaining; ti++) {
      let variation = actions[ti % actions.length];
      let isProject = ti === taskCount - 1 || (ti > 0 && ti % 5 === 0);
      tasks.push({
        id: `task-${pi}-${ti}`,
        day: dayCounter,
        title: isProject ? `🔴 Project: ${phaseName}` : `Task ${dayCounter}: ${variation.action} ${phaseName}`,
        description: `Deep dive into ${phaseName} - ${variation.details}`,
        objective: isProject ? `Complete ${phaseName} project` : `${variation.action} ${phaseName.toLowerCase()}`,
        youtubeLink: `https://www.youtube.com/results?search_query=${encodeURIComponent(career.title + ' ' + phaseName)}`,
        completed: false,
        phaseId: `phase-${pi}`,
      });
      dayCounter++;
    }
    return { id: `phase-${pi}`, title: `Phase ${pi + 1}: ${phaseName}`, tasks };
  });
}

export async function generateDailyChallenge(careerId: string): Promise<DailyChallenge> {
  const career = CAREER_DATABASE[careerId];
  if (!career) return localGenerateDailyChallenge(careerId);

  const prompt = `
    Generate a daily technical interview question for a ${career.title} role.
    Return ONLY a JSON object: { "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "..." }
  `;

  const geminiResult = await askGemini(prompt);
  if (geminiResult && geminiResult.question) {
    return { ...geminiResult, completedToday: false };
  }

  return localGenerateDailyChallenge(careerId);
}

function localGenerateDailyChallenge(careerId: string): DailyChallenge {
  const career = CAREER_DATABASE[careerId];
  const skill = career?.skills[Math.floor(Math.random() * (career?.skills.length || 1))] || 'Programming';
  return {
    question: `Which of the following best describes a core concept in ${skill}?`,
    options: [`Fundamental principle of ${skill}`, `Common design pattern`, `Performance optimization technique`, `Testing methodology`],
    correctIndex: Math.floor(Math.random() * 4),
    explanation: `Understanding ${skill} fundamentals is crucial for mastering this career path.`,
    completedToday: false,
  };
}

export function getPaceStatus(daysRemaining: number, tasksRemaining: number): 'ahead' | 'behind' | 'on-track' {
  if (daysRemaining > tasksRemaining) return 'ahead';
  if (daysRemaining < tasksRemaining) return 'behind';
  return 'on-track';
}

export function getDateEstimates(level: 'beginner' | 'intermediate' | 'advanced') {
  const now = new Date();

  // Base durations in days
  const base = {
    beginner: { basics: 30, intermediate: 90, jobReady: 180 },
    intermediate: { basics: 10, intermediate: 45, jobReady: 120 },
    advanced: { basics: 5, intermediate: 20, jobReady: 60 },
  };

  const estimates = base[level];

  return {
    basics: new Date(now.getTime() + estimates.basics * 86400000),
    intermediate: new Date(now.getTime() + estimates.intermediate * 86400000),
    jobReady: new Date(now.getTime() + estimates.jobReady * 86400000),
  };
}

// Practice questions database
export function getPracticeQuestions(topic: string) {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `practice-${topic}-${i}`,
    question: `Practice Question ${i + 1}: What is an important aspect of ${topic}?`,
    options: ['Correct approach', 'Partially correct', 'Common mistake', 'Incorrect'],
    correctIndex: 0,
    explanation: `The correct approach to ${topic} involves understanding the fundamentals and applying best practices.`,
  }));
}

// Interview questions
export function getInterviewQuestions(company: string) {
  const years = [2024, 2023, 2022, 2021];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `interview-${company}-${i}`,
    question: `[${company}] Technical Interview Q${i + 1}: Describe a scenario involving...`,
    options: ['Best approach', 'Acceptable approach', 'Suboptimal approach', 'Incorrect approach'],
    correctIndex: 0,
    year: years[i % years.length],
    type: i < 4 ? 'technical' : 'behavioral',
  }));
}

// Simulation scenarios
export function getSimulationScenarios() {
  return [
    {
      id: 'sim-1',
      scenario: 'A client requests a feature that would require major architecture changes. The deadline is in 2 weeks.',
      options: [
        { text: 'Negotiate scope and propose an MVP version', xp: 50, correct: true, explanation: 'Negotiating scope while meeting core needs shows professional maturity.' },
        { text: 'Agree and work overtime to deliver', xp: 0, correct: false, explanation: 'Overcommitting leads to burnout and potential quality issues.' },
        { text: 'Refuse the request entirely', xp: 0, correct: false, explanation: 'Flat refusal damages client relationships without offering alternatives.' },
        { text: 'Delegate to a junior developer', xp: 0, correct: false, explanation: 'Complex architecture decisions shouldnt be delegated without guidance.' },
      ],
    },
    {
      id: 'sim-2',
      scenario: 'Your team discovers a critical security vulnerability in production during a major release.',
      options: [
        { text: 'Halt the release, patch the vulnerability, then proceed', xp: 50, correct: true, explanation: 'Security always takes priority. A responsible approach protects users and the company.' },
        { text: 'Continue the release and fix it in the next sprint', xp: 0, correct: false, explanation: 'Ignoring security vulnerabilities puts users at risk.' },
        { text: 'Quietly fix it without telling anyone', xp: 0, correct: false, explanation: 'Transparency is crucial for security incidents.' },
        { text: 'Roll back to the previous version permanently', xp: 0, correct: false, explanation: 'Rolling back isnt a solution — the vulnerability needs to be fixed.' },
      ],
    },
    {
      id: 'sim-3',
      scenario: 'You disagree with a senior engineers approach to a technical problem. You believe your solution is more efficient.',
      options: [
        { text: 'Present your solution with data and benchmarks in a meeting', xp: 50, correct: true, explanation: 'Data-driven discussions are the most effective way to propose alternatives.' },
        { text: 'Implement your solution without telling anyone', xp: 0, correct: false, explanation: 'Going rogue undermines team trust and collaboration.' },
        { text: 'Stay silent and follow their approach', xp: 0, correct: false, explanation: 'Not speaking up means potentially missing a better solution.' },
        { text: 'Complain to your manager about the senior engineer', xp: 0, correct: false, explanation: 'Escalating without first discussing directly is unprofessional.' },
      ],
    },
  ];
}

export function getAllCareerTitles() {
  return CAREER_KEYS.map(k => ({ id: k, title: CAREER_DATABASE[k].title }));
}
