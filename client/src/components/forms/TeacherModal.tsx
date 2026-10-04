import React, { useEffect, useState } from 'react';
import {
  Modal,
  TextInput,
  NumberInput,
  Select,
  Button,
  Group,
  Stack,
  Text,
  Alert,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { validateTeacherCapacity } from 'school-timetabling-engine';
import { useSchoolConfig } from '../../api/queries/useSchoolData';
import { TeacherAvailabilityGrid } from '../teachers/TeacherAvailabilityGrid';
import { useTranslation } from '../../i18n';
import type { TeacherRecord, UnavailableSlot } from '../../api/types';

interface TeacherModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (teacher: Omit<TeacherRecord, 'id'> & { id?: string }) => Promise<unknown>;
  teacher?: TeacherRecord | null;
}

export function TeacherModal({ opened, onClose, onSave, teacher }: TeacherModalProps) {
  const { data: config } = useSchoolConfig();
  const { t, locale } = useTranslation();
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);

  const defaultSpecialization = locale === 'ar' ? 'لغة عربية' : 'Arabic';

  const form = useForm({
    initialValues: {
      name: '',
      specialization: defaultSpecialization,
      maxDailyPeriods: 4,
      maxWeeklyPeriods: 18,
    },
    validate: {
      name: (val) => (val.trim().length >= 2 ? null : t('teacherModal.nameLabel')),
    },
  });

  useEffect(() => {
    if (teacher) {
      form.setValues({
        name: teacher.name,
        specialization: teacher.specialization,
        maxDailyPeriods: teacher.maxDailyPeriods,
        maxWeeklyPeriods: teacher.maxWeeklyPeriods,
      });
      setUnavailableSlots(teacher.unavailableSlots || []);
    } else {
      form.reset();
      setUnavailableSlots([]);
    }
  }, [teacher, opened]);

  const validation = validateTeacherCapacity({
    workingDays: config?.workingDays ?? [0, 1, 2, 3, 4],
    periodsPerDay: config?.periodsPerDayDefault ?? 7,
    unavailableSlots,
    maxWeeklyPeriods: form.values.maxWeeklyPeriods,
    maxDailyPeriods: form.values.maxDailyPeriods,
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!validation.valid) {
      const validationMsg = validation.code === 'DAILY_CAPACITY_EXCEEDED'
        ? t('teacherModal.dailyCapacityExceededError', {
            needed: validation.neededLectures,
            capacity: validation.effectiveCapacity,
            maxDaily: values.maxDailyPeriods,
          })
        : t('teacherModal.capacityExceededError', {
            needed: validation.neededLectures,
            available: validation.availableSlotsCount,
          });
      notifications.show({
        title: t('teacherModal.capacityExceeded'),
        message: validationMsg,
        color: 'red',
      });
      return;
    }

    try {
      await onSave({
        ...(teacher?.id ? { id: teacher.id } : {}),
        name: values.name,
        specialization: values.specialization,
        maxDailyPeriods: values.maxDailyPeriods,
        maxWeeklyPeriods: values.maxWeeklyPeriods,
        unavailableSlots,
      });
      onClose();
    } catch (err: unknown) {
      notifications.show({
        title: t('teacherModal.capacityExceeded'),
        message: err instanceof Error ? err.message : t('common.loading'),
        color: 'red',
      });
    }
  };

  const specializations: string[] = Array.isArray(t('teacherModal.specializations')) ? t('teacherModal.specializations') : [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={teacher ? t('teacherModal.titleEdit') : t('teacherModal.titleAdd')}
      size="xl"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label={t('teacherModal.nameLabel')}
            placeholder={t('teacherModal.namePlaceholder')}
            required
            {...form.getInputProps('name')}
          />

          <Select
            label={t('teacherModal.specializationLabel')}
            data={specializations}
            required
            {...form.getInputProps('specialization')}
          />

          <Group grow>
            <NumberInput
              label={t('teacherModal.dailyMaxLabel')}
              min={1}
              max={7}
              {...form.getInputProps('maxDailyPeriods')}
            />
            <NumberInput
              label={t('teacherModal.weeklyQuotaLabel')}
              min={1}
              max={35}
              {...form.getInputProps('maxWeeklyPeriods')}
            />
          </Group>

          <div>
            <Text size="sm" fw={600} mb="xs">
              {t('teacherModal.availabilityTitle')}
            </Text>
            <TeacherAvailabilityGrid
              value={unavailableSlots}
              onChange={setUnavailableSlots}
              workingDays={config?.workingDays}
              periodsPerDay={config?.periodsPerDayDefault}
              maxWeeklyPeriods={form.values.maxWeeklyPeriods}
            />
          </div>

          {!validation.valid && (
            <Alert
              icon={<IconAlertTriangle size={18} />}
              color="red"
              title={t('teacherModal.capacityExceeded')}
              variant="light"
              radius="md"
            >
              {validation.error}
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" color="indigo" disabled={!validation.valid}>
              {t('common.save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
