import React from 'react';
import { Alert, Card, Stack, Text, Title, Badge, List, Group, useComputedColorScheme } from '@mantine/core';
import { IconAlertTriangle, IconBulb } from '@tabler/icons-react';
import { useTranslation } from '../../i18n';

export interface DiagnosticItem {
  code: string;
  message: string;
  teacherId?: string;
  classId?: string;
  details?: Record<string, unknown>;
}

interface DiagnosticsReportProps {
  diagnostics: DiagnosticItem[];
}

export function DiagnosticsReport({ diagnostics }: DiagnosticsReportProps) {
  const { t } = useTranslation();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';

  const getCodeTitle = (code: string) => {
    switch (code) {
      case 'TEACHER_CAPACITY_EXCEEDED':
        return t('generator.diagTeacherCapacity');
      case 'TEACHER_DAILY_CAPACITY_DEFICIT':
        return t('generator.diagTeacherDaily');
      case 'CLASS_OVERBOOKED':
        return t('generator.diagClassOverbooked');
      case 'TOTAL_CAPACITY_DEFICIT':
        return t('generator.diagTotalCapacity');
      case 'SLOT_SATURATION':
        return t('generator.diagSlotSaturation');
      default:
        return t('generator.diagConflictDefault');
    }
  };

  return (
    <Card withBorder radius="md" p="lg" mt="md" style={{ borderColor: 'var(--mantine-color-red-4)' }}>
      <Stack gap="md">
        <Alert
          color="red"
          title={t('generator.diagnosticsTitle')}
          icon={<IconAlertTriangle size={20} />}
        >
          {t('generator.diagnosticsDesc', { count: diagnostics.length })}
        </Alert>

        <Stack gap="sm">
          {diagnostics.map((d, idx) => (
            <Card key={idx} withBorder p="sm" radius="sm" bg={isDark ? "rgba(250, 82, 82, 0.15)" : "var(--mantine-color-red-0)"}>
              <Group justify="space-between" mb={4}>
                <Badge color="red" variant="filled">
                  {getCodeTitle(d.code)}
                </Badge>
                {d.teacherId && (
                  <Badge variant="outline" color="gray">
                    {t('generator.diagTeacherLabel', { name: d.teacherId })}
                  </Badge>
                )}
              </Group>
              <Text size="sm" c="red.9" fw={500}>
                {d.message}
              </Text>
            </Card>
          ))}
        </Stack>

        <Card withBorder p="md" radius="sm" bg={isDark ? "rgba(51, 154, 240, 0.15)" : "var(--mantine-color-blue-0)"}>
          <Title order={5} mb="xs" c="blue.9">
            <Group gap="xs">
              <IconBulb size={18} />
              <span>{t('generator.diagTipsTitle')}</span>
            </Group>
          </Title>
          <List size="sm" c="blue.8" spacing="xs">
            <List.Item>{t('generator.diagTip1')}</List.Item>
            <List.Item>{t('generator.diagTip2')}</List.Item>
            <List.Item>{t('generator.diagTip3')}</List.Item>
          </List>
        </Card>
      </Stack>
    </Card>
  );
}
