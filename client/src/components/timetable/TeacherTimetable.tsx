import { useTranslation } from "../../i18n";
import React from 'react';
import { Table, Card, Text, Badge, Group, Progress, useComputedColorScheme } from '@mantine/core';
import type { TeacherRecord, ClassRecord, SubjectRecord, TimetableAssignment } from '../../api/types';
import type { TimetableEditorProps } from './ClassTimetable';

interface TeacherTimetableProps {
  teacher: TeacherRecord;
  assignments: TimetableAssignment[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  editorProps?: TimetableEditorProps;
  workingDays?: number[];
  periodsCount?: number;
}

export function TeacherTimetable({
  teacher,
  assignments,
  classes,
  subjects,
  editorProps,
  workingDays,
  periodsCount,
}: TeacherTimetableProps) {
  const activeDays = workingDays ?? [0, 1, 2, 3, 4];
  const maxPeriods = periodsCount || (classes.length > 0 ? Math.max(...classes.map((c) => c.periodsPerDay || 7), 7) : 7);
  const periods = Array.from({ length: maxPeriods }, (_, i) => i);
  const { t } = useTranslation();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';
  const DAYS: string[] = t('common.days');
  const classMap = new Map(classes.map((c) => [c.id, c]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const teacherAssignments = assignments.filter((a) => a.teacherId === teacher.id);
  const grid = new Map<string, TimetableAssignment>();
  teacherAssignments.forEach((a) => {
    grid.set(`${a.dayIndex}__${a.periodIndex}`, a);
  });

  const isBlocked = (day: number, period: number) =>
    teacher.unavailableSlots?.some((s) => s.dayIndex === day && s.periodIndex === period);

  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb="md">
        <div>
          <Text fw={700} size="lg">
            {teacher.name}
          </Text>
          <Text size="xs" c="dimmed">
            {t('teachers.colSpecialty')}: {teacher.specialization}
          </Text>
        </div>
        <div style={{ textAlign: 'left', minWidth: 200 }}>
          <Group justify="space-between" mb={4}>
            <Text size="xs">{t("scheduleView.weeklyQuotaProgress")}</Text>
            <Text size="xs" fw={700}>
              {teacherAssignments.length} / {teacher.maxWeeklyPeriods || 24}
            </Text>
          </Group>
          <Progress
            value={(teacherAssignments.length / (teacher.maxWeeklyPeriods || 24)) * 100}
            color={teacherAssignments.length > (teacher.maxWeeklyPeriods || 24) ? 'red' : 'indigo'}
            size="sm"
            radius="xl"
          />
        </div>
      </Group>

      <Table.ScrollContainer minWidth={720}>
        <Table withTableBorder withColumnBorders style={{ textAlign: 'center', minWidth: 720 }}>
          <Table.Thead>
            <Table.Tr style={{ background: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-1)', borderBottom: isDark ? '1px solid var(--mantine-color-dark-4)' : undefined }}>
              <Table.Th style={{ textAlign: 'center', width: 90, minWidth: 80, whiteSpace: 'nowrap' }}>{t('scheduleView.matrixDayFilter')}</Table.Th>
              {periods.map((p) => (
                <Table.Th key={p} style={{ textAlign: 'center', minWidth: 85, whiteSpace: 'nowrap' }}>
                  {t('common.periodNumber', { number: p + 1 })}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
        <Table.Tbody>
          {activeDays.map((dIdx) => {
            const dayName = DAYS[dIdx];
            return (
            <Table.Tr key={dIdx}>
              <Table.Td fw={700} style={{ background: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-gray-0)', color: isDark ? 'var(--mantine-color-dark-0)' : undefined }}>
                {dayName}
              </Table.Td>
              {periods.map((pIdx) => {
                const blocked = isBlocked(dIdx, pIdx);
                const item = grid.get(`${dIdx}__${pIdx}`);
                const slotKey = `${dIdx}__${pIdx}`;

                const isSelected = Boolean(
                  editorProps?.isEditing &&
                    editorProps?.selectedSlot?.dayIndex === dIdx &&
                    editorProps?.selectedSlot?.periodIndex === pIdx
                );
                const isValidTarget = Boolean(
                  editorProps?.isEditing && editorProps?.validTargets?.has(slotKey)
                );
                const isConflict = Boolean(
                  editorProps?.isEditing &&
                    editorProps?.selectedSlot &&
                    !isSelected &&
                    !isValidTarget
                );

                const handleSlotClick = () => {
                  if (!editorProps?.isEditing) return;
                  if (isSelected) {
                    editorProps.onClearSelection?.();
                  } else if (editorProps.selectedSlot && isValidTarget) {
                    editorProps.onDropSlot?.(dIdx, pIdx);
                  } else if (item) {
                    editorProps.onSelectSlot?.(dIdx, pIdx, item);
                  }
                };

                const handleDragOver = (e: React.DragEvent) => {
                  if (isValidTarget) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }
                };

                const handleDrop = (e: React.DragEvent) => {
                  e.preventDefault();
                  if (isValidTarget) {
                    editorProps?.onDropSlot?.(dIdx, pIdx);
                  }
                };

                const cls = item ? classMap.get(item.classId) : null;
                const sub = item ? subjectMap.get(item.subjectId) : null;

                let cellBg = undefined;
                let cellCursor = undefined;
                let cellOpacity = undefined;

                if (editorProps?.isEditing) {
                  if (isValidTarget) {
                    cellBg = isDark ? 'rgba(32, 201, 151, 0.22)' : 'var(--mantine-color-teal-0)';
                    cellCursor = 'pointer';
                  } else if (isSelected) {
                    cellBg = isDark ? 'rgba(51, 154, 240, 0.28)' : 'var(--mantine-color-blue-0)';
                  } else if (isConflict) {
                    cellOpacity = 0.45;
                    cellCursor = 'not-allowed';
                  } else if (item) {
                    cellCursor = 'grab';
                  }
                } else if (blocked) {
                  cellBg = isDark ? 'var(--mantine-color-dark-8)' : 'var(--mantine-color-gray-1)';
                }

                return (
                  <Table.Td
                    key={pIdx}
                    p={6}
                    data-testid={`teacher-slot-${dIdx}-${pIdx}`}
                    onClick={handleSlotClick}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    style={{
                      verticalAlign: 'middle',
                      background: cellBg,
                      opacity: cellOpacity,
                      cursor: cellCursor,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {blocked ? (
                      <Badge variant="light" color={isDark ? "dark" : "gray"} size="sm">
                        {t('common.unavailable')}
                      </Badge>
                    ) : item ? (
                      <Card
                        withBorder
                        p={4}
                        radius="sm"
                        draggable={Boolean(editorProps?.isEditing)}
                        onDragStart={(e) => {
                          if (editorProps?.isEditing) {
                            e.dataTransfer.setData('text/plain', slotKey);
                            editorProps.onSelectSlot?.(dIdx, pIdx, item);
                          }
                        }}
                        onDragEnd={() => {
                          editorProps?.onClearSelection?.();
                        }}
                        style={{
                          background: isSelected
                            ? (isDark ? 'rgba(51, 154, 240, 0.35)' : 'var(--mantine-color-blue-1)')
                            : isValidTarget
                            ? (isDark ? 'rgba(32, 201, 151, 0.28)' : 'var(--mantine-color-teal-1)')
                            : (isDark ? 'rgba(32, 201, 151, 0.18)' : 'var(--mantine-color-teal-0)'),
                          borderColor: isSelected
                            ? 'var(--mantine-color-blue-5)'
                            : isValidTarget
                            ? 'var(--mantine-color-teal-5)'
                            : (isDark ? 'rgba(32, 201, 151, 0.35)' : 'var(--mantine-color-teal-2)'),
                          boxShadow: isSelected
                            ? '0 0 8px rgba(34, 139, 230, 0.4)'
                            : undefined,
                          transform: isSelected ? 'scale(1.02)' : undefined,
                          cursor: editorProps?.isEditing ? 'grab' : undefined,
                        }}
                      >
                        <Text
                          size="xs"
                          fw={700}
                          c={
                            isDark
                              ? (isSelected ? 'blue.2' : isValidTarget ? 'teal.2' : 'teal.2')
                              : (isSelected ? 'blue.9' : isValidTarget ? 'teal.9' : 'teal.9')
                          }
                          truncate
                        >
                          {cls?.sectionName || t("common.classFallback")}
                        </Text>
                        <Text size="10px" c={isDark ? 'gray.4' : 'dimmed'} truncate>
                          {sub?.name || t("common.subjectFallback")}
                        </Text>
                      </Card>
                    ) : (
                      <Text
                        size="xs"
                        c={isDark ? (isValidTarget ? 'teal.3' : 'dark.3') : (isValidTarget ? 'teal.8' : 'dimmed')}
                        fw={isValidTarget ? 700 : 400}
                      >
                        {isValidTarget ? t("common.moveHere") : '-'}
                      </Text>
                    )}
                  </Table.Td>
                );
              })}
            </Table.Tr>
          );
          })}
        </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}
