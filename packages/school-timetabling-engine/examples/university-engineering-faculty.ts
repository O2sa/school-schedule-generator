import {
  solveTimetable,
  formatTimetableByClass,
  formatTimetableByTeacher,
  type TimetableInput,
  type ClassDefinition,
  type TeacherDefinition,
  type TeachingRequirement,
  type HardConstraint,
  type AssignmentCandidate,
  type ReadonlyScheduleState
} from "../src/index";

/**
 * Custom Hard Constraint: Max Three Consecutive Lectures
 *
 * Ensures no professor or instructor is scheduled for 4 or more consecutive
 * periods without a rest / research / office-hours period.
 */
export class MaxThreeConsecutiveLecturesConstraint implements HardConstraint {
  readonly id = "CUSTOM_MAX_THREE_CONSECUTIVE";
  readonly description = "Instructors cannot teach 4 or more consecutive periods without a break";

  isSatisfied(candidate: AssignmentCandidate, state: ReadonlyScheduleState): boolean {
    const { teacherId, day, period } = candidate;

    // Pattern 1: [period - 3, period - 2, period - 1, (period)]
    if (
      period >= 3 &&
      state.isTeacherAssigned(teacherId, day, period - 1) &&
      state.isTeacherAssigned(teacherId, day, period - 2) &&
      state.isTeacherAssigned(teacherId, day, period - 3)
    ) {
      return false;
    }

    // Pattern 2: [period - 2, period - 1, (period), period + 1]
    if (
      period >= 2 &&
      state.isTeacherAssigned(teacherId, day, period - 2) &&
      state.isTeacherAssigned(teacherId, day, period - 1) &&
      state.isTeacherAssigned(teacherId, day, period + 1)
    ) {
      return false;
    }

    // Pattern 3: [period - 1, (period), period + 1, period + 2]
    if (
      period >= 1 &&
      state.isTeacherAssigned(teacherId, day, period - 1) &&
      state.isTeacherAssigned(teacherId, day, period + 1) &&
      state.isTeacherAssigned(teacherId, day, period + 2)
    ) {
      return false;
    }

    // Pattern 4: [(period), period + 1, period + 2, period + 3]
    if (
      state.isTeacherAssigned(teacherId, day, period + 1) &&
      state.isTeacherAssigned(teacherId, day, period + 2) &&
      state.isTeacherAssigned(teacherId, day, period + 3)
    ) {
      return false;
    }

    return true;
  }
}

/**
 * Hard Example 2: University Computer Science Department
 *
 * Real-world characteristics demonstrated:
 * 1. 4 Undergraduate Degree Cohorts (Freshmen, Sophomores, Juniors, Seniors):
 *    - Freshmen: Morning core blocks (Periods 0, 1, 2, 4)
 *    - Sophomores: Midday lecture blocks (Periods 0, 1, 4, 5)
 *    - Juniors: Afternoon systems & theory blocks (Periods 1, 2, 4, 5)
 *    - Seniors: Late afternoon advanced electives & seminar blocks (Periods 2, 4, 5, 6)
 * 2. Synchronized Faculty Board Meeting:
 *    - Wednesday Period 3 is reserved for the entire department assembly.
 *    - Every professor has Wednesday Period 3 blocked simultaneously.
 *    - All cohort allowedPeriods deliberately omit Period 3 (Campus Activity Hour).
 * 3. Dedicated Professor Research Days:
 *    - Prof. Turing: Friday off (Research & Government Consulting)
 *    - Prof. Lovelace: Thursday off (Compiler Architecture Lab)
 *    - Prof. Shannon: Monday off (Information Theory Research)
 *    - Prof. Dijkstra: Friday off (Formal Verification Group)
 *    - Prof. Hopper: Tuesday off (Industry Standards Committee)
 *    - Dr. Norvig: Tuesday off (AI Lab Directorship)
 * 4. Multi-Course Teaching:
 *    - Eminent faculty teach multiple distinct undergraduate subjects across different cohorts.
 * 5. Custom Domain Constraint:
 *    - MaxThreeConsecutiveLecturesConstraint: prevents consecutive teaching marathons.
 */
export function buildUniversityDepartmentInput(): TimetableInput {
  const days = [
    { id: 0, name: "Monday" },
    { id: 1, name: "Tuesday" },
    { id: 2, name: "Wednesday" },
    { id: 3, name: "Thursday" },
    { id: 4, name: "Friday" }
  ];

  const periodsPerDay = 7; // Periods 0 to 6

  // Wednesday Period 3 is the Department Council / Campus Hour slot
  const facultyBoardMeeting = { day: 2, period: 3 };

  const classes: ClassDefinition[] = [
    {
      id: "cs_freshman",
      name: "B.Sc. CS Year 1 (Freshmen)",
      lecturesPerDay: 4,
      allowedPeriods: [0, 1, 2, 4] // Morning schedule
    },
    {
      id: "cs_sophomore",
      name: "B.Sc. CS Year 2 (Sophomores)",
      lecturesPerDay: 4,
      allowedPeriods: [0, 1, 4, 5] // Midday schedule
    },
    {
      id: "cs_junior",
      name: "B.Sc. CS Year 3 (Juniors)",
      lecturesPerDay: 4,
      allowedPeriods: [1, 2, 4, 5] // Afternoon schedule
    },
    {
      id: "cs_senior",
      name: "B.Sc. CS Year 4 (Seniors)",
      lecturesPerDay: 4,
      allowedPeriods: [2, 4, 5, 6] // Late afternoon / Lab schedule
    }
  ];

  const teachers: TeacherDefinition[] = [
    {
      id: "prof_turing",
      name: "Prof. Alan Turing (Theory & AI)",
      workingDays: [0, 1, 2, 3], // Mon-Thu (Friday Research)
      maxLecturesPerDay: 4,
      blockedSlots: [facultyBoardMeeting, { day: 0, period: 0 }]
    },
    {
      id: "prof_lovelace",
      name: "Prof. Ada Lovelace (Software & Compilers)",
      workingDays: [0, 1, 2, 4], // Mon, Tue, Wed, Fri (Thursday Research)
      maxLecturesPerDay: 4,
      blockedSlots: [facultyBoardMeeting]
    },
    {
      id: "prof_knuth",
      name: "Prof. Donald Knuth (Algorithms & Discrete Math)",
      workingDays: [0, 1, 2, 3, 4],
      maxLecturesPerDay: 4,
      blockedSlots: [facultyBoardMeeting]
    },
    {
      id: "prof_shannon",
      name: "Prof. Claude Shannon (Networks & Cryptography)",
      workingDays: [1, 2, 3, 4], // Tue-Fri (Monday Research)
      maxLecturesPerDay: 4,
      blockedSlots: [facultyBoardMeeting]
    },
    {
      id: "prof_dijkstra",
      name: "Prof. Edsger Dijkstra (Operating Systems & Concurrency)",
      workingDays: [0, 1, 2, 3], // Mon-Thu (Friday Research)
      maxLecturesPerDay: 4,
      blockedSlots: [facultyBoardMeeting]
    },
    {
      id: "prof_hopper",
      name: "Prof. Grace Hopper (Systems, Cloud & DevOps)",
      workingDays: [0, 1, 3, 4], // Mon, Tue, Thu, Fri (Wednesday Research)
      maxLecturesPerDay: 4,
      blockedSlots: [facultyBoardMeeting]
    },
    {
      id: "dr_norvig",
      name: "Dr. Peter Norvig (Machine Learning & NLP)",
      workingDays: [0, 2, 3, 4], // Mon, Wed, Thu, Fri (Tuesday Research)
      maxLecturesPerDay: 4,
      blockedSlots: [facultyBoardMeeting]
    },
    {
      id: "dr_wing",
      name: "Dr. Jeannette Wing (Thinking, Security & Trust)",
      workingDays: [0, 1, 2, 3, 4],
      maxLecturesPerDay: 4,
      blockedSlots: [facultyBoardMeeting]
    }
  ];

  // 4 Cohorts x 20 weekly lectures = 80 lectures total
  const requirements: TeachingRequirement[] = [
    // --- Freshmen (20 lectures) ---
    { teacherId: "prof_knuth", classId: "cs_freshman", subjectId: "cs101", subjectName: "Discrete Mathematics", lecturesPerWeek: 5 },
    { teacherId: "prof_lovelace", classId: "cs_freshman", subjectId: "cs102", subjectName: "Intro to Computer Science", lecturesPerWeek: 5 },
    { teacherId: "dr_wing", classId: "cs_freshman", subjectId: "cs103", subjectName: "Computational Thinking", lecturesPerWeek: 5 },
    { teacherId: "prof_hopper", classId: "cs_freshman", subjectId: "cs104", subjectName: "Computer Architecture Lab", lecturesPerWeek: 5 },

    // --- Sophomores (20 lectures) ---
    { teacherId: "prof_knuth", classId: "cs_sophomore", subjectId: "cs201", subjectName: "Data Structures & Algorithms", lecturesPerWeek: 5 },
    { teacherId: "prof_dijkstra", classId: "cs_sophomore", subjectId: "cs202", subjectName: "Operating Systems Principles", lecturesPerWeek: 5 },
    { teacherId: "prof_shannon", classId: "cs_sophomore", subjectId: "cs203", subjectName: "Data Communications & Networks", lecturesPerWeek: 5 },
    { teacherId: "prof_turing", classId: "cs_sophomore", subjectId: "cs204", subjectName: "Automata & Computability", lecturesPerWeek: 5 },

    // --- Juniors (20 lectures) ---
    { teacherId: "prof_lovelace", classId: "cs_junior", subjectId: "cs301", subjectName: "Compiler Construction", lecturesPerWeek: 5 },
    { teacherId: "prof_shannon", classId: "cs_junior", subjectId: "cs302", subjectName: "Applied Cryptography & Security", lecturesPerWeek: 5 },
    { teacherId: "prof_dijkstra", classId: "cs_junior", subjectName: "Concurrent & Distributed Systems", lecturesPerWeek: 5 },
    { teacherId: "dr_norvig", classId: "cs_junior", subjectName: "Machine Learning Foundations", lecturesPerWeek: 5 },

    // --- Seniors (20 lectures) ---
    { teacherId: "prof_turing", classId: "cs_senior", subjectId: "cs401", subjectName: "Artificial Intelligence Seminar", lecturesPerWeek: 5 },
    { teacherId: "dr_wing", classId: "cs_senior", subjectId: "cs402", subjectName: "Formal Verification & Security", lecturesPerWeek: 5 },
    { teacherId: "prof_hopper", classId: "cs_senior", subjectId: "cs403", subjectName: "Cloud Computing & Site Reliability", lecturesPerWeek: 5 },
    { teacherId: "dr_norvig", classId: "cs_senior", subjectId: "cs404", subjectName: "Natural Language Processing", lecturesPerWeek: 5 }
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
      balanceWorkload: true,
      customConstraints: [new MaxThreeConsecutiveLecturesConstraint()]
    }
  };
}

function main() {
  console.log("=======================================================================");
  console.log("  COMPLEX BENCHMARK 2: University Computer Science Department");
  console.log("=======================================================================");
  console.log("Academic Setup:");
  console.log("- 4 Degree Cohorts: Freshmen, Sophomores, Juniors, Seniors");
  console.log("- 80 Total Weekly Lectures across 7 Daily Periods");
  console.log("- 8 Multi-Course Professors with Shared Cross-Cohort Teaching");
  console.log("- Synchronized Department Meeting: Wed Period 3 blocked for ALL faculty");
  console.log("- Asymmetric Cohort Shifts (Morning vs Midday vs Afternoon)");
  console.log("- Custom Hard Constraint: Max 3 consecutive lectures per instructor");
  console.log("\nSolving with custom constraints...");

  const input = buildUniversityDepartmentInput();
  const startTime = Date.now();
  const result = solveTimetable(input);
  const elapsed = Date.now() - startTime;

  if (result.status === "SUCCESS") {
    console.log("\n✅ TIMETABLE GENERATED SUCCESSFULLY!");
    console.log(`• Status: ${result.status}`);
    console.log(`• Total Scheduled: ${result.lectures.length} / 80 lectures`);
    console.log(`• Solver Execution Time: ${result.statistics.executionTimeMs}ms (total: ${elapsed}ms)`);
    console.log(`• Iterations: ${result.statistics.iterations}`);
    console.log(`• Backtracks: ${result.statistics.backtracks}`);
    console.log(`• Forward Checking Prunes: ${result.statistics.forwardCheckingPrunes}`);
    console.log(`• Max Search Depth: ${result.statistics.maxSearchDepth}`);
    console.log(`• Quality Score: ${result.quality.overallScore}/1000`);
    console.log(`• Teacher Free-Period Gaps: ${result.quality.teacherGapCount}`);
    console.log(`• Teacher Daily Load Variance: ${result.quality.teacherDailyLoadVariance.toFixed(2)}`);

    console.log("\n" + "=".repeat(60));
    console.log("  COHORT SCHEDULE: CS Freshmen (Morning: Periods 0, 1, 2, 4)");
    console.log("=".repeat(60));
    console.log(formatTimetableByClass({
      ...result,
      byClass: new Map([["cs_freshman", result.byClass.get("cs_freshman")!]])
    }, { ...input, classes: [input.classes[0]!] }));

    console.log("\n" + "=".repeat(60));
    console.log("  COHORT SCHEDULE: CS Seniors (Afternoon: Periods 2, 4, 5, 6)");
    console.log("=".repeat(60));
    console.log(formatTimetableByClass({
      ...result,
      byClass: new Map([["cs_senior", result.byClass.get("cs_senior")!]])
    }, { ...input, classes: [input.classes[3]!] }));

    console.log("\n" + "=".repeat(60));
    console.log("  PROFESSOR SCHEDULE: Prof. Donald Knuth (CS Freshmen & CS Sophomores)");
    console.log("  (Demonstrates: Synchronized Wed P3 Council Meeting & Break Compliance)");
    console.log("=".repeat(60));
    console.log(formatTimetableByTeacher({
      ...result,
      byTeacher: new Map([["prof_knuth", result.byTeacher.get("prof_knuth")!]])
    }, { ...input, teachers: [input.teachers[2]!] }));

    console.log("\n" + "=".repeat(60));
    console.log("  PROFESSOR SCHEDULE: Prof. Alan Turing (CS Sophomores & CS Seniors)");
    console.log("  (Demonstrates: Friday Research Off, Mon P0 Briefing & Wed P3 Meeting)");
    console.log("=".repeat(60));
    console.log(formatTimetableByTeacher({
      ...result,
      byTeacher: new Map([["prof_turing", result.byTeacher.get("prof_turing")!]])
    }, { ...input, teachers: [input.teachers[0]!] }));
  } else {
    console.error(`❌ Solver ended with status: ${result.status}`);
    console.error("Statistics:", result.statistics);
    console.error("Diagnostics:", JSON.stringify(result.diagnostics, null, 2));
    process.exit(1);
  }
}

if (require.main === module || process.argv[1]?.includes("university-engineering-faculty")) {
  main();
}
