import { solveTimetable, formatTimetableByClass, formatTimetableByTeacher } from "../src/index";
import type { TimetableInput } from "../src/index";

const input: TimetableInput = {
  days: [
    { id: 0, name: "Monday" },
    { id: 1, name: "Tuesday" },
    { id: 2, name: "Wednesday" },
    { id: 3, name: "Thursday" },
    { id: 4, name: "Friday" }
  ],
  periodsPerDay: 4,
  classes: [
    { id: "class_9a", name: "Grade 9A", lecturesPerDay: 4 },
    { id: "class_9b", name: "Grade 9B", lecturesPerDay: 4 }
  ],
  teachers: [
    { id: "t_math", name: "Dr. Euler (Math)", workingDays: [0, 1, 2, 3, 4] },
    { id: "t_eng", name: "Ms. Austen (English)", workingDays: [0, 1, 2, 3, 4] },
    { id: "t_sci", name: "Dr. Curie (Science)", workingDays: [0, 1, 2, 3, 4] },
    { id: "t_hist", name: "Mr. Herodotus (History)", workingDays: [0, 1, 2, 3, 4] }
  ],
  requirements: [
    { teacherId: "t_math", classId: "class_9a", subjectName: "Math", lecturesPerWeek: 5 },
    { teacherId: "t_eng", classId: "class_9a", subjectName: "English", lecturesPerWeek: 5 },
    { teacherId: "t_sci", classId: "class_9a", subjectName: "Science", lecturesPerWeek: 5 },
    { teacherId: "t_hist", classId: "class_9a", subjectName: "History", lecturesPerWeek: 5 },
    { teacherId: "t_math", classId: "class_9b", subjectName: "Math", lecturesPerWeek: 5 },
    { teacherId: "t_eng", classId: "class_9b", subjectName: "English", lecturesPerWeek: 5 },
    { teacherId: "t_sci", classId: "class_9b", subjectName: "Science", lecturesPerWeek: 5 },
    { teacherId: "t_hist", classId: "class_9b", subjectName: "History", lecturesPerWeek: 5 }
  ]
};

console.log("Solving basic school timetable...");
const result = solveTimetable(input);

if (result.status === "SUCCESS") {
  console.log("\nTimetable generated successfully!");
  console.log(`Execution Time: ${result.statistics.executionTimeMs}ms`);
  console.log(`Iterations: ${result.statistics.iterations}`);
  console.log(`Quality Score: ${result.quality.overallScore}/1000`);
  console.log(`Teacher Gaps: ${result.quality.teacherGapCount}`);
  console.log("\n--- Class Timetable ---");
  console.log(formatTimetableByClass(result, input));
  console.log("\n--- Teacher Timetable ---");
  console.log(formatTimetableByTeacher(result, input));
} else {
  console.error("Failed to solve:", result);
}
