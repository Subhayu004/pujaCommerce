import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, AlertCircle, Loader2, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  promptMessage?: string;
  onSuccess?: () => void;
  onNavigate?: (path: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  promptMessage,
  onSuccess,
  onNavigate,
}) => {
  const { login, register, refreshUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setError('');
      setSuccessMsg('');
      setShowPassword(false);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }

    if (mode === 'forgot') {
      if (!newPassword || newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: cleanEmail, new_password: newPassword }),
        });
        const data = await res.json();
        setLoading(false);
        if (res.ok && data.token) {
          localStorage.setItem('mv_session_token', data.token);
          await refreshUser();
          setSuccessMsg('Password reset successfully! Logged in.');
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 800);
        } else {
          setError(data.error || 'Failed to reset password');
        }
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Network error during password reset');
      }
      return;
    }

    if (!password) {
      setError('Please provide your password');
      return;
    }

    if (mode === 'register') {
      if (fullName.trim().length < 2) {
        setError('Please enter your full name (minimum 2 characters)');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }

    setLoading(true);

    if (mode === 'login') {
      const res = await login(cleanEmail, password);
      setLoading(false);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
        if (
          (cleanEmail === 'pujasathisupport@gmail.com' || cleanEmail.includes('admin')) &&
          onNavigate
        ) {
          onNavigate('/admin');
        }
      } else {
        setError(res.error || 'Failed to sign in. Please verify your email & password.');
      }
    } else {
      const res = await register({
        email: cleanEmail,
        password,
        full_name: fullName.trim(),
        phone: phone.trim(),
      });
      setLoading(false);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Failed to create account');
      }
    }
  };

  const handleQuickCustomerLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    const res = await login(demoEmail, demoPass);
    setLoading(false);
    if (res.success) {
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || `Failed to sign in as ${demoEmail}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-[#FAF7F2] border border-[#D1BA9C] rounded-2xl shadow-2xl p-6 sm:p-8 relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#D1BA9C] text-[#57534E] hover:text-[#292524] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="PujaSathi"
            className="w-12 h-12 mx-auto mb-2 rounded-full object-contain shadow-xs"
            referrerPolicy="no-referrer"
          />
          <h3 className="text-xl font-bold font-heading text-[#292524]">
            {mode === 'login'
              ? 'Sign In to PujaSathi'
              : mode === 'register'
              ? 'Create Devotee Account'
              : 'Reset Devotee Password'}
          </h3>
          <p className="text-xs text-[#78716C] mt-1">
            {mode === 'login'
              ? 'Access your puja bookings, samagri orders & official receipts'
              : mode === 'register'
              ? 'Join PujaSathi for personalized sankalpa and ceremony updates'
              : 'Set a new password to access your bookings and cart'}
          </p>
        </div>

        {promptMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5 shadow-2xs">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Sign In or Create Account Required</p>
              <p className="text-[#57534E] text-[11px] mt-0.5 leading-relaxed">{promptMessage}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            {error.includes('already exists') && (
              <div className="flex items-center gap-2 pt-1 border-t border-red-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="px-2.5 py-1 rounded-md bg-[#9A3412] text-white text-[11px] font-semibold hover:bg-[#7C2D12] transition-colors"
                >
                  👉 Click to Sign In Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                  }}
                  className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[11px] font-semibold hover:bg-amber-200 transition-colors"
                >
                  Reset Password
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-[#A8A29E]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Arjun Sharma"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-[#A8A29E]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#A8A29E]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="devotee@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
              />
            </div>
          </div>

          {mode !== 'forgot' ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-[#44403C] uppercase tracking-wider">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                    }}
                    className="text-[11px] text-[#9A3412] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#A8A29E]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#A8A29E] hover:text-[#57534E]"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
                New Password (minimum 6 characters)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-[#A8A29E]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secure password"
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#A8A29E] hover:text-[#57534E]"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === 'forgot' ? 'Updating Password...' : 'Authenticating...'}</span>
              </>
            ) : (
              <span>
                {mode === 'login'
                  ? 'Sign In'
                  : mode === 'register'
                  ? 'Register Devotee Account'
                  : 'Set Password & Sign In'}
              </span>
            )}
          </button>
        </form>

        {mode === 'login' && (
          <div className="mt-4 pt-3 border-t border-[#E7DCCE]/60 space-y-2">
            <button
              type="button"
              onClick={() => handleQuickCustomerLogin('arjun.sharma@example.com', 'Customer@123')}
              disabled={loading}
              className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>⚡ 1-Click Sign In: Arjun Sharma (Sample Devotee)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickCustomerLogin('subhayuroy666@gmail.com', 'Password@123')}
              disabled={loading}
              className="w-full py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-300 text-orange-950 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>👤 1-Click Sign In: Subhayu Roy (Customer)</span>
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-[#E7DCCE] flex items-center justify-center gap-3 text-center text-xs">
          {mode === 'login' ? (
            <button
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className="text-[#9A3412] font-semibold hover:underline cursor-pointer"
            >
              Don't have an account? Create one here
            </button>
          ) : (
            <button
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className="text-[#9A3412] font-semibold hover:underline cursor-pointer"
            >
              Already have an account? Sign in here
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
