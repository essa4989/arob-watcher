import { apiCall, getDeviceName } from './apiClient';
import type { JourneyStatusResponse, EntryType } from '@arob/shared';

export const journeyService = {
  async getStatus() {
    return apiCall<JourneyStatusResponse>('/journey');
  },
  async award(type: EntryType) {
    return apiCall<{ total: number; leveledUp: boolean; streak: number }>('/journey/award', {
      body: { type, device: getDeviceName() },
    });
  },
  async undo() {
    return apiCall('/journey/undo', { body: {} });
  },
  async getHonorBoard() {
    return apiCall<{ entries: Array<Record<string, unknown>> }>('/journey/honor-board');
  },
};
