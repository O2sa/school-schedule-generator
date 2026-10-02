import type { ScheduledLecture, SchoolDay, QualityMetrics } from "../domain/types";
import type { NormalizedTeacher } from "../domain/models";

export function calculateQualityMetrics(
  lectures: ScheduledLecture[],
  teachers: Map<string, NormalizedTeacher>,
  days: SchoolDay[],
  periodsPerDay: number
): QualityMetrics {
  const totalAssigned = lectures.length;

  // Build grid per teacher: teacherId -> Map<day, Set<period>>
  const teacherPeriodsByDay = new Map<string, Map<number, Set<number>>>();
  for (const [tId] of teachers) {
    const dayMap = new Map<number, Set<number>>();
    for (const d of days) {
      dayMap.set(d.id, new Set<number>());
    }
    teacherPeriodsByDay.set(tId, dayMap);
  }

  for (const lec of lectures) {
    teacherPeriodsByDay.get(lec.teacherId)?.get(lec.day)?.add(lec.period);
  }

  let totalGaps = 0;
  let totalVarianceSum = 0;
  let teacherCountWithWorkingDays = 0;

  for (const [tId, teacher] of teachers) {
    if (teacher.workingDays.size === 0) continue;
    teacherCountWithWorkingDays++;

    const dailyCounts: number[] = [];

    for (const day of teacher.workingDays) {
      const periods = teacherPeriodsByDay.get(tId)?.get(day) ?? new Set<number>();
      dailyCounts.push(periods.size);

      if (periods.size > 1) {
        let minPeriod = periodsPerDay;
        let maxPeriod = -1;
        for (const p of periods) {
          if (p < minPeriod) minPeriod = p;
          if (p > maxPeriod) maxPeriod = p;
        }

        // Count empty periods between min and max
        for (let p = minPeriod + 1; p < maxPeriod; p++) {
          if (!periods.has(p)) {
            totalGaps++;
          }
        }
      }
    }

    // Variance across working days
    const mean = dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length;
    const variance = dailyCounts.reduce((acc, count) => acc + (count - mean) ** 2, 0) / dailyCounts.length;
    totalVarianceSum += variance;
  }

  const avgVariance = teacherCountWithWorkingDays > 0
    ? totalVarianceSum / teacherCountWithWorkingDays
    : 0;

  const overallScore = Math.max(
    0,
    Math.round(1000 - totalGaps * 25 - avgVariance * 50)
  );

  return {
    totalAssigned,
    teacherGapCount: totalGaps,
    teacherDailyLoadVariance: Math.round(avgVariance * 100) / 100,
    overallScore
  };
}
