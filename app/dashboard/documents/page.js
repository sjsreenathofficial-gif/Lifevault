'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useDocuments } from '../../../hooks/useDocuments';
import { deleteDocument, updateDocument } from '../../../firebase/firestore';
import { deleteFile } from '../../../firebase/storage';
import { DOCUMENT_CATEGORIES } from '../../../lib/constants';
import { getExpiryStatus } from '../../../lib/categorize';
import FaceUnlockModal from '../../../components/documents/FaceUnlockModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FileText, Download, Trash2, Edit3, Eye, Share2, Search, Filter, AlertTriangle, Fingerprint } from 'lucide-react';

export default function DocumentsPage() {
  const { user } = useAuth();
  const { documents, loading, refetch } = useDocuments(user?.uid);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [faceUnlockDoc, setFaceUnlockDoc] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editName, setEditName] = useState('');

  const filtered = documents.filter(doc => {
    const matchSearch = doc.documentName?.toLowerCase().includes(search.toLowerCase()) ||
      doc.documentType?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleView = (doc) => {
    setFaceUnlockDoc(doc);
  };

  const handleFaceVerified = () => {
    if (faceUnlockDoc?.fileUrl) {
      window.open(faceUnlockDoc.fileUrl, '_blank');
    }
    setFaceUnlockDoc(null);
  };

  const handleDownload = async (doc) => {
    if (!doc.fileUrl) return toast.error('File URL not available');
    const a = document.createElement('a');
    a.href = doc.fileUrl;
    a.download = doc.documentName;
    a.target = '_blank';
    a.click();
    toast.success('Download started');
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.documentName}"? This cannot be undone.`)) return;
    try {
      await deleteDocument(doc.id);
      if (doc.filePath) await deleteFile(doc.filePath).catch(() => {});
      toast.success('Document deleted');
      refetch();
    } catch (e) {
      toast.error('Delete failed: ' + e.message);
    }
  };

  const handleEdit = async (doc) => {
    if (editingDoc === doc.id) {
      try {
        await updateDocument(doc.id, { documentName: editName });
        toast.success('Document updated');
        refetch();
        setEditingDoc(null);
      } catch (e) { toast.error('Update failed'); }
    } else {
      setEditingDoc(doc.id);
      setEditName(doc.documentName);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-8 lg:pt-0">
      <AnimatePresence>
        {faceUnlockDoc && (
          <FaceUnlockModal onVerified={handleFaceVerified} onCancel={() => setFaceUnlockDoc(null)} />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-slate-400 text-sm font-mono mb-1">DOCUMENT VAULT</p>
        <h1 className="font-display text-2xl md:text-3xl font-700 text-white">My Documents</h1>
        <p className="text-slate-500 text-sm mt-1">{documents.length} document{documents.length !== 1 ? 's' : ''} stored</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full bg-vault-card border border-vault-border rounded-xl px-10 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-vault-neon/50"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-vault-card border border-vault-border rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-vault-neon/50"
          >
            <option value="all">All Categories</option>
            {Object.entries(DOCUMENT_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 glass-card rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-display font-600 text-slate-400 mb-1">
            {search || categoryFilter !== 'all' ? 'No documents match' : 'No documents yet'}
          </h3>
          <p className="text-slate-500 text-sm">
            {search || categoryFilter !== 'all' ? 'Try a different search or filter' : 'Upload your first document to get started'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc, i) => {
            const catInfo = DOCUMENT_CATEGORIES[doc.category] || DOCUMENT_CATEGORIES.personal;
            const expiry = getExpiryStatus(doc.expiryDate);
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card-hover rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: catInfo.color + '15', border: `1px solid ${catInfo.color}25` }}>
                  <FileText className="w-5 h-5" style={{ color: catInfo.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  {editingDoc === doc.id ? (
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleEdit(doc); if (e.key === 'Escape') setEditingDoc(null); }}
                      autoFocus
                      className="bg-vault-darker border border-vault-neon/50 rounded-lg px-3 py-1 text-white text-sm w-full max-w-xs focus:outline-none"
                    />
                  ) : (
                    <p className="text-white text-sm font-display font-500 truncate">{doc.documentName}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-md font-mono" style={{ background: catInfo.color + '15', color: catInfo.color }}>{catInfo.label}</span>
                    <span className="text-slate-500 text-xs font-mono">{doc.documentType}</span>
                    {doc.createdAt?.toDate && (
                      <span className="text-slate-600 text-xs font-mono">{format(doc.createdAt.toDate(), 'MMM dd, yyyy')}</span>
                    )}
                    {expiry && (
                      <span className="text-xs px-2 py-0.5 rounded-md font-mono flex items-center gap-1" style={{ background: expiry.color + '15', color: expiry.color }}>
                        {expiry.status === 'expired' ? <AlertTriangle className="w-3 h-3" /> : null}
                        {expiry.status === 'expired' ? 'EXPIRED' : `${expiry.daysLeft}d left`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleView(doc)} title="View (Face Unlock)" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-vault-neon hover:bg-vault-neon/10 transition-all">
                    <Fingerprint className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDownload(doc)} title="Download" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-vault-neon hover:bg-vault-neon/10 transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleEdit(doc)} title="Edit name" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(doc)} title="Delete" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
