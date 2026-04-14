/**
 * ERPRouter
 * ---------
 * Central routing brain for PathFindr ERP.
 * Reads the active ERP session and renders the correct layer:
 *   - No session  → ERPLoginPage
 *   - admin       → AdminDashboard
 *   - institute   → InstituteDashboard
 *   - student     → StudentERPWrapper (existing app, institute-branded)
 *
 * Also handles path-based institute routing: /institute/:slug
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useERP } from '@/context/ERPContext';
import ERPLoginPage from '@/pages/erp/ERPLoginPage';
import AdminDashboard from '@/pages/erp/AdminDashboard';
import InstituteDashboard from '@/pages/erp/InstituteDashboard';
import StudentERPWrapper from '@/pages/erp/StudentERPWrapper';
import SplashScreen from '@/components/SplashScreen';

function PageTransition({ children, keyVal }: { children: React.ReactNode; keyVal: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyVal}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function ERPRouter() {
  const { session, institutes, loginAdmin } = useERP();
  const [showSplash, setShowSplash] = useState(true);

  // ── Path-based slug routing ──────────────────────────────────────────────
  // If the URL is /institute/:slug we treat this as "show institute login"
  // In a real app you'd do this with React Router; here we parse window.location.
  useEffect(() => {
    // Hide splash after 3 seconds
    const timer = setTimeout(() => setShowSplash(false), 3000);

    const path = window.location.pathname; // e.g. /institute/apex-tech
    const match = path.match(/^\/institute\/([^/]+)/);
    if (match) {
      const slug = match[1];
      const inst = institutes.find(i => i.slug === slug);
      if (inst) {
        // Reflect the slug context in the page title
        document.title = `${inst.name} | PathFindr ERP`;
      }
    } else {
      document.title = 'PathFindr ERP';
    }

    return () => clearTimeout(timer);
  }, [institutes]);

  if (showSplash) {
    return <SplashScreen />;
  }

  // ── Role routing ─────────────────────────────────────────────────────────
  if (!session) {
    return (
      <PageTransition keyVal="login">
        <ERPLoginPage />
      </PageTransition>
    );
  }

  if (session.role === 'admin') {
    return (
      <PageTransition keyVal="admin">
        <AdminDashboard />
      </PageTransition>
    );
  }

  if (session.role === 'institute') {
    return (
      <PageTransition keyVal="institute">
        <InstituteDashboard />
      </PageTransition>
    );
  }

  if (session.role === 'student') {
    return (
      <PageTransition keyVal="student">
        <StudentERPWrapper />
      </PageTransition>
    );
  }

  // Fallback
  return (
    <PageTransition keyVal="login-fallback">
      <ERPLoginPage />
    </PageTransition>
  );
}
