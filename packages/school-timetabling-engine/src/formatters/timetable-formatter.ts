import type { TimetableInput, TimetableResult, ScheduledLecture } from "../domain/types";

export function formatTimetableByClass(result: TimetableResult, input: TimetableInput): string {
  if (result.status !== "SUCCESS") {
    return `Timetable status: ${result.status}`;
  }

  const teacherMap = new Map(input.teachers.map(t => [t.id, t.name || t.id]));
  const dayNames = input.days.map(d => d.name ?? `Day ${d.id}`);

  const sections: string[] = [];

  for (const schoolClass of input.classes) {
    const classLectures = result.byClass.get(schoolClass.id) ?? [];
    const grid = new Map<string, ScheduledLecture>();
    for (const lec of classLectures) {
      grid.set(`${lec.day},${lec.period}`, lec);
    }

    const lines: string[] = [];
    lines.push(`### Class: ${schoolClass.name} (${schoolClass.id})`);
    lines.push("");

    // Markdown Table Header: Period | Day 0 | Day 1 | ...
    const header = `| Period | ${dayNames.join(" | ")} |`;
    const separator = `|:---|${dayNames.map(() => ":---").join("|")}|`;
    lines.push(header);
    lines.push(separator);

    for (let p = 0; p < input.periodsPerDay; p++) {
      const rowCells: string[] = [`Period ${p}`];
      for (const day of input.days) {
        const lec = grid.get(`${day.id},${p}`);
        if (lec) {
          const teacherName = teacherMap.get(lec.teacherId) ?? lec.teacherId;
          const subject = lec.subjectName ?? lec.subjectId ?? "";
          const cell = subject ? `${subject} (${teacherName})` : teacherName;
          rowCells.push(cell);
        } else {
          rowCells.push("-");
        }
      }
      lines.push(`| ${rowCells.join(" | ")} |`);
    }

    lines.push("");
    sections.push(lines.join("\n"));
  }

  return sections.join("\n\n");
}

export function formatTimetableByTeacher(result: TimetableResult, input: TimetableInput): string {
  if (result.status !== "SUCCESS") {
    return `Timetable status: ${result.status}`;
  }

  const classMap = new Map(input.classes.map(c => [c.id, c.name || c.id]));
  const dayNames = input.days.map(d => d.name ?? `Day ${d.id}`);

  const sections: string[] = [];

  for (const teacher of input.teachers) {
    const teacherLectures = result.byTeacher.get(teacher.id) ?? [];
    const grid = new Map<string, ScheduledLecture>();
    for (const lec of teacherLectures) {
      grid.set(`${lec.day},${lec.period}`, lec);
    }

    const lines: string[] = [];
    lines.push(`### Teacher: ${teacher.name} (${teacher.id})`);
    lines.push("");

    const header = `| Period | ${dayNames.join(" | ")} |`;
    const separator = `|:---|${dayNames.map(() => ":---").join("|")}|`;
    lines.push(header);
    lines.push(separator);

    for (let p = 0; p < input.periodsPerDay; p++) {
      const rowCells: string[] = [`Period ${p}`];
      for (const day of input.days) {
        const lec = grid.get(`${day.id},${p}`);
        if (lec) {
          const className = classMap.get(lec.classId) ?? lec.classId;
          const subject = lec.subjectName ?? lec.subjectId ?? "";
          const cell = subject ? `${className} - ${subject}` : className;
          rowCells.push(cell);
        } else if (!teacher.workingDays.includes(day.id)) {
          rowCells.push("OFF");
        } else if (teacher.blockedSlots?.some(s => s.day === day.id && s.period === p)) {
          rowCells.push("BLOCKED");
        } else {
          rowCells.push("-");
        }
      }
      lines.push(`| ${rowCells.join(" | ")} |`);
    }

    lines.push("");
    sections.push(lines.join("\n"));
  }

  return sections.join("\n\n");
}
