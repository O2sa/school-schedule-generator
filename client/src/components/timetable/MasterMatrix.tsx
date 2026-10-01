import React, { useState } from 'react';
import { Table, Card, ScrollArea, Select, Group, TextInput, Text, Badge } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { ClassRecord, TeacherRecord, SubjectRecord, TimetableAssignment } from '../../api/types';

interface MasterMatrixProps {
  classes: ClassRecord[];
  teachers: TeacherRecord[];
  subjects: SubjectRecord[];
  assignments: TimetableAssignment[];
}

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const PERIODS = [0, 1, 2, 3, 4, 5, 6];

export function MasterMatrix({ classes, teachers, subjects, assignments }: MasterMatrixProps) {
  const [selectedDay, setSelectedDay] = useState<string>('0');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const dayIdx = parseInt(selectedDay, 10);

  // Filter assignments for selected day
  const dayAssignments = assignments.filter((a) => {
    if (a.dayIndex !== dayIdx) return false;
    if (filterTeacher !== 'all' && a.teacherId !== filterTeacher) return false;
    return true;
  });

  const grid = new Map<string, TimetableAssignment>();
  dayAssignments.forEach((a) => {
    grid.set(`${a.classId}__${a.periodIndex}`, a);
  });

  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb="md">
        <Group>
          <Select
            label="اختر اليوم"
            data={DAYS.map((d, i) => ({ value: String(i), label: d }))}
            value={selectedDay}
            onChange={(v) => v && setSelectedDay(v)}
            style={{ width: 140 }}
          />

          <Select
            label="تصفية حسب المعلم"
            data={[{ value: 'all', label: 'جميع المعلمين' }, ...teachers.map((t) => ({ value: t.id, label: t.name }))]}
            value={filterTeacher}
            onChange={(v) => v && setFilterTeacher(v)}
            style={{ width: 220 }}
          />
        </Group>

        <Text size="sm" c="dimmed">
          يوم: <Text span fw={700} c="indigo">{DAYS[dayIdx]}</Text> | إجمالي الحصص المعروضة: {dayAssignments.length}
        </Text>
      </Group>

      <ScrollArea>
        <Table withTableBorder withColumnBorders style={{ minWidth: 900, textAlign: 'center' }}>
          <Table.Thead>
            <Table.Tr style={{ background: 'var(--mantine-color-gray-1)' }}>
              <Table.Th style={{ width: 140, textAlign: 'center' }}>الفصل / الشعبة</Table.Th>
              {PERIODS.map((p) => (
                <Table.Th key={p} style={{ textAlign: 'center' }}>
                  الحصة {p + 1}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {classes.map((cls) => (
              <Table.Tr key={cls.id}>
                <Table.Td fw={700} style={{ background: 'var(--mantine-color-gray-0)' }}>
                  {cls.sectionName}
                </Table.Td>
                {PERIODS.map((pIdx) => {
                  if (pIdx >= cls.periodsPerDay) {
                    return (
                      <Table.Td key={pIdx} p={4} style={{ background: 'var(--mantine-color-gray-2)' }}>
                        <Text size="10px" c="dimmed">
                          انصراف
                        </Text>
                      </Table.Td>
                    );
                  }

                  const item = grid.get(`${cls.id}__${pIdx}`);
                  if (!item) {
                    return (
                      <Table.Td key={pIdx} p={4}>
                        <Text size="xs" c="dimmed">
                          -
                        </Text>
                      </Table.Td>
                    );
                  }

                  const sub = subjectMap.get(item.subjectId);
                  const tch = teacherMap.get(item.teacherId);

                  return (
                    <Table.Td key={pIdx} p={4}>
                      <Card withBorder p={4} radius="xs" bg="var(--mantine-color-indigo-0)">
                        <Text size="11px" fw={700} c="indigo.9" truncate>
                          {sub?.name || 'مادة'}
                        </Text>
                        <Text size="9px" c="dimmed" truncate>
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
      </ScrollArea>
    </Card>
  );
}
