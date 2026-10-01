import React from 'react';
import { Table, Card, Text, Badge, Stack, Center } from '@mantine/core';
import type { ClassRecord, TeacherRecord, SubjectRecord, TimetableAssignment } from '../../api/types';

interface ClassTimetableProps {
  cls: ClassRecord;
  assignments: TimetableAssignment[];
  teachers: TeacherRecord[];
  subjects: SubjectRecord[];
}

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

export function ClassTimetable({ cls, assignments, teachers, subjects }: ClassTimetableProps) {
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
                if (!item) {
                  return (
                    <Table.Td key={pIdx} p="xs">
                      <Text size="xs" c="dimmed">
                        -
                      </Text>
                    </Table.Td>
                  );
                }

                const sub = subjectMap.get(item.subjectId);
                const tch = teacherMap.get(item.teacherId);

                return (
                  <Table.Td key={pIdx} p={6} style={{ verticalAlign: 'middle' }}>
                    <Card
                      withBorder
                      p={4}
                      radius="sm"
                      style={{
                        background: 'var(--mantine-color-indigo-0)',
                        borderColor: 'var(--mantine-color-indigo-2)',
                      }}
                    >
                      <Text size="xs" fw={700} c="indigo.9" truncate>
                        {sub?.name || 'مادة'}
                      </Text>
                      <Text size="10px" c="dimmed" truncate>
                        {tch?.name || 'معلم'}
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
