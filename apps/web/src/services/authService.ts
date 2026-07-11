import { apiCall, setToken, getDeviceName } from './apiClient';
import type { Role } from '@arob/shared';

export const authService = {
  async login(pin: string) {
    const res = await apiCall<{ role: Role; token: string; capabilities: Record<string, boolean> }>('/auth/login', {
      body: { pin, device: getDeviceName() },
    });
    if (res.ok) setToken(res.token);
    return res;
  },
  logout() {
    setToken(null);
  },
  async changePin(token: string, targetRole: Role, newPin: string) {
    return apiCall('/auth/change-pin', { body: { token, targetRole, newPin } });
  },
  async getAuditLog() {
    return apiCall<{ entries: Array<Record<string, unknown>> }>('/auth/audit-log');
  },
};
