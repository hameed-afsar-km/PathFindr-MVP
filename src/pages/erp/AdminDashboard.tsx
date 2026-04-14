import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useERP } from '@/context/ERPContext';
import { INSTITUTE_THEMES, type Institute, type InstituteFeatures, type Student } from '@/types/saas';
import ImportStudentsModal from '@/components/ImportStudentsModal';
import InstituteEditModal from '@/components/InstituteEditModal';
import StudentModal from '@/components/StudentModal';
import {
  LayoutDashboard, Building2, Plus, Trash2, LogOut, Users, Eye, Edit3, MessageCircle,
  ChevronRight, Shield, Sparkles, Globe, Check, X, Upload, Zap, Flame, Search, Mail,
  ArrowLeft, Image as ImageIcon, CreditCard, TrendingUp, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip, AreaChart, Area } from 'recharts';

type AdminTab = 'overview' | 'institutes' | 'create' | 'analytics' | 'students';

function InstituteCard({ inst, onDelete, onView, onLogin, onEdit }: { inst: Institute; onDelete: () => void; onView: () => void; onLogin: () => void; onEdit: () => void; }) {
  const theme = INSTITUTE_THEMES.find(t => t.id === inst.theme) ?? INSTITUTE_THEMES[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col group"
    >
      <div className="h-24 relative p-4 flex items-start justify-between" style={{ background: `linear-gradient(135deg, hsl(${theme.primary}/0.2), transparent)` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative flex items-center justify-center w-12 h-12 rounded-xl text-white font-black shadow-lg border border-white/20 overflow-hidden bg-[#221b33]" style={!inst.logoUrl ? { background: `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.accent}))` } : {}}>
          {inst.logoUrl ? <img src={inst.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : inst.logoInitials}
        </div>
        <div className="relative flex gap-2">
          <button onClick={onEdit} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors" title="Edit Settings">
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col pt-2 bg-gradient-to-b from-black/40 to-transparent">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{inst.name}</h3>
          <div className="flex items-center gap-2 text-xs font-mono text-white/50">
            <Globe className="w-3 h-3" /> /{inst.slug}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[10px] uppercase font-bold tracking-wider text-white/30 mb-1">Students</p>
            <p className="text-lg font-black text-white">{inst.students.length}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[10px] uppercase font-bold tracking-wider text-white/30 mb-1">Features</p>
            <p className="text-lg font-black text-emerald-400">
              {Object.values(inst.features).filter(Boolean).length}/6
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-4 border-t border-white/5">
          <button onClick={onDelete} className="p-2 rounded-lg text-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete Institute">
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="flex gap-2">
            <button onClick={onView} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-xs font-bold flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Students
            </button>
            <button onClick={onLogin} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-500 hover:bg-violet-600 text-white text-xs font-bold shadow-lg transition-all border border-violet-400/30">
              Enter <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// MAIN ADMIN DASHBOARD
export default function AdminDashboard() {
  const { institutes, createInstitute, deleteInstitute, updateInstitute, addStudentsToInstitute, updateStudent, removeStudent, logout, session, loginInstitute } = useERP();
  const [tab, setTab] = useState<AdminTab>('overview');

  const [editingInstitute, setEditingInstitute] = useState<Institute | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isStudentModalOpen, setStudentModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [pendingStudents, setPendingStudents] = useState<Partial<Student>[]>([]);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formAdminEmail, setFormAdminEmail] = useState('');
  const [formFeatures, setFormFeatures] = useState<InstituteFeatures>({
    roadmap: true, practice: true, chatbot: true,
    careers: true, interview: false, simulations: false,
  });
  const [formLogoInitials, setFormLogoInitials] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const createLogoInputRef = useRef<HTMLInputElement>(null);
  const [createdInst, setCreatedInst] = useState<Institute | null>(null);
  const [creating, setCreating] = useState(false);

  const [instituteSearch, setInstituteSearch] = useState('');
  
  const [activeStudentView, setActiveStudentView] = useState<'grid' | 'table'>('grid');
  const [selectedInstIdForStudents, setSelectedInstIdForStudents] = useState<string | 'ALL'>('ALL');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentInstituteSearch, setStudentInstituteSearch] = useState('');

  const selectedInstForStudents = institutes.find(i => i.id === selectedInstIdForStudents);

  const handleCreateLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("Image size must be less than 2MB.");
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) setFormLogoUrl(evt.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const inst = createInstitute({
      name: formName,
      slug: formSlug,
      adminEmail: formAdminEmail,
      adminPassword: 'admin',
      theme: 'violet',
      logoInitials: formLogoInitials || formName.substring(0, 2).toUpperCase(),
      logoUrl: formLogoUrl,
      whiteLabel: false,
      features: formFeatures,
    });

    if (pendingStudents.length) {
      addStudentsToInstitute(inst.id, pendingStudents as Omit<Student, 'id' | 'instituteId' | 'enrolledAt' | 'xp' | 'streak' | 'courses' | 'courseLimit'>[]);
    }

    setCreatedInst(inst);
    setCreating(false);
    setFormName(''); setFormSlug(''); setFormAdminEmail(''); setPendingStudents([]);
    setFormLogoInitials(''); setFormLogoUrl('');
  };

  const SIDEBAR_LINKS: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'institutes', label: 'Institutes', icon: Building2 },
    { id: 'students', label: 'Manage Students', icon: Users },
    { id: 'create', label: 'Add Institute', icon: Plus },
  ];

  const totalStudents = institutes.reduce((acc, inst) => acc + inst.students.length, 0);

  const mockRevenueData = [
    { month: 'Jan', revenue: 12000, activeInst: 5 },
    { month: 'Feb', revenue: 19000, activeInst: 8 },
    { month: 'Mar', revenue: 26000, activeInst: 12 },
    { month: 'Apr', revenue: 38000, activeInst: 18 },
    { month: 'May', revenue: 52000, activeInst: 24 },
    { month: 'Jun', revenue: 75000, activeInst: 30 },
  ];

  const atRiskInstitutes = institutes.filter(i => i.students.length < 5); 
  const overdueInstitutes = institutes.slice(0, 1); 
  const pendingPayments = institutes.slice(1, 3); 

  // Aggregated students payload
  const tableStudentsData = selectedInstIdForStudents === 'ALL'
    ? institutes.flatMap(i => i.students.map(s => ({ ...s, _instituteName: i.name })))
    : selectedInstForStudents?.students.map(s => ({ ...s, _instituteName: selectedInstForStudents.name })) || [];

  return (
    <div className="min-h-screen bg-[hsl(255_25%_10%)] text-white flex">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 flex flex-col py-6 shrink-0 bg-black/20 gpu">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center text-white/90">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-black tracking-tight text-lg">PathFindr<span className="text-violet-400">.Admin</span></span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {SIDEBAR_LINKS.map(link => (
            <button
              key={link.id}
              onClick={() => { setTab(link.id); if(link.id === 'students') setActiveStudentView('grid'); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                tab === link.id ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </button>
          ))}
        </nav>

        <div className="px-4 mt-auto">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-4">
            <p className="text-xs text-white/40 font-semibold mb-1">Super Admin</p>
            <p className="text-sm font-bold truncate text-white">{session?.email}</p>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">
            <LogOut className="w-4 h-4" /> Terminate Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto w-full p-8 relative gpu">
        <AnimatePresence mode="wait">
          
          {/* ── OVERVIEW ────────────────────────────────────────────────────────── */}
          {tab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-3xl font-black mb-8">Platform Overview</h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <Building2 className="w-24 h-24 absolute -bottom-4 -right-4 text-white/5 rotate-12" />
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-2">Total Institutes</p>
                  <p className="text-4xl font-black font-mono text-white">{institutes.length}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Check className="w-3 h-3" /> +1 this week
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <Users className="w-24 h-24 absolute -bottom-4 -right-4 text-white/5 rotate-12" />
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-2">Total Students</p>
                  <p className="text-4xl font-black font-mono text-white">{totalStudents}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Check className="w-3 h-3" /> Growing strongly
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-600/50 to-purple-800/50 border border-violet-400/30 rounded-2xl p-6 relative overflow-hidden">
                  <Sparkles className="w-24 h-24 absolute -bottom-4 -right-4 text-white/10 rotate-12" />
                  <p className="text-sm font-bold text-violet-200 uppercase tracking-widest mb-2">Platform Status</p>
                  <p className="text-4xl font-black font-mono text-white">100%</p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-violet-200">
                    All systems operational
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" /> SaaS Revenue Growth</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockRevenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="month" stroke="#ffffff30" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#ffffff30" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#181224', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Account Health / Admin Checks */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><CreditCard className="w-5 h-5 text-violet-400" /> Subscription Health</h2>
                  
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl relative overflow-hidden group">
                    <AlertCircle className="w-12 h-12 absolute -right-2 -bottom-2 text-red-500/10 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Overdue Payments</p>
                    <p className="text-xl font-bold text-white mb-1">{overdueInstitutes.length}</p>
                    <p className="text-xs text-white/50">{overdueInstitutes[0]?.name || 'None'}</p>
                  </div>
                  
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl relative overflow-hidden group">
                    <TrendingUp className="w-12 h-12 absolute -right-2 -bottom-2 text-amber-500/10 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">Upcoming Renewals</p>
                    <p className="text-xl font-bold text-white mb-1">{pendingPayments.length}</p>
                    <p className="text-xs text-white/50">Next 7 days</p>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden group mt-auto">
                    <Users className="w-12 h-12 absolute -right-2 -bottom-2 text-white/5 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Churn Risk (Low adoption)</p>
                    <p className="text-xl font-bold text-white mb-1">{atRiskInstitutes.length}</p>
                    <p className="text-xs text-white/50">Requires account management</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── INSTITUTES TAB ────────────────────────────────────────────────────── */}
          {tab === 'institutes' && (
            <motion.div key="institutes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-black mb-2">Managed Institutes</h1>
                  <p className="text-sm text-white/40">You are providing SaaS infrastructure for {institutes.length} organizations.</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={instituteSearch} onChange={e => setInstituteSearch(e.target.value)}
                    placeholder="Search institutes..."
                    className="pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-violet-500 w-64 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {institutes
                  .filter(i => i.name.toLowerCase().includes(instituteSearch.toLowerCase()) || i.slug.toLowerCase().includes(instituteSearch.toLowerCase()))
                  .map(inst => (
                  <InstituteCard
                    key={inst.id}
                    inst={inst}
                    onDelete={() => deleteInstitute(inst.id)}
                    onView={() => { setSelectedInstIdForStudents(inst.id); setTab('students'); setActiveStudentView('table'); }}
                    onLogin={() => { loginInstitute(inst.adminEmail, inst.adminPassword); }}
                    onEdit={() => setEditingInstitute(inst)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── MANAGE STUDENTS ────────────────────────────────────────────────────── */}
          {tab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col h-full">
              
              <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                  <h1 className="text-3xl font-black mb-1">Global Student Management</h1>
                  <p className="text-sm text-white/40">Edit or add students across all organizational contexts.</p>
                </div>

                {activeStudentView === 'grid' && (
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={studentInstituteSearch} onChange={e => setStudentInstituteSearch(e.target.value)}
                      placeholder="Search context..."
                      className="pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-violet-500 w-64 text-white"
                    />
                  </div>
                )}

                {activeStudentView === 'table' && (
                   <div className="flex items-center gap-3">
                     <button onClick={() => setImportModalOpen(true)} disabled={selectedInstIdForStudents === 'ALL'} className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50">
                       <Upload className="w-4 h-4" /> Import CSV
                     </button>
                     <button onClick={() => { setEditingStudent(null); setStudentModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/20 transition-all">
                       <Plus className="w-4 h-4" /> Add Student
                     </button>
                   </div>
                )}
              </div>

              {activeStudentView === 'grid' ? (
                // GRID OF INSTITUTE CARDS
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                   <motion.div
                      whileHover={{ y: -4 }}
                      onClick={() => { setSelectedInstIdForStudents('ALL'); setActiveStudentView('table'); }}
                      className="cursor-pointer bg-violet-500/10 border border-violet-500/30 rounded-2xl p-6 text-center shadow-lg transition-all hover:bg-violet-500/20 hover:border-violet-400"
                   >
                     <div className="w-16 h-16 rounded-full bg-violet-500 flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-violet-500/30">
                       <Users className="w-8 h-8" />
                     </div>
                     <h3 className="text-lg font-black text-white mb-1">All Students</h3>
                     <p className="text-violet-300/80 text-sm font-bold">{totalStudents} Total Users</p>
                   </motion.div>

                   {institutes
                    .filter(i => i.name.toLowerCase().includes(studentInstituteSearch.toLowerCase()) || i.slug.toLowerCase().includes(studentInstituteSearch.toLowerCase()))
                    .map(i => (
                     <motion.div
                        key={i.id}
                        whileHover={{ y: -4 }}
                        onClick={() => { setSelectedInstIdForStudents(i.id); setActiveStudentView('table'); }}
                        className="cursor-pointer bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-lg transition-all hover:bg-white/10 hover:border-white/30"
                     >
                       <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg mx-auto mb-4 flex items-center justify-center font-black text-xl text-white bg-[#221b33]" style={!i.logoUrl ? { background: `linear-gradient(135deg, hsl(${INSTITUTE_THEMES.find(t=>t.id===i.theme)?.primary}), hsl(${INSTITUTE_THEMES.find(t=>t.id===i.theme)?.accent}))` } : {}}>
                         {i.logoUrl ? <img src={i.logoUrl} className="w-full h-full object-cover" /> : i.logoInitials}
                       </div>
                       <h3 className="text-lg font-bold text-white mb-1 truncate px-2">{i.name}</h3>
                       <p className="text-white/40 text-sm">{i.students.length} Enrolled</p>
                     </motion.div>
                   ))}
                </div>
              ) : (
                // TABLE VIEW FOR SELECTED INSTITUTE
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setActiveStudentView('grid')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                      </button>
                      <div>
                        <h2 className="text-lg font-bold text-white">
                          {selectedInstIdForStudents === 'ALL' ? 'Browsing All Global Students' : `Editing ${selectedInstForStudents?.name}`}
                        </h2>
                      </div>
                    </div>
                    <div className="relative">
                      <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
                        placeholder="Search students..."
                        className="pl-9 pr-4 py-2 h-9 bg-black/40 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-violet-500 w-64 text-white"
                      />
                    </div>
                  </div>
                  <div className="overflow-auto flex-1 h-[400px]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-black/40">
                          {['Student Info', 'Institute context', 'Metrics', ''].map((h, i) => (
                            <th key={i} className="text-left px-5 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {tableStudentsData
                            .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase()))
                            .map(student => (
                            <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-white/5 hover:bg-white/5 transition-all">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-300 overflow-hidden shrink-0">
                                    {student.avatarUrl ? <img src={student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : student.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-white">{student.name}</p>
                                    <span className="flex items-center gap-1.5 text-[10px] text-white/30 mt-0.5"><Mail className="w-3 h-3" /> {student.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span className="inline-block px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-semibold text-white/60 mb-1">{student._instituteName}</span>
                                {student.activeCareer ? (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {student.activeCareer.split(',').filter(Boolean).map((c: string) => (
                                      <span key={c} className="text-[9px] px-1.5 py-0.5 bg-violet-500/10 text-violet-300 rounded border border-violet-500/20">{c.trim()}</span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-white/30 italic block mt-1">No trajectories active</span>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-1 border border-amber-400/20 rounded"><Zap className="w-3 h-3 inline pb-0.5" /> {student.xp}</span>
                                  <span className="text-orange-400 font-bold bg-orange-400/10 px-2 py-1 border border-orange-400/20 rounded"><Flame className="w-3 h-3 inline pb-0.5" /> {student.streak}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-right">
                                {selectedInstIdForStudents !== 'ALL' && (
                                  <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => { setEditingStudent(student); setStudentModalOpen(true); }} className="p-1.5 rounded-lg bg-white/10 text-white/80 hover:text-white" title="Edit Student">
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => removeStudent(selectedInstForStudents!.id, student.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20" title="Remove Student">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                        {tableStudentsData.length === 0 && (
                          <tr><td colSpan={4} className="p-12 text-center text-white/30 font-bold">No students found for this context.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── CREATE INSTITUTE TAB ──────────────────────────────────────────────── */}
          {tab === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto pb-20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-black mb-1">Provision New Institute</h1>
                  <p className="text-sm text-white/40">Set up a new isolated tenant environment for a school or boot-camp.</p>
                </div>
                <button onClick={() => setTab('institutes')} className="text-sm font-bold text-white/40 hover:text-white">Cancel</button>
              </div>

              {!createdInst ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <form onSubmit={handleCreate} className="space-y-8">
                    
                    {/* Basic Info */}
                    <div>
                      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-violet-400" /> Basic Details</h2>
                      
                      <div className="flex items-start gap-6 mb-6 pb-6 border-b border-white/10">
                        <div className="relative group shrink-0">
                          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2 text-center">Institution Logo</label>
                          <div 
                            onClick={() => createLogoInputRef.current?.click()}
                            className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/20 bg-black/40 overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-violet-500/50 transition-all shadow-xl"
                          >
                            {formLogoUrl ? (
                              <img src={formLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <ImageIcon className="w-8 h-8 text-white/20 mb-2" />
                                <span className="text-[9px] uppercase font-bold text-white/30">Upload</span>
                              </>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl top-6">
                              <Upload className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <input type="file" accept="image/*" className="hidden" ref={createLogoInputRef} onChange={handleCreateLogoUpload} />
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Institute Name</label>
                            <input required value={formName} onChange={e => { setFormName(e.target.value); if(!formSlug) setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')); setFormLogoInitials(e.target.value.substring(0, 2).toUpperCase()); }} placeholder="e.g. Acme Tech Academy" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">URL Slug (Path)</label>
                            <input required value={formSlug} onChange={e => setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="acme-tech" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Admin Email</label>
                            <input required type="email" value={formAdminEmail} onChange={e => setFormAdminEmail(e.target.value)} placeholder="admin@acme.edu" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Fallback Initials</label>
                            <input maxLength={2} value={formLogoInitials} onChange={e => setFormLogoInitials(e.target.value)} placeholder="AT" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-center font-black tracking-widest text-lg" />
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Features */}
                      <div>
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-400" /> Authorized Features</h2>
                        <div className="space-y-3">
                          {Object.keys(formFeatures).map(key => (
                            <label key={key} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                              <input type="checkbox" checked={formFeatures[key as keyof InstituteFeatures]} onChange={e => setFormFeatures({ ...formFeatures, [key]: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-black/50 text-violet-500 focus:ring-violet-500 focus:ring-offset-0" />
                              <span className="text-sm font-semibold capitalize text-white/80">{key} Module</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Bulk Student Upload */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                        <Upload className="w-8 h-8 text-white/30 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-white mb-1">Import Initial Students</h3>
                        <p className="text-[10px] text-white/40 mb-4 max-w-[200px] mx-auto">Upload a CSV or XLSX file to seed the database immediately.</p>
                        
                        {pendingStudents.length > 0 ? (
                          <div className="flex items-center justify-between bg-violet-500/10 border border-violet-500/20 px-4 py-2 rounded-lg">
                            <span className="text-xs font-bold text-violet-300">{pendingStudents.length} students loaded</span>
                            <button type="button" onClick={() => setPendingStudents([])} className="text-[10px] text-red-400 font-bold uppercase hover:text-red-300">Clear</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setImportModalOpen(true)} className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg transition-all border border-white/10">
                            Browse Spreadsheets
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <button type="submit" disabled={creating} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl font-black text-lg shadow-xl shadow-violet-500/20 transition-all">
                        {creating ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <><Plus className="w-6 h-6" /> Provision Institute Tenant</>}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-12 text-center max-w-2xl mx-auto">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">{createdInst.name} Created!</h2>
                  <p className="text-emerald-200/60 mb-8">The tenant environment is provisioned and ready for access.</p>
                  <div className="bg-black/30 rounded-xl p-4 mb-8 inline-block text-left text-sm border border-emerald-500/10">
                    <p className="text-white/50 mb-1">Admin Portal:</p>
                    <p className="font-mono text-emerald-400 mb-4">{window.location.host}/institute/{createdInst.slug}</p>
                    <p className="text-white/50 mb-1">Admin Email:</p>
                    <p className="font-mono text-white mb-4">{createdInst.adminEmail}</p>
                    <p className="text-white/50 mb-1">Default Password:</p>
                    <p className="font-mono text-white">admin</p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button onClick={() => setCreatedInst(null)} className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all">Create Another</button>
                    <button onClick={() => setTab('institutes')} className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg transition-all">View Dashboard</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
      
      {/* ── MODALS ────────────────────────────────────────────────────────────── */}
      <InstituteEditModal
        isOpen={!!editingInstitute}
        onClose={() => setEditingInstitute(null)}
        institute={editingInstitute}
        onSave={(id, updates) => updateInstitute(id, updates)}
      />

      <StudentModal
        isOpen={isStudentModalOpen}
        institute={selectedInstForStudents}
        allInstitutes={institutes}
        onClose={() => { setStudentModalOpen(false); setEditingStudent(null); }}
        initialData={editingStudent}
        onSave={(payload) => {
          const targetInstId = payload.instituteId || selectedInstIdForStudents;
          if (targetInstId === 'ALL') return alert("Please select an institute.");
          
          if (editingStudent) {
            updateStudent(targetInstId, editingStudent.id, payload);
          } else {
            addStudentsToInstitute(targetInstId, [payload as any]);
          }
        }}
      />

      {selectedInstForStudents && (
        <ImportStudentsModal
          isOpen={isImportModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImport={(st) => setPendingStudents(st)}
        />
      )}
    </div>
  );
}
