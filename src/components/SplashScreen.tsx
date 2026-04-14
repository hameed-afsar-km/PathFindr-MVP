import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { GlowingEffect } from './ui/glowing-effect';
import { EtherealShadow } from './ui/etheral-shadow';
import { Compass, Sparkles, BrainCircuit } from 'lucide-react';

export default function SplashScreen() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 0: Logo entering
    // Phase 1: Text entering
    // Phase 2: Loading State
    const timer1 = setTimeout(() => setPhase(1), 800);
    const timer2 = setTimeout(() => setPhase(2), 1600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <EtherealShadow 
          color="rgba(167, 139, 250, 1)" 
          animation={{ scale: 80, speed: 10 }}
          noise={{ opacity: 0.8, scale: 1.8 }}
          sizing="fill"
        />
      </div>
      <motion.div
        className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"
        animate={{ opacity: [0.03, 0.05, 0.03] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Decorative Floating Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/20"
            initial={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Modern Logo Mark with Glowing Effect */}
        <motion.div
          className="group relative w-24 h-24 mb-12 rounded-[2rem] border border-border/50 p-1"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlowingEffect spread={120} glow={true} disabled={false} proximity={128} inactiveZone={0.01} borderWidth={3} />
          <div className="relative h-full w-full rounded-[1.75rem] bg-background flex items-center justify-center overflow-hidden">
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <Compass className="w-10 h-10 text-primary" />
            </motion.div>

            {/* Abstract internal glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent animate-pulse" />
          </div>
        </motion.div>

        {/* Clean Typography */}
        <div className="flex flex-col items-center">
          <div className="overflow-hidden h-16 mb-2">
            <motion.h1
              className="text-5xl md:text-7xl font-black tracking-tighter text-foreground text-center"
              initial={{ opacity: 0, y: 80 }}
              animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              PathFindr<span className="text-primary">.AI</span>
            </motion.h1>
          </div>

          <motion.div
            className="h-1 w-12 bg-primary/20 rounded-full mb-6"
            initial={{ width: 0 }}
            animate={phase >= 1 ? { width: 48 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>

        {/* Status Messaging */}
        <div className="h-12 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {phase >= 2 && (
              <motion.div
                key="loading"
                className="flex items-center gap-4 px-6 py-2 rounded-full glass border border-primary/20"
                initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
              >
                <div className="flex gap-1.5 items-center">
                  <BrainCircuit className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                    Initializing Neural Frameworks
                  </span>
                </div>
                <div className="w-[1px] h-3 bg-primary/20" />
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 rounded-full bg-primary"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* High-end Copyright / Version Marker */}
      <motion.div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3 h-3 text-primary/40" />
          <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.4em]">
            Secure Environment v1.0.4
          </span>
          <Sparkles className="w-3 h-3 text-primary/40" />
        </div>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      </motion.div>
    </motion.div>
  );
}
