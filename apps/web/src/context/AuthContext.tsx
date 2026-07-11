import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiCall, getToken, setToken as persistToken } from '../services/apiClient';
import { authService } from '../services/authService';
import { ROLE_CAPABILITIES, type Role } from '@arob/shared';

interface AuthState {
  role: Role | null;
  capabilities: Record<string, boolean>;
  loading: boolean;
  login: (pin: string) => Promise<{ ok: boolean; error?: string; role?: Role }>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const GUEST_CAPS: Record<string, boolean> = { can_view: true, can_export: true };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await apiCall<{ role: Role }>('/auth/session');
      if (res.ok) setRole(res.role);
      else persistToken(null);
      setLoading(false);
    })();
  }, []);

  const login = async (pin: string) => {
    const res = await authService.login(pin);
    if (res.ok) setRole(res.role);
    return res;
  };

  const logout = () => {
    authService.logout();
    setRole(null);
  };

  const capabilities = role ? ROLE_CAPABILITIES[role] : GUEST_CAPS;

  return <AuthContext.Provider value={{ role, capabilities, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
