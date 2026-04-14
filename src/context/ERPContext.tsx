import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ERPData, AuthSession, Institute, Student, InstituteFeatures } from '@/types/saas';
import { INSTITUTE_THEMES } from '@/types/saas';

// ── Defaults ──────────────────────────────────────────────────────────────────

const ADMIN_CREDENTIALS = { email: 'admin@pathfindr.ai', password: 'admin123' };

const SEED_STUDENTS: Student[] = [
  // Crescent Students
  { id: 's1', name: 'Zaid Bin Haris', email: 'zaid@crescent.edu', username: 'zaid.h', password: 'student123', instituteId: 'inst-crescent', enrolledAt: new Date().toISOString(), xp: 1250, streak: 12, activeCareer: 'AI Engineer', courses: ['Machine Learning', 'Deep Learning'], courseLimit: 5 },
  { id: 's2', name: 'Ameena Fathima', email: 'ameena@crescent.edu', username: 'ameena.f', password: 'student123', instituteId: 'inst-crescent', enrolledAt: new Date().toISOString(), xp: 150, streak: 1, activeCareer: 'Data Analyst', courses: ['PowerBI', 'SQL'], courseLimit: 5 },
  
  // SRM Students
  { id: 's3', name: 'Vijay Kumar', email: 'vijay@srm.edu', username: 'vijay.k', password: 'student123', instituteId: 'inst-srm', enrolledAt: new Date().toISOString(), xp: 850, streak: 5, activeCareer: 'Full Stack Developer', courses: ['React', 'Node.js'], courseLimit: 5 },
  { id: 's4', name: 'Sneha Reddy', email: 'sneha@srm.edu', username: 'sneha.r', password: 'student123', instituteId: 'inst-srm', enrolledAt: new Date().toISOString(), xp: 120, streak: 2, activeCareer: 'UI/UX Designer', courses: ['Figma'], courseLimit: 5 },

  // Rajalakshmi Students
  { id: 's5', name: 'Manoj Swaminathan', email: 'manoj@rec.edu', username: 'manoj.s', password: 'student123', instituteId: 'inst-rec', enrolledAt: new Date().toISOString(), xp: 2100, streak: 24, activeCareer: 'Cloud Architect', courses: ['AWS', 'Kubernetes'], courseLimit: 10 },
  { id: 's6', name: 'Divya Bharathi', email: 'divya@rec.edu', username: 'divya.b', password: 'student123', instituteId: 'inst-rec', enrolledAt: new Date().toISOString(), xp: 95, streak: 0, activeCareer: 'Cybersecurity Analyst', courses: ['Ethical Hacking'], courseLimit: 5 },
];

const SEED_INSTITUTES: Institute[] = [
  {
    id: 'inst-crescent',
    name: 'Crescent Institute of Science and Technology',
    slug: 'crescent',
    logoInitials: 'BS',
    logoColor: '#10b981',
    theme: 'forest',
    whiteLabel: true,
    features: { roadmap: true, practice: true, chatbot: true, careers: true, interview: true, simulations: true },
    authorizedFeatures: { roadmap: true, practice: true, chatbot: true, careers: true, interview: true, simulations: true },
    students: SEED_STUDENTS.filter(s => s.instituteId === 'inst-crescent'),
    createdAt: new Date().toISOString(),
    createdBy: 'admin',
    adminEmail: 'admin@crescent.edu',
    adminPassword: 'crescentAdmin',
  },
  {
    id: 'inst-srm',
    name: 'SRM Katangulathur',
    slug: 'srm',
    logoInitials: 'SR',
    logoColor: '#0ea5e9',
    theme: 'ocean',
    whiteLabel: false,
    features: { roadmap: true, practice: true, chatbot: false, careers: true, interview: true, simulations: false },
    authorizedFeatures: { roadmap: true, practice: true, chatbot: true, careers: true, interview: true, simulations: true },
    students: SEED_STUDENTS.filter(s => s.instituteId === 'inst-srm'),
    createdAt: new Date().toISOString(),
    createdBy: 'admin',
    adminEmail: 'admin@srm.edu',
    adminPassword: 'srmAdmin',
  },
  {
    id: 'inst-rec',
    name: 'Rajalakshmi Engineering College',
    slug: 'recollege',
    logoInitials: 'RC',
    logoColor: '#f43f5e',
    theme: 'crimson',
    whiteLabel: true,
    features: { roadmap: true, practice: true, chatbot: true, careers: true, interview: false, simulations: true },
    authorizedFeatures: { roadmap: true, practice: true, chatbot: true, careers: true, interview: true, simulations: true },
    students: SEED_STUDENTS.filter(s => s.instituteId === 'inst-rec'),
    createdAt: new Date().toISOString(),
    createdBy: 'admin',
    adminEmail: 'admin@rec.edu',
    adminPassword: 'recAdmin',
  },
];

const DEFAULT_DATA: ERPData = {
  institutes: SEED_INSTITUTES,
  session: null,
};

// ── Storage helpers ────────────────────────────────────────────────────────────

function loadERP(): ERPData {
  try {
    const raw = localStorage.getItem('pathfindr-erp');
    if (raw) return JSON.parse(raw) as ERPData;
  } catch { /* empty */ }
  return DEFAULT_DATA;
}

function saveERP(data: ERPData) {
  try { localStorage.setItem('pathfindr-erp', JSON.stringify(data)); } catch { /* empty */ }
}

// ── Context ────────────────────────────────────────────────────────────────────

interface ERPContextType {
  data: ERPData;
  session: AuthSession | null;
  institutes: Institute[];
  // Auth
  login: (identifier: string, password: string) => boolean;
  loginAdmin: (email: string, password: string) => boolean;
  loginInstitute: (email: string, password: string) => boolean;
  loginStudent: (username: string, password: string, slug: string) => boolean;
  logout: () => void;
  // Admin operations
  createInstitute: (payload: Omit<Institute, 'id' | 'students' | 'createdAt' | 'createdBy'>) => Institute;
  deleteInstitute: (id: string) => void;
  updateInstitute: (id: string, updates: Partial<Institute>) => void;
  // Student operations
  addStudentsToInstitute: (instituteId: string, students: Omit<Student, 'id' | 'instituteId' | 'enrolledAt' | 'xp' | 'streak' | 'courses' | 'courseLimit'>[]) => void;
  updateStudent: (instituteId: string, studentId: string, updates: Partial<Student>) => void;
  removeStudent: (instituteId: string, studentId: string) => void;
  // Announcements & Notifications
  addAnnouncement: (instituteId: string, payload: Omit<Announcement, 'id' | 'createdAt'>) => void;
  removeAnnouncement: (instituteId: string, announcementId: string) => void;
  addNotification: (instituteId: string, notification: Omit<InstituteNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationsRead: (instituteId: string) => void;
  // Helpers
  getInstituteBySlug: (slug: string) => Institute | undefined;
  getInstituteById: (id: string) => Institute | undefined;
  getStudentById: (id: string) => Student | undefined;
  applyInstituteTheme: (themeId: Institute['theme']) => void;
  resetTheme: () => void;
}

const ERPContext = createContext<ERPContextType | null>(null);

export function ERPProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ERPData>(loadERP);

  // Persist on every change
  useEffect(() => { saveERP(data); }, [data]);

  const mutate = useCallback((fn: (d: ERPData) => ERPData) => {
    setData(prev => fn(prev));
  }, []);

  // ── AUTH ──────────────────────────────────────────────────────────────────

  const loginAdmin = useCallback((email: string, password: string): boolean => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      mutate(d => ({
        ...d,
        session: {
          role: 'admin',
          userId: 'admin',
          username: 'Super Admin',
          email,
          loggedInAt: new Date().toISOString(),
        },
      }));
      return true;
    }
    return false;
  }, [mutate]);

  const loginInstitute = useCallback((email: string, password: string): boolean => {
    const inst = data.institutes.find(i => i.adminEmail === email && i.adminPassword === password);
    if (inst) {
      mutate(d => ({
        ...d,
        session: {
          role: 'institute',
          userId: inst.id,
          instituteId: inst.id,
          username: inst.name,
          email,
          loggedInAt: new Date().toISOString(),
        },
      }));
      return true;
    }
    return false;
  }, [data.institutes, mutate]);

  const loginStudent = useCallback((username: string, password: string, slug: string): boolean => {
    const inst = data.institutes.find(i => i.slug === slug);
    if (!inst) return false;
    const student = inst.students.find(s => s.username === username && s.password === password);
    if (student) {
      mutate(d => ({
        ...d,
        session: {
          role: 'student',
          userId: student.id,
          instituteId: inst.id,
          username: student.name,
          email: student.email,
          loggedInAt: new Date().toISOString(),
        },
      }));
      return true;
    }
    return false;
  }, [data.institutes, mutate]);

  const login = useCallback((identifier: string, password: string): boolean => {
    // 1. Check Admin
    if (identifier === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      mutate(d => ({
        ...d,
        session: {
          role: 'admin',
          userId: 'admin',
          username: 'Super Admin',
          email: identifier,
          loggedInAt: new Date().toISOString(),
        },
      }));
      return true;
    }

    // 2. Check Institute
    const inst = data.institutes.find(i => i.adminEmail === identifier && i.adminPassword === password);
    if (inst) {
      mutate(d => ({
        ...d,
        session: {
          role: 'institute',
          userId: inst.id,
          instituteId: inst.id,
          username: inst.name,
          email: identifier,
          loggedInAt: new Date().toISOString(),
        },
      }));
      return true;
    }

    // 3. Check Student
    for (const i of data.institutes) {
      const student = i.students.find(s => (s.username === identifier || s.email === identifier) && s.password === password);
      if (student) {
        mutate(d => ({
          ...d,
          session: {
            role: 'student',
            userId: student.id,
            instituteId: i.id,
            username: student.name,
            email: student.email,
            loggedInAt: new Date().toISOString(),
          },
        }));
        return true;
      }
    }
    return false;
  }, [data.institutes, mutate]);

  const logout = useCallback(() => {
    resetTheme();
    mutate(d => ({ ...d, session: null }));
  }, [mutate]);

  // ── INSTITUTE CRUD ────────────────────────────────────────────────────────

  const createInstitute = useCallback((payload: any): Institute => {
    const defaultFeatures = { roadmap: false, practice: false, chatbot: false, careers: false, interview: false, simulations: false };
    const newInst: Institute = {
      ...payload,
      id: `inst-${Date.now()}`,
      students: [],
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
      authorizedFeatures: payload.authorizedFeatures || payload.features || defaultFeatures,
      features: payload.features || defaultFeatures,
    };
    mutate(d => ({ ...d, institutes: [...d.institutes, newInst] }));
    return newInst;
  }, [mutate]);

  const deleteInstitute = useCallback((id: string) => {
    mutate(d => ({ ...d, institutes: d.institutes.filter(i => i.id !== id) }));
  }, [mutate]);

  const updateInstitute = useCallback((id: string, updates: Partial<Institute>) => {
    mutate(d => ({
      ...d,
      institutes: d.institutes.map(i => i.id === id ? { ...i, ...updates } : i),
    }));
  }, [mutate]);

  // ── STUDENT CRUD ──────────────────────────────────────────────────────────

  const addStudentsToInstitute = useCallback((
    instituteId: string,
    students: Omit<Student, 'id' | 'instituteId' | 'enrolledAt' | 'xp' | 'streak' | 'courses' | 'courseLimit'>[]
  ) => {
    const newStudents: Student[] = students.map((s, i) => ({
      ...s,
      id: `stu-${Date.now()}-${i}`,
      instituteId,
      enrolledAt: new Date().toISOString(),
      xp: 0,
      streak: 0,
      courses: (s as any).courses || [],
      courseLimit: (s as any).courseLimit || 1,
    }));
    mutate(d => ({
      ...d,
      institutes: d.institutes.map(inst =>
        inst.id === instituteId
          ? { ...inst, students: [...inst.students, ...newStudents] }
          : inst
      ),
    }));
  }, [mutate]);

  const updateStudent = useCallback((instituteId: string, studentId: string, updates: Partial<Student>) => {
    mutate(d => ({
      ...d,
      institutes: d.institutes.map(inst =>
        inst.id === instituteId
          ? { ...inst, students: inst.students.map(s => s.id === studentId ? { ...s, ...updates } : s) }
          : inst
      ),
    }));
  }, [mutate]);

  const removeStudent = useCallback((instituteId: string, studentId: string) => {
    mutate(d => ({
      ...d,
      institutes: d.institutes.map(inst =>
        inst.id === instituteId
          ? { ...inst, students: inst.students.filter(s => s.id !== studentId) }
          : inst
      ),
    }));
  }, [mutate]);

  // ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────

  const addAnnouncement = useCallback((instituteId: string, payload: Omit<Announcement, 'id' | 'createdAt'>) => {
    mutate(d => ({
      ...d,
      institutes: d.institutes.map(inst =>
        inst.id === instituteId
          ? {
              ...inst,
              announcements: [
                { ...payload, id: `ann-${Date.now()}`, createdAt: new Date().toISOString() },
                ...(inst.announcements || [])
              ]
            }
          : inst
      ),
    }));
  }, [mutate]);

  const removeAnnouncement = useCallback((instituteId: string, announcementId: string) => {
    mutate(d => ({
      ...d,
      institutes: d.institutes.map(inst =>
        inst.id === instituteId
          ? { ...inst, announcements: (inst.announcements || []).filter(a => a.id !== announcementId) }
          : inst
      ),
    }));
  }, [mutate]);

  const addNotification = useCallback((instituteId: string, payload: Omit<InstituteNotification, 'id' | 'createdAt' | 'read'>) => {
    mutate(d => ({
      ...d,
      institutes: d.institutes.map(inst => 
        inst.id === instituteId 
          ? {
              ...inst,
              notifications: [
                { ...payload, id: `notif-${Date.now()}`, createdAt: new Date().toISOString(), read: false },
                ...(inst.notifications || [])
              ]
            }
          : inst
      )
    }));
  }, [mutate]);

  const markNotificationsRead = useCallback((instituteId: string) => {
    mutate(d => ({
      ...d,
      institutes: d.institutes.map(inst =>
        inst.id === instituteId
          ? { ...inst, notifications: (inst.notifications || []).map(n => ({ ...n, read: true })) }
          : inst
      )
    }));
  }, [mutate]);

  // ── HELPERS ───────────────────────────────────────────────────────────────

  const getInstituteBySlug = useCallback((slug: string) =>
    data.institutes.find(i => i.slug === slug), [data.institutes]);

  const getInstituteById = useCallback((id: string) =>
    data.institutes.find(i => i.id === id), [data.institutes]);

  const getStudentById = useCallback((id: string) => {
    for (const inst of data.institutes) {
      const s = inst.students.find(s => s.id === id);
      if (s) return s;
    }
    return undefined;
  }, [data.institutes]);

  // Dynamic CSS theming
  const applyInstituteTheme = useCallback((themeId: Institute['theme']) => {
    const theme = INSTITUTE_THEMES.find(t => t.id === themeId);
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--card', theme.secondary);
    root.style.setProperty('--glow-primary', theme.glow);
    root.style.setProperty('--muted', theme.secondary);
    root.style.setProperty('--border', theme.secondary);
    root.style.setProperty('--sidebar-background', theme.background);
    root.style.setProperty('--ring', theme.primary);
  }, []);

  const resetTheme = useCallback(() => {
    const root = document.documentElement;
    // Restore PathFindr defaults
    root.style.setProperty('--primary', '260 100% 70%');
    root.style.setProperty('--accent', '310 100% 65%');
    root.style.setProperty('--background', '255 45% 12%');
    root.style.setProperty('--secondary', '255 35% 22%');
    root.style.setProperty('--card', '255 40% 16%');
    root.style.setProperty('--glow-primary', '260 100% 70%');
    root.style.setProperty('--muted', '255 30% 20%');
    root.style.setProperty('--border', '255 35% 26%');
    root.style.setProperty('--ring', '260 100% 70%');
  }, []);

  return (
    <ERPContext.Provider value={{
      data,
      session: data.session,
      institutes: data.institutes,
      login, loginAdmin, loginInstitute, loginStudent, logout,
      createInstitute, deleteInstitute, updateInstitute,
      addStudentsToInstitute, updateStudent, removeStudent,
      addAnnouncement, removeAnnouncement,
      addNotification, markNotificationsRead,
      getInstituteBySlug, getInstituteById, getStudentById,
      applyInstituteTheme, resetTheme,
    }}>
      {children}
    </ERPContext.Provider>
  );
}

export function useERP() {
  const ctx = useContext(ERPContext);
  if (!ctx) throw new Error('useERP must be used within ERPProvider');
  return ctx;
}
