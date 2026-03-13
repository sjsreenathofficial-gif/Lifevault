'use client';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useDocuments } from '../../hooks/useDocuments';
import { DOCUMENT_CATEGORIES } from '../../lib/constants';
import { formatFileSize } from '../../firebase/storage';
import { format } from 'date-fns';
import Link from 'next/link';
import { FileText, Upload, Users, Share2, TrendingUp, Clock, HardDrive, Layers } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card-hover rounded-2xl p-6"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center`} style={{ background: color + '20', border: `1px solid ${color}30` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
    </div>
    <p className="font-display text-3xl font-700 text-white mb-1">{value}</p>
    <p className="text-slate-400 text-sm">{label}</p>
  </motion.div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const { documents, loading, stats } = useDocuments(user?.uid);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto pt-8 lg:pt-0">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-slate-400 text-sm font-mono mb-1">VAULT OVERVIEW</p>
        <h1 className="font-display text-2xl md:text-3xl font-700 text-white">
          {greeting()}, <span className="gradient-text">{user?.displayName?.split(' ')[0] || 'User'}</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">Your vault is secure and up to date</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="Total Documents" value={loading ? '—' : stats.total} color="#00f5ff" delay={0.1} />
        <StatCard icon={HardDrive} label="Storage Used" value={loading ? '—' : formatFileSize(stats.totalSize)} color="#7c3aed" delay={0.15} />
        <StatCard icon={Layers} label="Categories" value={loading ? '—' : Object.keys(stats.byCategory).length} color="#f59e0b" delay={0.2} />
        <StatCard icon={Clock} label="Recent Uploads" value={loading ? '—' : stats.recentUploads.length} color="#10b981" delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6 lg:col-span-2">
          <h2 className="font-display font-600 text-white mb-5 flex items-center gap-2">
            <Layers className="w-4 h-4 text-vault-neon" />
            Document Categories
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-vault-border/30 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(DOCUMENT_CATEGORIES).map(([key, cat]) => {
                const count = stats.byCategory[key] || 0;
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={key} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cat.color + '15', border: `1px solid ${cat.color}25` }}>
                      <span className="text-xs font-mono font-700" style={{ color: cat.color }}>{count}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-300 font-display font-500">{cat.label}</span>
                        <span className="text-xs text-slate-500 font-mono">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-vault-border rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5, duration: 0.8 }} className="h-full rounded-full" style={{ background: cat.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card rounded-2xl p-6">
          <h2 className="font-display font-600 text-white mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { href: '/dashboard/upload', icon: Upload, label: 'Upload Document', color: '#00f5ff' },
              { href: '/dashboard/documents', icon: FileText, label: 'View Documents', color: '#7c3aed' },
              { href: '/dashboard/family', icon: Users, label: 'Family Vault', color: '#f59e0b' },
              { href: '/dashboard/share', icon: Share2, label: 'Share Document', color: '#10b981' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-vault-card transition-all group border border-transparent hover:border-vault-border">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: item.color + '15' }}>
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white font-display font-500 transition-colors">{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent uploads */}
      {stats.recentUploads.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-6 mt-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-600 text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-vault-neon" />Recent Uploads
            </h2>
            <Link href="/dashboard/documents" className="text-vault-neon text-xs font-mono hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {stats.recentUploads.map(doc => {
              const catInfo = DOCUMENT_CATEGORIES[doc.category] || DOCUMENT_CATEGORIES.personal;
              return (
                <div key={doc.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-vault-card/50 transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: catInfo.color + '15', border: `1px solid ${catInfo.color}25` }}>
                    <FileText className="w-4 h-4" style={{ color: catInfo.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-display font-500 truncate">{doc.documentName}</p>
                    <p className="text-slate-500 text-xs font-mono">{catInfo.label} · {doc.createdAt?.toDate ? format(doc.createdAt.toDate(), 'MMM dd, yyyy') : 'Recently'}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg font-mono" style={{ background: catInfo.color + '15', color: catInfo.color }}>{doc.documentType}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
