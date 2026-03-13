'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useDocuments } from '../../../hooks/useDocuments';
import { createShareLink, getUserShareLinks } from '../../../firebase/firestore';
import { nanoid } from 'nanoid';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Share2, Link, Copy, Clock, Eye, Lock, Plus, X, Shield, CheckCircle } from 'lucide-react';

export default function SharePage() {
  const { user } = useAuth();
  const { documents } = useDocuments(user?.uid);
  const [shareLinks, setShareLinks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(null);

  const [form, setForm] = useState({
    documentId: '',
    expiresIn: '24', // hours
    password: '',
    allowDownload: true,
  });

  useEffect(() => {
    if (user) fetchLinks();
  }, [user]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const links = await getUserShareLinks(user.uid);
      setShareLinks(links);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.documentId) return toast.error('Please select a document');
    const selectedDoc = documents.find(d => d.id === form.documentId);
    if (!selectedDoc) return toast.error('Document not found');

    setCreating(true);
    try {
      const linkId = nanoid(16);
      const expiresAt = new Date(Date.now() + parseInt(form.expiresIn) * 60 * 60 * 1000);
      await createShareLink({
        linkId,
        userId: user.uid,
        documentId: form.documentId,
        documentName: selectedDoc.documentName,
        fileUrl: selectedDoc.fileUrl,
        expiresAt: expiresAt.toISOString(),
        password: form.password || null,
        allowDownload: form.allowDownload,
        viewCount: 0,
      });
      toast.success('Secure share link created!');
      setShowModal(false);
      setForm({ documentId: '', expiresIn: '24', password: '', allowDownload: true });
      fetchLinks();
    } catch (e) {
      toast.error('Failed to create link: ' + e.message);
    } finally { setCreating(false); }
  };

  const copyLink = async (linkId) => {
    const url = `${window.location.origin}/share/${linkId}`;
    await navigator.clipboard.writeText(url);
    setCopied(linkId);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const isExpired = (link) => new Date(link.expiresAt) < new Date();

  return (
    <div className="max-w-4xl mx-auto pt-8 lg:pt-0">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-mono mb-1">SECURE SHARING</p>
          <h1 className="font-display text-2xl md:text-3xl font-700 text-white">Share Documents</h1>
          <p className="text-slate-500 text-sm mt-1">Generate secure, expiring share links</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary px-4 py-2.5 rounded-xl text-sm font-display font-600 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Share Link
        </button>
      </motion.div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Clock, label: 'Expiring Links', desc: 'Links auto-expire after set time' },
          { icon: Lock, label: 'Password Protected', desc: 'Add optional password to links' },
          { icon: Eye, label: 'View Tracking', desc: 'Monitor who views your documents' },
        ].map(({ icon: Icon, label, desc }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-vault-neon/10 border border-vault-neon/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-vault-neon" />
            </div>
            <div>
              <p className="text-white text-sm font-display font-600">{label}</p>
              <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Share links list */}
      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 glass-card rounded-2xl animate-pulse" />)}</div>
      ) : shareLinks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-12 text-center">
          <Share2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-display font-600 mb-1">No share links yet</p>
          <p className="text-slate-500 text-sm">Create your first secure share link</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {shareLinks.map((link, i) => {
            const expired = isExpired(link);
            return (
              <motion.div key={link.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`glass-card rounded-2xl p-5 ${expired ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${expired ? 'bg-slate-800' : 'bg-vault-neon/10 border border-vault-neon/20'}`}>
                      <Link className={`w-4 h-4 ${expired ? 'text-slate-500' : 'text-vault-neon'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-display font-500 truncate">{link.documentName}</p>
                      <p className="text-slate-500 text-xs font-mono truncate">{window?.location?.origin}/share/{link.linkId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyLink(link.linkId)}
                    disabled={expired}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                      copied === link.linkId ? 'bg-green-500/20 text-green-400' : expired ? 'bg-vault-border text-slate-600 cursor-not-allowed' : 'bg-vault-neon/10 text-vault-neon hover:bg-vault-neon/20'
                    }`}
                  >
                    {copied === link.linkId ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === link.linkId ? 'Copied!' : expired ? 'Expired' : 'Copy Link'}
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-vault-border">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{link.viewCount || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{expired ? 'Expired' : `Expires ${format(new Date(link.expiresAt), 'MMM dd, HH:mm')}`}</span>
                  </div>
                  {link.password && (
                    <div className="flex items-center gap-1.5 text-vault-accent text-xs">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Password protected</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create link modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card rounded-2xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-700 text-white text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-vault-neon" /> Create Share Link
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-2">Select Document *</label>
                  <select value={form.documentId} onChange={e => setForm(p => ({...p, documentId: e.target.value}))} required
                    className="w-full bg-vault-darker border border-vault-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-vault-neon/50">
                    <option value="">Choose a document...</option>
                    {documents.map(d => <option key={d.id} value={d.id}>{d.documentName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-2">Link Expires In</label>
                  <select value={form.expiresIn} onChange={e => setForm(p => ({...p, expiresIn: e.target.value}))}
                    className="w-full bg-vault-darker border border-vault-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-vault-neon/50">
                    <option value="1">1 Hour</option>
                    <option value="6">6 Hours</option>
                    <option value="24">24 Hours</option>
                    <option value="72">3 Days</option>
                    <option value="168">7 Days</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-2">Password Protection (optional)</label>
                  <input type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} placeholder="Leave empty for no password"
                    className="w-full bg-vault-darker border border-vault-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-vault-neon/50" />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="allowDownload" checked={form.allowDownload} onChange={e => setForm(p => ({...p, allowDownload: e.target.checked}))}
                    className="w-4 h-4 accent-vault-neon" />
                  <label htmlFor="allowDownload" className="text-slate-300 text-sm">Allow recipient to download</label>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-vault-border text-slate-400 hover:text-white text-sm font-display">Cancel</button>
                  <button type="submit" disabled={creating} className="flex-1 btn-primary py-3 rounded-xl font-display font-600 text-sm">
                    {creating ? 'Creating...' : 'Create Secure Link'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
