import { apiCall } from './apiClient';
import type { MedSchedule } from '@arob/shared';

export const medScheduleService = {
  async list() {
    return apiCall<{ schedules: MedSchedule[] }>('/med-schedule');
  },
  async save(input: {
    id?: string;
    name: string;
    dose?: string;
    method?: string;
    times: string[];
    frequency?: string;
    days: string[];
    startDate?: string;
    notes?: string;
  }) {
    return apiCall<{ id: string }>('/med-schedule', { body: input });
  },
  async remove(id: string) {
    return apiCall(`/med-schedule/${id}`, { method: 'DELETE' });
  },
  async upcoming() {
    return apiCall<{ upcoming: Array<{ scheduleId: string; name: string; time: string }> }>('/med-schedule/upcoming');
  },
  async missed() {
    return apiCall<{ missed: Array<{ scheduleId: string; name: string; time: string }> }>('/med-schedule/missed');
  },
};
