import { apiCall } from './apiClient';
import type { Reward } from '@arob/shared';

export const rewardService = {
  async list() {
    return apiCall<{ rewards: Reward[]; total_stars: number }>('/rewards');
  },
  async save(input: { id?: string; title: string; description?: string; starsNeeded: number }) {
    return apiCall<{ id: string }>('/rewards', { body: input });
  },
  async remove(id: string) {
    return apiCall(`/rewards/${id}`, { method: 'DELETE' });
  },
  async claim(id: string) {
    return apiCall(`/rewards/${id}/claim`, { body: {} });
  },
};
