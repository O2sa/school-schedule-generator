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
        title: 'تعذر الحفظ',
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
        title: 'تم الحفظ',
        message: `تم تحديث أوقات توفر المعلم ${teacher.name} بنجاح.`,
        color: 'teal',
      });
      onClose();
    } catch (err: unknown) {
      notifications.show({
        title: 'خطأ',
        message: err instanceof Error ? err.message : 'فشل حفظ أوقات التوفر',
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
              أوقات توفر المعلم: {teacher.name}
            </Text>
            <Group gap="xs" mt={2}>
              <Badge size="xs" variant="light" color="indigo">
                {teacher.specialization}
              </Badge>
              <Text size="xs" c="dimmed">
                النصاب الأسبوعي: {teacher.maxWeeklyPeriods || 24} حصة
              </Text>
            </Group>
          </div>
        </Group>
      }
    >
      <Stack gap="md" mt="xs">
        <Text size="xs" c="dimmed">
          حدد الفترات التي لا يمكن للمعلم التدريس فيها (محظور). يمكنك النقر أو السحب لتحديد الفترات، أو استخدام الأزرار ورؤوس الجداول للتحديد السريع.
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
            title="لا يمكن حفظ أوقات التوفر"
            variant="light"
            radius="md"
          >
            {validation.error}
          </Alert>
        )}

        <Divider mt="md" />

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={isSaving}>
            إلغاء
          </Button>
          <Button
            color="indigo"
            leftSection={<IconDeviceFloppy size={16} />}
            loading={isSaving}
            disabled={!validation.valid}
            onClick={handleSave}
          >
            حفظ أوقات التوفر
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
