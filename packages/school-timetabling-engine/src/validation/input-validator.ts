import type { TimetableInput, DiagnosticViolation } from "../domain/types";

export interface ValidationResult {
  valid: boolean;
  errors: DiagnosticViolation[];
}

export function validateInput(input: TimetableInput): ValidationResult {
  const errors: DiagnosticViolation[] = [];

  if (!input) {
    return {
      valid: false,
      errors: [{ code: "INVALID_INPUT", message: "Input cannot be null or undefined" }]
    };
  }

  const { days, periodsPerDay, classes, teachers, requirements } = input;

  if (!Array.isArray(days)) {
    errors.push({ code: "INVALID_DAYS", message: "School days must be an array" });
  }

  if (typeof periodsPerDay !== "number" || periodsPerDay < 0 || !Number.isInteger(periodsPerDay)) {
    errors.push({
      code: "INVALID_PERIODS_PER_DAY",
      message: "periodsPerDay must be a non-negative integer"
    });
  }

  // 1. Validate Days
  const dayIds = new Set<number>();
  if (Array.isArray(days)) {
    for (const day of days) {
      if (typeof day.id !== "number" || !Number.isInteger(day.id)) {
        errors.push({
          code: "INVALID_DAY_ID",
          message: `Day id must be an integer, got: ${String(day.id)}`
        });
      } else if (dayIds.has(day.id)) {
        errors.push({
          code: "DUPLICATE_DAY_ID",
          message: `Duplicate day ID detected: ${day.id}`,
          day: day.id
        });
      } else {
        dayIds.add(day.id);
      }
    }
  }

  // 2. Validate Classes
  const classIds = new Set<string>();
  if (Array.isArray(classes)) {
    for (const c of classes) {
      if (!c.id || typeof c.id !== "string") {
        errors.push({ code: "INVALID_CLASS_ID", message: "Class id must be a non-empty string" });
      } else if (classIds.has(c.id)) {
        errors.push({
          code: "DUPLICATE_CLASS_ID",
          message: `Duplicate class ID detected: "${c.id}"`,
          classId: c.id
        });
      } else {
        classIds.add(c.id);
      }

      if (typeof c.lecturesPerDay !== "number" || c.lecturesPerDay < 0 || !Number.isInteger(c.lecturesPerDay)) {
        errors.push({
          code: "NEGATIVE_COUNT",
          message: `Class "${c.id}" lecturesPerDay must be a non-negative integer, got: ${c.lecturesPerDay}`,
          classId: c.id
        });
      } else if (c.lecturesPerDay > periodsPerDay) {
        errors.push({
          code: "CLASS_LECTURES_EXCEED_PERIODS",
          message: `Class "${c.id}" lecturesPerDay (${c.lecturesPerDay}) cannot exceed school periodsPerDay (${periodsPerDay})`,
          classId: c.id
        });
      }

      if (c.allowedPeriods) {
        if (!Array.isArray(c.allowedPeriods)) {
          errors.push({
            code: "INVALID_ALLOWED_PERIODS",
            message: `Class "${c.id}" allowedPeriods must be an array`,
            classId: c.id
          });
        } else {
          if (c.allowedPeriods.length !== c.lecturesPerDay) {
            errors.push({
              code: "ALLOWED_PERIODS_MISMATCH",
              message: `Class "${c.id}" allowedPeriods length (${c.allowedPeriods.length}) must match lecturesPerDay (${c.lecturesPerDay})`,
              classId: c.id
            });
          }
          const seenP = new Set<number>();
          for (const p of c.allowedPeriods) {
            if (typeof p !== "number" || p < 0 || p >= periodsPerDay || !Number.isInteger(p)) {
              errors.push({
                code: "INVALID_PERIOD_INDEX",
                message: `Class "${c.id}" has invalid allowed period index: ${p} (school periods: 0..${periodsPerDay - 1})`,
                classId: c.id,
                period: p
              });
            } else if (seenP.has(p)) {
              errors.push({
                code: "DUPLICATE_ALLOWED_PERIOD",
                message: `Class "${c.id}" has duplicate allowed period: ${p}`,
                classId: c.id,
                period: p
              });
            } else {
              seenP.add(p);
            }
          }
        }
      }
    }
  }

  // 3. Validate Teachers
  const teacherIds = new Set<string>();
  if (Array.isArray(teachers)) {
    for (const t of teachers) {
      if (!t.id || typeof t.id !== "string") {
        errors.push({ code: "INVALID_TEACHER_ID", message: "Teacher id must be a non-empty string" });
      } else if (teacherIds.has(t.id)) {
        errors.push({
          code: "DUPLICATE_TEACHER_ID",
          message: `Duplicate teacher ID detected: "${t.id}"`,
          teacherId: t.id
        });
      } else {
        teacherIds.add(t.id);
      }

      if (!Array.isArray(t.workingDays)) {
        errors.push({
          code: "INVALID_WORKING_DAYS",
          message: `Teacher "${t.id}" workingDays must be an array`,
          teacherId: t.id
        });
      } else {
        const seenDays = new Set<number>();
        for (const d of t.workingDays) {
          if (!dayIds.has(d)) {
            errors.push({
              code: "INVALID_WORKING_DAY",
              message: `Teacher "${t.id}" references unknown day ID: ${d}`,
              teacherId: t.id,
              day: d
            });
          }
          if (seenDays.has(d)) {
            errors.push({
              code: "DUPLICATE_WORKING_DAY",
              message: `Teacher "${t.id}" has duplicate working day ID: ${d}`,
              teacherId: t.id,
              day: d
            });
          }
          seenDays.add(d);
        }
      }

      if (t.blockedSlots) {
        if (!Array.isArray(t.blockedSlots)) {
          errors.push({
            code: "INVALID_BLOCKED_SLOTS",
            message: `Teacher "${t.id}" blockedSlots must be an array`,
            teacherId: t.id
          });
        } else {
          const seenSlots = new Set<string>();
          for (const slot of t.blockedSlots) {
            if (!dayIds.has(slot.day)) {
              errors.push({
                code: "INVALID_BLOCKED_SLOT_DAY",
                message: `Teacher "${t.id}" blocked slot references unknown day: ${slot.day}`,
                teacherId: t.id,
                day: slot.day
              });
            }
            if (typeof slot.period !== "number" || slot.period < 0 || slot.period >= periodsPerDay || !Number.isInteger(slot.period)) {
              errors.push({
                code: "INVALID_BLOCKED_SLOT_PERIOD",
                message: `Teacher "${t.id}" blocked slot has invalid period: ${slot.period}`,
                teacherId: t.id,
                period: slot.period
              });
            }
            const key = `${slot.day},${slot.period}`;
            if (seenSlots.has(key)) {
              errors.push({
                code: "DUPLICATE_BLOCKED_SLOT",
                message: `Teacher "${t.id}" has duplicate blocked slot at day ${slot.day}, period ${slot.period}`,
                teacherId: t.id,
                day: slot.day,
                period: slot.period
              });
            }
            seenSlots.add(key);
          }
        }
      }

      if (t.maxLecturesPerDay !== undefined) {
        if (typeof t.maxLecturesPerDay !== "number" || t.maxLecturesPerDay < 0 || !Number.isInteger(t.maxLecturesPerDay)) {
          errors.push({
            code: "NEGATIVE_COUNT",
            message: `Teacher "${t.id}" maxLecturesPerDay must be a non-negative integer`,
            teacherId: t.id
          });
        }
      }
    }
  }

  // 4. Validate Requirements
  const reqIds = new Set<string>();
  if (Array.isArray(requirements)) {
    for (let i = 0; i < requirements.length; i++) {
      const r = requirements[i]!;
      const reqId = r.id ?? `${r.teacherId}__${r.classId}__${r.subjectId ?? "default"}`;

      if (reqIds.has(reqId)) {
        errors.push({
          code: "DUPLICATE_REQUIREMENT_ID",
          message: `Duplicate requirement ID: "${reqId}"`,
          details: { requirementId: reqId }
        });
      }
      reqIds.add(reqId);

      if (!teacherIds.has(r.teacherId)) {
        errors.push({
          code: "UNKNOWN_TEACHER_REFERENCE",
          message: `Requirement "${reqId}" references unknown teacherId: "${r.teacherId}"`,
          teacherId: r.teacherId
        });
      }

      if (!classIds.has(r.classId)) {
        errors.push({
          code: "UNKNOWN_CLASS_REFERENCE",
          message: `Requirement "${reqId}" references unknown classId: "${r.classId}"`,
          classId: r.classId
        });
      }

      if (typeof r.lecturesPerWeek !== "number" || r.lecturesPerWeek < 0 || !Number.isInteger(r.lecturesPerWeek)) {
        errors.push({
          code: "NEGATIVE_COUNT",
          message: `Requirement "${reqId}" lecturesPerWeek must be a non-negative integer, got: ${r.lecturesPerWeek}`
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
