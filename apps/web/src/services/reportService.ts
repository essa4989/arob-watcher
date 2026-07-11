import { apiCall } from './apiClient';
import { logService } from './logService';
import type { StatsResponse, SmartSummaryResponse, Pattern } from '@arob/shared';

export const reportService = {
  async getStats(period: 'daily' | 'weekly' | 'monthly' | 'all') {
    return apiCall<StatsResponse>(`/reports/stats?period=${period}`);
  },
  async sendReport() {
    return apiCall('/reports/send', { body: {} });
  },
  async smartSummary(period: 'daily' | 'weekly') {
    return apiCall<SmartSummaryResponse>(`/reports/smart-summary?period=${period}`);
  },
  async patterns(days = 7) {
    return apiCall<{ patterns: Pattern[] }>(`/reports/patterns?days=${days}`);
  },
  async getAllLogsForExport() {
    return logService.getAll();
  },
};
