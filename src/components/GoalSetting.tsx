import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp, CareerPath } from '@/context/AppContext';
import { getDateEstimates, generateRoadmap } from '@/lib/mockAI';

const statuses = ['Student', 'Working Professional', 'Career Switcher', 'Unemployed'];
const goals = [
  { key: 'basics', label: 'Master the Basics' },
  { key: 'intermediate', label: 'Go to Intermediate Level' },
  { key: 'job-ready', label: 'Job-Ready Level' },
  { key: 'custom', label: 'Custom Target Date' },
] as const;

export default function GoalSetting() {
  const { addCareer, setScreen, updateProfile } = useApp();
  const careerId = localStorage.getItem('pathfindr-selected-career') || 'frontend-dev';
  const skillResult = JSON.parse(localStorage.getItem('pathfindr-skill-score') || '{"score":30,"level":"beginner"}');

  const [step, setStep] = useState<'status' | 'goal' | 'custom-goal'>('status');
  const [, setStatus] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [customDate, setCustomDate] = useState('');
  // use profile username

  const estimates = getDateEstimates(skillResult.level);

  const handleStatusSelect = (s: string) => {
    setStatus(s);
    setStep('goal');
  };

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    if (goal === 'custom') return;
    handleFinish(goal, '');
  };

  const handleCustomDateConfirm = () => {
    if (customDate) setStep('custom-goal');
  };

  const handleCustomFinish = () => {
    if (customDate && selectedGoal) {
      handleFinish(selectedGoal, customDate);
    }
  }

  const handleFinish = (goal: string, customDateStr: string) => {


    let targetDate: Date = customDateStr ? new Date(customDateStr) : new Date();
    let daysRemaining = 1;

    if (!customDateStr) {
      switch (goal) {
        case 'basics': targetDate = estimates.basics; break;
        case 'intermediate': targetDate = estimates.intermediate; break;
        case 'job-ready': targetDate = estimates.jobReady; break;
        default: targetDate = estimates.jobReady; break;
      }
      daysRemaining = Math.max(1, Math.ceil((targetDate.getTime() - Date.now()) / 86400000));
    } else {
      daysRemaining = Math.max(1, Math.ceil((targetDate.getTime() - Date.now()) / 86400000));
    }

    const phases = generateRoadmap(careerId, daysRemaining, skillResult.level);

    // Get career title from mockAI
    const careerTitles: Record<string, string> = {
      'frontend-dev': 'Frontend Developer',
      'backend-dev': 'Backend Developer',
      'data-scientist': 'Data Scientist',
      'ui-ux-designer': 'UI/UX Designer',
      'devops-engineer': 'DevOps Engineer',
      'mobile-dev': 'Mobile App Developer',
      'cybersecurity': 'Cybersecurity Analyst',
      'product-manager': 'Product Manager',
      'ai-ml-engineer': 'AI/ML Engineer',
      'cloud-architect': 'Cloud Architect',
      'blockchain-dev': 'Blockchain Developer',
      'game-dev': 'Game Developer',
    };

    const career: CareerPath = {
      id: careerId,
      title: careerTitles[careerId] || careerId,
      matchPercentage: 0,
      justification: '',
      startDate: new Date().toISOString(),
      targetDate: targetDate.toISOString(),
      level: skillResult.level,
      goal: selectedGoal as CareerPath['goal'],
      skillScore: skillResult.score,
      progress: 0,
      isActive: true,
      phases,
    };

    addCareer(career);
    setScreen('home');
  };

  return (
    <motion.div
      className="fixed inset-0 bg-background flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-full max-w-xl">
        {step === 'status' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl font-bold text-foreground mb-2">What's your current status?</h2>
            <p className="text-muted-foreground mb-8">This helps us calibrate your timeline.</p>
            <div className="space-y-3">
              {statuses.map(s => (
                <motion.button
                  key={s}
                  onClick={() => handleStatusSelect(s)}
                  className="w-full text-left glass px-6 py-4 rounded-xl text-foreground hover:border-primary/50 transition-all"
                  whileHover={{ scale: 1.01, x: 4 }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'goal' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl font-bold text-foreground mb-2">Choose your learning goal</h2>
            <p className="text-muted-foreground mb-2">Your skill level: <span className="text-primary capitalize">{skillResult.level}</span></p>
            <p className="text-muted-foreground text-sm mb-8">Estimated timelines are adjusted based on your assessment.</p>
            <div className="space-y-3">
              {goals.map(g => {
                const estDate = g.key === 'job-ready' ? estimates.jobReady : estimates[g.key as keyof typeof estimates];
                const days = estDate ? Math.max(1, Math.ceil((estDate.getTime() - Date.now()) / 86400000)) : 0;

                return (
                  <motion.button
                    key={g.key}
                    onClick={() => handleGoalSelect(g.key)}
                    className={`w-full text-left glass relative overflow-hidden px-6 py-4 rounded-xl text-foreground hover:border-primary/50 transition-all ${selectedGoal === g.key ? 'border-primary glow-primary' : ''}`}
                    whileHover={{ scale: 1.02, x: 4 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 relative z-10">
                      <div>
                        <div className="font-semibold text-lg">{g.label}</div>
                        {g.key !== 'custom' && (
                          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <span className="bg-secondary px-2 py-0.5 rounded text-primary font-mono">{days} Days</span>
                            <span>Target: {estDate?.toLocaleDateString() || ''}</span>
                          </div>
                        )}
                      </div>
                      {g.key !== 'custom' && (
                        <div className="hidden md:block text-right">
                          <span className="text-xs uppercase tracking-widest text-muted-foreground opacity-50">Estimated</span>
                        </div>
                      )}
                    </div>
                    {selectedGoal === g.key && (
                      <motion.div className="absolute inset-0 bg-primary/10 -z-0" layoutId="goalBg" />
                    )}
                  </motion.button>
                );
              })}
            </div>
            {selectedGoal === 'custom' && (
              <motion.div className="mt-4 flex gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <input
                  type="date"
                  value={customDate}
                  onChange={e => setCustomDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button onClick={handleCustomDateConfirm} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold">
                  Set →
                </button>
              </motion.div>
            )}
            <button onClick={() => setStep('status')} className="mt-6 text-muted-foreground text-sm hover:text-foreground">
              ← Back
            </button>
          </motion.div>
        )}

        {step === 'custom-goal' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl font-bold text-foreground mb-2">What is your learning goal for this timeline?</h2>
            <div className="space-y-3 mt-8">
              {goals.filter(g => g.key !== 'custom').map(g => (
                <motion.button
                  key={g.key}
                  onClick={() => { setSelectedGoal(g.key); handleFinish(g.key, customDate); }}
                  className="w-full text-left glass px-6 py-4 rounded-xl text-foreground hover:border-primary/50 transition-all font-semibold"
                  whileHover={{ scale: 1.01, x: 4 }}
                >
                  {g.label}
                </motion.button>
              ))}
            </div>
            <button onClick={() => { setStep('goal'); setSelectedGoal(''); setCustomDate(''); }} className="mt-6 text-muted-foreground text-sm hover:text-foreground">
              ← Back
            </button>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}
