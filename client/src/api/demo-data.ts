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

export function generateArabicK12DemoData(): {
  config: SchoolConfigRecord;
  teachers: TeacherRecord[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  curriculum: CurriculumRequirementRecord[];
} {
  // 1. Subjects
  const subjects: SubjectRecord[] = [
    { id: 'sub-islamic', name: 'التربية الإسلامية', code: 'ISL', category: 'core' },
    { id: 'sub-quran', name: 'القرآن الكريم والتجويد', code: 'QUR', category: 'core' },
    { id: 'sub-arabic', name: 'اللغة العربية', code: 'ARB', category: 'core' },
    { id: 'sub-english', name: 'اللغة الإنجليزية', code: 'ENG', category: 'core' },
    { id: 'sub-math', name: 'الرياضيات', code: 'MTH', category: 'core' },
    { id: 'sub-science', name: 'العلوم العامة', code: 'SCI', category: 'science' },
    { id: 'sub-physics', name: 'الفيزياء', code: 'PHY', category: 'science' },
    { id: 'sub-chemistry', name: 'الكيمياء', code: 'CHM', category: 'science' },
    { id: 'sub-biology', name: 'الأحياء', code: 'BIO', category: 'science' },
    { id: 'sub-social', name: 'الدراسات الاجتماعية', code: 'SOC', category: 'humanities' },
    { id: 'sub-history', name: 'التاريخ', code: 'HIS', category: 'humanities' },
    { id: 'sub-geography', name: 'الجغرافيا', code: 'GEO', category: 'humanities' },
    { id: 'sub-cs', name: 'الحاسب وتقنية المعلومات', code: 'COM', category: 'science' },
    { id: 'sub-art', name: 'التربية الفنية', code: 'ART', category: 'activity' },
    { id: 'sub-pe', name: 'التربية البدنية', code: 'PE', category: 'activity' },
  ];

  // 2. Classes: 12 Grades, 2 sections each = 24 classes
  const classes: ClassRecord[] = [];
  for (let grade = 1; grade <= 12; grade++) {
    const periodsPerDay = grade <= 4 ? 6 : 7;
    classes.push({
      id: `cls-g${grade}-1`,
      gradeLevel: grade,
      roomNumber: `${grade}01`,
      sectionName: grade <= 10 ? `الصف ${grade} / 1` : grade === 11 ? `الصف 11 / علمي 1` : `الصف 12 / علمي 1`,
      periodsPerDay,
    });
    classes.push({
      id: `cls-g${grade}-2`,
      gradeLevel: grade,
      roomNumber: `${grade}02`,
      sectionName: grade <= 10 ? `الصف ${grade} / 2` : grade === 11 ? `الصف 11 / أدبي` : `الصف 12 / أدبي`,
      periodsPerDay,
    });
  }

  // 3. Teachers (26 teachers spanning all disciplines)
  const teacherDefs = [
    { name: 'أ. محمد بن أحمد', spec: 'التربية الإسلامية', count: 2 },
    { name: 'أ. عبدالله القحطاني', spec: 'القرآن الكريم', count: 2 },
    { name: 'أ. خالد التميمي', spec: 'اللغة العربية', count: 4 },
    { name: 'أ. عمر بن سلطان', spec: 'اللغة الإنجليزية', count: 3 },
    { name: 'أ. عبدالرحمن الدوسري', spec: 'الرياضيات', count: 4 },
    { name: 'أ. فهد الشمري', spec: 'العلوم العامة', count: 2 },
    { name: 'أ. إبراهيم الغامدي', spec: 'الفيزياء', count: 2 },
    { name: 'أ. طارق الشهري', spec: 'الكيمياء', count: 2 },
    { name: 'أ. سامي المنصور', spec: 'الأحياء', count: 2 },
    { name: 'أ. ماجد العتيبي', spec: 'الدراسات الاجتماعية', count: 2 },
    { name: 'أ. هشام السالم', spec: 'الحاسب وتقنية المعلومات', count: 2 },
    { name: 'أ. وليد الخالدي', spec: 'التربية البدنية', count: 2 },
    { name: 'أ. حسام باوزير', spec: 'التربية الفنية', count: 2 },
  ];

  const teachers: TeacherRecord[] = [];
  let tIdx = 1;
  for (const group of teacherDefs) {
    for (let i = 1; i <= group.count; i++) {
      teachers.push({
        id: `tch-${tIdx++}`,
        name: `${group.name} (${i})`,
        specialization: group.spec,
        maxDailyPeriods: 4,
        maxWeeklyPeriods: 18,
        unavailableSlots: i % 2 === 0 ? [{ dayIndex: 0, periodIndex: 0 }] : [],
      });
    }
  }

  // 4. Curriculum distribution: assign realistic quotas to each class
  const curriculum: CurriculumRequirementRecord[] = [];
  let curId = 1;

  // Helper to find teacher by specialization
  const getTeachersBySpec = (spec: string) => teachers.filter((t) => t.specialization === spec);

  classes.forEach((cls) => {
    const isPrimary = cls.gradeLevel <= 4;
    const isPrep = cls.gradeLevel >= 5 && cls.gradeLevel <= 9;
    const isHigh = cls.gradeLevel >= 10;

    // Subjects and periods for this class type
    const alloc: { subCode: string; periods: number }[] = isPrimary
      ? [
          { subCode: 'QUR', periods: 4 },
          { subCode: 'ISL', periods: 4 },
          { subCode: 'ARB', periods: 7 },
          { subCode: 'ENG', periods: 4 },
          { subCode: 'MTH', periods: 5 },
          { subCode: 'SCI', periods: 3 },
          { subCode: 'ART', periods: 1 },
          { subCode: 'PE', periods: 2 },
        ] // Total = 30 periods (6 per day x 5 days)
      : isPrep
      ? [
          { subCode: 'QUR', periods: 2 },
          { subCode: 'ISL', periods: 3 },
          { subCode: 'ARB', periods: 6 },
          { subCode: 'ENG', periods: 5 },
          { subCode: 'MTH', periods: 6 },
          { subCode: 'SCI', periods: 5 },
          { subCode: 'SOC', periods: 3 },
          { subCode: 'COM', periods: 2 },
          { subCode: 'PE', periods: 2 },
          { subCode: 'ART', periods: 1 },
        ] // Total = 35 periods (7 per day x 5 days)
      : [
          { subCode: 'ISL', periods: 3 },
          { subCode: 'ARB', periods: 6 },
          { subCode: 'ENG', periods: 6 },
          { subCode: 'MTH', periods: 6 },
          { subCode: 'PHY', periods: 4 },
          { subCode: 'CHM', periods: 4 },
          { subCode: 'BIO', periods: 3 },
          { subCode: 'COM', periods: 2 },
          { subCode: 'PE', periods: 1 },
        ]; // Total = 35 periods (7 per day x 5 days)

    alloc.forEach((item) => {
      const sub = subjects.find((s) => s.code === item.subCode);
      if (!sub) return;

      const candidates = getTeachersBySpec(sub.name);
      const chosenTeacher = candidates.length > 0 ? candidates[cls.gradeLevel % candidates.length] : teachers[0];

      curriculum.push({
        id: `cur-${curId++}`,
        classId: cls.id,
        subjectId: sub.id,
        teacherId: chosenTeacher.id,
        periodsPerWeek: item.periods,
      });
    });
  });

  return {
    config: DEFAULT_SCHOOL_CONFIG,
    teachers,
    classes,
    subjects,
    curriculum,
  };
}
