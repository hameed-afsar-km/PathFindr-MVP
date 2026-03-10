import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, CareerPath } from '@/context/AppContext';
import { getDateEstimates, generateRoadmap } from '@/lib/mockAI';
import { GlowingEffect } from './ui/glowing-effect';
import { Calendar, Target, UserCheck, Timer, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Brain } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);

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

  const handleFinish = async (goal: string, customDateStr: string) => {
    setIsLoading(true);
    try {
      let targetDate: Date = customDateStr ? new Date(customDateStr) : new Date();
      let daysRemaining = 1;

      if (!customDateStr) {
        switch (goal) {
          case 'basics': targetDate = estimates.basics; break;
          case 'intermediate': targetDate = estimates.intermediate; break;
          case 'job-ready': targetDate = estimates.jobReady; break;
          default: targetDate = estimates.jobReady; break;
        }
      }
      daysRemaining = Math.max(1, Math.ceil((targetDate.getTime() - Date.now()) / 86400000));

      const phases = await generateRoadmap(careerId, daysRemaining, skillResult.level, goal);

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
        goal: (goal || 'job-ready') as CareerPath['goal'],
        skillScore: skillResult.score,
        progress: 0,
        isActive: true,
        phases,
      };

      addCareer(career);
      setScreen('home');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-background flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 rounded-full border-t-2 border-primary"
              />
              <Brain className="w-12 h-12 text-primary absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-[0.3em]">Neural Synthesis</h2>
              <p className="text-muted-foreground font-medium animate-pulse">Architecting your personalized ${careerId} roadmap...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {step === 'status' && (
              <motion.div
                key="status"
                initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -40, filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="space-y-2 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">Your Background</h2>
                  </div>
                  <p className="text-muted-foreground font-medium">This helps us calibrate your trajectory for maximum throughput.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {statuses.map((s, i) => (
                    <motion.button
                      key={s}
                      onClick={() => handleStatusSelect(s)}
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="group relative h-28 rounded-3xl border border-border/50 p-1 transition-all text-left"
                    >
                      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                      <div className="relative h-full w-full rounded-2xl bg-background flex items-center px-6 gap-4 overflow-hidden group-hover:bg-secondary/20 transition-colors">
                        <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <span className="font-black text-sm">{i + 1}</span>
                        </div>
                        <span className="text-foreground font-black tracking-tight">{s}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'goal' && (
              <motion.div
                key="goal"
                initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -40, filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="space-y-2 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">Final Objective</h2>
                    </div>
                    <div className="flex items-center gap-2 bg-success/5 px-3 py-1 rounded-full border border-success/20">
                      <ShieldCheck className="w-3 h-3 text-success" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-success">{skillResult.level} matched</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground font-medium">Choose a milestone. We'll derive the architecture to get you there.</p>
                </div>

                <div className="space-y-4">
                  {goals.map(g => {
                    const estDate = g.key === 'job-ready' ? estimates.jobReady : (g.key !== 'custom' ? estimates[g.key] : null);
                    const days = estDate ? Math.max(1, Math.ceil((estDate.getTime() - Date.now()) / 86400000)) : 0;

                    return (
                      <button
                        key={g.key}
                        onClick={() => handleGoalSelect(g.key)}
                        className={`group relative w-full h-24 rounded-3xl border border-border/50 p-1 transition-all hover:scale-[1.01] text-left ${selectedGoal === g.key ? 'scale-[1.01] ring-2 ring-primary/20' : ''}`}
                      >
                        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant={selectedGoal === g.key ? 'default' : 'white'} />
                        <div className={`relative h-full w-full rounded-2xl bg-background flex items-center justify-between px-8 overflow-hidden group-hover:bg-secondary/10 transition-colors ${selectedGoal === g.key ? 'bg-primary/5' : ''}`}>
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedGoal === g.key ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-primary/5 text-primary'}`}>
                              {g.key === 'custom' ? <Calendar className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-foreground font-black tracking-tight text-lg">{g.label}</span>
                              {g.key !== 'custom' && (
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Projection: {days} Days</span>
                              )}
                            </div>
                          </div>

                          {g.key !== 'custom' && (
                            <div className="hidden md:flex flex-col items-end gap-1">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Target Date</span>
                              <span className="text-sm font-mono font-bold text-primary">{estDate?.toLocaleDateString() || ''}</span>
                            </div>
                          )}

                          {selectedGoal === g.key && (
                            <motion.div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center" layoutId="goalIndicator">
                              <ArrowRight className="w-5 h-5 text-primary" />
                            </motion.div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedGoal === 'custom' && (
                  <motion.div
                    className="mt-6 flex items-center gap-4 animate-in slide-in-from-top-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="relative group flex-1">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-4 h-4" />
                      <input
                        type="date"
                        value={customDate}
                        onChange={e => setCustomDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-secondary/50 border border-border rounded-2xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                    </div>
                    <button
                      onClick={handleCustomDateConfirm}
                      className="px-10 py-4 gradient-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                    >
                      Process →
                    </button>
                  </motion.div>
                )}

                <button onClick={() => setStep('status')} className="mt-8 flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">
                  <ArrowLeft className="w-3 h-3" /> Redefine Status
                </button>
              </motion.div>
            )}

            {step === 'custom-goal' && (
              <motion.div
                key="custom-goal"
                initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -40, filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Timer className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">Timeline Calibration</h2>
                  </div>
                  <p className="text-muted-foreground font-medium">Select the target achievement for your custom deadline.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {goals.filter(g => g.key !== 'custom').map(g => (
                    <button
                      key={g.key}
                      onClick={() => { setSelectedGoal(g.key); handleFinish(g.key, customDate); }}
                      className="group relative h-24 rounded-3xl border border-border/50 p-1 transition-all hover:scale-[1.02] text-left"
                    >
                      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                      <div className="relative h-full w-full rounded-2xl bg-background flex items-center justify-between px-8 overflow-hidden group-hover:bg-secondary/10 transition-colors">
                        <span className="text-xl font-black text-foreground tracking-tight">{g.label}</span>
                        <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => { setStep('goal'); setSelectedGoal(''); setCustomDate(''); }} className="mt-8 flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">
                  <ArrowLeft className="w-3 h-3" /> Adjust Deadline
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
