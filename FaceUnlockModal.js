'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, CheckCircle, XCircle, Camera, X } from 'lucide-react';

export default function FaceUnlockModal({ onVerified, onCancel }) {
  const [status, setStatus] = useState('init'); // init | scanning | verified | failed
  const [progress, setProgress] = useState(0);
  const [camError, setCamError] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStatus('ready');
    } catch {
      setCamError(true);
      setStatus('ready');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const startScan = () => {
    setStatus('scanning');
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 8 + 2;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        // Simulate 90% success rate
        const success = Math.random() > 0.1;
        setStatus(success ? 'verified' : 'failed');
        if (success) setTimeout(() => { stopCamera(); onVerified(); }, 1200);
      }
    }, 80);
  };

  const retry = () => {
    setStatus('ready');
    setProgress(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card rounded-2xl p-8 max-w-sm w-full relative"
      >
        <button onClick={() => { stopCamera(); onCancel(); }} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h3 className="font-display font-700 text-white text-lg mb-1">Face Verification</h3>
          <p className="text-slate-400 text-sm">Verify identity to access this document</p>
        </div>

        {/* Camera frame */}
        <div className="relative w-52 h-52 mx-auto mb-6">
          {/* Corner brackets */}
          {['top-0 left-0 border-l border-t', 'top-0 right-0 border-r border-t', 'bottom-0 left-0 border-l border-b', 'bottom-0 right-0 border-r border-b'].map((cls, i) => (
            <div key={i} className={`absolute w-8 h-8 border-vault-neon ${cls}`} style={{ borderWidth: '2px' }} />
          ))}

          <div className="absolute inset-3 rounded-2xl overflow-hidden bg-vault-darker">
            {!camError ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Camera className="w-10 h-10 text-slate-500 mb-2" />
                <p className="text-slate-500 text-xs text-center px-4">Camera unavailable<br/>Simulating verification</p>
              </div>
            )}
            {status === 'scanning' && (
              <div className="absolute inset-0 scan-line">
                <div className="absolute inset-0 bg-vault-neon/5" />
              </div>
            )}
          </div>

          {status === 'verified' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-3 rounded-2xl bg-green-900/80 flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </motion.div>
          )}
          {status === 'failed' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-3 rounded-2xl bg-red-900/80 flex items-center justify-center">
              <XCircle className="w-16 h-16 text-red-400" />
            </motion.div>
          )}
        </div>

        {/* Progress */}
        {status === 'scanning' && (
          <div className="mb-4">
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-vault-neon animate-pulse">SCANNING FACE...</span>
              <span className="text-slate-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-vault-border rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }} className="h-full bg-vault-neon rounded-full" />
            </div>
          </div>
        )}

        {status === 'verified' && (
          <div className="text-center">
            <p className="text-green-400 font-display font-600 mb-1">Identity Verified!</p>
            <p className="text-slate-400 text-sm">Opening document...</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center">
            <p className="text-red-400 font-display font-600 mb-1">Verification Failed</p>
            <button onClick={retry} className="btn-primary px-6 py-2.5 rounded-xl text-sm mt-3 inline-block">Try Again</button>
          </div>
        )}

        {(status === 'ready' || status === 'init') && (
          <button onClick={startScan} className="btn-primary w-full py-3 rounded-xl font-display font-600 flex items-center justify-center gap-2">
            <Scan className="w-4 h-4" />
            Begin Face Scan
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
