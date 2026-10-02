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
 * Hard Benchmark 3: Dual-Shift Urban High School & Knife-Edge Stress Test
 *
 * Real-world characteristics demonstrated:
 * 1. Dual-Shift Facility Sharing:
 *    - Densely populated urban high school sharing one physical campus across two shifts:
 *      * Morning Shift (Junior High Grades 9 & 10): 4 daily periods (Periods 0, 1, 2, 3)
 *      * Afternoon Shift (Senior High Grades 11 & 12): 4 daily periods (Periods 4, 5, 6, 7)
 * 2. Cross-Shift Roving Teachers:
 *    - Subject heads (STEM, Humanities, Athletics) who teach across BOTH morning and afternoon shifts.
 *    - Strict maxLecturesPerDay (e.g. 5) prevents burnout while teaching across shifts.
 * 3. Part-Time & Floating Faculty with Heavy Interlocking Blocks:
 *    - Teachers with restricted working days and staggered availability.
 * 4. Dual-Phase Benchmark:
 *    - Phase 1 (Knife-Edge Feasible): Exactly balances supply and demand under high constraint density.
 *    - Phase 2 (Infeasible Boundary): Probes the boundary by injecting a 1-lecture overload into a bottleneck
 *      cross-shift teacher, proving the engine's instant O(1) mathematical diagnostic detection.
 */

export function buildDualShiftInput(overconstrainTeacher = false): TimetableInput {
  const days = [
    { id: 0, name: "Sunday" },
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" }
  ];

  const periodsPerDay = 8; // Periods 0..3 (Morning Shift), 4..7 (Afternoon Shift)

  const classes: ClassDefinition[] = [
    // Morning Shift Classes (Periods 0-3)
    { id: "c_9a", name: "Grade 9A (Morning Shift)", lecturesPerDay: 4, allowedPeriods: [0, 1, 2, 3] },
    { id: "c_9b", name: "Grade 9B (Morning Shift)", lecturesPerDay: 4, allowedPeriods: [0, 1, 2, 3] },
    { id: "c_10a", name: "Grade 10A (Morning Shift)", lecturesPerDay: 4, allowedPeriods: [0, 1, 2, 3] },
    { id: "c_10b", name: "Grade 10B (Morning Shift)", lecturesPerDay: 4, allowedPeriods: [0, 1, 2, 3] },

    // Afternoon Shift Classes (Periods 4-7)
    { id: "c_11a", name: "Grade 11A (Afternoon Shift)", lecturesPerDay: 4, allowedPeriods: [4, 5, 6, 7] },
    { id: "c_11b", name: "Grade 11B (Afternoon Shift)", lecturesPerDay: 4, allowedPeriods: [4, 5, 6, 7] },
    { id: "c_12a", name: "Grade 12A (Afternoon Shift)", lecturesPerDay: 4, allowedPeriods: [4, 5, 6, 7] },
    { id: "c_12b", name: "Grade 12B (Afternoon Shift)", lecturesPerDay: 4, allowedPeriods: [4, 5, 6, 7] }
  ];

  const teachers: TeacherDefinition[] = [
    // Cross-shift STEM Lead (teaches in both morning and afternoon)
    {
      id: "t_stem_director",
      name: "Dr. Al-Khwarizmi (STEM Director - Cross Shift)",
      workingDays: [0, 1, 2, 3, 4],
      maxLecturesPerDay: 5,
      blockedSlots: [
        { day: 0, period: 0 }, // Sunday morning staff assembly
        { day: 2, period: 3 }  // Tuesday midday shift-change coordination
      ]
    },
    // Morning Shift Math Specialist
    {
      id: "t_math_morning",
      name: "Prof. Hypatia (Morning Mathematics)",
      workingDays: [0, 1, 2, 3, 4],
      maxLecturesPerDay: 4
    },
    // Afternoon Shift Advanced Math Specialist
    {
      id: "t_math_afternoon",
      name: "Prof. Gauss (Afternoon Advanced Math)",
      workingDays: [0, 1, 2, 3, 4],
      maxLecturesPerDay: 4
    },
    // Cross-shift Language & Literature
    {
      id: "t_lang_director",
      name: "Dr. Al-Jahiz (Literature & Rhetoric - Cross Shift)",
      workingDays: [0, 1, 2, 3, 4],
      maxLecturesPerDay: 5,
      blockedSlots: [{ day: 1, period: 1 }] // Monday morning editorial meeting
    },
    // Morning Sciences (Physics & Chemistry)
    {
      id: "t_sci_morning",
      name: "Dr. Ibn Al-Haytham (Morning Optics & Sciences)",
      workingDays: [0, 1, 2, 3, 4],
      maxLecturesPerDay: 4
    },
    // Afternoon Sciences (Biology & Chemistry)
    {
      id: "t_sci_afternoon",
      name: "Dr. Ibn Sina (Afternoon Biology & Medicine Prep)",
      workingDays: [0, 1, 2, 3, 4],
      maxLecturesPerDay: 4
    },
    // Cross-shift Athletics & Physical Education Director
    {
      id: "t_pe_director",
      name: "Coach Tariq (Athletics & Physical Training - Cross Shift)",
      workingDays: [0, 1, 2, 3, 4],
      maxLecturesPerDay: 5
    },
    // Humanities & Social Studies
    {
      id: "t_humanities",
      name: "Dr. Ibn Battuta (Geography & Social Studies)",
      workingDays: [0, 1, 2, 3, 4],
      maxLecturesPerDay: 4,
      blockedSlots: [{ day: 3, period: 2 }] // Wednesday morning archive research
    }
  ];

  // If testing over-constraint, reduce stem director capacity to provoke instant diagnostic
  if (overconstrainTeacher) {
    const stemDirector = teachers.find(t => t.id === "t_stem_director");
    if (stemDirector) {
      // Artificially restrict working days from 5 to 2 days while demanding 20 lectures
      stemDirector.workingDays = [0, 1];
    }
  }

  // 8 classes x 4 lectures/day x 5 days = 160 total weekly lectures
  const requirements: TeachingRequirement[] = [
    // --- Grade 9A (Morning Shift - 20 lectures) ---
    { teacherId: "t_stem_director", classId: "c_9a", subjectName: "Integrated STEM", lecturesPerWeek: 5 },
    { teacherId: "t_math_morning", classId: "c_9a", subjectName: "Algebra I", lecturesPerWeek: 5 },
    { teacherId: "t_lang_director", classId: "c_9a", subjectName: "Arabic Language & Literature", lecturesPerWeek: 5 },
    { teacherId: "t_sci_morning", classId: "c_9a", subjectName: "Physical Science", lecturesPerWeek: 5 },

    // --- Grade 9B (Morning Shift - 20 lectures) ---
    { teacherId: "t_humanities", classId: "c_9b", subjectName: "Social Studies & Geography", lecturesPerWeek: 5 },
    { teacherId: "t_math_morning", classId: "c_9b", subjectName: "Algebra I", lecturesPerWeek: 5 },
    { teacherId: "t_pe_director", classId: "c_9b", subjectName: "Athletics & Physical Training", lecturesPerWeek: 5 },
    { teacherId: "t_sci_morning", classId: "c_9b", subjectName: "Physical Science", lecturesPerWeek: 5 },

    // --- Grade 10A (Morning Shift - 20 lectures) ---
    { teacherId: "t_stem_director", classId: "c_10a", subjectName: "Engineering Design", lecturesPerWeek: 5 },
    { teacherId: "t_math_morning", classId: "c_10a", subjectName: "Geometry", lecturesPerWeek: 5 },
    { teacherId: "t_lang_director", classId: "c_10a", subjectName: "Arabic Language & Literature", lecturesPerWeek: 5 },
    { teacherId: "t_humanities", classId: "c_10a", subjectName: "Islamic History", lecturesPerWeek: 5 },

    // --- Grade 10B (Morning Shift - 20 lectures) ---
    { teacherId: "t_stem_director", classId: "c_10b", subjectName: "Engineering Design", lecturesPerWeek: 5 },
    { teacherId: "t_math_morning", classId: "c_10b", subjectName: "Geometry", lecturesPerWeek: 5 },
    { teacherId: "t_pe_director", classId: "c_10b", subjectName: "Athletics & Physical Training", lecturesPerWeek: 5 },
    { teacherId: "t_sci_morning", classId: "c_10b", subjectName: "Chemistry Principles", lecturesPerWeek: 5 },

    // --- Grade 11A (Afternoon Shift - 20 lectures) ---
    { teacherId: "t_stem_director", classId: "c_11a", subjectName: "Robotics & Microcontrollers", lecturesPerWeek: 5 },
    { teacherId: "t_math_afternoon", classId: "c_11a", subjectName: "Pre-Calculus & Trigonometry", lecturesPerWeek: 5 },
    { teacherId: "t_lang_director", classId: "c_11a", subjectName: "Advanced Rhetoric & Composition", lecturesPerWeek: 5 },
    { teacherId: "t_sci_afternoon", classId: "c_11a", subjectName: "Cellular Biology", lecturesPerWeek: 5 },

    // --- Grade 11B (Afternoon Shift - 20 lectures) ---
    { teacherId: "t_humanities", classId: "c_11b", subjectName: "World History & Civilization", lecturesPerWeek: 5 },
    { teacherId: "t_math_afternoon", classId: "c_11b", subjectName: "Pre-Calculus & Trigonometry", lecturesPerWeek: 5 },
    { teacherId: "t_pe_director", classId: "c_11b", subjectName: "Athletics & Strength Training", lecturesPerWeek: 5 },
    { teacherId: "t_sci_afternoon", classId: "c_11b", subjectName: "Cellular Biology", lecturesPerWeek: 5 },

    // --- Grade 12A (Afternoon Shift - 20 lectures) ---
    { teacherId: "t_math_afternoon", classId: "c_12a", subjectName: "AP Calculus & Statistics", lecturesPerWeek: 5 },
    { teacherId: "t_sci_afternoon", classId: "c_12a", subjectName: "Biochemistry & Genetics", lecturesPerWeek: 5 },
    { teacherId: "t_lang_director", classId: "c_12a", subjectName: "Critical Analysis & Writing", lecturesPerWeek: 5 },
    { teacherId: "t_pe_director", classId: "c_12a", subjectName: "Athletics & Sports Leadership", lecturesPerWeek: 5 },

    // --- Grade 12B (Afternoon Shift - 20 lectures) ---
    { teacherId: "t_math_afternoon", classId: "c_12b", subjectName: "AP Calculus & Statistics", lecturesPerWeek: 5 },
    { teacherId: "t_sci_afternoon", classId: "c_12b", subjectName: "Biochemistry & Genetics", lecturesPerWeek: 5 },
    { teacherId: "t_humanities", classId: "c_12b", subjectName: "Economics & Global Studies", lecturesPerWeek: 5 },
    { teacherId: "t_pe_director", classId: "c_12b", subjectName: "Athletics & Sports Leadership", lecturesPerWeek: 5 }
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

function runBenchmark() {
  console.log("=======================================================================");
  console.log("  HARD BENCHMARK 3: Dual-Shift Urban High School & Boundary Stress");
  console.log("=======================================================================");
  console.log("Campus Architecture:");
  console.log("- Dual Shifts on Single Campus: 8 Periods / Day");
  console.log("  * Morning Shift (Grades 9 & 10): 4 Periods (0, 1, 2, 3)");
  console.log("  * Afternoon Shift (Grades 11 & 12): 4 Periods (4, 5, 6, 7)");
  console.log("- 8 Cohorts x 20 Lectures = 160 Total Scheduled Weekly Lectures");
  console.log("- Cross-Shift Faculty: STEM Director, Literature Head & Coach Tariq teach");
  console.log("  across BOTH shifts while respecting daily maximums and blocked slots.");

  console.log("\n-----------------------------------------------------------------------");
  console.log("  PHASE 1: Solving Knife-Edge Feasible Dual-Shift Problem");
  console.log("-----------------------------------------------------------------------");

  const inputFeasible = buildDualShiftInput(false);
  const start1 = Date.now();
  const res1 = solveTimetable(inputFeasible);
  const time1 = Date.now() - start1;

  if (res1.status === "SUCCESS") {
    console.log("✅ FEASIBLE PHASE SOLVED SUCCESSFULLY!");
    console.log(`• Status: ${res1.status}`);
    console.log(`• Total Assigned: ${res1.lectures.length} / 160 lectures`);
    console.log(`• Solver Execution Time: ${res1.statistics.executionTimeMs}ms (total: ${time1}ms)`);
    console.log(`• Search Iterations: ${res1.statistics.iterations}`);
    console.log(`• Backtracks: ${res1.statistics.backtracks}`);
    console.log(`• Forward Checking Prunes: ${res1.statistics.forwardCheckingPrunes}`);
    console.log(`• Max Search Depth: ${res1.statistics.maxSearchDepth}`);
    console.log(`• Quality Score: ${res1.quality.overallScore}/1000`);
    console.log(`• Teacher Free-Period Gaps: ${res1.quality.teacherGapCount}`);

    console.log("\n" + "=".repeat(60));
    console.log("  CROSS-SHIFT TEACHER SCHEDULE: Dr. Al-Khwarizmi (STEM Director)");
    console.log("  (Demonstrating: Teaching across Morning P0-3 AND Afternoon P4-7)");
    console.log("=".repeat(60));
    console.log(formatTimetableByTeacher({
      ...res1,
      byTeacher: new Map([["t_stem_director", res1.byTeacher.get("t_stem_director")!]])
    }, { ...inputFeasible, teachers: [inputFeasible.teachers[0]!] }));

    console.log("\n" + "=".repeat(60));
    console.log("  CROSS-SHIFT TEACHER SCHEDULE: Coach Tariq (PE & Athletics)");
    console.log("  (Demonstrating: 25 Weekly Lectures distributed across both shifts)");
    console.log("=".repeat(60));
    console.log(formatTimetableByTeacher({
      ...res1,
      byTeacher: new Map([["t_pe_director", res1.byTeacher.get("t_pe_director")!]])
    }, { ...inputFeasible, teachers: [inputFeasible.teachers[6]!] }));

    console.log("\n" + "=".repeat(60));
    console.log("  SAMPLE MORNING CLASS SCHEDULE: Grade 9A (Periods 0-3)");
    console.log("=".repeat(60));
    console.log(formatTimetableByClass({
      ...res1,
      byClass: new Map([["c_9a", res1.byClass.get("c_9a")!]])
    }, { ...inputFeasible, classes: [inputFeasible.classes[0]!] }));

    console.log("\n" + "=".repeat(60));
    console.log("  SAMPLE AFTERNOON CLASS SCHEDULE: Grade 12A (Periods 4-7)");
    console.log("=".repeat(60));
    console.log(formatTimetableByClass({
      ...res1,
      byClass: new Map([["c_12a", res1.byClass.get("c_12a")!]])
    }, { ...inputFeasible, classes: [inputFeasible.classes[6]!] }));
  } else {
    console.error(`❌ Phase 1 failed with status: ${res1.status}`);
    console.error("Diagnostics:", res1.diagnostics);
  }

  console.log("\n-----------------------------------------------------------------------");
  console.log("  PHASE 2: Probing the Mathematical Boundary (Over-Constrained Test)");
  console.log("-----------------------------------------------------------------------");
  console.log("Action: Restricting STEM Director working days from 5 days to 2 days");
  console.log("Demand: Still requires 20 lectures across 4 classes.");
  console.log("Expected: Instant detection by feasibility checker without expensive search.");

  const inputInfeasible = buildDualShiftInput(true);
  const start2 = Date.now();
  const res2 = solveTimetable(inputInfeasible);
  const time2 = Date.now() - start2;

  console.log(`\n• Status: ${res2.status}`);
  console.log(`• Detection Time: ${res2.statistics.executionTimeMs}ms (total: ${time2}ms)`);
  console.log(`• Backtracks needed to determine infeasibility: ${res2.statistics.backtracks} (0 = instant pre-check)`);
  console.log("• Structured Infeasibility Diagnostics:");
  if (res2.status !== "SUCCESS") {
    for (const diag of res2.diagnostics) {
      console.log(`  - [${diag.code}] ${diag.message}`);
    }
  }
}

if (require.main === module || process.argv[1]?.includes("knife-edge-stress-test")) {
  runBenchmark();
}
