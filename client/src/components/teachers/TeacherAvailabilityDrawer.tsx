import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  Divider,
  Alert,
} from '@mantine/core';
import { IconCalendarTime, IconDeviceFloppy, IconAlertTriangle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { validateTeacherCapacity } from 'school-timetabling-engine';
import { useSchoolConfig } from '../../api/queries/useSchoolData';
import { TeacherAvailabilityGrid } from './TeacherAvailabilityGrid';
import { useTranslation } from '../../i18n';
import type { TeacherRecord, UnavailableSlot } from '../../api/types';

interface TeacherAvailabilityDrawerProps {
  opened: boolean;
  onClose: () => void;
  teacher: TeacherRecord | null;
  onSave: (teacher: TeacherRecord) => Promise<unknown>;
}

export function TeacherAvailabilityDrawer({
  opened,
  onClose,
  teacher,
  onSave,
}: TeacherAvailabilityDrawerProps) {
  const { data: config } = useSchoolConfig();
  const { t } = useTranslation();
  const [slots, setSlots] = useState<UnavailableSlot[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (teacher) {
      setSlots(teacher.unavailableSlots || []);
    } else {
      setSlots([]);
    }
  }, [teacher, opened]);

  if (!teacher) return null;

  const validation = validateTeacherCapacity({
    workingDays: config?.workingDays ?? [0, 1, 2, 3, 4],
    periodsPerDay: config?.periodsPerDayDefault ?? 7,
    unavailableSlots: slots,
    maxWeeklyPeriods: teacher.maxWeeklyPeriods,
    maxDailyPeriods: teacher.maxDailyPeriods,
  });

  const handleSave = async () => {
    if (!validation.valid) {
      notifications.show({
        title: t('availabilityDrawer.cannotSave'),
        message: validation.error,
        color: 'red',
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...teacher,
        unavailableSlots: slots,
      });
      notifications.show({
        title: t('common.save'),
        message: t('availabilityDrawer.saveSuccess', { name: teacher.name }),
        color: 'teal',
      });
      onClose();
    } catch (err: unknown) {
      notifications.show({
        title: t('availabilityDrawer.cannotSave'),
        message: err instanceof Error ? err.message : t('common.loading'),
        color: 'red',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="left"
      size="xl"
      title={
        <Group gap="xs">
          <IconCalendarTime size={22} color="var(--mantine-color-indigo-6)" />
          <div>
            <Text fw={700} size="md">
              {t('availabilityDrawer.title', { name: teacher.name })}
            </Text>
            <Group gap="xs" mt={2}>
              <Badge size="xs" variant="light" color="indigo">
                {teacher.specialization}
              </Badge>
              <Text size="xs" c="dimmed">
                {t('availabilityDrawer.weeklyQuotaBadge', { count: teacher.maxWeeklyPeriods || 24 })}
              </Text>
            </Group>
          </div>
        </Group>
      }
    >
      <Stack gap="md" mt="xs">
        <Text size="xs" c="dimmed">
          {t('availabilityDrawer.instructions')}
        </Text>

        <TeacherAvailabilityGrid
          value={slots}
          onChange={setSlots}
          workingDays={config?.workingDays}
          periodsPerDay={config?.periodsPerDayDefault}
          maxWeeklyPeriods={teacher.maxWeeklyPeriods}
        />

        {!validation.valid && (
          <Alert
            icon={<IconAlertTriangle size={18} />}
            color="red"
            title={t('availabilityDrawer.cannotSave')}
            variant="light"
            radius="md"
          >
            {validation.error}
          </Alert>
        )}

        <Divider mt="md" />

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={isSaving}>
            {t('common.cancel')}
          </Button>
          <Button
            color="indigo"
            leftSection={<IconDeviceFloppy size={16} />}
            loading={isSaving}
            disabled={!validation.valid}
            onClick={handleSave}
          >
            {t('availabilityDrawer.saveBtn')}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
