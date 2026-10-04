import React, { useEffect } from 'react';
import {
  Modal,
  TextInput,
  Select,
  Radio,
  Button,
  Group,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from '../../i18n';
import type { ClassRecord } from '../../api/types';

interface ClassModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (cls: Omit<ClassRecord, 'id'> & { id?: string }) => Promise<unknown>;
  classRecord?: ClassRecord | null;
}

export function ClassModal({ opened, onClose, onSave, classRecord }: ClassModalProps) {
  const { t } = useTranslation();

  const form = useForm({
    initialValues: {
      gradeLevel: 1,
      sectionName: '1 / A',
      roomNumber: '101',
      periodsPerDay: 6,
    },
    validate: {
      sectionName: (val) => (val.trim().length >= 2 ? null : t('classModal.sectionLabel')),
      roomNumber: (val) => (val.trim().length >= 1 ? null : t('classModal.roomLabel')),
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
    }
  }, [classRecord, opened]);

  const handleGradeChange = (grade: number) => {
    form.setFieldValue('gradeLevel', grade);
    const periods = grade <= 4 ? 6 : 7;
    form.setFieldValue('periodsPerDay', periods);
  };

  const handleSubmit = async (values: typeof form.values) => {
    await onSave({
      ...(classRecord?.id ? { id: classRecord.id } : {}),
      gradeLevel: values.gradeLevel,
      sectionName: values.sectionName,
      roomNumber: values.roomNumber,
      periodsPerDay: values.periodsPerDay,
    });
    onClose();
  };

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

          <Radio.Group
            label={t('classModal.periodsPerDayLabel')}
            description={t('classModal.periodsPerDayDesc')}
            value={String(form.values.periodsPerDay)}
            onChange={(val) => form.setFieldValue('periodsPerDay', parseInt(val, 10))}
          >
            <Group mt="xs" wrap="wrap">
              <Radio value="6" label={t('classModal.sixPeriodsOption')} />
              <Radio value="7" label={t('classModal.sevenPeriodsOption')} />
            </Group>
          </Radio.Group>

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
