import React from 'react';
import { Table, Card, Text, Badge, Group, Progress } from '@mantine/core';
import type { TeacherRecord, ClassRecord, SubjectRecord, TimetableAssignment } from '../../api/types';
import type { TimetableEditorProps } from './ClassTimetable';

interface TeacherTimetableProps {
  teacher: TeacherRecord;
  assignments: TimetableAssignment[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  editorProps?: TimetableEditorProps;
}

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const PERIODS = [0, 1, 2, 3, 4, 5, 6];

export function TeacherTimetable({
  teacher,
  assignments,
  classes,
  subjects,
  editorProps,
}: TeacherTimetableProps) {
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
            التخصص: {teacher.specialization}
          </Text>
        </div>
        <div style={{ textAlign: 'left', minWidth: 200 }}>
          <Group justify="space-between" mb={4}>
            <Text size="xs">نصاب الحصص الأسبوعي</Text>
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
            <Table.Tr style={{ background: 'var(--mantine-color-gray-1)' }}>
              <Table.Th style={{ textAlign: 'center', width: 90, minWidth: 80, whiteSpace: 'nowrap' }}>اليوم / الحصة</Table.Th>
              {PERIODS.map((p) => (
                <Table.Th key={p} style={{ textAlign: 'center', minWidth: 85, whiteSpace: 'nowrap' }}>
                  الحصة {p + 1}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
        <Table.Tbody>
          {DAYS.map((dayName, dIdx) => (
            <Table.Tr key={dIdx}>
              <Table.Td fw={700} style={{ background: 'var(--mantine-color-gray-0)' }}>
                {dayName}
              </Table.Td>
              {PERIODS.map((pIdx) => {
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
                    cellBg = 'var(--mantine-color-teal-0)';
                    cellCursor = 'pointer';
                  } else if (isSelected) {
                    cellBg = 'var(--mantine-color-blue-0)';
                  } else if (isConflict) {
                    cellOpacity = 0.45;
                    cellCursor = 'not-allowed';
                  } else if (item) {
                    cellCursor = 'grab';
                  }
                } else if (blocked) {
                  cellBg = 'var(--mantine-color-gray-1)';
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
                      <Badge variant="light" color="gray" size="sm">
                        غير متاح
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
                            ? 'var(--mantine-color-blue-1)'
                            : isValidTarget
                            ? 'var(--mantine-color-teal-1)'
                            : 'var(--mantine-color-teal-0)',
                          borderColor: isSelected
                            ? 'var(--mantine-color-blue-6)'
                            : isValidTarget
                            ? 'var(--mantine-color-teal-6)'
                            : 'var(--mantine-color-teal-2)',
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
                            isSelected
                              ? 'blue.9'
                              : isValidTarget
                              ? 'teal.9'
                              : 'teal.9'
                          }
                          truncate
                        >
                          {cls?.sectionName || 'فصل'}
                        </Text>
                        <Text size="10px" c="dimmed" truncate>
                          {sub?.name || 'مادة'}
                        </Text>
                      </Card>
                    ) : (
                      <Text
                        size="xs"
                        c={isValidTarget ? 'teal.8' : 'dimmed'}
                        fw={isValidTarget ? 700 : 400}
                      >
                        {isValidTarget ? 'نقل هنا' : '-'}
                      </Text>
                    )}
                  </Table.Td>
                );
              })}
            </Table.Tr>
          ))}
        </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}
