 'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import LandingPage from '../components/LandingPage';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-vault-darker flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-2 border-vault-neon animate-ping opacity-30" />
            <div className="absolute inset-4 rounded-full bg-vault-neon/20" />
          </div>
          <p className="text-vault-neon font-mono text-sm tracking-widest animate-pulse">INITIALIZING VAULT...</p>
        </div>
      </div>
    );
  }

  return <LandingPage />;
}
