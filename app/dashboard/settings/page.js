'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { setUserProfile } from '../../../firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import toast from 'react-hot-toast';
import { User, Shield, Bell, Palette, Trash2, Save, Loader } from 'lucide-react';

export default function SettingsPage() {
  const { user, userProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    bio: userProfile?.bio || '',
    notifications: userProfile?.notifications !== false,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: form.displayName });
      await setUserProfile(user.uid, { displayName: form.displayName, bio: form.bio, notifications: form.notifications });
      toast.success('Settings saved!');
    } catch (e) {
      toast.error('Save failed: ' + e.message);
    } finally { setSaving(false); }
  };

  const Section = ({ title, icon: Icon, children }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 mb-5">
      <h2 className="font-display font-600 text-white mb-5 flex items-center gap-2">
        <Icon className="w-4 h-4 text-vault-neon" />{title}
      </h2>
      {children}
    </motion.div>
  );

  return (
    <div className="max-w-2xl mx-auto pt-8 lg:pt-0">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-slate-400 text-sm font-mono mb-1">VAULT SETTINGS</p>
        <h1 className="font-display text-2xl md:text-3xl font-700 text-white">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your vault preferences</p>
      </motion.div>

      <form onSubmit={handleSave}>
        <Section title="Profile" icon={User}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vault-accent/30 to-vault-neon/20 flex items-center justify-center text-vault-neon font-display font-700 text-2xl border border-vault-border overflow-hidden">
              {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : (user?.displayName?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <p className="text-white font-display font-600">{user?.displayName || 'User'}</p>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <p className="text-slate-500 text-xs font-mono mt-0.5">UID: {user?.uid?.slice(0, 16)}...</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-2">Display Name</label>
              <input value={form.displayName} onChange={e => setForm(p => ({...p, displayName: e.target.value}))}
                className="w-full bg-vault-darker border border-vault-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-vault-neon/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-2">Bio (optional)</label>
              <textarea value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} rows={3}
                placeholder="Tell us about yourself..."
                className="w-full bg-vault-darker border border-vault-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-vault-neon/50 resize-none" />
            </div>
          </div>
        </Section>

        <Section title="Security" icon={Shield}>
          <div className="space-y-4">
            {[
              { label: 'Face Unlock for Documents', desc: 'Require face verification to view documents', enabled: true },
              { label: 'Two-Factor Authentication', desc: 'Add extra security with 2FA', enabled: false },
              { label: 'End-to-End Encryption', desc: 'All documents encrypted at rest', enabled: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-vault-darker/50 border border-vault-border">
                <div>
                  <p className="text-white text-sm font-display font-500">{item.label}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-mono ${item.enabled ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-vault-border text-slate-500'}`}>
                  {item.enabled ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Notifications" icon={Bell}>
          <div className="flex items-center justify-between p-4 rounded-xl bg-vault-darker/50 border border-vault-border">
            <div>
              <p className="text-white text-sm font-display font-500">Document Expiry Alerts</p>
              <p className="text-slate-400 text-xs mt-0.5">Get notified before documents expire</p>
            </div>
            <button type="button" onClick={() => setForm(p => ({...p, notifications: !p.notifications}))}
              className={`relative w-12 h-6 rounded-full transition-all ${form.notifications ? 'bg-vault-neon' : 'bg-vault-border'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.notifications ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </Section>

        <div className="flex justify-end gap-3">
          <button type="submit" disabled={saving} className="btn-primary px-8 py-3 rounded-xl font-display font-600 flex items-center gap-2">
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
