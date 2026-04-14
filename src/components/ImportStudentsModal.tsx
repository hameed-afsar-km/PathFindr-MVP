import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import type { Student } from '@/types/saas';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: Partial<Student>[]) => void;
}

export default function ImportStudentsModal({ isOpen, onClose, onImport }: ImportStudentsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<any[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Column mapping (1-indexed for user, we subtract 1 in logic)
  const [mapping, setMapping] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    contactNumber: '',
    activeCareer: '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        let rows: any[][] = [];

        if (selected.name.endsWith('.csv')) {
          const parsed = Papa.parse(data as string, { header: false, skipEmptyLines: true });
          rows = parsed.data as any[][];
        } else {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        }
        setRawRows(rows);
      } catch (err: any) {
        setError('Failed to parse file: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (selected.name.endsWith('.csv')) reader.readAsText(selected);
    else reader.readAsBinaryString(selected);
  };

  const handleImport = () => {
    try {
      if (!mapping.name || !mapping.email) {
        setError('Name and Email column numbers are required.');
        return;
      }
      
      const getVal = (row: any[], colStr: string) => {
        if (!colStr) return undefined;
        const index = parseInt(colStr, 10) - 1;
        return row[index] ? String(row[index]).trim() : undefined;
      };

      // Skip header assuming first row might be header 
      // Ask user to skip or just do it blindly? We'll assume row 0 is header and parse from index 1.
      const studentsToImport: Partial<Student>[] = [];
      const dataRows = rawRows.slice(1);
      
      for (const row of dataRows) {
        const name = getVal(row, mapping.name);
        if (!name) continue; // Skip empty rows

        const email = getVal(row, mapping.email) || `${name.replace(/\s+/g, '').toLowerCase()}@demo.com`;
        const username = getVal(row, mapping.username) || name.replace(/\s+/g, '.').toLowerCase();
        const password = getVal(row, mapping.password) || 'student123';
        const contactNumber = getVal(row, mapping.contactNumber);
        const activeCareer = getVal(row, mapping.activeCareer);

        studentsToImport.push({
          name,
          email,
          username,
          password,
          contactNumber,
          activeCareer,
        });
      }

      onImport(studentsToImport);
      onClose();
      // Reset
      setFile(null);
      setRawRows([]);
      setMapping({ name: '', email: '', username: '', password: '', contactNumber: '', activeCareer: '' });
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-xl bg-[hsl(255_35%_22%)] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-hidden"
        >
          <div className="shrink-0 mb-6">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-white mb-1">Import Students (CSV/XLSX)</h2>
            <p className="text-sm text-white/50">Upload your spreadsheet and map the column numbers.</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">

          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-center"
            >
              <Upload className="w-10 h-10 text-white/30 mb-3" />
              <p className="text-sm font-bold text-white mb-1">Click to browse file</p>
              <p className="text-xs text-white/40">Supports .csv, .xlsx</p>
              <input type="file" accept=".csv, .xlsx" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{file.name}</p>
                  <p className="text-xs text-white/40">{rawRows.length} rows detected</p>
                </div>
                <button onClick={() => { setFile(null); setRawRows([]); }} className="text-[10px] uppercase font-bold tracking-wider text-red-400 hover:text-red-300">
                  Remove
                </button>
              </div>

              {rawRows.length > 0 && (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold text-white">Map Columns (Enter Column Number 1, 2, 3...)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'name', label: 'Name *' },
                      { key: 'email', label: 'Email *' },
                      { key: 'username', label: 'Username' },
                      { key: 'password', label: 'Password' },
                      { key: 'contactNumber', label: 'Contact Number' },
                      { key: 'activeCareer', label: 'Active Career' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5">{f.label}</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 1"
                          value={mapping[f.key as keyof typeof mapping]}
                          onChange={e => setMapping(m => ({ ...m, [f.key]: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5">
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg text-sm font-black text-white bg-violet-500 hover:bg-violet-600 shadow flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Import Data
                </button>
              </div>
            </div>
          )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
