export const ar = {
  app: { title: 'منصة رعاية عروب', tagline: 'متابعة رعاية منزلية دقيقة وآمنة' },
  nav: { home: 'الرئيسية', journey: 'الرحلة', reports: 'التقارير', guide: 'الدليل', settings: 'الإعدادات' },
  common: {
    save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل', close: 'إغلاق', add: 'إضافة',
    notes: 'ملاحظات', optional: '(اختياري)', loading: 'جارٍ التحميل...', success: 'تم بنجاح',
    error: 'حدث خطأ', confirm: 'تأكيد', back: 'رجوع', logout: 'تسجيل الخروج', login: 'تسجيل الدخول',
    minutes: 'دقيقة', ml: 'مل', yes: 'نعم', no: 'لا', all: 'الكل', today: 'اليوم', week: 'أسبوعي', month: 'شهري',
  },
  home: {
    sinceLastCatheter: 'منذ آخر قسطرة', remaining: 'الوقت المتبقي', noDataYet: 'لا توجد بيانات بعد',
    quickActions: 'إجراء سريع', catheter: 'قسطرة', medication: 'دواء', check: 'فحص', fluid: 'سوائل', care: 'عناية',
    recentEntries: 'آخر الإدخالات', smartSummary: 'الملخص الذكي', runSummary: 'تحديث الملخص',
    sleepBadge: 'وضع النوم مفعّل', undo: 'تراجع', undoWindow: 'يمكن التراجع خلال 30 دقيقة',
  },
  starDialog: {
    title: 'هل استحقت عروب وردة؟', yes: 'نعم استحقت 🌸', no: 'ليس بعد', leveledUp: 'ترقية مستوى جديد!',
  },
  forms: {
    catheterTitle: 'تسجيل قسطرة', amount: 'الكمية (مل)', color: 'اللون', smell: 'الرائحة', pain: 'الألم',
    medicationTitle: 'تسجيل دواء', med: 'اسم الدواء', dose: 'الجرعة', method: 'الطريقة', response: 'الاستجابة',
    checkTitle: 'تسجيل فحص', temp: 'الحرارة (°C)', bp: 'ضغط الدم', pulse: 'النبض (bpm)', spo2: 'الأكسجين (%)',
    skin: 'الجلد', consciousness: 'الوعي', position: 'الوضعية',
    fluidTitle: 'تسجيل سوائل', fluidType: 'النوع',
    careTitle: 'تسجيل عناية', care: 'نوع العناية',
    validationRequired: 'هذا الحقل مطلوب', validationOneMeasure: 'قياس واحد على الأقل مطلوب',
  },
  journey: {
    title: 'رحلة عروب', level: 'المستوى', totalStars: 'إجمالي النجوم', todayStars: 'نجوم اليوم',
    streak: 'السلسلة الحالية', longestStreak: 'أطول سلسلة', days: 'يوم', progressToNext: 'التقدم للمستوى التالي',
    rewards: 'المكافآت', addReward: 'إضافة مكافأة', rewardTitle: 'عنوان المكافأة', starsNeeded: 'عدد النجوم المطلوبة',
    claim: 'استلام', available: 'متاحة', pending: 'قيد التقدّم', claimed: 'تم الاستلام',
    honorBoard: 'لوحة الشرف', levels: 'المستويات العشرة',
  },
  reports: {
    title: 'التقارير', period: 'الفترة', daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري', allTime: 'كل الفترات',
    counts: 'عدد الإدخالات', totalUrine: 'إجمالي البول', totalFluid: 'إجمالي السوائل', balance: 'التوازن',
    exportExcel: 'تصدير Excel', exportPdf: 'تصدير PDF', patterns: 'كشف الأنماط', noPatterns: 'لا توجد أنماط ملحوظة',
    insights: 'الملاحظات', recommendations: 'التوصيات',
  },
  guide: { title: 'دليل رعاية عروب' },
  settings: {
    title: 'الإعدادات', security: 'الأمان', pin: 'رمز الدخول (PIN)', changePin: 'تغيير الرمز',
    role: 'الدور', currentRole: 'الدور الحالي', auditLog: 'سجل التدقيق', sleepMode: 'وضع النوم',
    sleepFrom: 'من', sleepTo: 'إلى', deviceName: 'اسم الجهاز', diagnostics: 'التشخيص',
    testTelegram: 'اختبار Telegram', version: 'الإصدار', database: 'قاعدة البيانات', telegramChats: 'محادثات Telegram',
    parent: 'أب/أم', nurse: 'ممرضة', doctor: 'طبيب', language: 'اللغة',
  },
  auth: { enterPin: 'أدخل رمز الدخول', wrongPin: 'الرمز غير صحيح', loggedInAs: 'مسجّل دخول كـ' },
  alerts: {
    level1: 'تنبيه — تأخر عن المثالي', level2: 'تحذير — احتمال احتباس', level3: 'تحذير عاجل — ضغط على الكلى',
    level4: 'إنذار — خطر مباشر', level5: 'إنذار حرج — اتصل بالطبيب',
  },
};
export type TranslationShape = typeof ar;
