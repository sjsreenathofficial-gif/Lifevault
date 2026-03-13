'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../../components/layout/Sidebar';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-vault-darker flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 relative">
            <div className="absolute inset-0 rounded-full border-2 border-vault-neon animate-ping opacity-30" />
            <div className="absolute inset-2 rounded-full bg-vault-neon/20" />
          </div>
          <p className="text-vault-neon font-mono text-xs tracking-widest">LOADING VAULT...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-vault-darker flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
