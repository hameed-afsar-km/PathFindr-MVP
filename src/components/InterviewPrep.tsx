import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getInterviewQuestions } from '@/lib/mockAI';
import { Building2, CheckCircle2, XCircle, ArrowLeft, Trophy, Calendar, Briefcase } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

const companies = ['Google', 'Amazon', 'Meta', 'Apple', 'Microsoft', 'Netflix', 'Stripe', 'Uber'];

export default function InterviewPrep() {
  const [company, setCompany] = useState('');
  const [questions, setQuestions] = useState<ReturnType<typeof getInterviewQuestions>>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'technical' | 'behavioral'>('all');

  const startPrep = (c: string) => {
    setCompany(c);
    setQuestions(getInterviewQuestions(c));
    setCurrentQ(0);
    setAnswered(null);
  };

  if (!company) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">Interview Prep</h1>
          <p className="text-muted-foreground max-w-xl">Master the art of technical and behavioral interviews at world-class companies.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {companies.map((c, i) => (
            <motion.div
              key={c}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <motion.button
                onClick={() => startPrep(c)}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative w-full h-40 rounded-[2rem] border border-border/50 p-1 transition-all"
              >
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative h-full w-full rounded-[1.75rem] bg-background flex flex-col items-center justify-center gap-3 overflow-hidden group-hover:bg-secondary/20 transition-colors">
                  <div className="p-3 bg-accent/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                    <Building2 className="w-6 h-6 text-accent" />
                  </div>
                  <span className="text-foreground font-bold text-center tracking-tight">{c}</span>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-border/20 rounded-full group-hover:w-16 group-hover:bg-accent/40 transition-all duration-500" />
                </div>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const filtered = questions.filter(q => filter === 'all' || q.type === filter);
  const q = filtered[currentQ];
  if (!q) return null;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => setCompany('')}
            className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors mb-3"
          >
            <ArrowLeft className="w-3 h-3" /> All Companies
          </button>
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-accent/10 rounded-xl">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{company} Mastery</h2>
          </div>
        </div>

        <div className="flex gap-2 bg-secondary/30 p-1.5 rounded-2xl border border-border/50">
          {(['all', 'technical', 'behavioral'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setCurrentQ(0); setAnswered(null); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${company}-${currentQ}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative min-h-[450px]"
        >
          <div className="relative h-full rounded-[2.5rem] border border-border/50 p-1 md:p-2">
            <GlowingEffect spread={80} glow={true} disabled={false} proximity={128} inactiveZone={0.01} borderWidth={3} variant="white" />
            <div className="relative h-full flex flex-col p-8 md:p-10 rounded-[2.25rem] bg-background overflow-hidden">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Calendar className="w-3 h-3" /> {q.year}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 rounded-lg text-[10px] font-bold text-accent uppercase tracking-widest">
                    <Briefcase className="w-3 h-3" /> {q.type}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-muted-foreground/50 tracking-widest">
                  {currentQ + 1} OF {filtered.length}
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed mb-10">
                {q.question}
              </h3>

              <div className="grid grid-cols-1 gap-4 flex-1">
                {q.options.map((opt, i) => {
                  let statusStyle = 'border-border/50 bg-secondary/10 hover:border-accent/30 hover:bg-secondary/30';
                  let icon = <div className="w-5 h-5 rounded-lg border-2 border-accent/20 flex items-center justify-center font-mono text-[10px] text-accent/50 group-hover:border-accent transition-colors">{String.fromCharCode(65 + i)}</div>;

                  if (answered !== null) {
                    if (i === q.correctIndex) {
                      statusStyle = 'border-success bg-success/10 cursor-default ring-2 ring-success/20';
                      icon = <CheckCircle2 className="w-5 h-5 text-success shrink-0" />;
                    }
                    else if (i === answered) {
                      statusStyle = 'border-destructive bg-destructive/10 cursor-default ring-2 ring-destructive/20';
                      icon = <XCircle className="w-5 h-5 text-destructive shrink-0" />;
                    }
                    else {
                      statusStyle = 'border-border/20 opacity-40 cursor-default';
                    }
                  }

                  return (
                    <motion.button
                      key={i}
                      whileHover={{ x: 8, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      onClick={() => answered === null && setAnswered(i)}
                      disabled={answered !== null}
                      className={`group relative flex items-center gap-5 text-left p-5 rounded-2xl text-sm font-semibold text-foreground transition-all border ${statusStyle}`}
                    >
                      {icon}
                      <span className="flex-1 leading-snug">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>

              {answered !== null && currentQ < filtered.length - 1 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => { setCurrentQ(c => c + 1); setAnswered(null); }}
                  className="mt-10 w-full md:w-auto px-10 py-4 bg-accent text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform"
                >
                  Proceed to Next →
                </motion.button>
              )}

              {answered !== null && currentQ === filtered.length - 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 p-6 bg-accent/5 rounded-2xl border border-accent/10 flex items-center justify-between">
                  <p className="text-sm font-bold text-accent uppercase tracking-widest">Section Mastery Complete</p>
                  <button onClick={() => setCompany('')} className="px-6 py-2 glass rounded-lg text-xs font-bold uppercase hover:bg-accent hover:text-white transition-all">Select Company</button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
