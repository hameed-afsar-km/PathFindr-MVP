import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';

export default function SplashScreen() {
  const { setScreen, careers, profile } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Automatically transition to the next screen after 2.5 seconds
    const timer = setTimeout(() => {
      if (careers && careers.length > 0) {
        setScreen('home');
      } else if (profile?.username) {
        setScreen('onboarding');
      } else {
        setScreen('auth');
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [careers, profile, setScreen]);

  return (
    <motion.div
      className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0, scale: 1.02, filter: "blur(5px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Subtle modern radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      {/* Decorative clean line */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-primary/50 to-transparent"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 128, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Modern Logo Mark */}
        <motion.div
          className="w-16 h-16 mb-8 rounded-2xl bg-gradient-to-br from-primary to-accent p-[1px] shadow-2xl shadow-primary/20"
          initial={{ opacity: 0, y: 20, rotate: -10 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="w-full h-full bg-background/90 backdrop-blur-sm rounded-[15px] flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
          </div>
        </motion.div>

        {/* Clean Typography */}
        <div className="overflow-hidden mb-2">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            PathFindr<span className="text-primary">.AI</span>
          </motion.h1>
        </div>

        {/* Subtitle / Loading state */}
        <motion.div
          className="overflow-hidden h-8 flex items-center justify-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center gap-3 space-x-1">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Initializing Experience
            </span>
            <div className="flex gap-1" aria-hidden="true">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-primary/60"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-primary/80"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative element */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground tracking-widest uppercase font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        © 2026 PathWeaver Technologies
      </motion.div>
    </motion.div>
  );
}
