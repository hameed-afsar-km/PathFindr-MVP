import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, HomeTab } from '@/context/AppContext';
import Dashboard from './Dashboard';
import RoadmapView from './RoadmapView';
import PracticeArena from './PracticeArena';
import InterviewPrep from './InterviewPrep';
import Simulations from './Simulations';
import CareersTab from './CareersTab';
import ProfileTab from './ProfileTab';
import Chatbot from './Chatbot';
import MagnificationDock from './MagnificationDock';
import { LayoutDashboard, Map, Dumbbell, MessageSquare, Gamepad2, Briefcase, UserCircle, MessageCircle } from 'lucide-react';

const tabs: { key: HomeTab; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { key: 'roadmap', label: 'Roadmap', icon: Map },
  { key: 'practice', label: 'Practice', icon: Dumbbell },
  { key: 'interview', label: 'Interview', icon: MessageSquare },
  { key: 'simulations', label: 'Sims', icon: Gamepad2 },
  { key: 'careers', label: 'Careers', icon: Briefcase },
  { key: 'profile', label: 'Profile', icon: UserCircle },
];

const tabComponents: Record<HomeTab, React.ElementType> = {
  dashboard: Dashboard,
  roadmap: RoadmapView,
  practice: PracticeArena,
  interview: InterviewPrep,
  simulations: Simulations,
  careers: CareersTab,
  profile: ProfileTab,
};

export default function HomeScreen() {
  const { homeTab, setHomeTab } = useApp();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const TabContent = tabComponents[homeTab];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={homeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="min-h-full flex flex-col"
          >
            <div className="flex-1">
              <TabContent />
            </div>

            {/* Footer */}
            <footer className="mt-20 py-10 px-6 border-t border-border/40 text-center">
              <h3 className="text-lg font-black text-foreground tracking-tight mb-1">
                PathFindr<span className="text-primary">.AI</span>
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Developed by <span className="text-primary/80">Hameed Afsar K M</span>
              </p>
              <p className="text-[10px] text-muted-foreground/50 mt-4 uppercase tracking-[0.2em]">
                © 2026 All Rights Reserved
              </p>
            </footer>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="z-50">
            <Chatbot />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-20 right-4 md:right-8 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Bottom nav using MagnificationDock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pb-4 pt-10 pointer-events-none flex justify-center bg-gradient-to-t from-background via-background/80 to-transparent">
        <div className="pointer-events-auto">
          <MagnificationDock
            items={tabs.map(tab => {
              const Icon = tab.icon;
              return {
                icon: <Icon size={20} />,
                label: tab.label,
                onClick: () => setHomeTab(tab.key),
                isActive: homeTab === tab.key
              };
            })}
            panelHeight={64}
            baseItemSize={48}
            magnification={70}
          />
        </div>
      </div>
    </div>
  );
}
