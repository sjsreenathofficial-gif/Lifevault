'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../firebase/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Shield, LayoutDashboard, FileText, Upload, Users, Share2, Settings, LogOut, Menu, X, ChevronRight } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/documents', label: 'My Documents', icon: FileText },
  { href: '/dashboard/upload', label: 'Upload Document', icon: Upload },
  { href: '/dashboard/family', label: 'Family Vault', icon: Users },
  { href: '/dashboard/share', label: 'Secure Share', icon: Share2 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      toast.success('Vault locked. See you soon!');
    } catch (e) { toast.error('Logout failed'); }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-vault-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vault-neon/20 to-vault-accent/20 border border-vault-neon/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-vault-neon" />
          </div>
          <span className="font-display font-800 text-lg text-white">Life<span className="text-vault-neon">Vault</span></span>
        </div>
      </div>
      <div className="p-4 mx-3 mt-4 rounded-xl glass-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vault-accent/30 to-vault-neon/20 flex items-center justify-center text-vault-neon font-display font-700 text-sm border border-vault-border overflow-hidden">
            {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : (user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-600 font-display truncate">{user?.displayName || 'Vault User'}</p>
            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 mt-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-500 transition-all ${isActive ? 'bg-vault-neon/10 text-vault-neon border border-vault-neon/20' : 'text-slate-400 hover:text-white hover:bg-vault-card'}`}>
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-vault-neon' : ''}`} />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-vault-border">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/10 transition-all font-display font-500">
          <LogOut className="w-4 h-4" />Lock Vault
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 bottom-0 glass-card border-r border-vault-border z-40">
        <SidebarContent />
      </aside>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 glass-card rounded-xl flex items-center justify-center border border-vault-border">
        <Menu className="w-5 h-5 text-white" />
      </button>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }} className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-vault-card border-r border-vault-border z-50">
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
