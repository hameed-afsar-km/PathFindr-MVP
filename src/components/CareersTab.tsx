import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Trash2, ArrowRightLeft, Star } from 'lucide-react';

export default function CareersTab() {
  const { careers, activeCareer, setActiveCareer, removeCareer, setScreen } = useApp();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Careers</h2>
          <p className="text-muted-foreground text-sm">All paths you've explored</p>
        </div>
        <button
          onClick={() => setScreen('onboarding')}
          className="glass px-4 py-2 rounded-lg text-primary text-sm font-semibold hover:border-primary/30"
        >
          + Add New
        </button>
      </div>

      {careers.length === 0 ? (
        <div className="bento-card text-center py-12">
          <p className="text-muted-foreground">No careers yet. Start exploring!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {careers.map((career, i) => {
            const daysLeft = Math.max(0, Math.ceil((new Date(career.targetDate).getTime() - Date.now()) / 86400000));
            const isActive = career.id === activeCareer?.id;

            return (
              <motion.div
                key={career.id}
                className={`bento-card ${isActive ? 'border-primary/50 glow-primary' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isActive && <Star className="w-4 h-4 text-xp fill-xp" />}
                      <h3 className="text-lg font-bold text-foreground">{career.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                      <span>Started: {new Date(career.startDate).toLocaleDateString()}</span>
                      <span>Target: {new Date(career.targetDate).toLocaleDateString()}</span>
                      <span>Level: <span className="text-primary capitalize">{career.level}</span></span>
                      <span>{daysLeft} days left</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden max-w-sm">
                      <div className="h-full progress-bar-fill rounded-full" style={{ width: `${career.progress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{career.progress}% complete</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!isActive && (
                      <button
                        onClick={() => setActiveCareer(career.id)}
                        className="p-2 glass rounded-lg text-primary hover:border-primary/30"
                        title="Switch to this career"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeCareer(career.id)}
                      className="p-2 glass rounded-lg text-destructive hover:border-destructive/30"
                      title="Delete career"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
