export interface GuideSection {
  icon: string;
  title: string;
  points: string[];
}

const ar: GuideSection[] = [
  {
    icon: '💗',
    title: 'القسطرة',
    points: [
      'الفترة المثالية بين كل قسطرة وأخرى: 90 دقيقة.',
      'راقبي اللون والرائحة — أي بول دموي يتطلب اتصالاً فورياً بالطبيب.',
      'كمية أقل من 30 مل قد تدل على احتباس بولي — أبلغي فوراً.',
    ],
  },
  {
    icon: '💊',
    title: 'الأدوية',
    points: [
      'التزمي بمواعيد الجرعات المُبرمجة في جدول الأدوية.',
      'أي جرعة تأخرت أكثر من 60 دقيقة تُعتبر فائتة وتحتاج متابعة.',
      'سجّلي استجابة عروب لكل دواء لمساعدة الطبيب في التقييم.',
    ],
  },
  {
    icon: '🩺',
    title: 'العلامات الحيوية',
    points: [
      'حرارة 38.5° فأعلى = حمى، و39° فأعلى = حمى عالية تتطلب اهتماماً عاجلاً.',
      'مستوى أكسجين أقل من 90% حالة حرجة.',
      'نبض أعلى من 130 نبضة/دقيقة يستدعي المراقبة.',
    ],
  },
  {
    icon: '💧',
    title: 'السوائل',
    points: [
      'شجعي عروب على شرب كميات كافية موزعة خلال اليوم.',
      'التوازن السلبي الكبير (سوائل أقل من البول بكثير) قد يدل على جفاف.',
      'نوّعي أنواع السوائل إذا لاحظتِ رفضاً متكرراً.',
    ],
  },
  {
    icon: '🌸',
    title: 'العناية اليومية',
    points: [
      'حافظي على نظافة الجلد بشكل يومي لتفادي التهيج.',
      'سجّلي أي علامة تعاون أو رفض لمساعدة الفريق على فهم حالتها المزاجية.',
    ],
  },
  {
    icon: '⚠️',
    title: 'تذكّري دائماً',
    points: [
      'عروب لا تعبّر عن الألم كالأطفال الآخرين — الدقة في التوثيق تحمي سلامتها.',
      'عند أي شك طبي، لا تفترضي — تواصلي مع الأهل أو الطبيب فوراً.',
    ],
  },
];

const en: GuideSection[] = [
  { icon: '💗', title: 'Catheterization', points: ['Ideal interval: 90 minutes.', 'Watch color/smell — bloody urine needs an immediate call.', 'Under 30ml may signal retention — report right away.'] },
  { icon: '💊', title: 'Medication', points: ['Follow the scheduled dose times.', 'A dose over 60 minutes late counts as missed.', "Record Aroob's response to each medication."] },
  { icon: '🩺', title: 'Vitals', points: ['38.5°+ is fever, 39°+ is high fever — urgent.', 'SpO2 under 90% is critical.', 'Pulse over 130 bpm needs monitoring.'] },
  { icon: '💧', title: 'Fluids', points: ['Encourage steady fluid intake through the day.', 'A large negative balance may signal dehydration.', 'Vary fluid types if refusal repeats.'] },
  { icon: '🌸', title: 'Daily care', points: ['Keep skin clean daily to avoid irritation.', "Log cooperation/refusal to help track her mood."] },
  { icon: '⚠️', title: 'Always remember', points: ["Aroob does not express pain like other children — precise logging protects her.", 'When medically unsure, never assume — contact family or the doctor immediately.'] },
];

const tl: GuideSection[] = [
  { icon: '💗', title: 'Catheterization', points: ['Ideal na agwat: 90 minuto.', 'Bantayan ang kulay/amoy — kailangan agad tawagan kung may dugo sa ihi.', 'Kung mas mababa sa 30ml, posibleng may retention — ireport agad.'] },
  { icon: '💊', title: 'Gamot', points: ['Sundin ang iskedyul ng dosis.', 'Kung 60 minuto nang huli, itinuturing na miss.', 'Itala ang reaksyon ni Aroob sa bawat gamot.'] },
  { icon: '🩺', title: 'Vitals', points: ['38.5°+ ay lagnat, 39°+ ay mataas na lagnat — agaran.', 'Mas mababa sa 90% ang SpO2 ay kritikal.', 'Pulso na higit sa 130 bpm ay kailangang bantayan.'] },
  { icon: '💧', title: 'Likido', points: ['Hikayatin ang regular na pag-inom sa buong araw.', 'Malaking negatibong balanse ay maaaring senyales ng dehydration.', 'Magpalit ng uri ng likido kung paulit-ulit na tinatanggihan.'] },
  { icon: '🌸', title: 'Pang-araw-araw na pangangalaga', points: ['Panatilihing malinis ang balat araw-araw.', 'Itala ang pakikipagtulungan o pagtanggi para masubaybayan ang kanyang mood.'] },
  { icon: '⚠️', title: 'Laging tandaan', points: ['Hindi tulad ng ibang bata, hindi ipinapakita ni Aroob ang sakit — mahalaga ang tumpak na dokumentasyon.', 'Kapag may pagdududa sa medikal, huwag mag-assume — makipag-ugnayan agad sa pamilya o doktor.'] },
];

export const GUIDE_CONTENT: Record<'ar' | 'en' | 'tl', GuideSection[]> = { ar, en, tl };
