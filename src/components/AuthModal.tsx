import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, AlertCircle, Loader2 } from 'lucide-react';
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
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(defaultMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
        if (
          (email.toLowerCase() === 'pujasathisupport@gmail.com' ||
            email.toLowerCase().includes('admin')) &&
          onNavigate
        ) {
          onNavigate('/admin');
        }
      } else {
        setError(res.error || 'Failed to login');
      }
    } else {
      const res = await register({
        email,
        password,
        full_name: fullName,
        phone,
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
            {isLogin ? 'Sign In to PujaSathi' : 'Create Devotee Account'}
          </h3>
          <p className="text-xs text-[#78716C] mt-1">
            {isLogin
              ? 'Access your puja bookings, samagri orders & official receipts'
              : 'Join PujaSathi for personalized sankalpa and ceremony updates'}
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

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
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

          <div>
            <label className="block text-[11px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#A8A29E]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Register Account'}</span>
            )}
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-[#E7DCCE] text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs text-[#9A3412] font-semibold hover:underline cursor-pointer"
          >
            {isLogin ? "Don't have an account? Create one here" : 'Already have an account? Sign in here'}
          </button>
        </div>
      </div>
    </div>
  );
};
