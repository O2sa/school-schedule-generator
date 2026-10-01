import React, { useEffect } from 'react';
import {
  Modal,
  TextInput,
  NumberInput,
  Select,
  Radio,
  Button,
  Group,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import type { ClassRecord } from '../../api/types';

interface ClassModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (cls: Omit<ClassRecord, 'id'> & { id?: string }) => Promise<unknown>;
  classRecord?: ClassRecord | null;
}

export function ClassModal({ opened, onClose, onSave, classRecord }: ClassModalProps) {
  const form = useForm({
    initialValues: {
      gradeLevel: 1,
      sectionName: 'الصف 1 / أ',
      roomNumber: '101',
      periodsPerDay: 6,
    },
    validate: {
      sectionName: (val) => (val.trim().length >= 2 ? null : 'اسم الفصل مطلوب'),
      roomNumber: (val) => (val.trim().length >= 1 ? null : 'رقم القاعة مطلوب'),
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
    // Auto set periods: 6 for grades 1-4, 7 for 5-12
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
      title={classRecord ? 'تعديل بيانات الفصل' : 'إضافة فصل وقاعة جديدة'}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label="المستوى الدراسي (الصف)"
            data={Array.from({ length: 12 }, (_, i) => ({
              value: String(i + 1),
              label: `الصف ${i + 1}`,
            }))}
            value={String(form.values.gradeLevel)}
            onChange={(val) => val && handleGradeChange(parseInt(val, 10))}
            required
          />

          <TextInput
            label="اسم الفصل / الشعبة"
            placeholder="مثال: الصف 1 / أ"
            required
            {...form.getInputProps('sectionName')}
          />

          <TextInput
            label="رقم القاعة / الغرفة الدراسية"
            placeholder="مثال: 101 أو معمل الحاسب"
            required
            {...form.getInputProps('roomNumber')}
          />

          <Radio.Group
            label="عدد الحصص اليومية"
            description="الصفوف الأولية (1-4) عادة 6 حصص، والعليا والمتوسطة والثانوية (5-12) 7 حصص."
            value={String(form.values.periodsPerDay)}
            onChange={(val) => form.setFieldValue('periodsPerDay', parseInt(val, 10))}
          >
            <Group mt="xs">
              <Radio value="6" label="6 حصص يومياً (30 أسبوعياً)" />
              <Radio value="7" label="7 حصص يومياً (35 أسبوعياً)" />
            </Group>
          </Radio.Group>

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
