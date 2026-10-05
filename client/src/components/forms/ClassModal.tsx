import React, { useEffect } from 'react';
import {
  Modal,
  TextInput,
  Select,
  NumberInput,
  Button,
  Group,
  Stack,
  Text,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from '../../i18n';
import type { ClassRecord } from '../../api/types';

interface ClassModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (cls: Omit<ClassRecord, 'id'> & { id?: string }) => Promise<unknown>;
  classRecord?: ClassRecord | null;
  workingDaysCount?: number;
  defaultPeriods?: number;
}

export function ClassModal({
  opened,
  onClose,
  onSave,
  classRecord,
  workingDaysCount = 5,
  defaultPeriods = 6,
}: ClassModalProps) {
  const { t } = useTranslation();

  const form = useForm({
    initialValues: {
      gradeLevel: 1,
      sectionName: '1 / A',
      roomNumber: '101',
      periodsPerDay: defaultPeriods,
    },
    validate: {
      sectionName: (val) => (val.trim().length >= 2 ? null : t('classModal.sectionLabel')),
      roomNumber: (val) => (val.trim().length >= 1 ? null : t('classModal.roomLabel')),
      periodsPerDay: (val) => (Number(val) >= 1 && Number(val) <= 12 ? null : t('classModal.periodsPerDayLabel')),
    },
  });

  useEffect(() => {
    if (classRecord) {
      form.setValues({
        gradeLevel: classRecord.gradeLevel,
        sectionName: classRecord.sectionName,
        roomNumber: classRecord.roomNumber,
        periodsPerDay: classRecord.periodsPerDay,
      });
    } else {
      form.reset();
      form.setFieldValue('periodsPerDay', defaultPeriods);
    }
  }, [classRecord, opened, defaultPeriods]);

  const handleGradeChange = (grade: number) => {
    form.setFieldValue('gradeLevel', grade);
    if (!classRecord) {
      const periods = defaultPeriods || (grade <= 4 ? 6 : 7);
      form.setFieldValue('periodsPerDay', periods);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    await onSave({
      ...(classRecord?.id ? { id: classRecord.id } : {}),
      gradeLevel: Number(values.gradeLevel),
      sectionName: values.sectionName,
      roomNumber: values.roomNumber,
      periodsPerDay: Number(values.periodsPerDay) || 6,
    });
    onClose();
  };

  const currentPeriods = Number(form.values.periodsPerDay) || 0;
  const weeklyLectures = currentPeriods * workingDaysCount;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={classRecord ? t('classModal.titleEdit') : t('classModal.titleAdd')}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label={t('classModal.gradeLabel')}
            data={Array.from({ length: 12 }, (_, i) => ({
              value: String(i + 1),
              label: t('classes.gradePrefix', { grade: i + 1 }),
            }))}
            value={String(form.values.gradeLevel)}
            onChange={(val) => val && handleGradeChange(parseInt(val, 10))}
            required
          />

          <TextInput
            label={t('classModal.sectionLabel')}
            placeholder={t('classModal.sectionPlaceholder')}
            required
            {...form.getInputProps('sectionName')}
          />

          <TextInput
            label={t('classModal.roomLabel')}
            placeholder={t('classModal.roomPlaceholder')}
            required
            {...form.getInputProps('roomNumber')}
          />

          <div>
            <NumberInput
              id="periodsPerDay"
              label={t('classModal.periodsPerDayLabel')}
              description={t('classModal.periodsPerDayDesc')}
              min={1}
              max={12}
              step={1}
              required
              value={form.values.periodsPerDay}
              onChange={(val) =>
                form.setFieldValue(
                  'periodsPerDay',
                  typeof val === 'number' ? val : (parseInt(String(val), 10) || 6)
                )
              }
            />

            <Group gap="xs" mt="xs" align="center" wrap="wrap">
              <Text size="xs" c="dimmed">{t('classModal.presetPeriods')}</Text>
              {[6, 7, 8].map((count) => (
                <Button
                  key={count}
                  size="compact-xs"
                  variant={currentPeriods === count ? 'filled' : 'subtle'}
                  color="indigo"
                  onClick={() => form.setFieldValue('periodsPerDay', count)}
                >
                  {count}
                </Button>
              ))}
              <Badge color="indigo" variant="light" size="sm" ml="auto">
                {t('classModal.calculatedWeekly', { count: weeklyLectures, days: workingDaysCount })}
              </Badge>
            </Group>
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" color="indigo">
              {t('common.save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
