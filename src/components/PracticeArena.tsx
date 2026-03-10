import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPracticeQuestions } from '@/lib/mockAI';
import { Search, CheckCircle2, XCircle, ArrowLeft, BookOpen, BrainCircuit } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

const topics = ['JavaScript', 'React', 'TypeScript', 'Python', 'SQL', 'System Design', 'Data Structures', 'Algorithms'];

export default function PracticeArena() {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const filteredTopics = topics.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

  const startPractice = async (topic: string) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    try {
      const qs = await getPracticeQuestions(topic);
      setQuestions(qs);
      setCurrentQ(0);
      setAnswered(null);
      setScore(0);
    } catch (error) {
      console.error("Failed to load practice questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    if (idx === questions[currentQ].correctIndex) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setAnswered(null);
    }
  };

  if (!selectedTopic) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">Practice Arena</h1>
          <p className="text-muted-foreground max-w-xl">Master core concepts through interactive challenges and real-time feedback.</p>
        </div>

        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search core topics..."
            className="w-full bg-secondary/50 border border-border/50 rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTopics.map((topic, i) => (
            <motion.div
              key={topic}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.button
                onClick={() => startPractice(topic)}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative w-full aspect-square md:aspect-auto md:h-40 rounded-[2rem] border border-border/50 p-1 transition-all"
              >
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative h-full w-full rounded-[1.75rem] bg-background flex flex-col items-center justify-center gap-3 overflow-hidden p-4 group-hover:bg-secondary/20 transition-colors">
                  <div className="p-3 bg-primary/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                    <BrainCircuit className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-foreground font-bold text-center tracking-tight">{topic}</span>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-border/20 rounded-full group-hover:w-16 group-hover:bg-primary/40 transition-all duration-500" />
                </div>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-24 h-24 rounded-full border-t-2 border-primary" />
              <BrainCircuit className="w-10 h-10 text-primary absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-xl font-black text-foreground uppercase tracking-widest animate-pulse">AI Synthesizing Challenges...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => setSelectedTopic('')}
            className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors mb-3"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Arena
          </button>
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{selectedTopic}</h2>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-2xl border border-border/50">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Question {currentQ + 1}/{questions.length}</span>
          <div className="w-[1px] h-3 bg-border" />
          <span className="text-sm font-mono font-bold text-primary">Score: {score}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative min-h-[400px]"
        >
          <div className="relative h-full rounded-[2.5rem] border border-border/50 p-1 md:p-2">
            <GlowingEffect spread={80} glow={true} disabled={false} proximity={128} inactiveZone={0.01} borderWidth={3} />
            <div className="relative h-full flex flex-col p-8 md:p-10 rounded-[2.25rem] bg-background overflow-hidden">
              <h3 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed mb-10">
                {q.question}
              </h3>

              <div className="grid grid-cols-1 gap-4 flex-1">
                {q.options.map((opt, i) => {
                  let statusStyle = 'border-border/50 bg-secondary/20 hover:border-primary/30 hover:bg-secondary/40';
                  let icon = <div className="w-5 h-5 rounded-lg border-2 border-primary/20 flex items-center justify-center font-mono text-[10px] text-primary/50 group-hover:border-primary transition-colors">{String.fromCharCode(65 + i)}</div>;

                  if (answered !== null) {
                    if (i === q.correctIndex) {
                      statusStyle = 'border-success bg-success/10 cursor-default ring-2 ring-success/20';
                      icon = <CheckCircle2 className="w-5 h-5 text-success shrink-0 scale-110" />;
                    }
                    else if (i === answered) {
                      statusStyle = 'border-destructive bg-destructive/10 cursor-default ring-2 ring-destructive/20';
                      icon = <XCircle className="w-5 h-5 text-destructive shrink-0 scale-110" />;
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
                      onClick={() => handleAnswer(i)}
                      disabled={answered !== null}
                      className={`group relative flex items-center gap-5 text-left p-5 rounded-2xl text-sm font-semibold text-foreground transition-all border ${statusStyle}`}
                    >
                      {icon}
                      <span className="flex-1 leading-snug">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>

              {answered !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 pt-8 border-t border-border/50">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-2 bg-primary/5 rounded-lg shrink-0">
                      <BrainCircuit className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Insight & Explanation</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">{q.explanation}</p>
                    </div>
                  </div>

                  {currentQ < questions.length - 1 ? (
                    <button
                      onClick={nextQuestion}
                      className="w-full md:w-auto px-10 py-4 gradient-primary rounded-xl text-primary-foreground font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                    >
                      Next Challenge →
                    </button>
                  ) : (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Assessment Complete</p>
                        <p className="text-lg font-black text-foreground">You scored <span className="text-primary">{score}</span> out of <span className="text-primary">{questions.length}</span></p>
                      </div>
                      <button
                        onClick={() => setSelectedTopic('')}
                        className="px-8 py-3 glass rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                      >
                        Try New Topic
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
