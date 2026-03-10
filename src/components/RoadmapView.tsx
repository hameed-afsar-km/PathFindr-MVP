import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Lock, CheckCircle2, Circle, ExternalLink, ChevronDown, ChevronRight, Search, Calendar, RefreshCw, Briefcase, Filter, ArrowRightLeft } from 'lucide-react';

export default function RoadmapView() {
  const { activeCareer, profile, updateProfile, completeTask, removeCareer, setHomeTab, updateCareer } = useApp();
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState<{ type: 'completed-phase' | 'target-date', dr: number, tr: number } | null>(null);
  const [newTargetDate, setNewTargetDate] = useState('');

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

  const applyAdjustment = (strategy: string) => {
    // In a real application, this would invoke the AI or regenerate the phases.
    // Here we just close the modal for mock purposes and simulate strategy implementation.
    console.log(`Applying adjustment strategy: ${strategy}`);
    setShowAdjustModal(null);
  };

  const filteredPhases = useMemo(() => {
    if (!searchQuery) return activeCareer.phases;
    const q = searchQuery.toLowerCase();
    return activeCareer.phases.map(p => ({
      ...p,
      tasks: p.tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    })).filter(p => p.tasks.length > 0);
  }, [activeCareer.phases, searchQuery]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <AnimatePresence>
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

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden p-8 rounded-3xl glass border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-background to-transparent z-0"></div>
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
                <span className="text-muted-foreground">Assumed Target:</span>
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
              <button onClick={() => { removeCareer(activeCareer.id); setHomeTab('dashboard'); }} className="flex-1 glass px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:border-destructive/50 transition-all text-destructive">
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>
        </div>

        {currentTask && (
          <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <p className="text-xs text-primary uppercase font-mono tracking-wider mb-1">Current Task</p>
              <p className="text-foreground font-semibold">{currentTask.title}</p>
            </div>
            <button className="glass glow-primary px-4 py-2 text-sm text-primary font-bold rounded-lg whitespace-nowrap" onClick={() => {
              const p = activeCareer.phases.find(x => x.id === currentTask.phaseId);
              const isLastInPhase = p?.tasks[p.tasks.length - 1].id === currentTask.id;
              handleTaskComplete(currentTask.id, isLastInPhase);
            }}>
              Mark Complete ✅
            </button>
          </div>
        )}
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
            <motion.div key={phase.id} className="glass rounded-2xl overflow-hidden mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.05 }}>
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
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      {phase.tasks.map((task, ti) => {
                        const globalIdx = allTasks.findIndex(t => t.id === task.id);
                        const isLocked = globalIdx > firstIncompleteIdx && !task.completed;
                        const isNext = globalIdx === firstIncompleteIdx;

                        return (
                          <div key={task.id} className={`flex items-start gap-4 p-4 rounded-xl transition-all ${task.completed ? 'opacity-60 bg-secondary/30' : isLocked ? 'opacity-40 bg-secondary/10' : isNext ? 'bg-primary/5 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]' : 'glass'}`}>
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
                          </div>
                        );
                      })}
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
