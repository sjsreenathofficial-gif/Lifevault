'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useDocuments } from '../../../hooks/useDocuments';
import { addFamilyMember, getFamilyMembers, deleteFamilyMember } from '../../../firebase/firestore';
import { DOCUMENT_CATEGORIES, FAMILY_RELATIONS } from '../../../lib/constants';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Users, Plus, X, FileText, User, Trash2, ChevronRight } from 'lucide-react';

const MEMBER_AVATARS = ['👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👶'];

export default function FamilyPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', relation: 'Father', avatar: '👨' });
  const [adding, setAdding] = useState(false);

  const { documents: memberDocs } = useDocuments(user?.uid, selectedMember?.id);

  useEffect(() => {
    if (user) fetchMembers();
  }, [user]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await getFamilyMembers(user.uid);
      setMembers(data);
    } catch (e) { toast.error('Failed to load family members'); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addFamilyMember(user.uid, form);
      toast.success(`${form.name} added to Family Vault!`);
      setShowAddModal(false);
      setForm({ name: '', relation: 'Father', avatar: '👨' });
      fetchMembers();
    } catch (e) { toast.error(e.message); }
    finally { setAdding(false); }
  };

  const handleDelete = async (member) => {
    if (!confirm(`Remove ${member.name} from Family Vault?`)) return;
    try {
      await deleteFamilyMember(member.id);
      if (selectedMember?.id === member.id) setSelectedMember(null);
      fetchMembers();
      toast.success('Member removed');
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="max-w-5xl mx-auto pt-8 lg:pt-0">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-mono mb-1">FAMILY VAULT</p>
          <h1 className="font-display text-2xl md:text-3xl font-700 text-white">Family Members</h1>
          <p className="text-slate-500 text-sm mt-1">Manage documents for everyone in your family</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary px-4 py-2.5 rounded-xl text-sm font-display font-600 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members list */}
        <div className="space-y-3">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-20 glass-card rounded-2xl animate-pulse" />)
          ) : members.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-8 text-center">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-display">No family members yet</p>
              <button onClick={() => setShowAddModal(true)} className="text-vault-neon text-xs mt-2 hover:underline">Add first member →</button>
            </motion.div>
          ) : (
            members.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedMember(member)}
                className={`glass-card-hover rounded-2xl p-4 cursor-pointer transition-all ${selectedMember?.id === member.id ? 'border border-vault-neon/30 bg-vault-neon/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-vault-border flex items-center justify-center text-2xl">{member.avatar || '👤'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-display font-600 text-sm">{member.name}</p>
                    <p className="text-slate-400 text-xs">{member.relation}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight className={`w-4 h-4 transition-colors ${selectedMember?.id === member.id ? 'text-vault-neon' : 'text-slate-600'}`} />
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(member); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Member documents */}
        <div className="lg:col-span-2">
          {selectedMember ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-vault-border">
                  <div className="w-14 h-14 rounded-xl bg-vault-border flex items-center justify-center text-3xl">{selectedMember.avatar}</div>
                  <div>
                    <h2 className="font-display font-700 text-white text-lg">{selectedMember.name}</h2>
                    <p className="text-slate-400 text-sm">{selectedMember.relation} · {memberDocs.length} document{memberDocs.length !== 1 ? 's' : ''}</p>
                  </div>
                  <a href={`/dashboard/upload?member=${selectedMember.id}`} className="ml-auto btn-accent px-4 py-2 rounded-xl text-xs font-display font-600 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Doc
                  </a>
                </div>

                {memberDocs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No documents for {selectedMember.name} yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {memberDocs.map(doc => {
                      const catInfo = DOCUMENT_CATEGORIES[doc.category] || DOCUMENT_CATEGORIES.personal;
                      return (
                        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-vault-darker/50 transition-all">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: catInfo.color + '15' }}>
                            <FileText className="w-4 h-4" style={{ color: catInfo.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-display font-500 truncate">{doc.documentName}</p>
                            <p className="text-slate-500 text-xs font-mono">{catInfo.label} · {doc.createdAt?.toDate ? format(doc.createdAt.toDate(), 'MMM yyyy') : 'Recent'}</p>
                          </div>
                          <a href={doc.fileUrl} target="_blank" rel="noopener" className="text-vault-neon text-xs hover:underline font-mono">View →</a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
              <User className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-400 font-display">Select a family member</p>
              <p className="text-slate-600 text-sm mt-1">to view their documents</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card rounded-2xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-700 text-white text-lg">Add Family Member</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-2">Choose Avatar</label>
                  <div className="flex gap-2 flex-wrap">
                    {MEMBER_AVATARS.map(av => (
                      <button key={av} type="button" onClick={() => setForm(p => ({...p, avatar: av}))}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.avatar === av ? 'bg-vault-neon/20 border border-vault-neon/50' : 'bg-vault-border hover:bg-vault-border/80'}`}>
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-2">Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required placeholder="e.g. Rahul Kumar"
                    className="w-full bg-vault-darker border border-vault-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-vault-neon/50" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-2">Relation *</label>
                  <select value={form.relation} onChange={e => setForm(p => ({...p, relation: e.target.value}))}
                    className="w-full bg-vault-darker border border-vault-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-vault-neon/50">
                    {FAMILY_RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl border border-vault-border text-slate-400 hover:text-white text-sm font-display">Cancel</button>
                  <button type="submit" disabled={adding} className="flex-1 btn-primary py-3 rounded-xl font-display font-600 text-sm">
                    {adding ? 'Adding...' : 'Add to Family Vault'}
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
