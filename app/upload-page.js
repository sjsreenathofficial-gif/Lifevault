'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../../hooks/useAuth';
import { uploadFile } from '../../../firebase/storage';
import { addDocument } from '../../../firebase/firestore';
import { autoClassifyDocument } from '../../../lib/categorize';
import { DOCUMENT_CATEGORIES, ALL_DOCUMENT_TYPES } from '../../../lib/constants';
import toast from 'react-hot-toast';
import { Upload, Camera, FileText, CheckCircle, Loader, X, Zap } from 'lucide-react';

export default function UploadPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: upload, 2: details, 3: done
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [familyMemberId, setFamilyMemberId] = useState('');

  const [form, setForm] = useState({
    documentName: '',
    documentType: ALL_DOCUMENT_TYPES[0],
    category: 'identity',
    expiryDate: '',
    notes: '',
  });

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    }
    // Auto-suggest name
    const nameWithoutExt = f.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const autoCategory = autoClassifyDocument(nameWithoutExt);
    setForm(p => ({
      ...p,
      documentName: nameWithoutExt,
      category: autoCategory,
    }));
    setStep(2);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 20 * 1024 * 1024, // 20MB
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/pdf': ['.pdf'],
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileData = await uploadFile(user.uid, file, setUploadProgress);
      await addDocument(user.uid, {
        ...form,
        fileUrl: fileData.url,
        filePath: fileData.path,
        fileName: fileData.name,
        fileSize: fileData.size,
        fileType: fileData.type,
        familyMemberId: familyMemberId || null,
        isShared: false,
      });
      toast.success('Document secured in your vault!');
      setStep(3);
    } catch (e) {
      toast.error('Upload failed: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCategoryAuto = (docName, docType) => {
    const auto = autoClassifyDocument(docName, docType);
    setForm(p => ({ ...p, category: auto }));
  };

  const reset = () => {
    setStep(1);
    setFile(null);
    setPreview(null);
    setUploadProgress(0);
    setForm({ documentName: '', documentType: ALL_DOCUMENT_TYPES[0], category: 'identity', expiryDate: '', notes: '' });
  };

  return (
    <div className="max-w-2xl mx-auto pt-8 lg:pt-0">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-slate-400 text-sm font-mono mb-1">VAULT SECURE UPLOAD</p>
        <h1 className="font-display text-2xl md:text-3xl font-700 text-white">Upload Document</h1>
        <p className="text-slate-500 text-sm mt-1">Files are encrypted and stored securely</p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-700 transition-all ${
              step >= s ? 'bg-vault-neon text-vault-darker' : 'bg-vault-border text-slate-400'
            }`}>{s}</div>
            {s < 3 && <div className={`w-12 h-0.5 transition-all ${step > s ? 'bg-vault-neon' : 'bg-vault-border'}`} />}
          </div>
        ))}
        <span className="text-slate-400 text-xs font-mono ml-2">
          {step === 1 ? 'SELECT FILE' : step === 2 ? 'ADD DETAILS' : 'SECURED!'}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div
              {...getRootProps()}
              className={`glass-card rounded-2xl p-12 text-center cursor-pointer transition-all border-2 border-dashed ${
                isDragActive ? 'border-vault-neon/60 bg-vault-neon/5' : 'border-vault-border hover:border-vault-neon/30'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-2xl bg-vault-neon/10 border border-vault-neon/20 flex items-center justify-center mx-auto mb-4 animate-float">
                <Upload className="w-8 h-8 text-vault-neon" />
              </div>
              <h3 className="font-display font-600 text-white text-lg mb-2">Drop document here</h3>
              <p className="text-slate-400 text-sm mb-4">or click to browse files</p>
              <p className="text-slate-500 text-xs font-mono">Supports PDF, JPG, PNG, WEBP · Max 20MB</p>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 h-px bg-vault-border" />
              <span className="text-slate-500 text-xs font-mono">OR</span>
              <div className="flex-1 h-px bg-vault-border" />
            </div>

            <button
              onClick={() => {
                toast('Camera capture: Open device camera to scan', { icon: '📷' });
              }}
              className="w-full mt-4 glass-card-hover py-4 rounded-2xl flex items-center justify-center gap-3 text-slate-300 hover:text-white transition-all border border-vault-border font-display font-500"
            >
              <Camera className="w-5 h-5 text-vault-neon" />
              Scan with Camera
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {/* File preview */}
            {file && (
              <div className="glass-card rounded-2xl p-4 mb-6 flex items-center gap-4">
                {preview ? (
                  <img src={preview} alt="" className="w-16 h-16 object-cover rounded-xl" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-vault-neon/10 border border-vault-neon/20 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-vault-neon" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-display font-500 truncate">{file.name}</p>
                  <p className="text-slate-400 text-xs font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB · {file.type}</p>
                </div>
                <button onClick={reset} className="text-slate-400 hover:text-white p-1"><X className="w-4 h-4" /></button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5">
              <div>
                <label className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-2">Document Name *</label>
                <div className="relative">
                  <input
                    value={form.documentName}
                    onChange={e => { setForm(p => ({...p, documentName: e.target.value})); handleCategoryAuto(e.target.value, form.documentType); }}
                    required
                    placeholder="e.g. My Passport 2024"
                    className="w-full bg-vault-darker/60 border border-vault-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-vault-neon/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-2">Document Type *</label>
                  <select
                    value={form.documentType}
                    onChange={e => { setForm(p => ({...p, documentType: e.target.value})); handleCategoryAuto(form.documentName, e.target.value); }}
                    className="w-full bg-vault-darker/60 border border-vault-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-vault-neon/50"
                  >
                    {ALL_DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-2 flex items-center gap-1">
                    Category <Zap className="w-3 h-3 text-vault-neon" /> Auto
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({...p, category: e.target.value}))}
                    className="w-full bg-vault-darker/60 border border-vault-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-vault-neon/50"
                  >
                    {Object.entries(DOCUMENT_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-2">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={e => setForm(p => ({...p, expiryDate: e.target.value}))}
                  className="w-full bg-vault-darker/60 border border-vault-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-vault-neon/50"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-2">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({...p, notes: e.target.value}))}
                  rows={3}
                  placeholder="Any additional notes about this document..."
                  className="w-full bg-vault-darker/60 border border-vault-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-vault-neon/50 resize-none"
                />
              </div>

              {uploading && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs font-mono">ENCRYPTING & UPLOADING</span>
                    <span className="text-vault-neon text-xs font-mono">{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-vault-border rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${uploadProgress}%` }} className="h-full bg-vault-neon rounded-full" />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={reset} className="px-6 py-3 rounded-xl border border-vault-border text-slate-400 hover:text-white font-display font-500 text-sm transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="flex-1 btn-primary py-3 rounded-xl font-display font-600 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Securing...' : 'Secure in Vault'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-vault-neon/20 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-vault-neon/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-vault-neon" />
              </div>
            </div>
            <h2 className="font-display text-2xl font-700 text-white mb-2">Document Secured!</h2>
            <p className="text-slate-400 mb-8">Your document is now safely stored in your vault</p>
            <div className="flex gap-3 justify-center">
              <button onClick={reset} className="btn-primary px-6 py-3 rounded-xl font-display font-600 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload Another
              </button>
              <a href="/dashboard/documents" className="px-6 py-3 rounded-xl border border-vault-border text-slate-300 hover:text-white font-display font-500 text-sm transition-all inline-flex items-center gap-2">
                <FileText className="w-4 h-4" /> View Documents
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
