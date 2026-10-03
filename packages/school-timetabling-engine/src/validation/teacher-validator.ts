export interface TeacherCapacityInput {
  workingDays: number[];
  periodsPerDay: number;
  unavailableSlots?: Array<{
    dayIndex?: number;
    periodIndex?: number;
    day?: number;
    period?: number;
  }>;
  maxWeeklyPeriods?: number;
  maxDailyPeriods?: number;
  assignedCurriculumPeriods?: number;
}

export interface TeacherCapacityValidationResult {
  valid: boolean;
  totalWorkingSlots: number;
  blockedSlotsCount: number;
  availableSlotsCount: number;
  effectiveCapacity: number;
  neededLectures: number;
  error?: string;
  code?: 'CAPACITY_EXCEEDED' | 'DAILY_CAPACITY_EXCEEDED';
}

/**
 * Validates whether a teacher's needed lectures can be scheduled given their availability
 * and daily workload limits.
 *
 * Rules:
 * 1. neededLectures = max(maxWeeklyPeriods, assignedCurriculumPeriods)
 * 2. If neededLectures > availableSlotsCount => CAPACITY_EXCEEDED (cannot save)
 * 3. If neededLectures > effectiveCapacity => DAILY_CAPACITY_EXCEEDED (cannot save)
 */
export function validateTeacherCapacity(input: TeacherCapacityInput): TeacherCapacityValidationResult {
  const workingDays = input.workingDays ?? [0, 1, 2, 3, 4];
  const periodsPerDay = input.periodsPerDay ?? 7;
  const maxDaily = input.maxDailyPeriods ?? periodsPerDay;
  const neededLectures = Math.max(
    input.maxWeeklyPeriods ?? 0,
    input.assignedCurriculumPeriods ?? 0
  );

  const blockedSet = new Set<string>();
  if (input.unavailableSlots) {
    for (const slot of input.unavailableSlots) {
      const d = slot.dayIndex !== undefined ? slot.dayIndex : (slot.day ?? 0);
      const p = slot.periodIndex !== undefined ? slot.periodIndex : (slot.period ?? 0);
      blockedSet.add(`${d},${p}`);
    }
  }

  let totalWorkingSlots = 0;
  let availableSlotsCount = 0;
  let effectiveCapacity = 0;

  for (const d of workingDays) {
    let usableOnDay = 0;
    for (let p = 0; p < periodsPerDay; p++) {
      totalWorkingSlots++;
      if (!blockedSet.has(`${d},${p}`)) {
        usableOnDay++;
      }
    }
    availableSlotsCount += usableOnDay;
    effectiveCapacity += Math.min(usableOnDay, maxDaily);
  }

  const blockedSlotsCount = totalWorkingSlots - availableSlotsCount;

  if (neededLectures > availableSlotsCount) {
    return {
      valid: false,
      totalWorkingSlots,
      blockedSlotsCount,
      availableSlotsCount,
      effectiveCapacity,
      neededLectures,
      code: 'CAPACITY_EXCEEDED',
      error: `عدد الحصص المطلوبة للمعلم (${neededLectures} حصة) أكبر من عدد الفترات المتاحة فعلياً (${availableSlotsCount} فترة). يرجى تقليل النصاب أو تقليل الفترات المحظورة.`
    };
  }

  if (neededLectures > effectiveCapacity) {
    return {
      valid: false,
      totalWorkingSlots,
      blockedSlotsCount,
      availableSlotsCount,
      effectiveCapacity,
      neededLectures,
      code: 'DAILY_CAPACITY_EXCEEDED',
      error: `عدد الحصص المطلوبة للمعلم (${neededLectures} حصة) يتجاوز الطاقة الاستيعابية اليومية المتاحة (${effectiveCapacity} حصة) بناءً على الحد اليومي (${maxDaily} حصص/يوم).`
    };
  }

  return {
    valid: true,
    totalWorkingSlots,
    blockedSlotsCount,
    availableSlotsCount,
    effectiveCapacity,
    neededLectures
  };
}
