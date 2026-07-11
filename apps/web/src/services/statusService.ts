import { apiCall } from './apiClient';
import type { StatusResponse } from '@arob/shared';

export const statusService = {
  async getStatus() {
    return apiCall<StatusResponse>('/status');
  },
  async getSleep() {
    return apiCall<{ enabled: boolean; from: string; to: string; is_now: boolean }>('/status/sleep');
  },
  async setSleep(enabled: boolean, from: string, to: string) {
    return apiCall('/status/sleep', { body: { enabled, from, to } });
  },
};
