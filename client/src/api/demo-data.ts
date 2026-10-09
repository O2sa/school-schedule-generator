import type {
  SchoolConfigRecord,
  TeacherRecord,
  ClassRecord,
  SubjectRecord,
  CurriculumRequirementRecord,
} from './types';

export type DemoPresetId = 'k12' | 'secondary' | 'primary';
export type DemoLanguage = 'ar' | 'en';

export interface DemoDataOptions {
  preset?: DemoPresetId;
  language?: DemoLanguage;
  numRoomsPerGrade?: number;
}

export interface DemoPresetInfo {
  id: DemoPresetId;
  titleKey: string;
  descKey: string;
  badgeKey: string;
  estimatedClasses: number;
  estimatedTeachers: number;
  periodsPerDay: number;
}

export const DEMO_PRESETS: DemoPresetInfo[] = [
  {
    id: 'k12',
    titleKey: 'demoModal.presetK12Title',
    descKey: 'demoModal.presetK12Desc',
    badgeKey: 'demoModal.presetK12Badge',
    estimatedClasses: 24,
    estimatedTeachers: 47,
    periodsPerDay: 7,
  },
  {
    id: 'secondary',
    titleKey: 'demoModal.presetSecondaryTitle',
    descKey: 'demoModal.presetSecondaryDesc',
    badgeKey: 'demoModal.presetSecondaryBadge',
    estimatedClasses: 6,
    estimatedTeachers: 14,
    periodsPerDay: 7,
  },
  {
    id: 'primary',
    titleKey: 'demoModal.presetPrimaryTitle',
    descKey: 'demoModal.presetPrimaryDesc',
    badgeKey: 'demoModal.presetPrimaryBadge',
    estimatedClasses: 6,
    estimatedTeachers: 11,
    periodsPerDay: 6,
  },
];

export const DEFAULT_SCHOOL_CONFIG: SchoolConfigRecord = {
  schoolName: 'مجمع الأندلس التعليمي النموذجي',
  academicYear: '2026 / 2027',
  term: 'الفصل الدراسي الأول',
  workingDays: [0, 1, 2, 3, 4], // Sun - Thu
  periodsPerDayDefault: 7,
  gradePeriodsConfig: {
    1: 6,
    2: 6,
    3: 6,
    4: 6,
    5: 7,
    6: 7,
    7: 7,
    8: 7,
    9: 7,
    10: 7,
    11: 7,
    12: 7,
  },
};

export interface GeneratedDemoData {
  config: SchoolConfigRecord;
  teachers: TeacherRecord[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  curriculum: CurriculumRequirementRecord[];
}

export function generateDemoData(options: DemoDataOptions = {}): GeneratedDemoData {
  const preset: DemoPresetId = options.preset || 'k12';
  const language: DemoLanguage = options.language || 'ar';
  const isEn = language === 'en';

  const classes: ClassRecord[] = [];
  const teachers: TeacherRecord[] = [];
  const subjects: SubjectRecord[] = [];
  const curriculum: CurriculumRequirementRecord[] = [];

  const subjectMap = new Map<string, SubjectRecord>();
  function getOrCreateSubject(name: string, code: string, category: 'core' | 'science' | 'humanities' | 'activity'): string {
    let sub = subjectMap.get(name);
    if (!sub) {
      sub = { id: `sub_${code.toLowerCase()}_${subjectMap.size + 1}`, name, code, category };
      subjectMap.set(name, sub);
      subjects.push(sub);
    }
    return sub.id;
  }

  let teacherSeq = 1;
  const teacherWorkloads = new Map<string, number>();
  const teacherMaxCapacities = new Map<string, number>();

  function registerTeacher(
    name: string,
    specialization: string,
    workingDays = [0, 1, 2, 3, 4],
    blockedSlots?: { dayIndex: number; periodIndex: number }[],
    maxDaily = 5
  ): string {
    const id = `t_${teacherSeq++}`;
    const unavailableSlots = blockedSlots || [];
    teachers.push({
      id,
      name,
      specialization,
      maxDailyPeriods: maxDaily,
      maxWeeklyPeriods: maxDaily * workingDays.length,
      unavailableSlots,
    });
    teacherWorkloads.set(id, 0);
    const usableSlots = workingDays.length * maxDaily - unavailableSlots.length;
    teacherMaxCapacities.set(id, usableSlots);
    return id;
  }

  function pickTeacher(pool: string[], hours: number): string {
    const eligible = pool.filter((t) => {
      const current = teacherWorkloads.get(t) ?? 0;
      const maxCap = teacherMaxCapacities.get(t) ?? 25;
      return current + hours <= maxCap;
    });

    if (eligible.length === 0) {
      throw new Error(`Insufficient teacher capacity in pool for ${hours} hours.`);
    }

    eligible.sort((a, b) => (teacherWorkloads.get(a) ?? 0) - (teacherWorkloads.get(b) ?? 0));
    const chosen = eligible[0]!;
    teacherWorkloads.set(chosen, (teacherWorkloads.get(chosen) ?? 0) + hours);
    return chosen;
  }

  let config: SchoolConfigRecord;
  let reqId = 1;

  if (preset === 'secondary') {
    // --- SECONDARY STEM PRESET (Grades 10-12, 2 rooms each = 6 classes) ---
    config = {
      schoolName: isEn ? 'Apex STEM Secondary School' : 'ثانوية القمة العلمية للمتفوقين',
      academicYear: '2026 / 2027',
      term: isEn ? 'First Semester' : 'الفصل الدراسي الأول',
      workingDays: [0, 1, 2, 3, 4],
      periodsPerDayDefault: 7,
      gradePeriodsConfig: { 10: 7, 11: 7, 12: 7 },
    };

    const roomLetters = isEn ? ['A', 'B'] : ['أ', 'ب'];
    for (const grade of [10, 11, 12]) {
      for (let r = 0; r < 2; r++) {
        const letter = roomLetters[r];
        classes.push({
          id: `sec_g${grade}_${r + 1}`,
          gradeLevel: grade,
          roomNumber: `${grade}0${r + 1}`,
          sectionName: isEn ? `Grade ${grade}-${letter}` : `الصف ${grade} / ${letter}`,
          periodsPerDay: 7,
        });
      }
    }

    const mathPool = [
      registerTeacher(isEn ? 'Dr. Alexander Wright (Math)' : 'د. رياض المنصور (رياضيات)', isEn ? 'Mathematics' : 'الرياضيات'),
      registerTeacher(isEn ? 'Prof. Sarah Jenkins (Calculus)' : 'أ. فهد التميمي (تفاضل وتكامل)', isEn ? 'Mathematics' : 'الرياضيات'),
      registerTeacher(isEn ? 'Mr. Brian Kelly (Algebra)' : 'أ. كمال الهاشمي (جبر وإحصاء)', isEn ? 'Mathematics' : 'الرياضيات'),
    ];

    const physicsPool = [
      registerTeacher(isEn ? 'Dr. Marcus Vance (Physics)' : 'د. حازم البكري (فيزياء)', isEn ? 'Physics' : 'الفيزياء'),
      registerTeacher(isEn ? 'Ms. Elena Rostova (Mechanics)' : 'أ. سمير خليل (ميكانيكا وفيزياء)', isEn ? 'Physics' : 'الفيزياء', [0, 1, 2, 3, 4], [{ dayIndex: 0, periodIndex: 6 }]),
    ];

    const chemistryPool = [
      registerTeacher(isEn ? 'Dr. Julian Reed (Chemistry)' : 'د. ماجد العصيمي (كيمياء)', isEn ? 'Chemistry' : 'الكيمياء'),
      registerTeacher(isEn ? 'Ms. Chloe Bennett (Organic Chem)' : 'أ. بسام الخالدي (كيمياء)', isEn ? 'Chemistry' : 'الكيمياء'),
    ];

    const biologyPool = [
      registerTeacher(isEn ? 'Dr. Hannah Cole (Biology)' : 'د. منى العلي (أحياء)', isEn ? 'Biology' : 'الأحياء'),
      registerTeacher(isEn ? 'Mr. Nathan Drake (Genetics)' : 'أ. وائل حبيب (علم الوراثة)', isEn ? 'Biology' : 'الأحياء'),
    ];

    const computingPool = [
      registerTeacher(isEn ? 'Eng. Omar Farooq (Computer Science)' : 'م. عمر فاروق (علوم الحاسب)', isEn ? 'Computer Science' : 'علوم الحاسب'),
      registerTeacher(isEn ? 'Eng. Lisa Chen (Algorithms & Coding)' : 'م. لينا القاسم (خوارزميات وبرمجة)', isEn ? 'Computer Science' : 'علوم الحاسب'),
    ];

    const englishPool = [
      registerTeacher(isEn ? 'Mr. David Miller (English Lit)' : 'أ. ديفيد ميلر (لغة إنجليزية)', isEn ? 'English' : 'اللغة الإنجليزية'),
      registerTeacher(isEn ? 'Ms. Rachel Green (ESL & Writing)' : 'أ. إيميلي واتسون (لغة إنجليزية)', isEn ? 'English' : 'اللغة الإنجليزية'),
    ];

    const humanitiesPool = [
      registerTeacher(isEn ? 'Mr. Tariq Al-Hassan (Social Studies)' : 'أ. فيصل القحطاني (دراسات اجتماعية)', isEn ? 'Social Studies' : 'الدراسات الاجتماعية'),
      registerTeacher(isEn ? 'Mr. Robert Vance (History)' : 'أ. خالد المطيري (تاريخ وحضارة)', isEn ? 'History' : 'التاريخ'),
    ];

    const pePool = [
      registerTeacher(isEn ? 'Coach Ryan Cooper (Physical Ed)' : 'كابتن فهد العنزي (تربية بدنية)', isEn ? 'Physical Ed' : 'التربية البدنية'),
    ];

    for (const c of classes) {
      const items = [
        { name: isEn ? 'Advanced Mathematics' : 'الرياضيات المتقدمة', code: 'MTH', cat: 'core' as const, pool: mathPool, hours: 6 },
        { name: isEn ? 'Physics' : 'الفيزياء', code: 'PHY', cat: 'science' as const, pool: physicsPool, hours: 5 },
        { name: isEn ? 'Chemistry' : 'الكيمياء', code: 'CHM', cat: 'science' as const, pool: chemistryPool, hours: 5 },
        { name: isEn ? 'Biology' : 'الأحياء', code: 'BIO', cat: 'science' as const, pool: biologyPool, hours: 4 },
        { name: isEn ? 'Computer Science' : 'علوم الحاسب وتقنية المعلومات', code: 'CS', cat: 'science' as const, pool: computingPool, hours: 4 },
        { name: isEn ? 'English Language' : 'اللغة الإنجليزية', code: 'ENG', cat: 'core' as const, pool: englishPool, hours: 5 },
        { name: isEn ? 'Social & Cultural Studies' : 'دراسات اجتماعية وثقافية', code: 'SOC', cat: 'humanities' as const, pool: humanitiesPool, hours: 4 },
        { name: isEn ? 'Physical Education' : 'التربية البدنية', code: 'PE', cat: 'activity' as const, pool: pePool, hours: 2 },
      ];

      for (const item of items) {
        const subId = getOrCreateSubject(item.name, item.code, item.cat);
        const tId = pickTeacher(item.pool, item.hours);
        curriculum.push({
          id: `cur_${reqId++}`,
          classId: c.id,
          subjectId: subId,
          teacherId: tId,
          periodsPerWeek: item.hours,
        });
      }
    }

  } else if (preset === 'primary') {
    // --- PRIMARY / ELEMENTARY PRESET (Grades 1-6, 1 room each = 6 classes, 6 periods/day = 30 hrs) ---
    config = {
      schoolName: isEn ? 'Cedar Grove Primary School' : 'ابتدائية رواد المعرفة النموذجية',
      academicYear: '2026 / 2027',
      term: isEn ? 'First Semester' : 'الفصل الدراسي الأول',
      workingDays: [0, 1, 2, 3, 4],
      periodsPerDayDefault: 6,
      gradePeriodsConfig: { 1: 6, 2: 6, 3: 6, 4: 6, 5: 6, 6: 6 },
    };

    for (let grade = 1; grade <= 6; grade++) {
      classes.push({
        id: `pri_g${grade}`,
        gradeLevel: grade,
        roomNumber: `${grade}01`,
        sectionName: isEn ? `Grade ${grade}` : `الصف ${grade} ابتدائي`,
        periodsPerDay: 6,
      });
    }

    const homeroomLangPool = [
      registerTeacher(isEn ? 'Ms. Emma Thompson (Language Arts)' : 'أ. نورة الشهري (لغتي)', isEn ? 'Language Arts' : 'لغتي الجميلة'),
      registerTeacher(isEn ? 'Ms. Sophia Martinez (Language Arts)' : 'أ. سارة العتيبي (لغتي)', isEn ? 'Language Arts' : 'لغتي الجميلة'),
      registerTeacher(isEn ? 'Mr. James Wilson (Language Arts)' : 'أ. إبراهيم الدوسري (لغتي)', isEn ? 'Language Arts' : 'لغتي الجميلة'),
    ];

    const primaryMathPool = [
      registerTeacher(isEn ? 'Mr. George Baker (Primary Math)' : 'أ. مصطفى الخطيب (رياضيات)', isEn ? 'Mathematics' : 'الرياضيات'),
      registerTeacher(isEn ? 'Ms. Olivia Davis (Primary Math)' : 'أ. هدى الغامدي (رياضيات)', isEn ? 'Mathematics' : 'الرياضيات'),
      registerTeacher(isEn ? 'Mr. Daniel Clark (Primary Math)' : 'أ. كريم عبد الوهاب (رياضيات)', isEn ? 'Mathematics' : 'الرياضيات'),
    ];

    const generalSciencePool = [
      registerTeacher(isEn ? 'Ms. Lucas Gray (Science & Nature)' : 'أ. سعيد العمودي (علوم)', isEn ? 'Science' : 'العلوم'),
      registerTeacher(isEn ? 'Mr. Henry Moore (General Science)' : 'أ. عمر الجابري (علوم)', isEn ? 'Science' : 'العلوم'),
    ];

    const englishPrimaryPool = [
      registerTeacher(isEn ? 'Ms. Jessica Taylor (English)' : 'أ. تركي الرويلي (لغة إنجليزية)', isEn ? 'English' : 'اللغة الإنجليزية'),
      registerTeacher(isEn ? 'Mr. Kevin Adams (English)' : 'أ. حسام فلاتة (لغة إنجليزية)', isEn ? 'English' : 'اللغة الإنجليزية'),
    ];

    const activitiesPool = [
      registerTeacher(isEn ? 'Coach Sam Jordan (Physical Education)' : 'كابتن سلمان النمري (تربية بدنية)', isEn ? 'Physical Ed' : 'التربية البدنية'),
      registerTeacher(isEn ? 'Ms. Laura White (Arts & Crafts)' : 'أ. رائد الشهري (تربية فنية)', isEn ? 'Arts' : 'التربية الفنية'),
      registerTeacher(isEn ? 'Mr. Ethan Brown (Islamic Studies & Ethics)' : 'الشيخ فهد العتيبي (دراسات إسلامية)', isEn ? 'Islamic Studies' : 'التربية الإسلامية'),
      registerTeacher(isEn ? 'Mr. Saleh Al-Shehri (Islamic Studies)' : 'د. صالح الشهري (دراسات إسلامية)', isEn ? 'Islamic Studies' : 'التربية الإسلامية'),
    ];

    for (const c of classes) {
      const items = [
        { name: isEn ? 'Language Arts' : 'لغتي الجميلة', code: 'LANG', cat: 'core' as const, pool: homeroomLangPool, hours: 8 },
        { name: isEn ? 'Primary Mathematics' : 'الرياضيات', code: 'MTH', cat: 'core' as const, pool: primaryMathPool, hours: 6 },
        { name: isEn ? 'General Science' : 'العلوم', code: 'SCI', cat: 'science' as const, pool: generalSciencePool, hours: 4 },
        { name: isEn ? 'English Language' : 'اللغة الإنجليزية', code: 'ENG', cat: 'core' as const, pool: englishPrimaryPool, hours: 4 },
        { name: isEn ? 'Moral & Islamic Studies' : 'الدراسات الإسلامية والقرآن', code: 'ISL', cat: 'core' as const, pool: activitiesPool.slice(2), hours: 4 },
        { name: isEn ? 'Physical Education' : 'التربية البدنية', code: 'PE', cat: 'activity' as const, pool: [activitiesPool[0]], hours: 2 },
        { name: isEn ? 'Arts & Crafts' : 'التربية الفنية', code: 'ART', cat: 'activity' as const, pool: [activitiesPool[1]], hours: 2 },
      ];

      for (const item of items) {
        const subId = getOrCreateSubject(item.name, item.code, item.cat);
        const tId = pickTeacher(item.pool, item.hours);
        curriculum.push({
          id: `cur_${reqId++}`,
          classId: c.id,
          subjectId: subId,
          teacherId: tId,
          periodsPerWeek: item.hours,
        });
      }
    }

  } else {
    // --- COMPREHENSIVE K-12 PRESET (12 Grades x numRoomsPerGrade = 24 classes default) ---
    const numRooms = options.numRoomsPerGrade ?? 2;
    config = {
      schoolName: isEn ? 'Al-Andalus Model Educational Complex' : 'مجمع الأندلس التعليمي النموذجي',
      academicYear: '2026 / 2027',
      term: isEn ? 'First Semester' : 'الفصل الدراسي الأول',
      workingDays: [0, 1, 2, 3, 4],
      periodsPerDayDefault: 7,
      gradePeriodsConfig: {
        1: 6,
        2: 6,
        3: 6,
        4: 6,
        5: 7,
        6: 7,
        7: 7,
        8: 7,
        9: 7,
        10: 7,
        11: 7,
        12: 7,
      },
    };

    const roomLabels = isEn ? ['A', 'B', 'C', 'D'] : ['أ', 'ب', 'ج', 'د'];
    for (let grade = 1; grade <= 12; grade++) {
      const isLower = grade <= 4;
      const periodsPerDay = isLower ? 6 : 7;

      for (let r = 0; r < numRooms; r++) {
        const roomLabel = roomLabels[r] ?? `${r + 1}`;
        classes.push({
          id: `g${grade}_r${r + 1}`,
          gradeLevel: grade,
          roomNumber: `${grade}0${r + 1}`,
          sectionName: isEn ? `Grade ${grade}-${roomLabel}` : `الصف ${grade} / ${roomLabel}`,
          periodsPerDay,
        });
      }
    }

    // Teacher pools identical to original Arabic K12 benchmark
    const islamicTeachers = [
      registerTeacher(isEn ? 'Dr. Abdullah Al-Ghamdi (Islamic)' : 'د. عبدالله الغامدي (إسلاميات)', isEn ? 'Islamic Studies' : 'الدراسات الإسلامية'),
      registerTeacher(isEn ? 'Sheikh Fahad Al-Otaibi (Islamic)' : 'الشيخ فهد العتيبي (إسلاميات)', isEn ? 'Islamic Studies' : 'الدراسات الإسلامية'),
      registerTeacher(isEn ? 'Dr. Saleh Al-Shehri (Islamic)' : 'د. صالح الشهري (إسلاميات)', isEn ? 'Islamic Studies' : 'الدراسات الإسلامية'),
      registerTeacher(isEn ? 'Mr. Mohammed Al-Dossari (Islamic)' : 'أ. محمد الدوسري (إسلاميات)', isEn ? 'Islamic Studies' : 'الدراسات الإسلامية'),
      registerTeacher(isEn ? 'Mr. Nasser Al-Harbi (Islamic)' : 'أ. ناصر الحربي (إسلاميات)', isEn ? 'Islamic Studies' : 'الدراسات الإسلامية'),
      registerTeacher(isEn ? 'Mr. Ibrahim Al-Qarni (Islamic)' : 'أ. إبراهيم القرني (إسلاميات)', isEn ? 'Islamic Studies' : 'الدراسات الإسلامية'),
      registerTeacher(isEn ? 'Sheikh Fahad (Islamic - Part-Time)' : 'الشيخ فهد العتيبي (إسلاميات - دوام جزئي)', isEn ? 'Islamic Studies' : 'الدراسات الإسلامية', [0, 1, 2, 3], undefined, 4),
    ];

    const arabicTeachers = [
      registerTeacher(isEn ? 'Dr. Ahmed Al-Mansoor (Arabic)' : 'د. أحمد المنصور (لغة عربية)', isEn ? 'Arabic Language' : 'اللغة العربية'),
      registerTeacher(isEn ? 'Dr. Khalid Al-Zahrani (Arabic)' : 'د. خالد الزهراني (لغة عربية)', isEn ? 'Arabic Language' : 'اللغة العربية'),
      registerTeacher(isEn ? 'Mr. Mahmoud Al-Sayed (Arabic)' : 'أ. محمود السيد (لغة عربية)', isEn ? 'Arabic Language' : 'اللغة العربية'),
      registerTeacher(isEn ? 'Mr. Tariq Al-Hassan (Arabic)' : 'أ. طارق الحسن (لغة عربية)', isEn ? 'Arabic Language' : 'اللغة العربية'),
      registerTeacher(isEn ? 'Mr. Yousef Al-Ghamdi (Arabic)' : 'أ. يوسف الغامدي (لغة عربية)', isEn ? 'Arabic Language' : 'اللغة العربية'),
      registerTeacher(isEn ? 'Mr. Hassan Al-Maliki (Arabic)' : 'أ. حسن المالكي (لغة عربية)', isEn ? 'Arabic Language' : 'اللغة العربية'),
      registerTeacher(isEn ? 'Mr. Saad Al-Bishi (Arabic)' : 'أ. سعد البيشي (لغة عربية)', isEn ? 'Arabic Language' : 'اللغة العربية'),
      registerTeacher(isEn ? 'Mr. Ziyad Al-Mutairi (Arabic)' : 'أ. زياد المطيري (لغة عربية)', isEn ? 'Arabic Language' : 'اللغة العربية'),
      registerTeacher(isEn ? 'Mr. Hamad Al-Ajmi (Arabic - Part-Time)' : 'أ. حمد العجمي (لغة عربية - متفرغ جزئياً)', isEn ? 'Arabic Language' : 'اللغة العربية', [0, 1, 2, 3, 4], [
        { dayIndex: 4, periodIndex: 5 },
        { dayIndex: 4, periodIndex: 6 },
      ], 5),
    ];

    const mathTeachers = [
      registerTeacher(isEn ? 'Prof. Mustafa Al-Khatib (Math)' : 'أ. مصطفى الخطيب (رياضيات)', isEn ? 'Mathematics' : 'الرياضيات'),
      registerTeacher(isEn ? 'Dr. Yasser Al-Husseini (Math)' : 'د. ياسر الحسيني (رياضيات)', isEn ? 'Mathematics' : 'الرياضيات'),
      registerTeacher(isEn ? 'Mr. Adel Al-Ghamdi (Math)' : 'أ. عادل الغامدي (رياضيات)', isEn ? 'Mathematics' : 'الرياضيات'),
      registerTeacher(isEn ? 'Mr. Karim Abdelwahab (Math)' : 'أ. كريم عبد الوهاب (رياضيات)', isEn ? 'Mathematics' : 'الرياضيات'),
      registerTeacher(isEn ? 'Mr. Hisham Radwan (Math)' : 'أ. هشام رضوان (رياضيات)', isEn ? 'Mathematics' : 'الرياضيات'),
      registerTeacher(isEn ? 'Mr. Maher Al-Subaie (Math)' : 'أ. ماهر السبيعي (رياضيات)', isEn ? 'Mathematics' : 'الرياضيات'),
      registerTeacher(isEn ? 'Mr. Mansour Al-Qahtani (Math)' : 'أ. منصور القحطاني (رياضيات)', isEn ? 'Mathematics' : 'الرياضيات'),
      registerTeacher(isEn ? 'Mr. Badr Al-Sharif (Math)' : 'أ. بدر الشريف (رياضيات)', isEn ? 'Mathematics' : 'الرياضيات'),
    ];

    const scienceElementary = [
      registerTeacher(isEn ? 'Mr. Saeed Al-Amoudi (Primary Science)' : 'أ. سعيد العمودي (علوم ابتدائي)', isEn ? 'Science' : 'العلوم'),
      registerTeacher(isEn ? 'Mr. Omar Al-Jabri (Primary Science)' : 'أ. عمر الجابري (علوم ابتدائي)', isEn ? 'Science' : 'العلوم'),
    ];
    const scienceMiddle = [
      registerTeacher(isEn ? 'Mr. Farooq Al-Husseini (Middle Science)' : 'أ. فاروق الحسيني (علوم متوسط)', isEn ? 'Science' : 'العلوم'),
      registerTeacher(isEn ? 'Mr. Issam Radwan (Middle Science)' : 'أ. عصام رضوان (علوم متوسط)', isEn ? 'Science' : 'العلوم'),
      registerTeacher(isEn ? 'Mr. Nabil Al-Fahd (Middle Science)' : 'أ. نبيل الفهد (علوم متوسط)', isEn ? 'Science' : 'العلوم'),
    ];
    const physicsTeachers = [
      registerTeacher(isEn ? 'Dr. Othman Al-Saleh (Physics)' : 'د. عثمان الصالح (فيزياء)', isEn ? 'Physics' : 'الفيزياء'),
      registerTeacher(isEn ? 'Mr. Samir Khalil (Physics)' : 'أ. سمير خليل (فيزياء)', isEn ? 'Physics' : 'الفيزياء'),
    ];
    const chemistryTeachers = [
      registerTeacher(isEn ? 'Mr. Bassam Al-Khalidi (Chemistry)' : 'أ. بسام الخالدي (كيمياء)', isEn ? 'Chemistry' : 'الكيمياء'),
      registerTeacher(isEn ? 'Mr. Rami Al-Mansoor (Chemistry)' : 'أ. رامي المنصور (كيمياء)', isEn ? 'Chemistry' : 'الكيمياء'),
    ];
    const biologyTeachers = [
      registerTeacher(isEn ? 'Mr. Sami Al-Omari (Biology)' : 'أ. سامي العمري (أحياء)', isEn ? 'Biology' : 'الأحياء'),
      registerTeacher(isEn ? 'Mr. Wael Habib (Biology)' : 'أ. وائل حبيب (أحياء)', isEn ? 'Biology' : 'الأحياء'),
    ];

    const englishTeachers = [
      registerTeacher(isEn ? 'Mr. David Miller (English)' : 'Mr. David Miller (English)', isEn ? 'English' : 'اللغة الإنجليزية'),
      registerTeacher(isEn ? 'Mr. Robert Vance (English)' : 'Mr. Robert Vance (English)', isEn ? 'English' : 'اللغة الإنجليزية'),
      registerTeacher(isEn ? 'Mr. Turki Al-Ruwaili (English)' : 'أ. تركي الرويلي (لغة إنجليزية)', isEn ? 'English' : 'اللغة الإنجليزية'),
      registerTeacher(isEn ? 'Mr. Badr Al-Anazi (English)' : 'أ. بدر العنزي (لغة إنجليزية)', isEn ? 'English' : 'اللغة الإنجليزية'),
      registerTeacher(isEn ? 'Mr. Hussam Fallatah (English)' : 'أ. حسام فلاتة (لغة إنجليزية)', isEn ? 'English' : 'اللغة الإنجليزية'),
      registerTeacher(isEn ? 'Mr. Khalid Al-Harbi (English)' : 'أ. خالد الحربي (لغة إنجليزية)', isEn ? 'English' : 'اللغة الإنجليزية'),
    ];

    const socialTeachers = [
      registerTeacher(isEn ? 'Mr. Abdulrahman Al-Tamimi (Social Studies)' : 'أ. عبدالرحمن التميمي (دراسات اجتماعية)', isEn ? 'Social Studies' : 'الدراسات الاجتماعية'),
      registerTeacher(isEn ? 'Mr. Bandar Al-Saadoun (History & Geo)' : 'أ. بندر السعدون (تاريخ وجغرافيا)', isEn ? 'Social Studies' : 'الدراسات الاجتماعية'),
      registerTeacher(isEn ? 'Mr. Saud Al-Rasheed (Social Studies)' : 'أ. سعود الرشيد (دراسات اجتماعية)', isEn ? 'Social Studies' : 'الدراسات الاجتماعية'),
    ];

    const computerTeachers = [
      registerTeacher(isEn ? 'Eng. Adel Bakhsh (Computer)' : 'م. عادل بخش (حاسب وتقنية)', isEn ? 'Computer' : 'الحاسب الآلي'),
      registerTeacher(isEn ? 'Eng. Muneer (Computer - Part-Time)' : 'م. منير الصاعدي (حاسب - دوام جزئي)', isEn ? 'Computer' : 'الحاسب الآلي', [0, 2, 4], undefined, 4),
      registerTeacher(isEn ? 'Eng. Firas Al-Nuaimi (CS & Networks)' : 'م. فراس النعيمي (حاسب وشبكات)', isEn ? 'Computer' : 'الحاسب الآلي'),
      registerTeacher(isEn ? 'Eng. Anas Al-Basheer (Computer)' : 'م. أنس البشير (حاسب وتقنية)', isEn ? 'Computer' : 'الحاسب الآلي'),
    ];

    const peTeachers = [
      registerTeacher(isEn ? 'Captain Mishaal (Physical Ed)' : 'كابتن مشعل الهلالي (تربية بدنية)', isEn ? 'Physical Ed' : 'التربية البدنية'),
      registerTeacher(isEn ? 'Captain Salman (Physical Ed)' : 'كابتن سلمان النمري (تربية بدنية)', isEn ? 'Physical Ed' : 'التربية البدنية'),
      registerTeacher(isEn ? 'Captain Ryan (Physical Ed)' : 'كابتن ريان الصالح (تربية بدنية)', isEn ? 'Physical Ed' : 'التربية البدنية'),
    ];

    const artTeachers = [
      registerTeacher(isEn ? 'Artist Wael Al-Sabbagh (Art)' : 'فنان وائل الصباغ (تربية فنية)', isEn ? 'Art' : 'التربية الفنية'),
      registerTeacher(isEn ? 'Mr. Raed Al-Shehri (Art)' : 'أ. رائد الشهري (تربية فنية)', isEn ? 'Art' : 'التربية الفنية'),
      registerTeacher(isEn ? 'Mr. Louay Al-Shami (Art - Part-Time)' : 'أ. لؤي الشامي (فنية - دوام جزئي)', isEn ? 'Art' : 'التربية الفنية', [1, 3, 4], undefined, 4),
    ];

    for (const c of classes) {
      const grade = c.gradeLevel;

      if (grade <= 4) {
        // Lower Elementary: 30 periods/week
        const items = [
          { name: isEn ? 'Quran & Islamic Studies' : 'القرآن والدراسات الإسلامية', code: 'ISL', cat: 'core' as const, pool: islamicTeachers, hours: 6 },
          { name: isEn ? 'Arabic Language' : 'لغتي الجميلة', code: 'ARB', cat: 'core' as const, pool: arabicTeachers, hours: 8 },
          { name: isEn ? 'Mathematics' : 'الرياضيات', code: 'MTH', cat: 'core' as const, pool: mathTeachers, hours: 5 },
          { name: isEn ? 'Science' : 'العلوم', code: 'SCI', cat: 'science' as const, pool: scienceElementary, hours: 3 },
          { name: isEn ? 'English Language' : 'اللغة الإنجليزية', code: 'ENG', cat: 'core' as const, pool: englishTeachers, hours: 4 },
          { name: isEn ? 'Physical Education' : 'التربية البدنية', code: 'PE', cat: 'activity' as const, pool: peTeachers, hours: 2 },
          { name: isEn ? 'Art Education' : 'التربية الفنية', code: 'ART', cat: 'activity' as const, pool: artTeachers, hours: 2 },
        ];
        for (const item of items) {
          const subId = getOrCreateSubject(item.name, item.code, item.cat);
          const tId = pickTeacher(item.pool, item.hours);
          curriculum.push({
            id: `cur_${reqId++}`,
            classId: c.id,
            subjectId: subId,
            teacherId: tId,
            periodsPerWeek: item.hours,
          });
        }
      } else if (grade <= 9) {
        // Upper Elementary & Middle: 35 periods/week
        const items = [
          { name: isEn ? 'Islamic Studies' : 'الدراسات الإسلامية', code: 'ISL', cat: 'core' as const, pool: islamicTeachers, hours: 5 },
          { name: isEn ? 'Arabic Language' : 'اللغة العربية', code: 'ARB', cat: 'core' as const, pool: arabicTeachers, hours: 6 },
          { name: isEn ? 'Mathematics' : 'الرياضيات', code: 'MTH', cat: 'core' as const, pool: mathTeachers, hours: 6 },
          { name: isEn ? 'Science' : 'العلوم', code: 'SCI', cat: 'science' as const, pool: scienceMiddle, hours: 5 },
          { name: isEn ? 'English Language' : 'اللغة الإنجليزية', code: 'ENG', cat: 'core' as const, pool: englishTeachers, hours: 4 },
          { name: isEn ? 'Social Studies' : 'الدراسات الاجتماعية', code: 'SOC', cat: 'humanities' as const, pool: socialTeachers, hours: 3 },
          { name: isEn ? 'Computer & Information Tech' : 'الحاسب الآلي', code: 'COM', cat: 'science' as const, pool: computerTeachers, hours: 2 },
          { name: isEn ? 'Physical Education' : 'التربية البدنية', code: 'PE', cat: 'activity' as const, pool: peTeachers, hours: 2 },
          { name: isEn ? 'Art Education' : 'التربية الفنية', code: 'ART', cat: 'activity' as const, pool: artTeachers, hours: 2 },
        ];
        for (const item of items) {
          const subId = getOrCreateSubject(item.name, item.code, item.cat);
          const tId = pickTeacher(item.pool, item.hours);
          curriculum.push({
            id: `cur_${reqId++}`,
            classId: c.id,
            subjectId: subId,
            teacherId: tId,
            periodsPerWeek: item.hours,
          });
        }
      } else {
        // High School: 35 periods/week
        const items = [
          { name: isEn ? 'Islamic Studies' : 'التربية الإسلامية', code: 'ISL', cat: 'core' as const, pool: islamicTeachers, hours: 3 },
          { name: isEn ? 'Arabic Literature' : 'اللغة العربية', code: 'ARB', cat: 'core' as const, pool: arabicTeachers, hours: 4 },
          { name: isEn ? 'Mathematics' : 'الرياضيات', code: 'MTH', cat: 'core' as const, pool: mathTeachers, hours: 6 },
          { name: isEn ? 'Physics' : 'الفيزياء', code: 'PHY', cat: 'science' as const, pool: physicsTeachers, hours: 4 },
          { name: isEn ? 'Chemistry' : 'الكيمياء', code: 'CHM', cat: 'science' as const, pool: chemistryTeachers, hours: 4 },
          { name: isEn ? 'Biology' : 'الأحياء', code: 'BIO', cat: 'science' as const, pool: biologyTeachers, hours: 4 },
          { name: isEn ? 'English Language' : 'اللغة الإنجليزية', code: 'ENG', cat: 'core' as const, pool: englishTeachers, hours: 5 },
          { name: isEn ? 'Data Science & Algorithms' : 'علم البيانات والخوارزميات', code: 'DSA', cat: 'science' as const, pool: computerTeachers, hours: 3 },
          { name: isEn ? 'Physical Education' : 'التربية البدنية', code: 'PE', cat: 'activity' as const, pool: peTeachers, hours: 2 },
        ];
        for (const item of items) {
          const subId = getOrCreateSubject(item.name, item.code, item.cat);
          const tId = pickTeacher(item.pool, item.hours);
          curriculum.push({
            id: `cur_${reqId++}`,
            classId: c.id,
            subjectId: subId,
            teacherId: tId,
            periodsPerWeek: item.hours,
          });
        }
      }
    }
  }

  return { config, teachers, classes, subjects, curriculum };
}

// Backwards-compatible alias
export function generateArabicK12DemoData(numRoomsPerGrade = 2): GeneratedDemoData {
  return generateDemoData({ preset: 'k12', language: 'ar', numRoomsPerGrade });
}
