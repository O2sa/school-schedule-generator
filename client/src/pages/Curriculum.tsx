import React, { useState, useMemo } from 'react';
import {
  Button,
  Card,
  Group,
  Table,
  Select,
  NumberInput,
  Badge,
  ActionIcon,
  Modal,
  Stack,
  Text,
  Progress,
  Center,
  Loader,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  useClasses,
  useTeachers,
  useSubjects,
  useCurriculum,
  useCurriculumMutations,
} from '../api/queries/useSchoolData';
import { PageHeader } from '../components/common/PageHeader';

export function Curriculum() {
  const { data: classes = [] } = useClasses();
  const { data: teachers = [] } = useTeachers();
  const { data: subjects = [] } = useSubjects();
  const { data: curriculum = [], isLoading } = useCurriculum();
  const { saveCurriculumItem, deleteCurriculumItem } = useCurriculumMutations();

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  // Set default selected class
  const activeClassId = selectedClassId || classes[0]?.id || '';
  const currentClass = classes.find((c) => c.id === activeClassId);

  const teacherMap = useMemo(() => new Map(teachers.map((t) => [t.id, t])), [teachers]);
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const classCurriculum = curriculum.filter((item) => item.classId === activeClassId);
  const totalAssignedPeriods = classCurriculum.reduce((sum, item) => sum + item.periodsPerWeek, 0);
  const targetPeriods = (currentClass?.periodsPerDay || 7) * 5;

  const form = useForm({
    initialValues: {
      subjectId: '',
      teacherId: '',
      periodsPerWeek: 4,
    },
    validate: {
      subjectId: (v) => (v ? null : 'المادة مطلوبة'),
      teacherId: (v) => (v ? null : 'المعلم مطلوب'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!activeClassId) return;
    await saveCurriculumItem({
      classId: activeClassId,
      subjectId: values.subjectId,
      teacherId: values.teacherId,
      periodsPerWeek: values.periodsPerWeek,
    });
    form.reset();
    setModalOpened(false);
  };

  return (
    <div>
      <PageHeader
        title="الخطة الدراسية وتوزيع الحصص"
        subtitle="تحديد نصاب المواد وتعيين المعلم المسؤول لكل فصل دراسي"
        actions={
          <Button
            leftSection={<IconPlus size={16} />}
            color="indigo"
            disabled={!activeClassId}
            onClick={() => setModalOpened(true)}
          >
            إضافة حصة للمنهج
          </Button>
        }
      />

      <Card withBorder radius="md" p="md" mb="md">
        <Group justify="space-between" align="center">
          <Select
            label="اختر الفصل لتوزيع حصصه"
            data={classes.map((c) => ({
              value: c.id,
              label: `${c.sectionName} (قاعة ${c.roomNumber})`,
            }))}
            value={activeClassId}
            onChange={setSelectedClassId}
            style={{ width: 280 }}
          />

          {currentClass && (
            <div style={{ textAlign: 'left', minWidth: 260 }}>
              <Group justify="space-between" mb={4}>
                <Text size="sm" fw={600}>
                  اكتمال نصاب الفصل:
                </Text>
                <Text size="sm" fw={700} c={totalAssignedPeriods === targetPeriods ? 'teal' : 'orange'}>
                  {totalAssignedPeriods} / {targetPeriods} حصة
                </Text>
              </Group>
              <Progress
                value={(totalAssignedPeriods / targetPeriods) * 100}
                color={totalAssignedPeriods === targetPeriods ? 'teal' : totalAssignedPeriods > targetPeriods ? 'red' : 'indigo'}
                size="md"
                radius="xl"
              />
            </div>
          )}
        </Group>
      </Card>

      <Card withBorder radius="md" p="md">
        {isLoading ? (
          <Center p="xl"><Loader /></Center>
        ) : classCurriculum.length === 0 ? (
          <Center p="xl">
            <Text c="dimmed">لم يتم توزيع أي مواد لهذا الفصل بعد.</Text>
          </Center>
        ) : (
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>المادة</Table.Th>
                <Table.Th>المعلم المسؤول</Table.Th>
                <Table.Th>التخصص</Table.Th>
                <Table.Th>الحصص أسبوعياً</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>إجراء</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {classCurriculum.map((item) => {
                const sub = subjectMap.get(item.subjectId);
                const tch = teacherMap.get(item.teacherId);
                return (
                  <Table.Tr key={item.id}>
                    <Table.Td fw={600}>{sub?.name || 'مادة غير معروفة'}</Table.Td>
                    <Table.Td>{tch?.name || 'معلم غير معين'}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="indigo">
                        {tch?.specialization || '-'}
                      </Badge>
                    </Table.Td>
                    <Table.Td fw={700}>{item.periodsPerWeek} حصص</Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <ActionIcon variant="subtle" color="red" onClick={() => deleteCurriculumItem(item.id)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="إضافة مادة لمنهج الفصل" centered>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label="المادة الدراسية"
              placeholder="اختر المادة..."
              data={subjects.map((s) => ({ value: s.id, label: s.name }))}
              required
              {...form.getInputProps('subjectId')}
            />

            <Select
              label="المعلم المسؤول"
              placeholder="اختر المعلم..."
              data={teachers.map((t) => ({ value: t.id, label: `${t.name} (${t.specialization})` }))}
              required
              {...form.getInputProps('teacherId')}
            />

            <NumberInput
              label="عدد الحصص في الأسبوع"
              min={1}
              max={10}
              required
              {...form.getInputProps('periodsPerWeek')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setModalOpened(false)}>إلغاء</Button>
              <Button type="submit" color="indigo">إضافة للمنهج</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
