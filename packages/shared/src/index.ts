// Explicit named re-exports (not `export *`): tsc's CommonJS output for `export *`
// uses a runtime __exportStar loop that Rollup's commonjs plugin cannot statically
// analyze, which breaks the production Vite build for the web app. Named exports
// compile to statically-analyzable `Object.defineProperty` calls instead.
export {
  CATHETER_IDEAL_INTERVAL_MIN,
  CATHETER_ALERT_LEVELS,
  CATHETER_CRITICAL_LOW_ML,
  FEVER_C,
  HIGH_FEVER_C,
  CRITICAL_SPO2_PCT,
  TACHYCARDIA_BPM,
  MED_MISSED_AFTER_MIN,
  FLUID_BALANCE_DEHYDRATION_ML,
  FLUID_BALANCE_RETENTION_ML,
  FLUID_REFUSAL_PATTERN_COUNT,
  SLEEP_MODE_DEFAULT,
  UNDO_WINDOW_MIN,
  SESSION_TTL_HOURS,
  STAR_LEVELS,
  STREAK_MILESTONES,
  PATTERN_RULES,
  ROLE_CAPABILITIES,
  CATHETER_COLORS,
  CATHETER_SMELLS,
  MED_METHODS,
  RESPONSES_GENERIC,
  CONSCIOUSNESS_STATES,
  FLUID_TYPES,
  FLUID_RESPONSES,
  CARE_RESPONSES,
} from './constants';

export type { CatheterAlertLevel, StarLevel, Role, EntryType } from './constants';

export type {
  ApiOk,
  ApiErr,
  ApiResult,
  CatheterInput,
  MedicationInput,
  CheckInput,
  FluidInput,
  CareInput,
  LogInput,
  StatusResponse,
  StatsResponse,
  JourneyLevel,
  JourneyStatusResponse,
  MedSchedule,
  Reward,
  Pattern,
  SmartSummaryResponse,
  AuditEntry,
  SessionUser,
} from './types';
