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
import { useTranslation } from '../i18n';

export function Curriculum() {
  const { data: classes = [] } = useClasses();
  const { data: teachers = [] } = useTeachers();
  const { data: subjects = [] } = useSubjects();
  const { data: curriculum = [], isLoading } = useCurriculum();
  const { saveCurriculumItem, deleteCurriculumItem } = useCurriculumMutations();
  const { t } = useTranslation();

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const activeClassId = selectedClassId || classes[0]?.id || '';
  const currentClass = classes.find((c) => c.id === activeClassId);

  const teacherMap = useMemo(() => new Map(teachers.map((tItem) => [tItem.id, tItem])), [teachers]);
  const subjectMap = useMemo(() => new Map(subjects.map((sItem) => [sItem.id, sItem])), [subjects]);

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
      subjectId: (v) => (v ? null : t('curriculum.selectSubject')),
      teacherId: (v) => (v ? null : t('curriculum.selectTeacher')),
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
        title={t('curriculum.title')}
        subtitle={t('curriculum.subtitle')}
        actions={
          <Button
            leftSection={<IconPlus size={16} />}
            color="indigo"
            disabled={!activeClassId}
            onClick={() => setModalOpened(true)}
          >
            {t('curriculum.add')}
          </Button>
        }
      />

      <Card withBorder radius="md" p="md" mb="md">
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Select
            label={t('curriculum.selectClass')}
            data={classes.map((c) => ({
              value: c.id,
              label: `${c.sectionName} (${t('classes.roomPrefix', { room: c.roomNumber })})`,
            }))}
            value={activeClassId}
            onChange={setSelectedClassId}
            style={{ width: 280, maxWidth: '100%' }}
          />

          {currentClass && (
            <div style={{ textAlign: 'left', minWidth: 260 }}>
              <Group justify="space-between" mb={4}>
                <Text size="sm" fw={600}>
                  {t('curriculum.assignedPeriods')}
                </Text>
                <Text size="sm" fw={700} c={totalAssignedPeriods === targetPeriods ? 'teal' : 'orange'}>
                  {totalAssignedPeriods} / {targetPeriods} {t('common.periods')}
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
            <Text c="dimmed">{t('curriculum.empty')}</Text>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={650}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('curriculum.colSubject')}</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('curriculum.colTeacher')}</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('curriculum.colSpecialty')}</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('curriculum.colPeriodsWeek')}</Table.Th>
                  <Table.Th style={{ textAlign: 'center', whiteSpace: 'nowrap', width: 80 }}>{t('curriculum.colAction')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {classCurriculum.map((item) => {
                  const sub = subjectMap.get(item.subjectId);
                  const tch = teacherMap.get(item.teacherId);
                  return (
                    <Table.Tr key={item.id}>
                      <Table.Td fw={600}>{sub?.name || '-'}</Table.Td>
                      <Table.Td>{tch?.name || '-'}</Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="indigo">
                          {tch?.specialization || '-'}
                        </Badge>
                      </Table.Td>
                      <Table.Td fw={700}>{t('common.periodsCount', { count: item.periodsPerWeek })}</Table.Td>
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
          </Table.ScrollContainer>
        )}
      </Card>

      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title={t('curriculum.modalTitle')} centered>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label={t('curriculum.selectSubject')}
              placeholder={t('curriculum.selectSubjectPlaceholder')}
              data={subjects.map((s) => ({ value: s.id, label: s.name }))}
              required
              {...form.getInputProps('subjectId')}
            />

            <Select
              label={t('curriculum.selectTeacher')}
              placeholder={t('curriculum.selectTeacherPlaceholder')}
              data={teachers.map((tItem) => ({ value: tItem.id, label: `${tItem.name} (${tItem.specialization})` }))}
              required
              {...form.getInputProps('teacherId')}
            />

            <NumberInput
              label={t('curriculum.periodsWeekLabel')}
              min={1}
              max={10}
              required
              {...form.getInputProps('periodsPerWeek')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setModalOpened(false)}>{t('common.cancel')}</Button>
              <Button type="submit" color="indigo">{t('common.save')}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
