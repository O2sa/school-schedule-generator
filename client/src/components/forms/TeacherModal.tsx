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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useSchoolConfig } from '../../api/queries/useSchoolData';
import { TeacherAvailabilityGrid } from '../teachers/TeacherAvailabilityGrid';
import type { TeacherRecord, UnavailableSlot } from '../../api/types';

interface TeacherModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (teacher: Omit<TeacherRecord, 'id'> & { id?: string }) => Promise<unknown>;
  teacher?: TeacherRecord | null;
}

export function TeacherModal({ opened, onClose, onSave, teacher }: TeacherModalProps) {
  const { data: config } = useSchoolConfig();
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);

  const form = useForm({
    initialValues: {
      name: '',
      specialization: 'لغة عربية',
      maxDailyPeriods: 4,
      maxWeeklyPeriods: 18,
    },
    validate: {
      name: (val) => (val.trim().length >= 2 ? null : 'يجب إدخال اسم المعلم بشكل صحيح'),
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

  const handleSubmit = async (values: typeof form.values) => {
    await onSave({
      ...(teacher?.id ? { id: teacher.id } : {}),
      name: values.name,
      specialization: values.specialization,
      maxDailyPeriods: values.maxDailyPeriods,
      maxWeeklyPeriods: values.maxWeeklyPeriods,
      unavailableSlots,
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={teacher ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}
      size="xl"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="اسم المعلم"
            placeholder="مثال: أ. أحمد العتيبي"
            required
            {...form.getInputProps('name')}
          />

          <Select
            label="التخصص"
            data={[
              'لغة عربية',
              'لغة إنجليزية',
              'رياضيات',
              'علوم عامة',
              'فيزياء',
              'كيمياء',
              'أحياء',
              'تاريخ',
              'جغرافيا',
              'تربية إسلامية',
              'تربية رياضية',
              'تربية فنية',
              'حاسب آلي',
            ]}
            required
            {...form.getInputProps('specialization')}
          />

          <Group grow>
            <NumberInput
              label="الحد الأقصى اليومي للحصص"
              min={1}
              max={7}
              {...form.getInputProps('maxDailyPeriods')}
            />
            <NumberInput
              label="النصاب الأسبوعي للحصص"
              min={1}
              max={35}
              {...form.getInputProps('maxWeeklyPeriods')}
            />
          </Group>

          <div>
            <Text size="sm" fw={600} mb="xs">
              أوقات التوفر الأسبوعية (الحصص المحظورة):
            </Text>
            <TeacherAvailabilityGrid
              value={unavailableSlots}
              onChange={setUnavailableSlots}
              workingDays={config?.workingDays}
              periodsPerDay={config?.periodsPerDayDefault}
              maxWeeklyPeriods={form.values.maxWeeklyPeriods}
            />
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" color="indigo">
              حفظ
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
