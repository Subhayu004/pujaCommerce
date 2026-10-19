import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  authModalOpen: boolean;
  authPromptMessage: string;
  openAuthModal: (promptMessage?: string, onComplete?: () => void) => void;
  closeAuthModal: () => void;
  pendingAction: (() => void) | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function parseJsonResponse(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return { error: 'Failed to parse JSON response' };
    }
  }
  // If server returned HTML or non-JSON
  const text = await res.text();
  if (text.trim().startsWith('<')) {
    return { error: res.ok ? 'Unexpected response format from server' : `Server error (${res.status} ${res.statusText})` };
  }
  return { error: text || 'Unknown response' };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('mv_session_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string>('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const openAuthModal = (message?: string, onComplete?: () => void) => {
    setAuthPromptMessage(message || '');
    if (onComplete) {
      setPendingAction(() => onComplete);
    } else {
      setPendingAction(null);
    }
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthPromptMessage('');
    setPendingAction(null);
  };

  const getAuthHeaders = (): Record<string, string> => {
    const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mv_session_token') : null);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
      headers['x-session-token'] = currentToken;
    }
    return headers;
  };

  const refreshUser = async () => {
    try {
      const currentToken = typeof window !== 'undefined' ? localStorage.getItem('mv_session_token') : null;
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
        headers['x-session-token'] = currentToken;
      }

      const res = await fetch('/api/auth/me', {
        headers,
        credentials: 'include',
      });

      if (res.ok) {
        const data = await parseJsonResponse(res);
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      if (data.token) {
        localStorage.setItem('mv_session_token', data.token);
        setToken(data.token);
      }

      setUser(data.user);
      if (pendingAction) {
        try {
          pendingAction();
        } catch (e) {
          console.error(e);
        }
        setPendingAction(null);
      }
      setAuthModalOpen(false);
      setAuthPromptMessage('');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      if (data.token) {
        localStorage.setItem('mv_session_token', data.token);
        setToken(data.token);
      }

      setUser(data.user);
      if (pendingAction) {
        try {
          pendingAction();
        } catch (e) {
          console.error(e);
        }
        setPendingAction(null);
      }
      setAuthModalOpen(false);
      setAuthPromptMessage('');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration' };
    }
  };

  const logout = async () => {
    try {
      const headers = getAuthHeaders();
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers,
        credentials: 'include',
      });
    } finally {
      localStorage.removeItem('mv_session_token');
      localStorage.removeItem('mv_cart_token');
      localStorage.removeItem('mv_cart_token_guest');
      // Clean all user-scoped cart keys so next login starts with a clean slate
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('mv_cart_token')) {
            localStorage.removeItem(key);
          }
        }
      } catch {}
      setToken(null);
      setUser(null);
      setAuthModalOpen(false);
      setPendingAction(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        authModalOpen,
        authPromptMessage,
        openAuthModal,
        closeAuthModal,
        pendingAction,
        login,
        register,
        logout,
        refreshUser,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
