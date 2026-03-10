import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Trash2, ArrowRightLeft, Star } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

export default function CareersTab() {
  const { careers, activeCareer, setActiveCareer, removeCareer, setScreen } = useApp();
  const [careerToDelete, setCareerToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Your Career Paths</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage and track your active journeys.</p>
        </div>
        <button
          onClick={() => setScreen('onboarding')}
          className="glass glow-primary px-6 py-3 rounded-xl text-primary text-sm font-bold hover:bg-primary/10 transition-colors flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Add New Path
        </button>
      </div>

      {careers.length === 0 ? (
        <div className="glass rounded-3xl text-center py-20 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No paths found</h3>
          <p className="text-muted-foreground max-w-sm">You haven't added any careers yet. Start exploring to build your personalized roadmap!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {careers.map((career, i) => {
            const daysLeft = Math.max(0, Math.ceil((new Date(career.targetDate).getTime() - Date.now()) / 86400000));
            const isActive = career.id === activeCareer?.id;

            return (
              <motion.div
                key={career.id}
                className={`relative overflow-hidden p-6 rounded-[2rem] border border-border/50 bg-background shadow-sm flex flex-col justify-between ${isActive ? 'ring-2 ring-primary/30' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />

                {isActive && (
                  <div className="absolute top-0 right-0 px-4 py-1.5 bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider rounded-bl-xl z-20">
                    Active
                  </div>
                )}
                <div className="relative z-10 flex-col flex h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">{career.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="bg-secondary px-2.5 py-1 rounded text-xs text-muted-foreground uppercase tracking-wider font-medium">
                          {career.level}
                        </span>
                        <span className="bg-primary/10 px-2.5 py-1 rounded text-xs text-primary uppercase tracking-wider font-bold">
                          {career.skillScore}% Score
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6 mt-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass px-3 py-2 rounded-lg text-xs">
                        <span className="text-muted-foreground block mb-1">Started</span>
                        <span className="text-foreground font-mono">{new Date(career.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="glass px-3 py-2 rounded-lg text-xs">
                        <span className="text-muted-foreground block mb-1">Target</span>
                        <span className="text-foreground font-mono">{new Date(career.targetDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{career.progress}% Completed</span>
                      <span className="text-xs text-muted-foreground">{daysLeft} days left</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden mb-6">
                      <div className="h-full progress-bar-fill rounded-full" style={{ width: `${career.progress}%` }} />
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      {!isActive ? (
                        <button
                          onClick={() => setActiveCareer(career.id)}
                          className="flex-1 glass px-4 py-2.5 rounded-xl text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-2"
                        >
                          <ArrowRightLeft className="w-4 h-4" /> Switch to this
                        </button>
                      ) : (
                        <div className="flex-1 flex items-center justify-center py-2.5 text-sm font-semibold text-primary/60 cursor-default">
                          Currently Active
                        </div>
                      )}
                      <button
                        onClick={() => setCareerToDelete(career.id)}
                        className="px-4 py-2.5 glass rounded-xl text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center"
                        title="Delete path"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {careerToDelete && (
          <motion.div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass-strong rounded-2xl p-8 max-w-md w-full border border-destructive/20" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 className="text-xl font-bold text-foreground mb-4">Delete Career Path?</h3>
              <p className="text-muted-foreground mb-6">
                This action cannot be undone. Type <strong className="text-destructive font-mono">DELETE</strong> to proceed.
              </p>
              <input
                type="text"
                placeholder="Type DELETE"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value.toUpperCase())}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-destructive/50 mb-6 font-mono text-foreground"
              />
              <div className="flex gap-3">
                <button
                  disabled={deleteConfirmText !== 'DELETE'}
                  onClick={() => { removeCareer(careerToDelete); setCareerToDelete(null); setDeleteConfirmText(''); }}
                  className="flex-1 bg-destructive text-destructive-foreground px-4 py-3 rounded-xl font-semibold disabled:opacity-50 transition-opacity"
                >
                  Delete Path
                </button>
                <button
                  onClick={() => { setCareerToDelete(null); setDeleteConfirmText(''); }}
                  className="flex-1 glass px-4 py-3 rounded-xl font-semibold hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
