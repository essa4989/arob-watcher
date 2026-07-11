import type { TranslationShape } from './ar';

export const tl: TranslationShape = {
  app: { title: 'Aroob Care Platform', tagline: 'Tumpak at ligtas na pagsubaybay ng home-care' },
  nav: { home: 'Home', journey: 'Paglalakbay', reports: 'Ulat', guide: 'Gabay', settings: 'Setting' },
  common: {
    save: 'I-save', cancel: 'Kanselahin', delete: 'Burahin', edit: 'I-edit', close: 'Isara', add: 'Idagdag',
    notes: 'Tala', optional: '(opsyonal)', loading: 'Naglo-load...', success: 'Tagumpay',
    error: 'May naganap na error', confirm: 'Kumpirmahin', back: 'Bumalik', logout: 'Mag-log out', login: 'Mag-log in',
    minutes: 'min', ml: 'ml', yes: 'Oo', no: 'Hindi', all: 'Lahat', today: 'Ngayon', week: 'Lingguhan', month: 'Buwanan',
  },
  home: {
    sinceLastCatheter: 'Mula huling catheter', remaining: 'Natitirang oras', noDataYet: 'Wala pang datos',
    quickActions: 'Mabilisang aksyon', catheter: 'Catheter', medication: 'Gamot', check: 'Vitals', fluid: 'Likido', care: 'Pangangalaga',
    recentEntries: 'Kamakailang tala', smartSummary: 'Matalinong buod', runSummary: 'I-refresh ang buod',
    sleepBadge: 'Naka-on ang sleep mode', undo: 'I-undo', undoWindow: 'Maaaring i-undo sa loob ng 30 minuto',
  },
  starDialog: {
    title: 'Nakabigay ba ng bituin si Aroob?', yes: 'Oo, karapat-dapat siya 🌸', no: 'Hindi pa', leveledUp: 'Bagong level!',
  },
  forms: {
    catheterTitle: 'Itala ang catheterization', amount: 'Dami (ml)', color: 'Kulay', smell: 'Amoy', pain: 'Sakit',
    medicationTitle: 'Itala ang gamot', med: 'Pangalan ng gamot', dose: 'Dosis', method: 'Paraan', response: 'Reaksyon',
    checkTitle: 'Itala ang vitals', temp: 'Temperatura (°C)', bp: 'Presyon ng dugo', pulse: 'Pulso (bpm)', spo2: 'Oxygen (%)',
    skin: 'Balat', consciousness: 'Kamalayan', position: 'Posisyon',
    fluidTitle: 'Itala ang likido', fluidType: 'Uri',
    careTitle: 'Itala ang pangangalaga', care: 'Uri ng pangangalaga',
    validationRequired: 'Kailangan ang field na ito', validationOneMeasure: 'Kailangan ng kahit isang sukat',
  },
  journey: {
    title: 'Paglalakbay ni Aroob', level: 'Level', totalStars: 'Kabuuang bituin', todayStars: 'Bituin ngayon',
    streak: 'Kasalukuyang streak', longestStreak: 'Pinakamahabang streak', days: 'araw', progressToNext: 'Progreso sa susunod na level',
    rewards: 'Gantimpala', addReward: 'Magdagdag ng gantimpala', rewardTitle: 'Pamagat ng gantimpala', starsNeeded: 'Kailangang bituin',
    claim: 'Kunin', available: 'Available', pending: 'Isinasagawa', claimed: 'Nakuha na',
    honorBoard: 'Honor board', levels: 'Sampung level',
  },
  reports: {
    title: 'Ulat', period: 'Panahon', daily: 'Araw-araw', weekly: 'Lingguhan', monthly: 'Buwanan', allTime: 'Lahat ng oras',
    counts: 'Bilang ng tala', totalUrine: 'Kabuuang ihi', totalFluid: 'Kabuuang likido', balance: 'Balanse',
    exportExcel: 'I-export sa Excel', exportPdf: 'I-export sa PDF', patterns: 'Pagtuklas ng pattern', noPatterns: 'Walang kapansin-pansing pattern',
    insights: 'Mga obserbasyon', recommendations: 'Mga rekomendasyon',
  },
  guide: { title: 'Gabay sa pangangalaga kay Aroob' },
  settings: {
    title: 'Setting', security: 'Seguridad', pin: 'PIN code', changePin: 'Palitan ang PIN',
    role: 'Tungkulin', currentRole: 'Kasalukuyang tungkulin', auditLog: 'Audit log', sleepMode: 'Sleep mode',
    sleepFrom: 'Mula', sleepTo: 'Hanggang', deviceName: 'Pangalan ng device', diagnostics: 'Diagnostics',
    testTelegram: 'Subukan ang Telegram', version: 'Bersyon', database: 'Database', telegramChats: 'Telegram chats',
    parent: 'Magulang', nurse: 'Nars', doctor: 'Doktor', language: 'Wika',
  },
  auth: { enterPin: 'Ilagay ang iyong PIN', wrongPin: 'Maling PIN', loggedInAs: 'Naka-log in bilang' },
  alerts: {
    level1: 'Paalala — overdue', level2: 'Babala — posibleng retention', level3: 'Kagyat — pagod ang bato',
    level4: 'Alarma — agarang panganib', level5: 'Kritikal na alarma — tawagan ang doktor',
  },
};
