import type { Role, EntryType } from './constants';

export interface ApiOk<T = Record<string, unknown>> {
  ok: true;
  [key: string]: unknown;
}
export interface ApiErr {
  ok: false;
  error: string;
}
export type ApiResult<T = Record<string, unknown>> = (ApiOk & T) | ApiErr;

export interface CatheterInput {
  amount: number;
  color?: string;
  smell?: string;
  pain?: 'لا' | 'نعم' | string;
  notes?: string;
  device?: string;
  time?: string;
}

export interface MedicationInput {
  med: string;
  dose?: string;
  method?: string;
  response?: string;
  notes?: string;
  medScheduleId?: string;
  device?: string;
  time?: string;
}

export interface CheckInput {
  temp?: number;
  bp?: string;
  pulse?: number;
  spo2?: number;
  skin?: string;
  consciousness?: string;
  position?: string;
  notes?: string;
  device?: string;
}

export interface FluidInput {
  fluidType: string;
  amount: number;
  response?: string;
  notes?: string;
  device?: string;
}

export interface CareInput {
  care: string;
  response?: string;
  notes?: string;
  device?: string;
}

export type LogInput =
  | ({ type: 'catheter' } & CatheterInput)
  | ({ type: 'medication' } & MedicationInput)
  | ({ type: 'check' } & CheckInput)
  | ({ type: 'fluid' } & FluidInput)
  | ({ type: 'care' } & CareInput);

export interface StatusResponse {
  ok: true;
  last_catheter: string | null;
  diff_minutes: number | null;
  alert_level: 0 | 1 | 2 | 3 | 4 | 5;
  alert_label: string;
  alert_emoji: string;
  kidney_msg: string;
  sleep_mode: boolean;
  sleep_from: string;
  sleep_to: string;
  is_sleep_now: boolean;
  server_time: string;
  version: string;
}

export interface StatsResponse {
  ok: true;
  counts: { catheter: number; medication: number; check: number; fluid: number; care: number };
  total_urine: number;
  total_fluid: number;
  balance: number;
  from: string;
  to: string;
}

export interface JourneyLevel {
  level: number;
  name: string;
  emoji: string;
  stars: number;
  next: number | null;
}

export interface JourneyStatusResponse {
  ok: true;
  total_stars: number;
  today_stars: number;
  current_streak: number;
  longest_streak: number;
  level: JourneyLevel;
  next_level: JourneyLevel | null;
  progress_to_next: number;
  by_type: Record<EntryType, number>;
}

export interface MedSchedule {
  id: string;
  name: string;
  dose?: string;
  method?: string;
  times: string[];
  frequency?: string;
  days: string[];
  startDate?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

export interface Reward {
  id: string;
  title: string;
  description?: string;
  starsNeeded: number;
  status: 'pending' | 'available' | 'claimed';
  createdAt: string;
  achievedAt?: string | null;
  claimedAt?: string | null;
}

export interface Pattern {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  title: string;
  description: string;
  recommendation: string;
}

export interface SmartSummaryResponse {
  ok: true;
  summary: string;
  insights: string[];
  recommendations: string[];
  flags: Array<{ level: 'critical' | 'warning' | 'info'; message: string }>;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  details: Record<string, unknown>;
  device?: string;
  role?: Role;
}

export interface SessionUser {
  role: Role;
  device: string;
  token: string;
  capabilities: Record<string, boolean>;
}

export type { Role, EntryType };
