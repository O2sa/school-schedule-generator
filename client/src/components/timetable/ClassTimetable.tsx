import React from 'react';
import { Table, Card, Text } from '@mantine/core';
import type { ClassRecord, TeacherRecord, SubjectRecord, TimetableAssignment } from '../../api/types';

export interface TimetableEditorProps {
  isEditing?: boolean;
  selectedSlot?: { dayIndex: number; periodIndex: number } | null;
  validTargets?: Set<string>;
  onSelectSlot?: (day: number, period: number, item: TimetableAssignment) => void;
  onDropSlot?: (day: number, period: number) => void;
  onClearSelection?: () => void;
}

interface ClassTimetableProps {
  cls: ClassRecord;
  assignments: TimetableAssignment[];
  teachers: TeacherRecord[];
  subjects: SubjectRecord[];
  editorProps?: TimetableEditorProps;
}

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

export function ClassTimetable({
  cls,
  assignments,
  teachers,
  subjects,
  editorProps,
}: ClassTimetableProps) {
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const periodsCount = cls.periodsPerDay || 7;
  const periods = Array.from({ length: periodsCount }, (_, i) => i);

  // Group assignments by day and period for this class
  const classAssignments = assignments.filter((a) => a.classId === cls.id);
  const grid = new Map<string, TimetableAssignment>();
  classAssignments.forEach((a) => {
    grid.set(`${a.dayIndex}__${a.periodIndex}`, a);
  });

  return (
    <Card withBorder radius="md" p="md">
      <Table withTableBorder withColumnBorders style={{ textAlign: 'center' }}>
        <Table.Thead>
          <Table.Tr style={{ background: 'var(--mantine-color-gray-1)' }}>
            <Table.Th style={{ textAlign: 'center', width: 100 }}>اليوم / الحصة</Table.Th>
            {periods.map((p) => (
              <Table.Th key={p} style={{ textAlign: 'center' }}>
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
              {periods.map((pIdx) => {
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

                const sub = item ? subjectMap.get(item.subjectId) : null;
                const tch = item ? teacherMap.get(item.teacherId) : null;

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
                }

                return (
                  <Table.Td
                    key={pIdx}
                    p={6}
                    data-testid={`slot-${dIdx}-${pIdx}`}
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
                    {item ? (
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
                            : 'var(--mantine-color-indigo-0)',
                          borderColor: isSelected
                            ? 'var(--mantine-color-blue-6)'
                            : isValidTarget
                            ? 'var(--mantine-color-teal-6)'
                            : 'var(--mantine-color-indigo-2)',
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
                              : 'indigo.9'
                          }
                          truncate
                        >
                          {sub?.name || 'مادة'}
                        </Text>
                        <Text size="10px" c="dimmed" truncate>
                          {tch?.name || 'معلم'}
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
    </Card>
  );
}
