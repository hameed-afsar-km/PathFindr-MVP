import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { adaptRoadmap } from '@/lib/mockAI';
import { Lock, CheckCircle2, Circle, ExternalLink, ChevronDown, ChevronRight, Search, Calendar, RefreshCw, Briefcase, Filter, ArrowRightLeft, Sparkles, BrainCircuit } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

export default function RoadmapView() {
  const { activeCareer, profile, updateProfile, completeTask, clearCareerProgress, setHomeTab, updateCareer } = useApp();
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState<{ type: 'completed-phase' | 'target-date', dr: number, tr: number } | null>(null);
  const [newTargetDate, setNewTargetDate] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isAdapting, setIsAdapting] = useState(false);

  const filteredPhases = useMemo(() => {
    if (!activeCareer) return [];
    if (!searchQuery) return activeCareer.phases;
    const q = searchQuery.toLowerCase();
    return activeCareer.phases.map(p => ({
      ...p,
      tasks: p.tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    })).filter(p => p.tasks.length > 0);
  }, [activeCareer, searchQuery]);

  if (!activeCareer) return <div className="p-6 text-muted-foreground">No active career selected.</div>;

  const allTasks = activeCareer.phases.flatMap(p => p.tasks);
  const completedTasks = allTasks.filter(t => t.completed).length;
  const tasksRemaining = allTasks.length - completedTasks;
  const daysRemaining = Math.max(1, Math.ceil((new Date(activeCareer.targetDate).getTime() - Date.now()) / 86400000));

  const pace = daysRemaining > tasksRemaining ? 'ahead' : daysRemaining < tasksRemaining ? 'behind' : 'on schedule';
  const paceClass = pace === 'ahead' ? 'text-success bg-success/10' : pace === 'behind' ? 'text-destructive bg-destructive/10' : 'text-primary bg-primary/10';

  const firstIncompleteIdx = allTasks.findIndex(t => !t.completed);
  const currentTask = firstIncompleteIdx !== -1 ? allTasks[firstIncompleteIdx] : null;

  const checkAdjustmentNeeded = (dr: number, tr: number, type: 'completed-phase' | 'target-date') => {
    if (dr !== tr) {
      setShowAdjustModal({ type, dr, tr });
    }
  };

  const handleTaskComplete = (taskId: string, phaseComplete: boolean) => {
    completeTask(activeCareer.id, taskId);
    if (phaseComplete) {
      // Small timeout to allow state to update first
      setTimeout(() => {
        checkAdjustmentNeeded(daysRemaining, tasksRemaining - 1, 'completed-phase');
      }, 500);
    }
  };

  const handleTargetDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTargetDate(e.target.value);
  };

  const applyTargetDate = () => {
    if (!newTargetDate) return;
    const dt = new Date(newTargetDate);
    const dr = Math.max(1, Math.ceil((dt.getTime() - Date.now()) / 86400000));
    updateCareer(activeCareer.id, { targetDate: dt.toISOString() });
    checkAdjustmentNeeded(dr, tasksRemaining, 'target-date');
    setNewTargetDate('');
  };

  const applyAdjustment = async (strategy: string) => {
    if (strategy === 'No Change') {
      setShowAdjustModal(null);
      return;
    }

    setIsAdapting(true);
    setShowAdjustModal(null);

    try {
      const newPhases = await adaptRoadmap(activeCareer.id, daysRemaining, activeCareer.phases, strategy);
      updateCareer(activeCareer.id, { phases: newPhases });
      console.log(`Regenerated roadmap with strategy: ${strategy}`);
    } catch (error) {
      console.error('Adaptation failed:', error);
    } finally {
      setIsAdapting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 relative">
      <AnimatePresence>
        {isAdapting && (
          <motion.div
            className="fixed inset-0 z-[100] glass-strong flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border-t-2 border-primary"
              />
              <BrainCircuit className="w-10 h-10 text-primary absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black text-foreground uppercase tracking-widest">AI Neural Recalibration</h2>
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <Sparkles className="w-4 h-4 text-primary animate-bounce" />
                <span>Adjusting your roadmap based on real-time performance...</span>
              </div>
            </div>
          </motion.div>
        )}

        {showAdjustModal && (
          <motion.div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass-strong rounded-2xl p-8 max-w-md w-full" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 className="text-xl font-bold text-foreground mb-4">
                {showAdjustModal.type === 'target-date' ? 'Target Date Changed' : 'Phase Completed!'}
              </h3>
              <p className="text-muted-foreground mb-6">
                You have {showAdjustModal.dr} days and {showAdjustModal.tr} tasks remaining.
                You are currently <strong className={pace === 'ahead' ? 'text-success' : pace === 'behind' ? 'text-destructive' : ''}>{pace}</strong>. How would you like to adjust?
              </p>
              <div className="space-y-3 mb-6">
                {showAdjustModal.dr > showAdjustModal.tr ? (
                  <>
                    <button onClick={() => applyAdjustment('Increase Difficulty')} className="w-full text-left glass px-4 py-3 rounded-xl hover:border-primary/50 transition-all">Increase Difficulty (Add more tasks)</button>
                    <button onClick={() => applyAdjustment('Relax Pace')} className="w-full text-left glass px-4 py-3 rounded-xl hover:border-primary/50 transition-all">Relax Pace (Redistribute tasks)</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => applyAdjustment('Reduce Difficulty')} className="w-full text-left glass px-4 py-3 rounded-xl hover:border-primary/50 transition-all">Reduce Difficulty (Reduce tasks, keep important)</button>
                    <button onClick={() => applyAdjustment('Increase Pace')} className="w-full text-left glass px-4 py-3 rounded-xl hover:border-primary/50 transition-all">Increase Pace (Fit tasks in tight schedule)</button>
                  </>
                )}
                <button onClick={() => applyAdjustment('No Change')} className="w-full text-left glass px-4 py-3 rounded-xl hover:border-primary/50 transition-all">No Change</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResetConfirm && (
          <motion.div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass-strong rounded-2xl p-8 max-w-md w-full border border-destructive/20" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 className="text-xl font-bold text-foreground mb-4">Reset Progress?</h3>
              <p className="text-muted-foreground mb-6">
                This will clear all your progress for this career. Type <strong className="text-destructive font-mono">RESET</strong> to proceed.
              </p>
              <input
                type="text"
                placeholder="Type RESET"
                value={resetConfirmText}
                onChange={e => setResetConfirmText(e.target.value.toUpperCase())}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-destructive/50 mb-6 font-mono text-foreground"
              />
              <div className="flex gap-3">
                <button
                  disabled={resetConfirmText !== 'RESET'}
                  onClick={() => { clearCareerProgress(activeCareer.id); setShowResetConfirm(false); setResetConfirmText(''); }}
                  className="flex-1 bg-destructive text-destructive-foreground px-4 py-3 rounded-xl font-semibold disabled:opacity-50 transition-opacity"
                >
                  Reset Progress
                </button>
                <button
                  onClick={() => { setShowResetConfirm(false); setResetConfirmText(''); }}
                  className="flex-1 glass px-4 py-3 rounded-xl font-semibold hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <div className="relative rounded-[2rem] border border-border/50 p-2 md:p-3">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <div className="relative z-10 p-8 rounded-[1.75rem] bg-background overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-background to-transparent z-0 opacity-50"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span className="text-primary font-mono text-sm tracking-widest uppercase">Active Roadmap</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
                  {activeCareer.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm font-medium mb-8">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Tasks Left</span>
                    <span className="text-xl text-foreground font-mono">{tasksRemaining}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Days Left</span>
                    <span className="text-xl text-foreground font-mono">{daysRemaining}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Pace</span>
                    <span className={`px-3 py-1 mt-1 rounded-full shrink-0 ${paceClass} uppercase text-xs tracking-wider inline-block`}>{pace}</span>
                  </div>
                </div>

                <div className="max-w-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">Overall Completion</span>
                    <span className="text-sm text-primary font-mono">{activeCareer.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
                    <motion.div className="h-full progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${activeCareer.progress}%` }} transition={{ duration: 1 }} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0 md:min-w-[280px]">
                <div className="glass-strong p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="text-foreground font-medium">{new Date(activeCareer.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Target Date:</span>
                    <span className="text-foreground font-medium">{new Date(activeCareer.targetDate).toLocaleDateString()}</span>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground block mb-2">Alter Target Date</span>
                    <div className="flex items-center gap-2">
                      <input type="date" value={newTargetDate} onChange={handleTargetDateChange} className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground flex-1 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                      {newTargetDate && <button onClick={applyTargetDate} className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-semibold">Apply</button>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setHomeTab('careers')} className="flex-1 glass px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:border-primary/50 transition-all">
                    <ArrowRightLeft className="w-4 h-4 text-primary" /> Switch
                  </button>
                  <button onClick={() => { setShowResetConfirm(true); }} className="flex-1 glass px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:border-destructive/50 transition-all text-destructive">
                    <RefreshCw className="w-4 h-4" /> Reset Progress
                  </button>
                </div>
              </div>
            </div>

            {currentTask && (
              <div className="mt-8 relative h-full">
                <div className="relative rounded-2xl border border-border/50 p-1">
                  <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
                  <div className="relative z-10 p-6 rounded-[1.25rem] bg-background shadow-lg flex flex-col md:flex-row gap-6 justify-between items-start md:items-center overflow-hidden">
                    <div className="flex-1">
                      <p className="text-xs text-primary uppercase font-mono tracking-wider mb-2">Current Task Focus</p>
                      <h3 className="text-xl font-bold text-foreground mb-1">{currentTask.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{currentTask.description}</p>
                      <div className="inline-flex bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
                        <p className="text-xs text-primary font-medium"><strong className="mr-1">Objective:</strong> {currentTask.objective}</p>
                      </div>
                    </div>
                    <button className="glass shrink-0 px-6 py-3 text-sm text-primary font-bold rounded-xl whitespace-nowrap hover:bg-primary/10 transition-colors border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.1)]" onClick={() => {
                      const p = activeCareer.phases.find(x => x.id === currentTask.phaseId);
                      const isLastInPhase = p?.tasks[p.tasks.length - 1].id === currentTask.id;
                      handleTaskComplete(currentTask.id, isLastInPhase);
                    }}>
                      Mark Complete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks, certificates, internships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <button className="glass px-4 py-3 rounded-xl flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground shrink-0">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="space-y-4">
        {filteredPhases.map((phase, pi) => {
          const isExpanded = expandedPhase === phase.id;
          const phaseTasksCompleted = phase.tasks.filter(t => t.completed).length;
          const isPhaseComplete = phaseTasksCompleted === phase.tasks.length;

          return (
            <motion.div
              key={phase.id}
              className="glass rounded-2xl overflow-hidden mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pi * 0.05 }}
              whileHover={{ y: -2, scale: 1.002 }}
            >
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                className={`w-full flex items-center justify-between p-5 transition-colors ${isExpanded ? 'bg-background/40' : 'hover:bg-background/20'}`}
              >
                <div className="flex items-center gap-4 text-left">
                  {isPhaseComplete ?
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    </div>
                    :
                    <div className="w-10 h-10 rounded-full border-2 border-primary/30 flex items-center justify-center shrink-0">
                      <span className="text-primary font-mono text-sm">{pi + 1}</span>
                    </div>
                  }
                  <div>
                    <h3 className={`font-semibold text-lg ${isPhaseComplete ? 'text-muted-foreground line-through decoration-success/50' : 'text-foreground'}`}>{phase.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="w-3.5 h-3.5" /> Phase Duration: {phase.tasks.length} {phase.tasks.length === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <span className="text-sm font-medium text-foreground">{phaseTasksCompleted} <span className="text-muted-foreground">/ {phase.tasks.length} tasks</span></span>
                  </div>
                  <div className={`p-2 rounded-full ${isExpanded ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 space-y-3">
                      <div className="border-t border-border/40 pt-5 space-y-3">
                        {phase.tasks.map((task, ti) => {
                          const globalIdx = allTasks.findIndex(t => t.id === task.id);
                          const isLocked = globalIdx > firstIncompleteIdx && !task.completed;
                          const isNext = globalIdx === firstIncompleteIdx;

                          return (
                            <motion.div
                              key={task.id}
                              whileHover={!isLocked ? { x: 6, scale: 1.01 } : {}}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                              className={`flex items-start gap-4 p-4 rounded-xl transition-all ${task.completed ? 'opacity-60 bg-secondary/30' : isLocked ? 'opacity-40 bg-secondary/10' : isNext ? 'bg-primary/5 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]' : 'glass'}`}
                            >
                              <button
                                onClick={() => !isLocked && !task.completed && handleTaskComplete(task.id, ti === phase.tasks.length - 1)}
                                disabled={isLocked || task.completed}
                                className="mt-1 shrink-0"
                              >
                                {task.completed ? <CheckCircle2 className="w-6 h-6 text-success" /> : isLocked ? <Lock className="w-5 h-5 text-muted-foreground ml-0.5" /> : <Circle className="w-6 h-6 text-primary hover:text-primary/80 transition-colors" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-base font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                  {task.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1 mb-2 leading-relaxed">{task.description}</p>
                                <div className="bg-secondary/50 rounded-lg p-3 text-xs mb-3 border border-border/50">
                                  <strong className="text-foreground">Objective:</strong> {task.objective}
                                </div>
                                {!isLocked && (
                                  <a href={task.youtubeLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-accent font-medium hover:underline bg-accent/10 px-3 py-1.5 rounded-md">
                                    <ExternalLink className="w-3 h-3" /> Learning Material (YT)
                                  </a>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        {filteredPhases.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No tasks matched your search.</div>
        )}
      </div>
    </div>
  );
}
