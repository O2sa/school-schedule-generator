import {
  solveTimetable,
  formatTimetableByClass,
  formatTimetableByTeacher,
  type TimetableInput,
  type ClassDefinition,
  type TeacherDefinition,
  type TeachingRequirement
} from "../src/index";

/**
 * Real-World Arabic K-12 School Example (نموذج مدرسة متكاملة من الصف 1 إلى 12)
 *
 * Real-world characteristics demonstrated:
 * 1. 12 Grades (Levels 1 to 12):
 *    - Lower Elementary (الصفوف الأولية 1-4): 6 periods per day (30 periods/week, early dismissal)
 *    - Upper Elementary & Middle (العليا والمتوسطة 5-9): 7 periods per day (35 periods/week)
 *    - High School (المرحلة الثانوية 10-12): 7 periods per day (35 periods/week, specialized sciences)
 * 2. Multiple rooms / sections per level (e.g., Room A & Room B for each grade = 24 classrooms).
 * 3. Working days: Sunday through Thursday (الأحد - الخميس).
 * 4. Realistic Arabic curriculum subject distributions.
 * 5. Realistic teacher profiles:
 *    - Daily workload limits (`maxLecturesPerDay: 5` or `4` to prevent fatigue)
 *    - Department heads with blocked administrative meeting periods
 *    - Part-time teachers with specific working day availability
 */

export function buildArabicK12SchoolInput(numRoomsPerGrade = 2): TimetableInput {
  const days = [
    { id: 0, name: "الأحد (Sunday)" },
    { id: 1, name: "الإثنين (Monday)" },
    { id: 2, name: "الثلاثاء (Tuesday)" },
    { id: 3, name: "الأربعاء (Wednesday)" },
    { id: 4, name: "الخميس (Thursday)" }
  ];

  const periodsPerDay = 7;
  const classes: ClassDefinition[] = [];
  const teachers: TeacherDefinition[] = [];
  const requirements: TeachingRequirement[] = [];

  const roomLabels = ["أ (A)", "ب (B)", "ج (C)", "د (D)"];

  // 1. Generate 12 Grades with multiple rooms/sections per grade
  for (let grade = 1; grade <= 12; grade++) {
    // Grades 1-4 have 6 lectures per day; Grades 5-12 have 7 lectures per day
    const isLower = grade <= 4;
    const lecturesPerDay = isLower ? 6 : 7;
    const allowedPeriods = isLower ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6];

    for (let r = 0; r < numRoomsPerGrade; r++) {
      const roomLabel = roomLabels[r] ?? `Room ${r + 1}`;
      classes.push({
        id: `g${grade}_r${r + 1}`,
        name: `الصف ${grade} - قاعة ${roomLabel}`,
        lecturesPerDay,
        allowedPeriods
      });
    }
  }

  // Teacher allocation helper & capacity tracker
  let teacherSeq = 1;
  const teacherWorkloads = new Map<string, number>();
  const teacherMaxCapacities = new Map<string, number>();

  function registerTeacher(
    name: string,
    subjectSpecialty: string,
    workingDays = [0, 1, 2, 3, 4],
    blockedSlots?: { day: number; period: number }[],
    maxDaily = 5
  ): string {
    const id = `t_${teacherSeq++}_${subjectSpecialty}`;
    teachers.push({
      id,
      name,
      workingDays,
      ...(blockedSlots && blockedSlots.length > 0 ? { blockedSlots } : {}),
      maxLecturesPerDay: maxDaily
    });
    teacherWorkloads.set(id, 0);
    const usableSlots = workingDays.length * maxDaily - (blockedSlots?.length ?? 0);
    teacherMaxCapacities.set(id, usableSlots);
    return id;
  }

  // --- Teacher Faculty Pools ---

  // Islamic Studies (الدراسات الإسلامية والقرآن)
  const islamicTeachers = [
    registerTeacher("أ. أحمد الغامدي (إسلاميات)", "islamic"),
    registerTeacher("أ. خالد القرني (إسلاميات)", "islamic"),
    registerTeacher("أ. عبدالله الدوسري (إسلاميات)", "islamic"),
    registerTeacher("أ. فهد الشمري (إسلاميات)", "islamic"),
    registerTeacher("أ. عمر العتيبي (إسلاميات)", "islamic"),
    registerTeacher("أ. صالح العمري (إسلاميات)", "islamic"),
    // Part-time Islamic scholar available 4 days, max 3 lectures/day
    registerTeacher("الشيخ إبراهيم السعد (إسلاميات - إشراف)", "islamic", [0, 1, 2, 3], undefined, 3)
  ];

  // Arabic Language (اللغة العربية)
  const arabicTeachers = [
    registerTeacher("أ. محمد الزهراني (لغة عربية)", "arabic"),
    registerTeacher("أ. سعيد القحطاني (لغة عربية)", "arabic"),
    registerTeacher("أ. فيصل المطيري (لغة عربية)", "arabic"),
    registerTeacher("أ. علي الشهري (لغة عربية)", "arabic"),
    registerTeacher("أ. طارق المالكي (لغة عربية)", "arabic"),
    registerTeacher("أ. ناصر السبيعي (لغة عربية)", "arabic"),
    registerTeacher("أ. وليد الثبيتي (لغة عربية)", "arabic"),
    registerTeacher("أ. حسام الغامدي (لغة عربية)", "arabic"),
    // Department Head: Thursday periods 5 & 6 blocked for curriculum meeting
    registerTeacher("أ. هشام السليمان (رئيس قسم العربي)", "arabic", [0, 1, 2, 3, 4], [
      { day: 4, period: 5 },
      { day: 4, period: 6 }
    ])
  ];

  // Mathematics (الرياضيات)
  const mathTeachers = [
    registerTeacher("أ. محمود المصري (رياضيات)", "math"),
    registerTeacher("أ. زياد الشريف (رياضيات)", "math"),
    registerTeacher("أ. ياسر الأحمد (رياضيات)", "math"),
    registerTeacher("أ. حمزة عسيري (رياضيات)", "math"),
    registerTeacher("أ. وليد الحربي (رياضيات)", "math"),
    registerTeacher("أ. ماجد الجهني (رياضيات)", "math"),
    registerTeacher("أ. راكان الحارثي (رياضيات)", "math"),
    registerTeacher("أ. إياد النجار (رياضيات)", "math")
  ];

  // Science & Specialized Branches (العلوم، الفيزياء، الكيمياء، الأحياء)
  const scienceElementary = [
    registerTeacher("أ. حسن العلي (علوم ابتدائي)", "science"),
    registerTeacher("أ. سالم باوزير (علوم ابتدائي)", "science")
  ];
  const scienceMiddle = [
    registerTeacher("أ. مازن البلوي (علوم متوسط)", "science"),
    registerTeacher("أ. عصام رضوان (علوم متوسط)", "science"),
    registerTeacher("أ. نبيل الفهد (علوم متوسط)", "science")
  ];
  const physicsTeachers = [
    registerTeacher("د. عثمان الصالح (فيزياء)", "physics"),
    registerTeacher("أ. سمير خليل (فيزياء)", "physics")
  ];
  const chemistryTeachers = [
    registerTeacher("أ. بسام الخالدي (كيمياء)", "chemistry"),
    registerTeacher("أ. رامي المنصور (كيمياء)", "chemistry")
  ];
  const biologyTeachers = [
    registerTeacher("أ. سامي العمري (أحياء)", "biology"),
    registerTeacher("أ. وائل حبيب (أحياء)", "biology")
  ];

  // English Language (اللغة الإنجليزية)
  const englishTeachers = [
    registerTeacher("Mr. David Miller (English)", "english"),
    registerTeacher("Mr. Robert Vance (English)", "english"),
    registerTeacher("أ. تركي الرويلي (لغة إنجليزية)", "english"),
    registerTeacher("أ. بدر العنزي (لغة إنجليزية)", "english"),
    registerTeacher("أ. حسام فلاتة (لغة إنجليزية)", "english"),
    registerTeacher("أ. خالد الحربي (لغة إنجليزية)", "english")
  ];

  // Social Studies & History (الدراسات الاجتماعية والمواطنة)
  const socialTeachers = [
    registerTeacher("أ. عبدالرحمن التميمي (دراسات اجتماعية)", "social"),
    registerTeacher("أ. بندر السعدون (تاريخ وجغرافيا)", "social"),
    registerTeacher("أ. سعود الرشيد (دراسات اجتماعية)", "social")
  ];

  // Computer & IT (الحاسب وتقنية المعلومات)
  const computerTeachers = [
    registerTeacher("م. عادل بخش (حاسب وتقنية)", "computer"),
    // Part-time IT teacher (working Sun, Tue, Thu)
    registerTeacher("م. منير الصاعدي (حاسب - دوام جزئي)", "computer", [0, 2, 4], undefined, 4),
    registerTeacher("م. فراس النعيمي (حاسب وشبكات)", "computer"),
    registerTeacher("م. أنس البشير (حاسب وتقنية)", "computer")
  ];

  // Physical Education & Arts (التربية البدنية والفنية)
  const peTeachers = [
    registerTeacher("كابتن مشعل الهلالي (تربية بدنية)", "pe"),
    registerTeacher("كابتن سلمان النمري (تربية بدنية)", "pe"),
    registerTeacher("كابتن ريان الصالح (تربية بدنية)", "pe")
  ];

  const artTeachers = [
    registerTeacher("فنان وائل الصباغ (تربية فنية)", "art"),
    registerTeacher("أ. رائد الشهري (تربية فنية)", "art"),
    // Part-time art teacher (working Mon, Wed, Thu)
    registerTeacher("أ. لؤي الشامي (فنية - دوام جزئي)", "art", [1, 3, 4], undefined, 3)
  ];

  // Pick least loaded eligible teacher from pool
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

  // 2. Assign Subject Curriculums across Grades
  for (const c of classes) {
    const grade = parseInt(c.id.replace(/^g(\d+)_.*$/, "$1"), 10);

    if (grade <= 4) {
      // Lower Elementary (الصفوف 1-4): 30 lectures/week (6 per day)
      requirements.push(
        { teacherId: pickTeacher(islamicTeachers, 6), classId: c.id, subjectName: "القرآن والدراسات الإسلامية", lecturesPerWeek: 6 },
        { teacherId: pickTeacher(arabicTeachers, 8), classId: c.id, subjectName: "لغتي الجميلة", lecturesPerWeek: 8 },
        { teacherId: pickTeacher(mathTeachers, 5), classId: c.id, subjectName: "الرياضيات", lecturesPerWeek: 5 },
        { teacherId: pickTeacher(scienceElementary, 3), classId: c.id, subjectName: "العلوم", lecturesPerWeek: 3 },
        { teacherId: pickTeacher(englishTeachers, 4), classId: c.id, subjectName: "اللغة الإنجليزية", lecturesPerWeek: 4 },
        { teacherId: pickTeacher(peTeachers, 2), classId: c.id, subjectName: "التربية البدنية", lecturesPerWeek: 2 },
        { teacherId: pickTeacher(artTeachers, 2), classId: c.id, subjectName: "التربية الفنية", lecturesPerWeek: 2 }
      );
    } else if (grade <= 9) {
      // Upper Elementary & Middle (الصفوف 5-9): 35 lectures/week (7 per day)
      requirements.push(
        { teacherId: pickTeacher(islamicTeachers, 5), classId: c.id, subjectName: "الدراسات الإسلامية", lecturesPerWeek: 5 },
        { teacherId: pickTeacher(arabicTeachers, 6), classId: c.id, subjectName: "اللغة العربية", lecturesPerWeek: 6 },
        { teacherId: pickTeacher(mathTeachers, 6), classId: c.id, subjectName: "الرياضيات", lecturesPerWeek: 6 },
        { teacherId: pickTeacher(scienceMiddle, 5), classId: c.id, subjectName: "العلوم", lecturesPerWeek: 5 },
        { teacherId: pickTeacher(englishTeachers, 4), classId: c.id, subjectName: "اللغة الإنجليزية", lecturesPerWeek: 4 },
        { teacherId: pickTeacher(socialTeachers, 3), classId: c.id, subjectName: "الدراسات الاجتماعية", lecturesPerWeek: 3 },
        { teacherId: pickTeacher(computerTeachers, 2), classId: c.id, subjectName: "الحاسب الآلي", lecturesPerWeek: 2 },
        { teacherId: pickTeacher(peTeachers, 2), classId: c.id, subjectName: "التربية البدنية", lecturesPerWeek: 2 },
        { teacherId: pickTeacher(artTeachers, 2), classId: c.id, subjectName: "التربية الفنية", lecturesPerWeek: 2 }
      );
    } else {
      // High School (الصفوف الثانوية 10-12): 35 lectures/week (7 per day)
      requirements.push(
        { teacherId: pickTeacher(islamicTeachers, 3), classId: c.id, subjectName: "التربية الإسلامية", lecturesPerWeek: 3 },
        { teacherId: pickTeacher(arabicTeachers, 4), classId: c.id, subjectName: "اللغة العربية", lecturesPerWeek: 4 },
        { teacherId: pickTeacher(mathTeachers, 6), classId: c.id, subjectName: "الرياضيات", lecturesPerWeek: 6 },
        { teacherId: pickTeacher(physicsTeachers, 4), classId: c.id, subjectName: "الفيزياء", lecturesPerWeek: 4 },
        { teacherId: pickTeacher(chemistryTeachers, 4), classId: c.id, subjectName: "الكيمياء", lecturesPerWeek: 4 },
        { teacherId: pickTeacher(biologyTeachers, 4), classId: c.id, subjectName: "الأحياء", lecturesPerWeek: 4 },
        { teacherId: pickTeacher(englishTeachers, 5), classId: c.id, subjectName: "اللغة الإنجليزية", lecturesPerWeek: 5 },
        { teacherId: pickTeacher(computerTeachers, 3), classId: c.id, subjectName: "علم البيانات والخوارزميات", lecturesPerWeek: 3 },
        { teacherId: pickTeacher(peTeachers, 2), classId: c.id, subjectName: "التربية البدنية والدفاع عن النفس", lecturesPerWeek: 2 }
      );
    }
  }

  return {
    days,
    periodsPerDay,
    classes,
    teachers,
    requirements,
    options: {
      timeoutMs: 30_000,
      minimizeGaps: true,
      balanceWorkload: true
    }
  };
}

// Execute and print timetable
console.log("=======================================================================");
console.log("  🏢 Arabic K-12 School Timetabling (مجمع مدرسي من الصف 1 إلى 12)  ");
console.log("=======================================================================\n");

const schoolInput = buildArabicK12SchoolInput(2);
const totalLectures = schoolInput.requirements.reduce((sum, r) => sum + r.lecturesPerWeek, 0);

console.log(`• Working Days: ${schoolInput.days.map((d) => d.name).join(", ")}`);
console.log(`• Max Periods/Day: ${schoolInput.periodsPerDay}`);
console.log(`• Total Classrooms (Rooms): ${schoolInput.classes.length} (12 grades × 2 rooms)`);
console.log(`  - Grades 1-4: 6 periods/day (Early dismissal after 6th period)`);
console.log(`  - Grades 5-12: 7 periods/day (Full day)`);
console.log(`• Total Faculty Staff: ${schoolInput.teachers.length} teachers`);
console.log(`• Total Requirements: ${schoolInput.requirements.length}`);
console.log(`• Total Weekly Lectures to Schedule: ${totalLectures} lectures\n`);

console.log("Solving constraint satisfaction problem (CSP with MRV & Forward Checking)...");
const startTime = Date.now();
const result = solveTimetable(schoolInput);
const elapsedMs = Date.now() - startTime;

if (result.status === "SUCCESS") {
  console.log("\n=======================================================================");
  console.log("  ✅ TIMETABLE GENERATED SUCCESSFULLY!");
  console.log("=======================================================================");
  console.log(`• Total Scheduled Lectures: ${result.lectures.length}/${totalLectures}`);
  console.log(`• Execution Time: ${elapsedMs}ms`);
  console.log(`• Search Iterations: ${result.statistics.iterations}`);
  console.log(`• Backtracks Needed: ${result.statistics.backtracks}`);
  console.log(`• Forward Checking Prunes: ${result.statistics.forwardCheckingPrunes}`);
  console.log(`• Max Search Depth: ${result.statistics.maxSearchDepth}`);
  console.log(`• Quality Score: ${result.quality.overallScore}/1000`);
  console.log(`• Teacher Free-Period Gaps: ${result.quality.teacherGapCount}`);

  // Display sample timetable for Grade 1 (6 periods) and Grade 12 (7 periods)
  console.log("\n-----------------------------------------------------------------------");
  console.log("  Sample 1: Grade 1 Classroom Timetable (6 periods/day - دوام 6 حصص)");
  console.log("-----------------------------------------------------------------------");
  const grade1Input: TimetableInput = {
    ...schoolInput,
    classes: schoolInput.classes.filter((c) => c.id === "g1_r1")
  };
  console.log(formatTimetableByClass(result, grade1Input));

  console.log("\n-----------------------------------------------------------------------");
  console.log("  Sample 2: Grade 12 High School Classroom (7 periods/day - دوام 7 حصص)");
  console.log("-----------------------------------------------------------------------");
  const grade12Input: TimetableInput = {
    ...schoolInput,
    classes: schoolInput.classes.filter((c) => c.id === "g12_r1")
  };
  console.log(formatTimetableByClass(result, grade12Input));

  console.log("\n-----------------------------------------------------------------------");
  console.log("  Sample 3: Teacher Timetable (Department Head with Blocked Meeting)");
  console.log("-----------------------------------------------------------------------");
  const deptHeadInput: TimetableInput = {
    ...schoolInput,
    teachers: schoolInput.teachers.filter((t) => t.id === "t_15_arabic")
  };
  console.log(formatTimetableByTeacher(result, deptHeadInput));
} else {
  console.error("\n❌ Solving Failed:", result);
}
