import React from 'react';
import { Card, Group, Text, Title, Button, Divider } from '@mantine/core';
import { IconPrinter } from '@tabler/icons-react';
import type { SchoolConfigRecord, ClassRecord, TeacherRecord, SubjectRecord, TimetableAssignment } from '../../api/types';
import { ClassTimetable } from './ClassTimetable';
import { useTranslation } from '../../i18n';

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
  const { t, locale } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';

  return (
    <div>
      <Group justify="space-between" mb="lg" className="no-print">
        <Text size="sm" c="dimmed">
          {t('scheduleView.printPreviewSubtitle')}
        </Text>
        <Button leftSection={<IconPrinter size={18} />} color="indigo" onClick={handlePrint}>
          {t('scheduleView.printButton')}
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
                    {t('scheduleView.ministryHeader')}
                  </Text>
                  <Title order={3}>{config.schoolName}</Title>
                  <Text size="xs" c="dimmed">
                    {t('dashboard.subtitle', { year: config.academicYear, term: config.term })}
                  </Text>
                </div>
                <div style={{ textAlign: locale === 'ar' ? 'left' : 'right' }}>
                  <Title order={4} c="indigo">
                    {t('scheduleView.scheduleFor', { section: cls.sectionName })}
                  </Title>
                  <Text size="xs" c="dimmed">
                    {t('scheduleView.roomAndDate', {
                      room: cls.roomNumber,
                      date: new Date().toLocaleDateString(dateLocale),
                    })}
                  </Text>
                </div>
              </Group>
            </Card>

            <ClassTimetable
              cls={cls}
              assignments={assignments}
              teachers={teachers}
              subjects={subjects}
              workingDays={config.workingDays}
            />

            {/* Signature Block */}
            <Group justify="space-between" mt="xl" px="xl" pt="md">
              <Text size="xs" fw={600}>
                {t('scheduleView.vicePrincipal')}
              </Text>
              <Text size="xs" fw={600}>
                {t('scheduleView.principal')}
              </Text>
              <Text size="xs" fw={600}>
                {t('scheduleView.schoolSeal')}
              </Text>
            </Group>
            {idx < 3 && <Divider my="xl" className="no-print" />}
          </div>
        ))}
      </div>
    </div>
  );
}
