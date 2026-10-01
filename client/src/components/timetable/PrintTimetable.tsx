import React from 'react';
import { Card, Group, Stack, Text, Title, Button, Divider, Table } from '@mantine/core';
import { IconPrinter } from '@tabler/icons-react';
import type { SchoolConfigRecord, ClassRecord, TeacherRecord, SubjectRecord, TimetableAssignment } from '../../api/types';
import { ClassTimetable } from './ClassTimetable';

interface PrintTimetableProps {
  config: SchoolConfigRecord;
  classes: ClassRecord[];
  teachers: TeacherRecord[];
  subjects: SubjectRecord[];
  assignments: TimetableAssignment[];
}

export function PrintTimetable({
  config,
  classes,
  teachers,
  subjects,
  assignments,
}: PrintTimetableProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <Group justify="space-between" mb="lg" className="no-print">
        <Text size="sm" c="dimmed">
          معاينة الطباعة وتصدير PDF (منسق لورق A4 الأفقي والرأسي)
        </Text>
        <Button leftSection={<IconPrinter size={18} />} color="indigo" onClick={handlePrint}>
          طباعة الجدول الآن (Print / PDF)
        </Button>
      </Group>

      {/* Printable Document Container */}
      <div className="printable-document">
        {classes.slice(0, 4).map((cls, idx) => (
          <div key={cls.id} className="print-page" style={{ marginBottom: '2.5rem', pageBreakAfter: 'always' }}>
            {/* Formal Institutional School Header */}
            <Card withBorder radius="md" p="md" mb="md">
              <Group justify="space-between" align="center">
                <div>
                  <Text size="xs" c="dimmed">
                    المملكة العربية السعودية - وزارة التعليم
                  </Text>
                  <Title order={3}>{config.schoolName}</Title>
                  <Text size="xs" c="dimmed">
                    العام الدراسي: {config.academicYear} | {config.term}
                  </Text>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <Title order={4} c="indigo">
                    جدول حصص: {cls.sectionName}
                  </Title>
                  <Text size="xs" c="dimmed">
                    القاعة: {cls.roomNumber} | تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}
                  </Text>
                </div>
              </Group>
            </Card>

            <ClassTimetable
              cls={cls}
              assignments={assignments}
              teachers={teachers}
              subjects={subjects}
            />

            {/* Signature Block */}
            <Group justify="space-between" mt="xl" px="xl" pt="md">
              <Text size="xs" fw={600}>
                وكيل الشؤون التعليمية والمدرسية: ....................
              </Text>
              <Text size="xs" fw={600}>
                مدير المدرسة: ....................
              </Text>
              <Text size="xs" fw={600}>
                ختم المدرسة: [ .................... ]
              </Text>
            </Group>
            {idx < 3 && <Divider my="xl" className="no-print" />}
          </div>
        ))}
      </div>
    </div>
  );
}
