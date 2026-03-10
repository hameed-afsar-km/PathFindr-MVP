import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { generateCareerMatches, generateMoreCareers, searchCareers } from '@/lib/mockAI';
import { Search, Sparkles, BrainCircuit, Rocket, Target, ArrowRight, RefreshCw } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

const loadingTexts = [
  'Synthesizing career paths...',
  'Mapping skill gaps...',
  'Analyzing market trends...',
  'Calculating match scores...',
  'Finalizing recommendations...',
];

export default function CareerMatcher() {
  const { surveyAnswers, setScreen } = useApp();
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState(loadingTexts[0]);
  const [matches, setMatches] = useState<{ title: string; matchPercentage: number; justification: string; id: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ title: string; id: string }[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < loadingTexts.length) setLoadingText(loadingTexts[i]);
    }, 500);

    const load = async () => {
      const results = await generateCareerMatches(surveyAnswers);
      setMatches(results);
      setLoading(false);
      clearInterval(interval);
    };

    load();

    return () => { clearInterval(interval); };
  }, [surveyAnswers]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.length >= 2) setSearchResults(searchCareers(q));
    else setSearchResults([]);
  };

  const handleGenerateMore = () => {
    const newExcluded = [...excluded, ...matches.map(m => m.id)];
    setExcluded(newExcluded);
    setMatches(generateMoreCareers(newExcluded));
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    // Store selected career ID temporarily
    localStorage.setItem('pathfindr-selected-career', id);
    setScreen('skill-assessment');
  };

  if (loading) {
    return (
      <motion.div
        className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-32 h-32 mb-12">
            <motion.div
              className="absolute inset-0 rounded-[2rem] border-2 border-primary/20 backdrop-blur-sm shadow-[0_0_30px_rgba(var(--primary),0.15)]"
              animate={{ rotate: 360, borderRadius: ["2rem", "3rem", "2rem"] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-4 rounded-3xl border-2 border-dashed border-accent/30"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <BrainCircuit className="w-10 h-10 text-primary animate-pulse" />
            </div>
          </div>

          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3 justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
              Cognitive Engine Processing
            </h2>
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingText}
                className="text-primary font-mono text-xs font-bold uppercase tracking-[0.3em] bg-primary/5 px-6 py-2 rounded-full border border-primary/10"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.4 }}
              >
                {loadingText}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-background overflow-y-auto scrollbar-thin"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-12">
        <header className="space-y-4">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Target className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Analysis Complete</span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Your Career <span className="text-primary">Trajectories</span>
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-lg max-w-xl leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            We've synthesized your inputs to identify the paths where you have the highest potential for impact and growth.
          </motion.p>
        </header>

        {/* Search */}
        <motion.div
          className="relative max-w-md group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for a specific path..."
            className="w-full bg-secondary/50 border border-border/50 rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-3 glass rounded-2xl overflow-hidden z-20 border border-border/50 shadow-2xl"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
              >
                {searchResults.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r.id)}
                    className="w-full text-left px-5 py-4 text-sm font-semibold text-foreground hover:bg-primary hover:text-white transition-all border-b border-border/40 last:border-0 flex items-center justify-between group/res"
                  >
                    {r.title}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover/res:opacity-100 -translate-x-2 group-hover/res:translate-x-0 transition-all" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Career cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <button
                onClick={() => handleSelect(match.id)}
                className="group relative w-full rounded-[2.5rem] border border-border/50 p-1 text-left transition-all"
              >
                <GlowingEffect spread={80} glow={true} disabled={false} proximity={128} inactiveZone={0.01} borderWidth={3} />
                <div className="relative h-full w-full rounded-[2.25rem] bg-background p-8 md:p-10 flex flex-col gap-6 overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                      <Rocket className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Match Index</span>
                      <span className="text-3xl font-black text-primary font-mono tabular-nums leading-none">
                        {typeof match.matchPercentage === 'number' ? match.matchPercentage.toFixed(2) : match.matchPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                      {match.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {match.justification}
                    </p>
                  </div>

                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                      <span>Alignment</span>
                      <span>Optimal Path</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden p-[2px]">
                      <motion.div
                        className="h-full gradient-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${match.matchPercentage}%` }}
                        transition={{ delay: 1 + i * 0.1, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="pt-8 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <button
            onClick={handleGenerateMore}
            className="px-12 py-4 glass rounded-2xl text-muted-foreground hover:text-primary font-black text-xs uppercase tracking-[0.3em] transition-all hover:border-primary/30 flex items-center gap-4"
          >
            Explore Alternative Realities
            <RefreshCw className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
