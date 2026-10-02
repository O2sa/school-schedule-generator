import { solveTimetable } from "../src/index";
import type { TimetableInput } from "../src/index";

// Demonstrates early detection and transparent diagnostics for impossible configurations
const input: TimetableInput = {
  days: [
    { id: 0, name: "Day 0" },
    { id: 1, name: "Day 1" }
  ],
  periodsPerDay: 4,
  classes: [
    { id: "class_a", name: "Class A", lecturesPerDay: 4 } // 2 days * 4 = 8 lectures required
  ],
  teachers: [
    {
      id: "teacher_x",
      name: "Teacher X",
      workingDays: [0], // Only 1 day = 4 periods max!
      blockedSlots: [{ day: 0, period: 3 }] // 3 usable slots max!
    }
  ],
  requirements: [
    // Requirement requests 8 lectures, but Teacher X only has 3 usable slots!
    { teacherId: "teacher_x", classId: "class_a", lecturesPerWeek: 8 }
  ]
};

console.log("Attempting to solve impossible timetable...");
const result = solveTimetable(input);

console.log("Status:", result.status);
if (result.status === "INFEASIBLE") {
  console.log("\nStructured Diagnostics:");
  for (const diag of result.diagnostics) {
    console.log(`- [${diag.code}] ${diag.message}`);
  }
}
