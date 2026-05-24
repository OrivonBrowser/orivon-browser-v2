import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle, Unlock } from 'lucide-react';

interface PasswordModalProps {
  mode: 'setup' | 'unlock';
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PasswordModal({ mode, onSuccess, onCancel }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockout, setLockout] = useState(0);
  const [shake, setShake] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (lockout > 0) {
      const timer = setInterval(() => setLockout(l => l - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [lockout]);

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Passwords match', met: password === confirmPassword && password.length > 0 },
  ];

  const allMet = requirements.every(r => r.met);

  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/\d/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const strengthInfo = [
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f97316' },
    { label: 'Good', color: '#eab308' },
    { label: 'Strong', color: '#22c55e' },
  ][strength - 1] || { label: '', color: '#1e2030' };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allMet) return;
    setIsLoading(true);
    try {
      if (window.electronAPI?.setPassword) {
        await window.electronAPI.setPassword(password);
        setIsSuccess(true);
        setTimeout(onSuccess, 1500);
      }
    } catch (err) {
      setError('Failed to set password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockout > 0 || !password) return;
    setIsLoading(true);
    setError('');
    try {
      if (window.electronAPI?.unlockWallet) {
        const result = await window.electronAPI.unlockWallet(password);
        if (result.success) {
          onSuccess();
        } else {
          setAttempts(a => a + 1);
          setShake(true);
          setTimeout(() => setShake(false), 300);
          setError('Incorrect password');
          setPassword('');
          inputRef.current?.focus();
          if (attempts + 1 >= 5) {
            setLockout(30);
          }
        }
      }
    } catch (err) {
      setError('System error. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-[4px]"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative bg-[#111218] border border-[#1e2030] rounded-[16px] p-8 max-w-[440px] w-full shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-4"
            >
              <CheckCircle size={48} className="text-[#22c55e] mb-4" />
              <h2 className="text-[18px] font-semibold text-[#f8fafc] mb-1">Account secured</h2>
              <p className="text-[13px] text-[#94a3b8]">Your wallet is now protected</p>
            </motion.div>
          ) : mode === 'setup' ? (
            <div key="setup">
              <div className="flex flex-col items-center text-center mb-6">
                <ShieldCheck size={40} className="text-[#6366f1] mb-4" />
                <h2 className="text-[20px] font-bold text-[#f8fafc] tracking-[-0.02em] mb-2">Secure your account</h2>
                <p className="text-[14px] text-[#94a3b8] leading-[1.6] max-w-[340px]">
                  Your wallet controls real funds. Setting a password protects it from anyone with access to your device.
                </p>
              </div>

              <div className="h-[1px] bg-[#1e2030] w-full mb-4" />

              <div className="space-y-4 mb-6">
                <Row icon={<Lock size={16} className="text-[#6366f1]" />} label="Encrypts your seed phrase" desc="Your keys are encrypted locally." />
                <Row icon={<Eye size={16} className="text-[#f59e0b]" />} label="Required to view sensitive info" desc="Seed phrase, private keys, transactions." />
                <Row icon={<Shield size={16} className="text-[#22c55e]" />} label="Stays on your device" desc="Never sent anywhere. Orivon cannot see it." />
              </div>

              <div className="h-[1px] bg-[#1e2030] w-full mb-6" />

              <form onSubmit={handleSetup} className="space-y-3">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-[44px] bg-[#161720] border border-[#1e2030] rounded-[8px] px-[16px] pr-[44px] text-[#f8fafc] outline-none focus:border-[#6366f1] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {password && (
                  <div className="space-y-1.5">
                    <div className="h-[4px] w-full bg-[#1e2030] rounded-full flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div 
                          key={i} 
                          className="flex-1 h-full rounded-full transition-colors duration-300" 
                          style={{ backgroundColor: i <= strength ? strengthInfo.color : '#1e2030' }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: strengthInfo.color }}>
                      {strengthInfo.label}
                    </span>
                  </div>
                )}

                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full h-[44px] bg-[#161720] border border-[#1e2030] rounded-[8px] px-[16px] pr-[44px] text-[#f8fafc] outline-none focus:border-[#6366f1] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8]"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-2">
                  {requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full flex items-center justify-center ${req.met ? 'bg-[#22c55e]' : 'border border-[#64748b]'}`}>
                        {req.met && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className={`text-[11px] ${req.met ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>{req.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={!allMet || isLoading}
                    className="w-full h-[44px] bg-[#6366f1] text-white rounded-[10px] text-[14px] font-semibold hover:bg-[#4f46e5] disabled:bg-[#1e2030] disabled:text-[#475569] transition-all"
                  >
                    {isLoading ? 'Setting password...' : 'Set Password and Continue'}
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-full h-[44px] bg-transparent border border-[#1e2030] text-[#64748b] rounded-[10px] text-[14px] font-semibold hover:border-[#2d2e45] hover:text-[#94a3b8] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div key="unlock">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1] mb-4">
                  <Unlock size={32} />
                </div>
                <h2 className="text-[20px] font-bold text-[#f8fafc] tracking-[-0.02em] mb-2">Your wallet is locked</h2>
                <p className="text-[14px] text-[#94a3b8]">Enter your password to proceed.</p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-4">
                <motion.div 
                  animate={shake ? { x: [-4, 4, -4, 4, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <input
                    ref={inputRef}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={e => {
                        setPassword(e.target.value);
                        if (error) setError('');
                    }}
                    disabled={lockout > 0}
                    className={`w-full h-[48px] bg-[#161720] border rounded-[8px] px-[16px] pr-[44px] text-[#f8fafc] outline-none transition-all ${
                        error ? 'border-[#ef4444]' : 'border-[#1e2030] focus:border-[#6366f1]'
                    } ${lockout > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </motion.div>

                {error && (
                  <div className="flex items-center gap-1.5 text-[#ef4444] text-[12px] px-1">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                {lockout > 0 && (
                  <div className="flex items-center gap-1.5 text-[#f59e0b] text-[12px] px-1">
                    <AlertCircle size={14} />
                    <span>Too many attempts. Wait {lockout} seconds.</span>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!password || isLoading || lockout > 0}
                    className="w-full h-[48px] bg-[#6366f1] text-white rounded-[10px] text-[15px] font-semibold hover:bg-[#4f46e5] disabled:bg-[#1e2030] disabled:text-[#475569] transition-all"
                  >
                    {isLoading ? 'Unlocking...' : 'Unlock'}
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-full h-[48px] bg-transparent text-[#64748b] rounded-[10px] text-[14px] font-semibold hover:text-[#94a3b8] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function Row({ icon, label, desc }: { icon: React.ReactNode, label: string, desc: string }) {
  return (
    <div className="flex items-center gap-4 h-[44px]">
      <div className="shrink-0">{icon}</div>
      <div className="flex flex-col justify-center">
        <span className="text-[13px] font-medium text-[#f8fafc]">{label}</span>
        <span className="text-[12px] text-[#64748b]">{desc}</span>
      </div>
    </div>
  );
}
