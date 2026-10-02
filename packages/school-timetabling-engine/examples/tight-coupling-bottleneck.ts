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
 * Hard Example 1: The Combinatorial Pinwheel (100% Capacity Saturation)
 *
 * Characteristics:
 * - 4 High School sections (10A, 10B, 11A, 11B), 5 days, 5 periods/day.
 * - Exactly 100 scheduled periods required out of 100 available classroom slots (100% saturation, zero slack).
 * - Part-time specialist faculty with mutually disjoint working days:
 *   - Prof. Ramanujan (Advanced Math): Mon, Wed, Fri only (14 lectures required out of 15 available slots = 93.3% load)
 *   - Dr. Faraday (Experimental Physics): Tue, Thu only (8 lectures required out of 9 available slots = 88.9% load)
 *   - Dr. Hopper (AI & Computing): Mon-Thu only, Friday off (12 lectures required)
 *   - Coach DaVinci (Arts & Athletics): Tue-Fri only, Monday off (10 lectures required)
 * - Tightly interlocking blocked slots (administrative meetings, lab setup, server maintenance).
 * - Requires deep constraint propagation (MRV + Forward Checking) to prevent dead-end branches.
 */

export function buildTightCouplingInput(): TimetableInput {
  const days = [
    { id: 0, name: "Monday" },
    { id: 1, name: "Tuesday" },
    { id: 2, name: "Wednesday" },
    { id: 3, name: "Thursday" },
    { id: 4, name: "Friday" }
  ];

  const periodsPerDay = 5;

  const classes: ClassDefinition[] = [
    { id: "grade_10a", name: "Grade 10A (STEM Track)", lecturesPerDay: 5 },
    { id: "grade_10b", name: "Grade 10B (STEM Track)", lecturesPerDay: 5 },
    { id: "grade_11a", name: "Grade 11A (Honors Track)", lecturesPerDay: 5 },
    { id: "grade_11b", name: "Grade 11B (Honors Track)", lecturesPerDay: 5 }
  ];

  const teachers: TeacherDefinition[] = [
    {
      id: "t_stem_grace",
      name: "Dr. Grace (STEM Lead)",
      workingDays: [0, 1, 2, 3, 4],
      maxLecturesPerDay: 4,
      blockedSlots: [
        { day: 0, period: 0 }, // Monday morning faculty briefing
        { day: 2, period: 4 }  // Wednesday afternoon STEM lab inventory
      ]
    },
    {
      id: "t_math_ramanujan",
      name: "Prof. Ramanujan (Pure & Applied Math)",
      workingDays: [0, 2, 4], // Mon / Wed / Fri only
      maxLecturesPerDay: 5
    },
    {
      id: "t_physics_faraday",
      name: "Dr. Faraday (Experimental Physics)",
      workingDays: [1, 3], // Tue / Thu only
      maxLecturesPerDay: 5,
      blockedSlots: [
        { day: 3, period: 4 } // Thursday prep
      ]
    },
    {
      id: "t_humanities_socrates",
      name: "Prof. Socrates (Philosophy & History)",
      workingDays: [0, 1, 2, 3, 4],
      maxLecturesPerDay: 4,
      blockedSlots: [
        { day: 1, period: 2 },
        { day: 3, period: 2 }
      ]
    },
    {
      id: "t_lang_woolf",
      name: "Ms. Woolf (Literature & Writing)",
      workingDays: [0, 1, 2, 3, 4],
      maxLecturesPerDay: 4,
      blockedSlots: [
        { day: 2, period: 0 }
      ]
    },
    {
      id: "t_cs_hopper",
      name: "Dr. Hopper (Computing & Algorithms)",
      workingDays: [0, 1, 2, 3], // Mon - Thu only
      maxLecturesPerDay: 4,
      blockedSlots: [
        { day: 0, period: 4 }
      ]
    },
    {
      id: "t_bio_franklin",
      name: "Dr. Franklin (Molecular Biology)",
      workingDays: [0, 1, 2, 3, 4],
      maxLecturesPerDay: 3
    },
    {
      id: "t_arts_davinci",
      name: "Coach DaVinci (Arts & Athletics)",
      workingDays: [1, 2, 3, 4], // Tue - Fri only
      maxLecturesPerDay: 3
    }
  ];

  const requirements: TeachingRequirement[] = [
    // --- Grade 10A (25 total) ---
    { teacherId: "t_stem_grace", classId: "grade_10a", subjectId: "stem", subjectName: "Integrated STEM", lecturesPerWeek: 4 },
    { teacherId: "t_math_ramanujan", classId: "grade_10a", subjectId: "math", subjectName: "Advanced Calculus", lecturesPerWeek: 3 },
    { teacherId: "t_physics_faraday", classId: "grade_10a", subjectId: "phys", subjectName: "Mechanics Lab", lecturesPerWeek: 2 },
    { teacherId: "t_humanities_socrates", classId: "grade_10a", subjectId: "phil", subjectName: "Ethics & History", lecturesPerWeek: 4 },
    { teacherId: "t_lang_woolf", classId: "grade_10a", subjectId: "lit", subjectName: "Literature Seminar", lecturesPerWeek: 4 },
    { teacherId: "t_cs_hopper", classId: "grade_10a", subjectId: "cs", subjectName: "Algorithms I", lecturesPerWeek: 3 },
    { teacherId: "t_bio_franklin", classId: "grade_10a", subjectId: "bio", subjectName: "Cell Biology", lecturesPerWeek: 2 },
    { teacherId: "t_arts_davinci", classId: "grade_10a", subjectId: "art", subjectName: "Visual Arts & Sport", lecturesPerWeek: 3 },

    // --- Grade 10B (25 total) ---
    { teacherId: "t_stem_grace", classId: "grade_10b", subjectId: "stem", subjectName: "Integrated STEM", lecturesPerWeek: 4 },
    { teacherId: "t_math_ramanujan", classId: "grade_10b", subjectId: "math", subjectName: "Advanced Calculus", lecturesPerWeek: 4 },
    { teacherId: "t_physics_faraday", classId: "grade_10b", subjectId: "phys", subjectName: "Mechanics Lab", lecturesPerWeek: 2 },
    { teacherId: "t_humanities_socrates", classId: "grade_10b", subjectId: "phil", subjectName: "Ethics & History", lecturesPerWeek: 4 },
    { teacherId: "t_lang_woolf", classId: "grade_10b", subjectId: "lit", subjectName: "Literature Seminar", lecturesPerWeek: 4 },
    { teacherId: "t_cs_hopper", classId: "grade_10b", subjectId: "cs", subjectName: "Algorithms I", lecturesPerWeek: 3 },
    { teacherId: "t_bio_franklin", classId: "grade_10b", subjectId: "bio", subjectName: "Cell Biology", lecturesPerWeek: 2 },
    { teacherId: "t_arts_davinci", classId: "grade_10b", subjectId: "art", subjectName: "Visual Arts & Sport", lecturesPerWeek: 2 },

    // --- Grade 11A (25 total) ---
    { teacherId: "t_stem_grace", classId: "grade_11a", subjectId: "stem", subjectName: "Engineering Design", lecturesPerWeek: 4 },
    { teacherId: "t_math_ramanujan", classId: "grade_11a", subjectId: "math", subjectName: "Differential Equations", lecturesPerWeek: 4 },
    { teacherId: "t_physics_faraday", classId: "grade_11a", subjectId: "phys", subjectName: "Electromagnetism Lab", lecturesPerWeek: 2 },
    { teacherId: "t_humanities_socrates", classId: "grade_11a", subjectId: "phil", subjectName: "Political Theory", lecturesPerWeek: 4 },
    { teacherId: "t_lang_woolf", classId: "grade_11a", subjectId: "lit", subjectName: "Rhetoric & Writing", lecturesPerWeek: 4 },
    { teacherId: "t_cs_hopper", classId: "grade_11a", subjectId: "cs", subjectName: "Systems Programming", lecturesPerWeek: 3 },
    { teacherId: "t_bio_franklin", classId: "grade_11a", subjectId: "bio", subjectName: "Genetics Lab", lecturesPerWeek: 2 },
    { teacherId: "t_arts_davinci", classId: "grade_11a", subjectId: "art", subjectName: "Studio Arts & Athletics", lecturesPerWeek: 2 },

    // --- Grade 11B (25 total) ---
    { teacherId: "t_stem_grace", classId: "grade_11b", subjectId: "stem", subjectName: "Engineering Design", lecturesPerWeek: 4 },
    { teacherId: "t_math_ramanujan", classId: "grade_11b", subjectId: "math", subjectName: "Differential Equations", lecturesPerWeek: 3 },
    { teacherId: "t_physics_faraday", classId: "grade_11b", subjectId: "phys", subjectName: "Electromagnetism Lab", lecturesPerWeek: 2 },
    { teacherId: "t_humanities_socrates", classId: "grade_11b", subjectId: "phil", subjectName: "Political Theory", lecturesPerWeek: 4 },
    { teacherId: "t_lang_woolf", classId: "grade_11b", subjectId: "lit", subjectName: "Rhetoric & Writing", lecturesPerWeek: 4 },
    { teacherId: "t_cs_hopper", classId: "grade_11b", subjectId: "cs", subjectName: "Systems Programming", lecturesPerWeek: 3 },
    { teacherId: "t_bio_franklin", classId: "grade_11b", subjectId: "bio", subjectName: "Genetics Lab", lecturesPerWeek: 2 },
    { teacherId: "t_arts_davinci", classId: "grade_11b", subjectId: "art", subjectName: "Studio Arts & Athletics", lecturesPerWeek: 3 }
  ];

  return {
    days,
    periodsPerDay,
    classes,
    teachers,
    requirements,
    options: {
      timeoutMs: 15_000,
      enableForwardChecking: true,
      minimizeGaps: false,
      balanceWorkload: true
    }
  };
}

function main() {
  console.log("=======================================================================");
  console.log("  COMPLEX BENCHMARK 1: Combinatorial Pinwheel (100% Saturation Bottleneck)");
  console.log("=======================================================================");
  console.log("Problem Setup:");
  console.log("- 4 Cohorts x 5 Days x 5 Periods = 100 Classroom Slots");
  console.log("- Exactly 100 Teaching Requirements (100.0% Saturation / Zero Slack)");
  console.log("- Interlocking Part-time Specialist Constraints:");
  console.log("  * Prof. Ramanujan (Mon/Wed/Fri only)  -> 14/15 slots utilized (93.3%)");
  console.log("  * Dr. Faraday     (Tue/Thu only)      -> 8/9 slots utilized   (88.9%)");
  console.log("  * Dr. Hopper      (Mon-Thu only)      -> 12/15 slots utilized (80.0%)");
  console.log("  * Coach DaVinci   (Tue-Fri only)      -> 10/12 slots utilized (83.3%)");
  console.log("\nSolving with MRV variable ordering + forward checking...");

  const input = buildTightCouplingInput();
  const startTime = Date.now();
  const result = solveTimetable(input);
  const elapsed = Date.now() - startTime;

  if (result.status === "SUCCESS") {
    console.log("\n✅ TIMETABLE GENERATED SUCCESSFULLY!");
    console.log(`• Status: ${result.status}`);
    console.log(`• Total Assigned: ${result.lectures.length} / 100 slots (100% Saturation)`);
    console.log(`• Solver Execution Time: ${result.statistics.executionTimeMs}ms (total: ${elapsed}ms)`);
    console.log(`• Search Iterations: ${result.statistics.iterations}`);
    console.log(`• Backtracks: ${result.statistics.backtracks}`);
    console.log(`• Forward Checking Prunes: ${result.statistics.forwardCheckingPrunes}`);
    console.log(`• Max Search Depth: ${result.statistics.maxSearchDepth}`);
    console.log(`• Quality Score: ${result.quality.overallScore}/1000`);
    console.log(`• Teacher Free-Period Gaps: ${result.quality.teacherGapCount}`);
    console.log(`• Teacher Daily Load Variance: ${result.quality.teacherDailyLoadVariance.toFixed(2)}`);

    console.log("\n" + "=".repeat(60));
    console.log("  CLASS SCHEDULE: Grade 10A (STEM Track)");
    console.log("=".repeat(60));
    console.log(formatTimetableByClass({
      ...result,
      byClass: new Map([["grade_10a", result.byClass.get("grade_10a")!]])
    }, { ...input, classes: [input.classes[0]!] }));

    console.log("\n" + "=".repeat(60));
    console.log("  TEACHER SCHEDULE: Prof. Ramanujan (Mon/Wed/Fri - 14 lectures)");
    console.log("=".repeat(60));
    console.log(formatTimetableByTeacher({
      ...result,
      byTeacher: new Map([["t_math_ramanujan", result.byTeacher.get("t_math_ramanujan")!]])
    }, { ...input, teachers: [input.teachers[1]!] }));

    console.log("\n" + "=".repeat(60));
    console.log("  TEACHER SCHEDULE: Dr. Faraday (Tue/Thu - 8 lectures)");
    console.log("=".repeat(60));
    console.log(formatTimetableByTeacher({
      ...result,
      byTeacher: new Map([["t_physics_faraday", result.byTeacher.get("t_physics_faraday")!]])
    }, { ...input, teachers: [input.teachers[2]!] }));
  } else {
    console.error(`❌ Solver ended with status: ${result.status}`);
    console.error("Statistics:", result.statistics);
    console.error("Diagnostics:", JSON.stringify(result.diagnostics, null, 2));
    process.exit(1);
  }
}

if (require.main === module || process.argv[1]?.includes("tight-coupling-bottleneck")) {
  main();
}
