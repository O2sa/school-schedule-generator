import React from 'react';
import {
  Container,
  Title,
  Text,
  Badge,
  Card,
  Box,
  Stack,
  Table,
  Group,
  useComputedColorScheme,
} from '@mantine/core';
import { IconSchool, IconCheck } from '@tabler/icons-react';
import { useTranslation } from '../../i18n';

export function TimetablePreviewCard() {
  const { t } = useTranslation();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';

  const scheduleGrid = [
    {
      period: 1,
      time: '07:30 - 08:15',
      slots: [
        { subject: 'الرياضيات / Math', teacher: 'د. رياض', room: '101', color: 'indigo' },
        { subject: 'الفيزياء / Physics', teacher: 'د. حازم', room: '101', color: 'blue' },
        { subject: 'الكيمياء / Chem', teacher: 'د. ماجد', room: '101', color: 'cyan' },
        { subject: 'اللغة العربية / Arabic', teacher: 'د. أحمد', room: '101', color: 'teal' },
        { subject: 'الإنجليزية / English', teacher: 'Mr. David', room: '101', color: 'grape' },
      ],
    },
    {
      period: 2,
      time: '08:15 - 09:00',
      slots: [
        { subject: 'اللغة العربية / Arabic', teacher: 'د. أحمد', room: '101', color: 'teal' },
        { subject: 'الرياضيات / Math', teacher: 'د. رياض', room: '101', color: 'indigo' },
        { subject: 'الأحياء / Biology', teacher: 'د. منى', room: '101', color: 'green' },
        { subject: 'الفيزياء / Physics', teacher: 'د. حازم', room: '101', color: 'blue' },
        { subject: 'الحاسب الآلي / CS', teacher: 'م. عمر', room: 'Lab 1', color: 'violet' },
      ],
    },
    {
      period: 3,
      time: '09:00 - 09:45',
      slots: [
        { subject: 'الكيمياء / Chem', teacher: 'د. ماجد', room: '101', color: 'cyan' },
        { subject: 'الإنجليزية / English', teacher: 'Mr. David', room: '101', color: 'grape' },
        { subject: 'الرياضيات / Math', teacher: 'د. رياض', room: '101', color: 'indigo' },
        { subject: 'الأحياء / Biology', teacher: 'د. منى', room: '101', color: 'green' },
        { subject: 'التربية الإسلامية / Islamic', teacher: 'د. عبدالله', room: '101', color: 'emerald' },
      ],
    },
    {
      period: 4,
      time: '10:15 - 11:00',
      slots: [
        { subject: 'الإنجليزية / English', teacher: 'Mr. David', room: '101', color: 'grape' },
        { subject: 'التربية البدنية / PE', teacher: 'ك. فهد', room: 'Gym', color: 'orange' },
        { subject: 'اللغة العربية / Arabic', teacher: 'د. أحمد', room: '101', color: 'teal' },
        { subject: 'الحاسب الآلي / CS', teacher: 'م. عمر', room: 'Lab 1', color: 'violet' },
        { subject: 'الرياضيات / Math', teacher: 'د. رياض', room: '101', color: 'indigo' },
      ],
    },
  ];

  const days = [
    t('landing.preview.daySunday'),
    t('landing.preview.dayMonday'),
    t('landing.preview.dayTuesday'),
    t('landing.preview.dayWednesday'),
    t('landing.preview.dayThursday'),
  ];

  return (
    <Box component="section" id="preview" aria-label={t('landing.preview.sectionTitle')} py={{ base: 40, md: 70 }}>
      <Container size="xl">
        <Stack align="center" gap="xs" mb={40} style={{ textAlign: 'center' }}>
          <Badge size="md" variant="light" color="teal">
            {t('landing.preview.tag')}
          </Badge>
          <Title order={2} size="h1" fw={900} style={{ letterSpacing: '-0.5px' }}>
            {t('landing.preview.sectionTitle')}
          </Title>
          <Text c="dimmed" size="md" maw={640}>
            {t('landing.preview.sectionDesc')}
          </Text>
        </Stack>

        <Card
          withBorder
          radius="xl"
          p="lg"
          style={{
            background: isDark ? 'rgba(26, 27, 30, 0.75)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Card Top Banner */}
          <Group justify="space-between" align="center" mb="md" wrap="wrap" gap="xs">
            <Group gap="xs">
              <Box
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <IconSchool size={20} />
              </Box>
              <div>
                <Text fw={800} size="sm">{t('landing.preview.sampleClass')}</Text>
                <Text size="xs" c="dimmed">7 Periods / Day • Zero Conflict Status</Text>
              </div>
            </Group>

            <Badge variant="light" color="teal" leftSection={<IconCheck size={12} />}>
              100% Conflict-Free
            </Badge>
          </Group>

          {/* Timetable Matrix */}
          <Table.ScrollContainer minWidth={700}>
            <Table withTableBorder withColumnBorders style={{ textAlign: 'center' }}>
              <Table.Thead>
                <Table.Tr style={{ background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)' }}>
                  <Table.Th style={{ width: 100, textAlign: 'center' }}>الفترة / Period</Table.Th>
                  {days.map((d, i) => (
                    <Table.Th key={i} style={{ textAlign: 'center' }}>{d}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {scheduleGrid.map((row) => (
                  <Table.Tr key={row.period}>
                    <Table.Td style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      <Text fw={700} size="xs">الحصة {row.period}</Text>
                      <Text size="0.7rem" c="dimmed">{row.time}</Text>
                    </Table.Td>
                    {row.slots.map((slot, sIdx) => (
                      <Table.Td key={sIdx} p="xs">
                        <Box
                          p={6}
                          style={{
                            borderRadius: 6,
                            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'}`,
                          }}
                        >
                          <Badge size="xs" variant="filled" color={slot.color} mb={3}>
                            {slot.subject}
                          </Badge>
                          <Text size="0.7rem" fw={600} c="dimmed">
                            {slot.teacher} • {slot.room}
                          </Text>
                        </Box>
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      </Container>
    </Box>
  );
}
