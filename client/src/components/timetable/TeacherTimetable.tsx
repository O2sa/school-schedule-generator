import React from 'react';
import { Table, Card, Text, Badge, Group, Progress } from '@mantine/core';
import type { TeacherRecord, ClassRecord, SubjectRecord, TimetableAssignment } from '../../api/types';

interface TeacherTimetableProps {
  teacher: TeacherRecord;
  assignments: TimetableAssignment[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
}

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const PERIODS = [0, 1, 2, 3, 4, 5, 6];

export function TeacherTimetable({ teacher, assignments, classes, subjects }: TeacherTimetableProps) {
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
          <Group justify="space-between" mb={2}>
            <Text size="xs" fw={600}>
              إجمالي الحصص المسندة:
            </Text>
            <Badge color="indigo" size="md">
              {teacherAssignments.length} / {teacher.maxWeeklyPeriods} حصة
            </Badge>
          </Group>
          <Progress
            value={(teacherAssignments.length / teacher.maxWeeklyPeriods) * 100}
            color="indigo"
            size="sm"
            radius="xl"
          />
        </div>
      </Group>

      <Table withTableBorder withColumnBorders style={{ textAlign: 'center' }}>
        <Table.Thead>
          <Table.Tr style={{ background: 'var(--mantine-color-gray-1)' }}>
            <Table.Th style={{ textAlign: 'center', width: 100 }}>اليوم / الحصة</Table.Th>
            {PERIODS.map((p) => (
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
              {PERIODS.map((pIdx) => {
                if (isBlocked(dIdx, pIdx)) {
                  return (
                    <Table.Td key={pIdx} p={4} style={{ background: 'var(--mantine-color-red-0)' }}>
                      <Text size="xs" c="red.6" fw={600}>
                        محجوبة
                      </Text>
                    </Table.Td>
                  );
                }

                const item = grid.get(`${dIdx}__${pIdx}`);
                if (!item) {
                  return (
                    <Table.Td key={pIdx} p={4}>
                      <Text size="xs" c="dimmed">
                        فراغ
                      </Text>
                    </Table.Td>
                  );
                }

                const cls = classMap.get(item.classId);
                const sub = subjectMap.get(item.subjectId);

                return (
                  <Table.Td key={pIdx} p={4}>
                    <Card
                      withBorder
                      p={4}
                      radius="sm"
                      style={{
                        background: 'var(--mantine-color-teal-0)',
                        borderColor: 'var(--mantine-color-teal-2)',
                      }}
                    >
                      <Text size="xs" fw={700} c="teal.9" truncate>
                        {cls?.sectionName || 'فصل'}
                      </Text>
                      <Text size="10px" c="dimmed" truncate>
                        {sub?.name || 'مادة'}
                      </Text>
                    </Card>
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
