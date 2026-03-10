import { SurveyAnswer, CareerPath, Phase, Task, DailyChallenge } from '@/context/AppContext';

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

export function generateCareerMatches(answers: SurveyAnswer[]): { title: string; matchPercentage: number; justification: string; id: string }[] {
  const hash = hashAnswers(answers);
  const shuffled = [...CAREER_KEYS].sort((a, b) => {
    const ha = (hash * a.length) % 100;
    const hb = (hash * b.length) % 100;
    return hb - ha;
  });

  const interestText = answers.map(a => a.answer.toLowerCase()).join(' ');

  return shuffled.slice(0, 3).map((key, i) => {
    const career = CAREER_DATABASE[key];
    const relevance = career.skills.filter(s => interestText.includes(s.toLowerCase())).length;
    const base = 85 - i * 8;
    const matchPercentage = Math.min(98, base + relevance * 3 + (hash % 5));

    const justifications = [
      `Your interests in ${answers[0]?.answer || 'technology'} align strongly with ${career.title}. This path leverages your analytical mindset.`,
      `Based on your background and preferences, ${career.title} offers excellent growth potential matching your career drivers.`,
      `Your skill profile suggests a natural aptitude for ${career.title}. The learning curve aligns with your experience level.`,
    ];

    return {
      id: key,
      title: career.title,
      matchPercentage,
      justification: justifications[i],
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

export function generateSkillQuestions(careerId: string): { question: string; options: string[]; correctIndex: number; level: string }[] {
  const career = CAREER_DATABASE[careerId];
  if (!career) return [];

  const levels = ['basic', 'basic', 'basic', 'intermediate', 'intermediate', 'intermediate', 'advanced', 'advanced', 'advanced'];

  // Shuffle utility
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

export function calculateSkillScore(correct: number, total: number): { score: number; level: 'beginner' | 'intermediate' | 'advanced' } {
  const pct = (correct / total) * 100;
  if (pct >= 70) return { score: pct, level: 'advanced' };
  if (pct >= 40) return { score: pct, level: 'intermediate' };
  return { score: pct, level: 'beginner' };
}

export function generateRoadmap(careerId: string, daysRemaining: number, level: string): Phase[] {
  const career = CAREER_DATABASE[careerId];
  if (!career) return [];

  const phaseCount = career.phases.length;
  const daysPerPhase = Math.max(1, Math.floor(daysRemaining / phaseCount));
  let dayCounter = 1;

  return career.phases.map((phaseName, pi) => {
    const taskCount = pi === phaseCount - 1 ? daysRemaining - dayCounter + 1 : daysPerPhase;
    const tasks: Task[] = [];

    for (let ti = 0; ti < taskCount && dayCounter <= daysRemaining; ti++) {
      tasks.push({
        id: `task-${pi}-${ti}`,
        day: dayCounter,
        title: `Day ${dayCounter}: ${phaseName} - Session ${ti + 1}`,
        description: `Deep dive into ${phaseName}. Focus on practical application and understanding core concepts through hands-on exercises.`,
        objective: `Complete the ${phaseName.toLowerCase()} exercise set ${ti + 1} and submit your work.`,
        youtubeLink: `https://www.youtube.com/results?search_query=${encodeURIComponent(career.title + ' ' + phaseName + ' tutorial')}`,
        completed: false,
        phaseId: `phase-${pi}`,
      });
      dayCounter++;
    }

    return {
      id: `phase-${pi}`,
      title: `Phase ${pi + 1}: ${phaseName}`,
      tasks,
    };
  });
}

export function generateDailyChallenge(careerId: string): DailyChallenge {
  const career = CAREER_DATABASE[careerId];
  const skill = career?.skills[Math.floor(Math.random() * (career?.skills.length || 1))] || 'Programming';

  return {
    question: `Which of the following best describes a core concept in ${skill}?`,
    options: [
      `Fundamental principle of ${skill}`,
      `Common design pattern`,
      `Performance optimization technique`,
      `Testing methodology`,
    ],
    correctIndex: Math.floor(Math.random() * 4),
    explanation: `Understanding ${skill} fundamentals is crucial for mastering this career path. This concept forms the backbone of professional practice.`,
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
  const multiplier = level === 'advanced' ? 0.5 : level === 'intermediate' ? 0.75 : 1;
  return {
    basics: new Date(now.getTime() + 30 * multiplier * 86400000),
    intermediate: new Date(now.getTime() + 90 * multiplier * 86400000),
    jobReady: new Date(now.getTime() + 180 * multiplier * 86400000),
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
