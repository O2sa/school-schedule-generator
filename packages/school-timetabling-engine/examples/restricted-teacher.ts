import { solveTimetable, formatTimetableByClass } from "../src/index";
import type { TimetableInput } from "../src/index";

// Demonstrates scheduling with part-time teachers and blocked slots
const input: TimetableInput = {
  days: [
    { id: 0, name: "Sunday" },
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" }
  ],
  periodsPerDay: 5,
  classes: [
    { id: "class_1", name: "Section 1", lecturesPerDay: 5 } // 25 total
  ],
  teachers: [
    {
      id: "t_part_time",
      name: "Prof. Restricted (Physics)",
      workingDays: [0, 2], // Only works Sunday and Tuesday
      blockedSlots: [{ day: 0, period: 0 }] // Blocked Sunday morning
    },
    {
      id: "t_full_time",
      name: "Prof. Available (All Subjects)",
      workingDays: [0, 1, 2, 3, 4]
    }
  ],
  requirements: [
    { teacherId: "t_part_time", classId: "class_1", subjectName: "Physics", lecturesPerWeek: 6 },
    { teacherId: "t_full_time", classId: "class_1", subjectName: "General", lecturesPerWeek: 19 }
  ]
};

console.log("Solving timetable with restricted teacher...");
const result = solveTimetable(input);

if (result.status === "SUCCESS") {
  console.log("SUCCESS!");
  console.log("\nTimetable generated successfully!");
  console.log(`Execution Time: ${result.statistics.executionTimeMs}ms`);
  console.log(`Iterations: ${result.statistics.iterations}`);
  console.log(`Quality Score: ${result.quality.overallScore}/1000`);
  console.log(`Teacher Gaps: ${result.quality.teacherGapCount}`);
  console.log(formatTimetableByClass(result, input));
} else {
  console.error("Result:", result);
}
