import { useState } from 'react';
import { motion } from 'framer-motion';
import { getInterviewQuestions } from '@/lib/mockAI';
import { Building2, CheckCircle2, XCircle } from 'lucide-react';

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
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-1">Interview Prep</h2>
        <p className="text-muted-foreground text-sm mb-6">Practice company-specific interview questions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {companies.map((c, i) => (
            <motion.button
              key={c}
              onClick={() => startPrep(c)}
              className="bento-card text-center py-6 hover:border-primary/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <Building2 className="w-6 h-6 mx-auto mb-2 text-primary" />
              <span className="text-foreground font-semibold">{c}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const filtered = questions.filter(q => filter === 'all' || q.type === filter);
  const q = filtered[currentQ];
  if (!q) return null;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <button onClick={() => setCompany('')} className="text-muted-foreground text-sm hover:text-foreground mb-2">← Back</button>
      <h2 className="text-xl font-bold text-foreground mb-4">{company} Interview Questions</h2>

      <div className="flex gap-2 mb-6">
        {(['all', 'technical', 'behavioral'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setCurrentQ(0); setAnswered(null); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground hover:text-foreground'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <motion.div key={`${company}-${currentQ}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bento-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-muted-foreground">{q.year} • {q.type}</span>
          <span className="text-xs font-mono text-muted-foreground">{currentQ + 1}/{filtered.length}</span>
        </div>
        <p className="text-foreground font-semibold mb-6">{q.question}</p>
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let style = 'border-border hover:border-primary/30';
            let icon = null;
            if (answered !== null) {
              if (i === q.correctIndex) { style = 'border-success bg-success/10'; icon = <CheckCircle2 className="w-4 h-4 text-success" />; }
              else if (i === answered) { style = 'border-destructive bg-destructive/10'; icon = <XCircle className="w-4 h-4 text-destructive" />; }
            }
            return (
              <button key={i} onClick={() => answered === null && setAnswered(i)} className={`w-full flex items-center gap-3 text-left glass px-4 py-3 rounded-lg text-sm text-foreground border ${style}`}>
                {icon} <span>{opt}</span>
              </button>
            );
          })}
        </div>
        {answered !== null && currentQ < filtered.length - 1 && (
          <button onClick={() => { setCurrentQ(c => c + 1); setAnswered(null); }} className="mt-4 glass px-6 py-2 rounded-lg text-primary text-sm font-semibold">
            Next →
          </button>
        )}
      </motion.div>
    </div>
  );
}
