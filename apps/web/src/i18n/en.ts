import type { TranslationShape } from './ar';

export const en: TranslationShape = {
  app: { title: 'Aroob Care Platform', tagline: 'Accurate, safe home-care monitoring' },
  nav: { home: 'Home', journey: 'Journey', reports: 'Reports', guide: 'Guide', settings: 'Settings' },
  common: {
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', close: 'Close', add: 'Add',
    notes: 'Notes', optional: '(optional)', loading: 'Loading...', success: 'Success',
    error: 'An error occurred', confirm: 'Confirm', back: 'Back', logout: 'Log out', login: 'Log in',
    minutes: 'min', ml: 'ml', yes: 'Yes', no: 'No', all: 'All', today: 'Today', week: 'Weekly', month: 'Monthly',
  },
  home: {
    sinceLastCatheter: 'Since last catheter', remaining: 'Time remaining', noDataYet: 'No data yet',
    quickActions: 'Quick action', catheter: 'Catheter', medication: 'Medication', check: 'Vitals', fluid: 'Fluids', care: 'Care',
    recentEntries: 'Recent entries', smartSummary: 'Smart summary', runSummary: 'Refresh summary',
    sleepBadge: 'Sleep mode active', undo: 'Undo', undoWindow: 'Can be undone within 30 minutes',
  },
  starDialog: {
    title: 'Did Aroob earn a star?', yes: 'Yes, she earned it 🌸', no: 'Not yet', leveledUp: 'New level unlocked!',
  },
  forms: {
    catheterTitle: 'Log catheterization', amount: 'Amount (ml)', color: 'Color', smell: 'Smell', pain: 'Pain',
    medicationTitle: 'Log medication', med: 'Medication name', dose: 'Dose', method: 'Method', response: 'Response',
    checkTitle: 'Log vitals', temp: 'Temperature (°C)', bp: 'Blood pressure', pulse: 'Pulse (bpm)', spo2: 'Oxygen (%)',
    skin: 'Skin', consciousness: 'Consciousness', position: 'Position',
    fluidTitle: 'Log fluids', fluidType: 'Type',
    careTitle: 'Log care', care: 'Care type',
    validationRequired: 'This field is required', validationOneMeasure: 'At least one measurement is required',
  },
  journey: {
    title: "Aroob's Journey", level: 'Level', totalStars: 'Total stars', todayStars: "Today's stars",
    streak: 'Current streak', longestStreak: 'Longest streak', days: 'days', progressToNext: 'Progress to next level',
    rewards: 'Rewards', addReward: 'Add reward', rewardTitle: 'Reward title', starsNeeded: 'Stars needed',
    claim: 'Claim', available: 'Available', pending: 'In progress', claimed: 'Claimed',
    honorBoard: 'Honor board', levels: 'The 10 levels',
  },
  reports: {
    title: 'Reports', period: 'Period', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', allTime: 'All time',
    counts: 'Entry counts', totalUrine: 'Total urine', totalFluid: 'Total fluids', balance: 'Balance',
    exportExcel: 'Export Excel', exportPdf: 'Export PDF', patterns: 'Pattern detection', noPatterns: 'No notable patterns',
    insights: 'Insights', recommendations: 'Recommendations',
  },
  guide: { title: "Aroob's care guide" },
  settings: {
    title: 'Settings', security: 'Security', pin: 'PIN code', changePin: 'Change PIN',
    role: 'Role', currentRole: 'Current role', auditLog: 'Audit log', sleepMode: 'Sleep mode',
    sleepFrom: 'From', sleepTo: 'To', deviceName: 'Device name', diagnostics: 'Diagnostics',
    testTelegram: 'Test Telegram', version: 'Version', database: 'Database', telegramChats: 'Telegram chats',
    parent: 'Parent', nurse: 'Nurse', doctor: 'Doctor', language: 'Language',
  },
  auth: { enterPin: 'Enter your PIN', wrongPin: 'Incorrect PIN', loggedInAs: 'Logged in as' },
  alerts: {
    level1: 'Notice — overdue', level2: 'Warning — possible retention', level3: 'Urgent — kidney strain',
    level4: 'Alarm — immediate risk', level5: 'Critical alarm — call the doctor',
  },
};
