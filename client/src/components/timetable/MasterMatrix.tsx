import React, { useState } from 'react';
import { Table, Card, Select, Group, Text } from '@mantine/core';
import type { ClassRecord, TeacherRecord, SubjectRecord, TimetableAssignment } from '../../api/types';
import { useTranslation } from '../../i18n';

interface MasterMatrixProps {
  classes: ClassRecord[];
  teachers: TeacherRecord[];
  subjects: SubjectRecord[];
  assignments: TimetableAssignment[];
}

const PERIODS = [0, 1, 2, 3, 4, 5, 6];

export function MasterMatrix({
  classes,
  teachers,
  subjects,
  assignments,
}: MasterMatrixProps) {
  const { t } = useTranslation();
  const DAYS: string[] = t('common.days');
  const [selectedDay, setSelectedDay] = useState<string>('0');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');

  const teacherMap = new Map(teachers.map((tRec) => [tRec.id, tRec]));
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
            label={t('scheduleView.matrixDayFilter')}
            data={DAYS.map((d, i) => ({ value: String(i), label: d }))}
            value={selectedDay}
            onChange={(v) => v && setSelectedDay(v)}
            style={{ width: 140 }}
          />

          <Select
            label={t('scheduleView.filterByTeacher')}
            data={[
              { value: 'all', label: t('common.allTeachers') },
              ...teachers.map((tRec) => ({ value: tRec.id, label: tRec.name })),
            ]}
            value={filterTeacher}
            onChange={(v) => v && setFilterTeacher(v)}
            style={{ width: 220 }}
          />
        </Group>

        <Text size="sm" c="dimmed">
          {t('scheduleView.dayLabel', { day: DAYS[dayIdx] || '' })} |{' '}
          {t('scheduleView.totalDisplayedLectures', { count: dayAssignments.length })}
        </Text>
      </Group>

      <Table.ScrollContainer minWidth={900}>
        <Table withTableBorder withColumnBorders style={{ minWidth: 900, textAlign: 'center' }}>
          <Table.Thead>
            <Table.Tr style={{ background: 'var(--mantine-color-gray-1)' }}>
              <Table.Th style={{ width: 140, textAlign: 'center' }}>
                {t('scheduleView.classSection')}
              </Table.Th>
              {PERIODS.map((p) => (
                <Table.Th key={p} style={{ textAlign: 'center' }}>
                  {t('common.periodNumber', { number: p + 1 })}
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
                          {t('common.dismissal')}
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
                          {sub?.name || t('common.subjectFallback')}
                        </Text>
                        <Text size="9px" c="dimmed" truncate>
                          {tch?.name || t('common.teacherFallback')}
                        </Text>
                      </Card>
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
