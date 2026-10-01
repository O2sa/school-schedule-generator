import type {
  SchoolConfigRecord,
  TeacherRecord,
  ClassRecord,
  SubjectRecord,
  CurriculumRequirementRecord,
} from './types';

export const DEFAULT_SCHOOL_CONFIG: SchoolConfigRecord = {
  schoolName: 'مدرسة الأمل النموذجية للبنين',
  academicYear: '2026 / 2027',
  term: 'الفصل الدراسي الأول',
  workingDays: [0, 1, 2, 3, 4], // الأحد إلى الخميس
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

export function generateArabicK12DemoData(numRoomsPerGrade = 2): {
  config: SchoolConfigRecord;
  teachers: TeacherRecord[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  curriculum: CurriculumRequirementRecord[];
} {
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

  // 1. Classes: 12 Grades x numRoomsPerGrade
  const roomLabels = ['أ', 'ب', 'ج', 'د'];
  for (let grade = 1; grade <= 12; grade++) {
    const isLower = grade <= 4;
    const periodsPerDay = isLower ? 6 : 7;

    for (let r = 0; r < numRoomsPerGrade; r++) {
      const roomLabel = roomLabels[r] ?? `${r + 1}`;
      classes.push({
        id: `g${grade}_r${r + 1}`,
        gradeLevel: grade,
        roomNumber: `${grade}0${r + 1}`,
        sectionName: `الصف ${grade} / ${roomLabel}`,
        periodsPerDay,
      });
    }
  }

  // 2. Teachers registration
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

  // Teacher pools
  const islamicTeachers = [
    registerTeacher('أ. أحمد الغامدي (إسلاميات)', 'الدراسات الإسلامية'),
    registerTeacher('أ. خالد القرني (إسلاميات)', 'الدراسات الإسلامية'),
    registerTeacher('أ. عبدالله الدوسري (إسلاميات)', 'الدراسات الإسلامية'),
    registerTeacher('أ. فهد الشمري (إسلاميات)', 'الدراسات الإسلامية'),
    registerTeacher('أ. عمر العتيبي (إسلاميات)', 'الدراسات الإسلامية'),
    registerTeacher('أ. صالح العمري (إسلاميات)', 'الدراسات الإسلامية'),
    registerTeacher('الشيخ إبراهيم السعد (إسلاميات - إشراف)', 'الدراسات الإسلامية', [0, 1, 2, 3], undefined, 4),
  ];

  const arabicTeachers = [
    registerTeacher('أ. محمد الزهراني (لغة عربية)', 'اللغة العربية'),
    registerTeacher('أ. سعيد القحطاني (لغة عربية)', 'اللغة العربية'),
    registerTeacher('أ. فيصل المطيري (لغة عربية)', 'اللغة العربية'),
    registerTeacher('أ. علي الشهري (لغة عربية)', 'اللغة العربية'),
    registerTeacher('أ. طارق المالكي (لغة عربية)', 'اللغة العربية'),
    registerTeacher('أ. ناصر السبيعي (لغة عربية)', 'اللغة العربية'),
    registerTeacher('أ. وليد الثبيتي (لغة عربية)', 'اللغة العربية'),
    registerTeacher('أ. حسام الغامدي (لغة عربية)', 'اللغة العربية'),
    registerTeacher('أ. هشام السليمان (رئيس قسم العربي)', 'اللغة العربية', [0, 1, 2, 3, 4], [
      { dayIndex: 4, periodIndex: 5 },
      { dayIndex: 4, periodIndex: 6 },
    ], 5),
  ];

  const mathTeachers = [
    registerTeacher('أ. محمود المصري (رياضيات)', 'الرياضيات'),
    registerTeacher('أ. زياد الشريف (رياضيات)', 'الرياضيات'),
    registerTeacher('أ. ياسر الأحمد (رياضيات)', 'الرياضيات'),
    registerTeacher('أ. حمزة عسيري (رياضيات)', 'الرياضيات'),
    registerTeacher('أ. وليد الحربي (رياضيات)', 'الرياضيات'),
    registerTeacher('أ. ماجد الجهني (رياضيات)', 'الرياضيات'),
    registerTeacher('أ. راكان الحارثي (رياضيات)', 'الرياضيات'),
    registerTeacher('أ. إياد النجار (رياضيات)', 'الرياضيات'),
  ];

  const scienceElementary = [
    registerTeacher('أ. حسن العلي (علوم ابتدائي)', 'العلوم'),
    registerTeacher('أ. سالم باوزير (علوم ابتدائي)', 'العلوم'),
  ];
  const scienceMiddle = [
    registerTeacher('أ. مازن البلوي (علوم متوسط)', 'العلوم'),
    registerTeacher('أ. عصام رضوان (علوم متوسط)', 'العلوم'),
    registerTeacher('أ. نبيل الفهد (علوم متوسط)', 'العلوم'),
  ];
  const physicsTeachers = [
    registerTeacher('د. عثمان الصالح (فيزياء)', 'الفيزياء'),
    registerTeacher('أ. سمير خليل (فيزياء)', 'الفيزياء'),
  ];
  const chemistryTeachers = [
    registerTeacher('أ. بسام الخالدي (كيمياء)', 'الكيمياء'),
    registerTeacher('أ. رامي المنصور (كيمياء)', 'الكيمياء'),
  ];
  const biologyTeachers = [
    registerTeacher('أ. سامي العمري (أحياء)', 'الأحياء'),
    registerTeacher('أ. وائل حبيب (أحياء)', 'الأحياء'),
  ];

  const englishTeachers = [
    registerTeacher('Mr. David Miller (English)', 'اللغة الإنجليزية'),
    registerTeacher('Mr. Robert Vance (English)', 'اللغة الإنجليزية'),
    registerTeacher('أ. تركي الرويلي (لغة إنجليزية)', 'اللغة الإنجليزية'),
    registerTeacher('أ. بدر العنزي (لغة إنجليزية)', 'اللغة الإنجليزية'),
    registerTeacher('أ. حسام فلاتة (لغة إنجليزية)', 'اللغة الإنجليزية'),
    registerTeacher('أ. خالد الحربي (لغة إنجليزية)', 'اللغة الإنجليزية'),
  ];

  const socialTeachers = [
    registerTeacher('أ. عبدالرحمن التميمي (دراسات اجتماعية)', 'الدراسات الاجتماعية'),
    registerTeacher('أ. بندر السعدون (تاريخ وجغرافيا)', 'الدراسات الاجتماعية'),
    registerTeacher('أ. سعود الرشيد (دراسات اجتماعية)', 'الدراسات الاجتماعية'),
  ];

  const computerTeachers = [
    registerTeacher('م. عادل بخش (حاسب وتقنية)', 'الحاسب الآلي'),
    registerTeacher('م. منير الصاعدي (حاسب - دوام جزئي)', 'الحاسب الآلي', [0, 2, 4], undefined, 4),
    registerTeacher('م. فراس النعيمي (حاسب وذكاء اصطناعي)', 'الحاسب الآلي'),
    registerTeacher('م. أنس البشير (حاسب وتقنية)', 'الحاسب الآلي'),
  ];

  const peTeachers = [
    registerTeacher('كابتن مشعل الهلالي (تربية بدنية)', 'التربية البدنية'),
    registerTeacher('كابتن سلمان النمري (تربية بدنية)', 'التربية البدنية'),
    registerTeacher('كابتن ريان الصالح (تربية بدنية)', 'التربية البدنية'),
  ];

  const artTeachers = [
    registerTeacher('فنان وائل الصباغ (تربية فنية)', 'التربية الفنية'),
    registerTeacher('أ. رائد الشهري (تربية فنية)', 'التربية الفنية'),
    registerTeacher('أ. لؤي الشامي (فنية - دوام جزئي)', 'التربية الفنية', [1, 3, 4], undefined, 4),
  ];

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

  let reqId = 1;
  for (const c of classes) {
    const grade = c.gradeLevel;

    if (grade <= 4) {
      // Lower Elementary: 30 periods/week
      const items = [
        { name: 'القرآن والدراسات الإسلامية', code: 'ISL', cat: 'core' as const, pool: islamicTeachers, hours: 6 },
        { name: 'لغتي الجميلة', code: 'ARB', cat: 'core' as const, pool: arabicTeachers, hours: 8 },
        { name: 'الرياضيات', code: 'MTH', cat: 'core' as const, pool: mathTeachers, hours: 5 },
        { name: 'العلوم', code: 'SCI', cat: 'science' as const, pool: scienceElementary, hours: 3 },
        { name: 'اللغة الإنجليزية', code: 'ENG', cat: 'core' as const, pool: englishTeachers, hours: 4 },
        { name: 'التربية البدنية', code: 'PE', cat: 'activity' as const, pool: peTeachers, hours: 2 },
        { name: 'التربية الفنية', code: 'ART', cat: 'activity' as const, pool: artTeachers, hours: 2 },
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
        { name: 'الدراسات الإسلامية', code: 'ISL', cat: 'core' as const, pool: islamicTeachers, hours: 5 },
        { name: 'اللغة العربية', code: 'ARB', cat: 'core' as const, pool: arabicTeachers, hours: 6 },
        { name: 'الرياضيات', code: 'MTH', cat: 'core' as const, pool: mathTeachers, hours: 6 },
        { name: 'العلوم', code: 'SCI', cat: 'science' as const, pool: scienceMiddle, hours: 5 },
        { name: 'اللغة الإنجليزية', code: 'ENG', cat: 'core' as const, pool: englishTeachers, hours: 4 },
        { name: 'الدراسات الاجتماعية', code: 'SOC', cat: 'humanities' as const, pool: socialTeachers, hours: 3 },
        { name: 'الحاسب الآلي', code: 'COM', cat: 'science' as const, pool: computerTeachers, hours: 2 },
        { name: 'التربية البدنية', code: 'PE', cat: 'activity' as const, pool: peTeachers, hours: 2 },
        { name: 'التربية الفنية', code: 'ART', cat: 'activity' as const, pool: artTeachers, hours: 2 },
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
        { name: 'التربية الإسلامية', code: 'ISL', cat: 'core' as const, pool: islamicTeachers, hours: 3 },
        { name: 'اللغة العربية', code: 'ARB', cat: 'core' as const, pool: arabicTeachers, hours: 4 },
        { name: 'الرياضيات', code: 'MTH', cat: 'core' as const, pool: mathTeachers, hours: 6 },
        { name: 'الفيزياء', code: 'PHY', cat: 'science' as const, pool: physicsTeachers, hours: 4 },
        { name: 'الكيمياء', code: 'CHM', cat: 'science' as const, pool: chemistryTeachers, hours: 4 },
        { name: 'الأحياء', code: 'BIO', cat: 'science' as const, pool: biologyTeachers, hours: 4 },
        { name: 'اللغة الإنجليزية', code: 'ENG', cat: 'core' as const, pool: englishTeachers, hours: 5 },
        { name: 'علم البيانات والذكاء الاصطناعي', code: 'AI', cat: 'science' as const, pool: computerTeachers, hours: 3 },
        { name: 'التربية البدنية', code: 'PE', cat: 'activity' as const, pool: peTeachers, hours: 2 },
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

  return {
    config: DEFAULT_SCHOOL_CONFIG,
    teachers,
    classes,
    subjects,
    curriculum,
  };
}
