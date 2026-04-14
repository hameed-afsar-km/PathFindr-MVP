import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Upload, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import type { Institute } from '@/types/saas';
import { INSTITUTE_THEMES } from '@/types/saas';
import { cn } from '@/lib/utils';

interface InstituteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Institute>) => void;
  institute: Institute | null;
}

export default function InstituteEditModal({ isOpen, onClose, onSave, institute }: InstituteEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    adminEmail: '',
    adminPassword: '',
    logoInitials: '',
    theme: '',
    whiteLabel: false,
    logoUrl: '',
    availableCourses: '',
    authorizedFeatures: {
      roadmap: false, practice: false, chatbot: false,
      careers: false, interview: false, simulations: false
    },
    features: {
      roadmap: false, practice: false, chatbot: false,
      careers: false, interview: false, simulations: false
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (institute) {
      setFormData({
        name: institute.name,
        slug: institute.slug,
        adminEmail: institute.adminEmail,
        adminPassword: institute.adminPassword,
        logoInitials: institute.logoInitials,
        theme: institute.theme,
        whiteLabel: institute.whiteLabel,
        logoUrl: institute.logoUrl || '',
        availableCourses: (institute.availableCourses || []).join(', '),
        authorizedFeatures: institute.authorizedFeatures || institute.features,
        features: institute.features,
      });
    }
  }, [institute, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setFormData(f => ({ ...f, logoUrl: evt.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute) return;
    onSave(institute.id, {
      ...formData,
      availableCourses: formData.availableCourses.split(',').map(c => c.trim()).filter(Boolean),
      authorizedFeatures: formData.authorizedFeatures,
      // Apply the selected active features, but ensure they don't exceed authorized features
      features: Object.keys(formData.features).reduce((acc, key) => ({
        ...acc,
        [key]: formData.authorizedFeatures[key as keyof typeof formData.authorizedFeatures] ? formData.features[key as keyof typeof formData.features] : false
      }), {}) as any
    });
    onClose();
  };

  if (!isOpen || !institute) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-[#231b34] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-white/10 bg-black/20 flex items-center justify-between shrink-0">
             <h2 className="text-lg font-black text-white">Edit Institute Profile</h2>
             <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
            {/* Logo Upload Section */}
            <div className="flex items-center gap-5 pb-5 border-b border-white/10">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-500/10 transition-all overflow-hidden relative group"
              >
                {formData.logoUrl ? (
                   <>
                     <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <Upload className="w-6 h-6 text-white" />
                     </div>
                   </>
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 text-white/30 mb-1" />
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Logo</span>
                  </>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1">Institute Icon / Logo</h3>
                <p className="text-xs text-white/40 mb-3">Upload a clean transparent PNG or JPG, max 2MB.</p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white transition-colors">
                    Upload File
                  </button>
                  {formData.logoUrl && (
                     <button type="button" onClick={() => setFormData(f => ({ ...f, logoUrl: '' }))} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors">
                       Remove
                     </button>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">Institute Name *</label>
                <input
                  required value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">URL Slug *</label>
                <input
                  required value={formData.slug}
                  onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))}
                  className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">Admin Email *</label>
                <input
                  required type="email" value={formData.adminEmail}
                  onChange={e => setFormData(f => ({ ...f, adminEmail: e.target.value }))}
                  className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">Admin Password *</label>
                <input
                  required minLength={4} value={formData.adminPassword}
                  onChange={e => setFormData(f => ({ ...f, adminPassword: e.target.value }))}
                  className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">Fallback Logo Initials</label>
                <input
                  required maxLength={2} value={formData.logoInitials}
                  onChange={e => setFormData(f => ({ ...f, logoInitials: e.target.value.toUpperCase() }))}
                  className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">Theme Palette</label>
                <select
                  value={formData.theme}
                  onChange={e => setFormData(f => ({ ...f, theme: e.target.value }))}
                  className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 appearance-none"
                >
                  {INSTITUTE_THEMES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">Available Courses (Comma-separated)</label>
              <input
                value={formData.availableCourses}
                onChange={e => setFormData(f => ({ ...f, availableCourses: e.target.value }))}
                placeholder="e.g. Intro to Python, Advanced React, AI Fundamentals"
                className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
              <input
                type="checkbox"
                id="whiteLabel"
                checked={formData.whiteLabel}
                onChange={e => setFormData(f => ({ ...f, whiteLabel: e.target.checked }))}
                className="w-5 h-5 mt-0.5 rounded border-white/20 bg-black/40 text-violet-500 focus:ring-violet-500 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="whiteLabel" className="cursor-pointer flex-1">
                <span className="block text-sm font-bold text-white">Enable Premium White-labeling</span>
                <span className="block text-xs text-white/40 mt-1">
                  Hides the PathFindr.AI branding and emphasizes institute identity.
                </span>
              </label>
            </div>

            <div className="space-y-4 pt-2">
               <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Authorize Global Features (Master Control)</h3>
               <div className="grid grid-cols-2 gap-3">
                  {Object.entries(formData.authorizedFeatures).map(([key, val]) => (
                    <button
                      key={`auth-${key}`}
                      type="button"
                      onClick={() => setFormData(f => ({
                        ...f,
                        authorizedFeatures: { ...f.authorizedFeatures, [key]: !val },
                        // auto-disable active feature if authorization is removed
                        features: { ...f.features, [key]: !val ? f.features[key as keyof typeof f.features] : false }
                      }))}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all",
                        val ? "bg-violet-600/20 border-violet-500/50 text-white" : "bg-black/40 border-white/10 text-white/40"
                      )}
                    >
                      <span className="text-xs font-bold capitalize">{key}</span>
                      {val ? <Check className="w-4 h-4 text-violet-400" /> : <X className="w-4 h-4" />}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-4 pt-2">
               <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Active Features Currently Enabled for Students</h3>
               <div className="grid grid-cols-2 gap-3">
                  {Object.entries(formData.features).map(([key, val]) => {
                    const isAuthorized = formData.authorizedFeatures[key as keyof typeof formData.authorizedFeatures];
                    return (
                      <button
                        key={`feat-${key}`}
                        type="button"
                        onClick={() => {
                          if (!isAuthorized) return alert("You must authorize this feature globally first.");
                          setFormData(f => ({
                            ...f,
                            features: { ...f.features, [key]: !val }
                          }));
                        }}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all",
                          !isAuthorized ? "opacity-50 grayscale cursor-not-allowed bg-black/40 border-white/5 text-white/20" :
                          val ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-100" : "bg-white/5 border-white/10 text-white/40"
                        )}
                      >
                        <span className="text-xs font-bold capitalize">{key}</span>
                        {val ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4" />}
                      </button>
                    );
                  })}
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-black text-white bg-violet-600 hover:bg-violet-700 shadow-xl shadow-violet-500/20 flex items-center gap-2 transition-all"
              >
                <Check className="w-5 h-5" /> Save Configuration
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
