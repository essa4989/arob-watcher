import { apiCall, getDeviceName } from './apiClient';
import type {
  CatheterInput,
  MedicationInput,
  CheckInput,
  FluidInput,
  CareInput,
  EntryType,
} from '@arob/shared';

export const logService = {
  async logCatheter(data: CatheterInput) {
    return apiCall('/log', { body: { type: 'catheter', device: getDeviceName(), ...data } });
  },
  async logMedication(data: MedicationInput) {
    return apiCall('/log', { body: { type: 'medication', device: getDeviceName(), ...data } });
  },
  async logCheck(data: CheckInput) {
    return apiCall('/log', { body: { type: 'check', device: getDeviceName(), ...data } });
  },
  async logFluid(data: FluidInput) {
    return apiCall('/log', { body: { type: 'fluid', device: getDeviceName(), ...data } });
  },
  async logCare(data: CareInput) {
    return apiCall('/log', { body: { type: 'care', device: getDeviceName(), ...data } });
  },
  async getRecent(limit = 30) {
    return apiCall<{ logs: Array<Record<string, unknown>> }>(`/log?limit=${limit}`);
  },
  async getAll() {
    return apiCall<{
      catheter: Array<Record<string, unknown>>;
      medication: Array<Record<string, unknown>>;
      check: Array<Record<string, unknown>>;
      fluid: Array<Record<string, unknown>>;
      care: Array<Record<string, unknown>>;
    }>('/log/all');
  },
  async deleteLast(type: EntryType) {
    return apiCall(`/log/last/${type}`, { method: 'DELETE' });
  },
};
