// ============================================================
// PathFindr ERP — Multi-Tenant SaaS Type Definitions
// ============================================================

export type UserRole = 'admin' | 'institute' | 'student';

export interface InstituteTheme {
  id: 'purple' | 'ocean' | 'sunset' | 'forest' | 'crimson';
  name: string;
  primary: string;    // HSL values e.g. "260 100% 70%"
  accent: string;
  background: string;
  secondary: string;
  glow: string;
}

export interface InstituteFeatures {
  roadmap: boolean;
  practice: boolean;
  chatbot: boolean;
  careers: boolean;
  interview: boolean;
  simulations: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  avatarUrl?: string;
  contactNumber?: string;
  activeCareer?: string;
  courses: string[];
  courseLimit: number;
  instituteId: string;
  enrolledAt: string;
  xp: number;
  streak: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  important: boolean;
}

export interface InstituteNotification {
  id: string;
  studentId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Institute {
  id: string;
  name: string;
  slug: string;           // URL-safe unique identifier e.g. "abcschool"
  logoInitials: string;   // For placeholder logo
  logoColor: string;      // Hex color for logo bg
  theme: InstituteTheme['id'];
  whiteLabel: boolean;
  features: InstituteFeatures;         // Subscriptions / Active for students
  authorizedFeatures: InstituteFeatures; // Toggled by Super Admin ONLY
  availableCourses?: string[];
  students: Student[];
  announcements?: Announcement[];
  notifications?: InstituteNotification[];
  createdAt: string;
  createdBy: string;      // admin id
  adminEmail: string;
  adminPassword: string;
}

export interface AuthSession {
  role: UserRole;
  userId: string;
  instituteId?: string;   // set for institute & student roles
  username: string;
  email: string;
  loggedInAt: string;
}

// ERP Platform Data (root of localStorage)
export interface ERPData {
  institutes: Institute[];
  session: AuthSession | null;
}

// ============================================================
// Predefined Themes
// ============================================================
export const INSTITUTE_THEMES: InstituteTheme[] = [
  {
    id: 'purple',
    name: 'Cosmic Purple',
    primary: '260 100% 70%',
    accent: '310 100% 65%',
    background: '255 45% 12%',
    secondary: '255 35% 22%',
    glow: '260 100% 70%',
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    primary: '200 100% 60%',
    accent: '170 100% 55%',
    background: '210 45% 10%',
    secondary: '210 35% 18%',
    glow: '200 100% 60%',
  },
  {
    id: 'sunset',
    name: 'Sunset Ember',
    primary: '25 100% 60%',
    accent: '340 100% 65%',
    background: '20 35% 10%',
    secondary: '20 30% 18%',
    glow: '25 100% 60%',
  },
  {
    id: 'forest',
    name: 'Neon Forest',
    primary: '140 80% 55%',
    accent: '80 100% 60%',
    background: '140 30% 8%',
    secondary: '140 25% 16%',
    glow: '140 80% 55%',
  },
  {
    id: 'crimson',
    name: 'Royal Crimson',
    primary: '350 90% 60%',
    accent: '30 100% 65%',
    background: '350 30% 8%',
    secondary: '350 25% 16%',
    glow: '350 90% 60%',
  },
];

export const getTheme = (id: InstituteTheme['id']): InstituteTheme =>
  INSTITUTE_THEMES.find(t => t.id === id) ?? INSTITUTE_THEMES[0];
