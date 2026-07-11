import { apiCall } from './apiClient';

export const settingsService = {
  async testTelegram() {
    return apiCall<{ results: Array<{ chatId: string; ok: boolean }> }>('/settings/telegram-test', { body: {} });
  },
  async diagnostic() {
    return apiCall<{
      version: string;
      database: string;
      telegram_configured: boolean;
      telegram_chats: number;
      server_time: string;
    }>('/settings/diagnostic');
  },
  async listTelegramChats() {
    return apiCall<{ chats: Array<{ id: string; chatId: string; label?: string; enabled: boolean }> }>('/settings/telegram-chats');
  },
  async addTelegramChat(chatId: string, label?: string) {
    return apiCall('/settings/telegram-chats', { body: { chatId, label } });
  },
  async removeTelegramChat(id: string) {
    return apiCall(`/settings/telegram-chats/${id}`, { method: 'DELETE' });
  },
};
