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
  Table,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconBan } from '@tabler/icons-react';
import type { TeacherRecord, UnavailableSlot } from '../../api/types';

interface TeacherModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (teacher: Omit<TeacherRecord, 'id'> & { id?: string }) => Promise<unknown>;
  teacher?: TeacherRecord | null;
}

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];

export function TeacherModal({ opened, onClose, onSave, teacher }: TeacherModalProps) {
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);

  const form = useForm({
    initialValues: {
      name: '',
      specialization: 'التربية الإسلامية',
      maxDailyPeriods: 4,
      maxWeeklyPeriods: 18,
    },
    validate: {
      name: (val) => (val.trim().length >= 2 ? null : 'الاسم يجب أن يكون حرفين على الأقل'),
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

  const toggleSlot = (dayIndex: number, periodIndex: number) => {
    setUnavailableSlots((prev) => {
      const exists = prev.some((s) => s.dayIndex === dayIndex && s.periodIndex === periodIndex);
      if (exists) {
        return prev.filter((s) => !(s.dayIndex === dayIndex && s.periodIndex === periodIndex));
      }
      return [...prev, { dayIndex, periodIndex }];
    });
  };

  const isSlotBlocked = (dayIndex: number, periodIndex: number) =>
    unavailableSlots.some((s) => s.dayIndex === dayIndex && s.periodIndex === periodIndex);

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
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="اسم المعلم"
            placeholder="مثال: أ. محمد أحمد"
            required
            {...form.getInputProps('name')}
          />

          <Select
            label="التخصص الأكاديمي"
            data={[
              'التربية الإسلامية',
              'القرآن الكريم',
              'اللغة العربية',
              'اللغة الإنجليزية',
              'الرياضيات',
              'العلوم',
              'الفيزياء',
              'الكيمياء',
              'الأحياء',
              'الدراسات الاجتماعية',
              'الحاسب الآلي',
              'التربية البدنية',
              'التربية الفنية',
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
              label="الحد الأقصى الأسبوعي للحصص"
              min={1}
              max={35}
              {...form.getInputProps('maxWeeklyPeriods')}
            />
          </Group>

          <div>
            <Text size="sm" fw={500} mb={4}>
              أوقات عدم التفرغ (انقر على الحصة لحجبها):
            </Text>
            <Table withTableBorder withColumnBorders style={{ textAlign: 'center' }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ textAlign: 'center' }}>اليوم</Table.Th>
                  {PERIODS.map((p) => (
                    <Table.Th key={p} style={{ textAlign: 'center' }}>
                      {p}
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {DAYS.map((dayName, dIdx) => (
                  <Table.Tr key={dIdx}>
                    <Table.Td fw={600} style={{ fontSize: '0.85rem' }}>
                      {dayName}
                    </Table.Td>
                    {PERIODS.map((_, pIdx) => {
                      const blocked = isSlotBlocked(dIdx, pIdx);
                      return (
                        <Table.Td key={pIdx} p={4}>
                          <Tooltip label={blocked ? 'محجوبة (غير متاح)' : 'متاح'}>
                            <ActionIcon
                              size="sm"
                              color={blocked ? 'red' : 'gray'}
                              variant={blocked ? 'filled' : 'subtle'}
                              onClick={() => toggleSlot(dIdx, pIdx)}
                            >
                              {blocked ? <IconBan size={14} /> : <IconCheck size={14} />}
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      );
                    })}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
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
