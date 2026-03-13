'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  setupRecaptcha,
  sendOTP,
  resetPassword,
} from '../../firebase/auth';
import toast from 'react-hot-toast';
import { Shield, Mail, Lock, Eye, EyeOff, Phone, User, ArrowLeft, Loader } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // login | signup | otp | reset
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', otp: '',
  });

  const recaptchaRef = useRef(null);
  const recaptchaVerifier = useRef(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) router.push('/dashboard');
  }, [user, authLoading, router]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Welcome to LifeVault!');
      router.push('/dashboard');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await signUpWithEmail(form.email, form.password, form.name);
        toast.success('Account created! Welcome to LifeVault!');
      }
      router.push('/dashboard');
    } catch (e) {
      toast.error(e.message.replace('Firebase: ', '').replace(' (auth/...)', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!recaptchaVerifier.current) {
        recaptchaVerifier.current = setupRecaptcha('recaptcha-container');
      }
      const result = await sendOTP(form.phone, recaptchaVerifier.current);
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success('OTP sent to ' + form.phone);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmationResult.confirm(form.otp);
      toast.success('Phone verified! Welcome!');
      router.push('/dashboard');
    } catch (e) {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(form.email);
      toast.success('Reset link sent to ' + form.email);
      setMode('login');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-vault-darker flex items-center justify-center p-4 relative overflow-hidden">
      <div id="recaptcha-container" />

      {/* BG effects */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-vault-neon/4 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-vault-accent/4 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-vault-neon/10 to-vault-accent/10 border border-vault-neon/30 mb-4 animate-float">
            <Shield className="w-8 h-8 text-vault-neon" />
          </div>
          <h1 className="font-display text-2xl font-800 text-white">
            Life<span className="text-vault-neon">Vault</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Your secure document fortress</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {/* Mode tabs */}
          {mode !== 'otp' && mode !== 'reset' && (
            <div className="flex rounded-xl overflow-hidden border border-vault-border mb-8">
              {['login', 'signup'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-3 text-sm font-display font-600 transition-all ${
                    mode === m
                      ? 'bg-vault-neon/10 text-vault-neon border-vault-neon/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}

          {mode === 'reset' && (
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setMode('login')} className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-display font-600 text-white">Reset Password</h2>
            </div>
          )}

          {mode === 'otp' && (
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => { setMode('login'); setOtpSent(false); }} className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-display font-600 text-white">Phone Verification</h2>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Email/Password form */}
            {(mode === 'login' || mode === 'signup') && (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleEmailAuth}
                className="space-y-4"
              >
                {mode === 'signup' && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      required
                      className="w-full bg-vault-darker/60 border border-vault-border rounded-xl px-10 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-vault-neon/50 transition-colors"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    required
                    className="w-full bg-vault-darker/60 border border-vault-border rounded-xl px-10 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-vault-neon/50 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    minLength={6}
                    className="w-full bg-vault-darker/60 border border-vault-border rounded-xl px-10 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-vault-neon/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {mode === 'login' && (
                  <div className="text-right">
                    <button type="button" onClick={() => setMode('reset')} className="text-vault-neon text-xs hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 rounded-xl font-display font-600 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                  {mode === 'login' ? 'Sign In to Vault' : 'Create Vault Account'}
                </button>
              </motion.form>
            )}

            {/* Reset password */}
            {mode === 'reset' && (
              <motion.form
                key="reset-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleReset}
                className="space-y-4"
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Your email address"
                    required
                    className="w-full bg-vault-darker/60 border border-vault-border rounded-xl px-10 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-vault-neon/50 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 rounded-xl font-display font-600 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                  Send Reset Link
                </button>
              </motion.form>
            )}

            {/* OTP */}
            {mode === 'otp' && (
              <motion.div key="otp-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {!otpSent ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                        required
                        className="w-full bg-vault-darker/60 border border-vault-border rounded-xl px-10 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-vault-neon/50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-3.5 rounded-xl font-display font-600 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                      Send OTP
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <p className="text-slate-400 text-sm text-center">Enter the 6-digit OTP sent to {form.phone}</p>
                    <input
                      name="otp"
                      type="text"
                      value={form.otp}
                      onChange={handleChange}
                      placeholder="000000"
                      maxLength={6}
                      required
                      className="w-full bg-vault-darker/60 border border-vault-border rounded-xl px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-vault-neon/50"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-3.5 rounded-xl font-display font-600 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                      Verify & Access Vault
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider & other options */}
          {(mode === 'login' || mode === 'signup') && (
            <>
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-vault-border" />
                <span className="text-slate-500 text-xs font-mono">OR</span>
                <div className="flex-1 h-px bg-vault-border" />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full glass-card-hover py-3 rounded-xl flex items-center justify-center gap-3 text-sm text-slate-300 font-display font-500 transition-all hover:text-white border border-vault-border"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <button
                  onClick={() => setMode('otp')}
                  disabled={loading}
                  className="w-full glass-card-hover py-3 rounded-xl flex items-center justify-center gap-3 text-sm text-slate-300 font-display font-500 transition-all hover:text-white border border-vault-border"
                >
                  <Phone className="w-4 h-4" />
                  Sign in with Phone OTP
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6 font-mono">
          🔒 Your documents are end-to-end encrypted
        </p>
      </motion.div>
    </div>
  );
}
