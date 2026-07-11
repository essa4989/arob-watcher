/**
 * Business-rule constants shared by the API and the web app.
 * These mirror PROJECT_MASTER_SPEC.md Sections 11, 22 and Appendix A.
 * Medical thresholds must not change without explicit human approval.
 */

export const CATHETER_IDEAL_INTERVAL_MIN = 90;

export interface CatheterAlertLevel {
  level: 1 | 2 | 3 | 4 | 5;
  minMinutes: number;
  emoji: string;
  labelAr: string;
  labelEn: string;
  labelTl: string;
}

/** Escalation table: 90 / 120 / 150 / 180 / 210 minutes. Ordered from most to least severe. */
export const CATHETER_ALERT_LEVELS: CatheterAlertLevel[] = [
  { level: 5, minMinutes: 210, emoji: '🚨', labelAr: 'إنذار حرج', labelEn: 'Critical alarm', labelTl: 'Kritikal na alarma' },
  { level: 4, minMinutes: 180, emoji: '🔴', labelAr: 'إنذار', labelEn: 'Alarm', labelTl: 'Alarma' },
  { level: 3, minMinutes: 150, emoji: '🟠', labelAr: 'تحذير عاجل', labelEn: 'Urgent warning', labelTl: 'Kagyat na babala' },
  { level: 2, minMinutes: 120, emoji: '🟡', labelAr: 'تحذير', labelEn: 'Warning', labelTl: 'Babala' },
  { level: 1, minMinutes: 90, emoji: '🟢', labelAr: 'تنبيه', labelEn: 'Notice', labelTl: 'Paalala' },
];

export const CATHETER_CRITICAL_LOW_ML = 30;
export const FEVER_C = 38.5;
export const HIGH_FEVER_C = 39;
export const CRITICAL_SPO2_PCT = 90;
export const TACHYCARDIA_BPM = 130;
export const MED_MISSED_AFTER_MIN = 60;

export const FLUID_BALANCE_DEHYDRATION_ML = -500;
export const FLUID_BALANCE_RETENTION_ML = 800;
export const FLUID_REFUSAL_PATTERN_COUNT = 1;

export const SLEEP_MODE_DEFAULT = { enabled: false, from: '23:00', to: '07:00' };

export const UNDO_WINDOW_MIN = 30;
export const SESSION_TTL_HOURS = 168; // 7 days

export type Role = 'parent' | 'nurse' | 'doctor';

export type EntryType = 'catheter' | 'medication' | 'check' | 'fluid' | 'care';

export interface StarLevel {
  level: number;
  nameAr: string;
  nameEn: string;
  nameTl: string;
  emoji: string;
  stars: number;
}

/** 10-level gamification ladder. Section 22. */
export const STAR_LEVELS: StarLevel[] = [
  { level: 1, nameAr: 'البذرة', nameEn: 'Seed', nameTl: 'Buto', emoji: '🌱', stars: 0 },
  { level: 2, nameAr: 'البرعم', nameEn: 'Sprout', nameTl: 'Usbong', emoji: '🌿', stars: 10 },
  { level: 3, nameAr: 'الزهرة', nameEn: 'Flower', nameTl: 'Bulaklak', emoji: '🌷', stars: 25 },
  { level: 4, nameAr: 'الوردة', nameEn: 'Rose', nameTl: 'Rosas', emoji: '🌹', stars: 50 },
  { level: 5, nameAr: 'الباقة', nameEn: 'Bouquet', nameTl: 'Bouquet', emoji: '💐', stars: 100 },
  { level: 6, nameAr: 'الحديقة', nameEn: 'Garden', nameTl: 'Hardin', emoji: '🌺', stars: 200 },
  { level: 7, nameAr: 'البستان', nameEn: 'Orchard', nameTl: 'Taniman', emoji: '🌻', stars: 350 },
  { level: 8, nameAr: 'الفراشة', nameEn: 'Butterfly', nameTl: 'Paruparo', emoji: '🦋', stars: 500 },
  { level: 9, nameAr: 'النجمة', nameEn: 'Star', nameTl: 'Bituin', emoji: '⭐', stars: 750 },
  { level: 10, nameAr: 'الأميرة', nameEn: 'Princess', nameTl: 'Prinsesa', emoji: '👑', stars: 1000 },
];

export const STREAK_MILESTONES = [7, 14, 30];

export const PATTERN_RULES = {
  recurringFever: { minTempC: 38, minDaysOutOf7: 3, severity: 'high' as const },
  lowUrine: { maxMl: 50, minOccurrences: 3, severity: 'high' as const },
  bloodyUrine: { severity: 'critical' as const },
  fluidRefusal: { minOccurrences: 4, severity: 'medium' as const },
};

/** Server-enforced role → capability matrix. Section 17. */
export const ROLE_CAPABILITIES: Record<Role, Record<string, boolean>> = {
  parent: {
    can_log: true,
    can_view: true,
    can_delete: true,
    can_settings: true,
    can_rewards: true,
    can_export: true,
    can_change_pin: true,
  },
  nurse: {
    can_log: true,
    can_view: true,
    can_delete: false,
    can_settings: false,
    can_rewards: false,
    can_export: true,
    can_change_pin: false,
  },
  doctor: {
    can_log: false,
    can_view: true,
    can_delete: false,
    can_settings: false,
    can_rewards: false,
    can_export: true,
    can_change_pin: false,
  },
};

export const CATHETER_COLORS = ['أصفر فاتح', 'أصفر داكن', 'عكر', 'دموي'] as const;
export const CATHETER_SMELLS = ['طبيعي', 'كريه'] as const;
export const MED_METHODS = ['فموي', 'حقنة', 'موضعي'] as const;
export const RESPONSES_GENERIC = ['جيدة', 'عادية', 'ضعيفة'] as const;
export const CONSCIOUSNESS_STATES = ['مستيقظة', 'نائمة', 'هائجة'] as const;
export const FLUID_TYPES = ['ماء', 'حليب', 'عصير', 'شوربة'] as const;
export const FLUID_RESPONSES = ['شربت كامل', 'شربت قليل', 'رفضت'] as const;
export const CARE_RESPONSES = ['متعاونة', 'عادية', 'رافضة'] as const;
