'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getShareLink, incrementShareViewCount } from '../../../firebase/firestore';
import { Shield, Lock, Eye, Download, AlertTriangle, FileText } from 'lucide-react';

export default function ShareViewPage({ params }) {
  const { linkId } = params;
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);

  useEffect(() => {
    fetchLink();
  }, [linkId]);

  const fetchLink = async () => {
    try {
      const data = await getShareLink(linkId);
      if (!data) { setError('Link not found'); return; }
      if (new Date(data.expiresAt) < new Date()) { setError('This link has expired'); return; }
      setLink(data);
      if (!data.password) {
        await incrementShareViewCount(linkId);
        setPasswordVerified(true);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password === link.password) {
      setPasswordVerified(true);
      await incrementShareViewCount(linkId);
    } else {
      setWrongPassword(true);
      setTimeout(() => setWrongPassword(false), 2000);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-vault-darker flex items-center justify-center">
      <div className="text-vault-neon font-mono text-sm animate-pulse">LOADING VAULT...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-vault-darker flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-10 max-w-sm w-full text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="font-display font-700 text-white text-lg mb-2">Access Denied</h2>
        <p className="text-slate-400 text-sm">{error}</p>
        <a href="/" className="text-vault-neon text-sm mt-4 inline-block hover:underline">← Back to LifeVault</a>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-vault-darker flex items-center justify-center p-4">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <Shield className="w-5 h-5 text-vault-neon" />
        <span className="font-display font-700 text-white">Life<span className="text-vault-neon">Vault</span></span>
      </div>

      {!passwordVerified ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8 max-w-sm w-full text-center">
          <Lock className="w-10 h-10 text-vault-accent mx-auto mb-4" />
          <h2 className="font-display font-700 text-white text-lg mb-2">Password Required</h2>
          <p className="text-slate-400 text-sm mb-6">This document is password protected</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password"
              className={`w-full bg-vault-darker border rounded-xl px-4 py-3 text-white text-sm text-center focus:outline-none transition-colors ${wrongPassword ? 'border-red-500/50 shake' : 'border-vault-border focus:border-vault-neon/50'}`} />
            {wrongPassword && <p className="text-red-400 text-xs">Incorrect password</p>}
            <button type="submit" className="btn-primary w-full py-3 rounded-xl font-display font-600">Unlock Document</button>
          </form>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8 max-w-lg w-full">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-vault-border">
            <div className="w-12 h-12 rounded-xl bg-vault-neon/10 border border-vault-neon/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-vault-neon" />
            </div>
            <div>
              <h2 className="font-display font-700 text-white">{link.documentName}</h2>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" /> {link.viewCount} view{link.viewCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <a href={link.fileUrl} target="_blank" rel="noopener noreferrer"
              className="w-full btn-primary py-3 rounded-xl font-display font-600 flex items-center justify-center gap-2 text-sm">
              <Eye className="w-4 h-4" /> View Document
            </a>
            {link.allowDownload && (
              <a href={link.fileUrl} download className="w-full glass-card-hover py-3 rounded-xl border border-vault-border font-display font-500 flex items-center justify-center gap-2 text-sm text-slate-300 hover:text-white transition-all">
                <Download className="w-4 h-4" /> Download
              </a>
            )}
          </div>

          <p className="text-center text-slate-500 text-xs mt-6 font-mono">
            🔒 Shared via LifeVault · Expires {new Date(link.expiresAt).toLocaleString()}
          </p>
        </motion.div>
      )}
    </div>
  );
}
