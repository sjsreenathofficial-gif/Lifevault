'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Fingerprint, Zap, Users, Share2, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Military-Grade Security', desc: 'AES-256 encryption for every document stored in your vault' },
  { icon: Fingerprint, title: 'Face Unlock', desc: 'Biometric verification before accessing sensitive documents' },
  { icon: Users, title: 'Family Vault', desc: 'Manage documents for your entire family in one secure place' },
  { icon: Share2, title: 'Secure Sharing', desc: 'Share documents with expiring links and password protection' },
  { icon: Zap, title: 'AI Categorization', desc: 'Documents auto-categorized using smart classification' },
  { icon: Lock, title: 'Zero-Knowledge', desc: 'Your documents are only accessible by you' },
];

const docTypes = [
  'Birth Certificate', 'Aadhaar Card', 'PAN Card', 'Passport',
  'Degree Certificates', 'Property Documents', 'Insurance', 'Medical Records',
  'Marriage Certificate', 'Land Records', 'SSC Memo', 'Tax Returns'
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-vault-darker text-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vault-neon/20 to-vault-accent/20 border border-vault-neon/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-vault-neon" />
            </div>
            <span className="font-display font-800 text-xl tracking-tight">
              Life<span className="text-vault-neon">Vault</span>
            </span>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/auth')}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* BG glow blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-vault-neon/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-vault-accent/5 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-vault-neon/20 text-vault-neon text-xs font-mono tracking-widest mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-vault-neon animate-pulse" />
            ENCRYPTED & SECURE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-800 leading-tight mb-6"
          >
            Your Entire Life's
            <br />
            <span className="gradient-text">Documents. Secured.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Store every important document from birth to death in one ultra-secure digital vault.
            Access anywhere, share securely, never lose what matters most.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => router.push('/auth')}
              className="btn-primary px-8 py-4 rounded-2xl text-base font-700 flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              <Lock className="w-5 h-5" />
              Open Your Vault — Free
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Doc types scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 flex flex-wrap justify-center gap-3"
          >
            {docTypes.map((type, i) => (
              <motion.span
                key={type}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="px-3 py-1.5 rounded-lg glass-card text-xs text-slate-400 border border-vault-border font-mono"
              >
                {type}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-700 text-center mb-4"
          >
            Everything you need to keep <span className="gradient-text">documents safe</span>
          </motion.h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            LifeVault combines military-grade security with a beautiful, intuitive interface designed for everyone.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-6 rounded-2xl group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vault-neon/10 to-vault-accent/10 border border-vault-neon/20 flex items-center justify-center mb-4 group-hover:border-vault-neon/40 transition-colors">
                  <feature.icon className="w-6 h-6 text-vault-neon" />
                </div>
                <h3 className="font-display font-600 text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-12 border border-vault-neon/10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-vault-neon/5 to-vault-accent/5" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-700 mb-4">
                Start securing your documents <span className="text-vault-neon">today</span>
              </h2>
              <p className="text-slate-400 mb-8">Free forever. No credit card required.</p>
              <button
                onClick={() => router.push('/auth')}
                className="btn-primary px-10 py-4 rounded-2xl text-base font-700 inline-flex items-center gap-3"
              >
                <Shield className="w-5 h-5" />
                Create Your Vault
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-vault-border text-center">
        <p className="text-slate-500 text-sm font-mono">
          © 2025 LifeVault · Built with 🔒 for India & beyond
        </p>
      </footer>
    </div>
  );
}
