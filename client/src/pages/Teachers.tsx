import React, { useState } from 'react';
import {
  Button,
  Card,
  Group,
  Table,
  TextInput,
  Badge,
  ActionIcon,
  Text,
  Loader,
  Center,
  Tooltip,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconCalendarTime,
  IconBan,
  IconCheck,
} from '@tabler/icons-react';
import { useTeachers, useTeacherMutations } from '../api/queries/useSchoolData';
import { PageHeader } from '../components/common/PageHeader';
import { TeacherModal } from '../components/forms/TeacherModal';
import { TeacherAvailabilityDrawer } from '../components/teachers/TeacherAvailabilityDrawer';
import { useTranslation } from '../i18n';
import type { TeacherRecord } from '../api/types';

export function Teachers() {
  const { data: teachers = [], isLoading } = useTeachers();
  const { saveTeacher, deleteTeacher } = useTeacherMutations();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);

  const [drawerOpened, setDrawerOpened] = useState(false);
  const [availabilityTeacher, setAvailabilityTeacher] = useState<TeacherRecord | null>(null);

  const filtered = teachers.filter(
    (tRecord) =>
      tRecord.name.toLowerCase().includes(search.toLowerCase()) ||
      tRecord.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (teacher: TeacherRecord) => {
    setEditingTeacher(teacher);
    setModalOpened(true);
  };

  const handleAdd = () => {
    setEditingTeacher(null);
    setModalOpened(true);
  };

  const handleOpenAvailability = (teacher: TeacherRecord) => {
    setAvailabilityTeacher(teacher);
    setDrawerOpened(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('teachers.deleteConfirm'))) {
      await deleteTeacher(id);
    }
  };

  return (
    <div>
      <PageHeader
        categoryBadge={t('nav.teachers') || 'المعلمون'}
        title={t('teachers.title')}
        subtitle={t('teachers.subtitle', { count: teachers.length })}
        actions={
          <Button
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan', deg: 90 }}
            radius="md"
            leftSection={<IconPlus size={16} />}
            onClick={handleAdd}
            style={{ fontWeight: 700, boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}
          >
            {t('teachers.add')}
          </Button>
        }
      />

      <Card withBorder radius="md" p="md">
        <TextInput
          placeholder={t('teachers.search')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          mb="md"
        />

        {isLoading ? (
          <Center p="xl">
            <Loader />
          </Center>
        ) : filtered.length === 0 ? (
          <Center p="xl">
            <Text c="dimmed">{t('teachers.empty')}</Text>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={750}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('teachers.colName')}</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('teachers.colSpecialty')}</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('teachers.colDailyMax')}</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('teachers.colWeeklyQuota')}</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('teachers.colAvailability')}</Table.Th>
                  <Table.Th style={{ textAlign: 'center', whiteSpace: 'nowrap', width: 130 }}>{t('teachers.colActions')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((teacher) => (
                  <Table.Tr key={teacher.id}>
                    <Table.Td fw={600}>{teacher.name}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="indigo">
                        {teacher.specialization}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{t('common.periodsCount', { count: teacher.maxDailyPeriods })}</Table.Td>
                    <Table.Td>{t('common.periodsCount', { count: teacher.maxWeeklyPeriods })}</Table.Td>
                    <Table.Td>
                      {teacher.unavailableSlots?.length ? (
                        <Tooltip label={t('teachers.editAvailabilityTooltip')}>
                          <Badge
                            color="red"
                            variant="light"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleOpenAvailability(teacher)}
                            leftSection={<IconBan size={12} />}
                          >
                            {t('teachers.blockedCount', { count: teacher.unavailableSlots.length })}
                          </Badge>
                        </Tooltip>
                      ) : (
                        <Tooltip label={t('teachers.editAvailabilityTooltip')}>
                          <Badge
                            color="teal"
                            variant="light"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleOpenAvailability(teacher)}
                            leftSection={<IconCheck size={12} />}
                          >
                            {t('teachers.fullAvailable')}
                          </Badge>
                        </Tooltip>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="center">
                        <Tooltip label={t('teachers.editAvailabilityTooltip')}>
                          <ActionIcon
                            variant="subtle"
                            color="teal"
                            onClick={() => handleOpenAvailability(teacher)}
                          >
                            <IconCalendarTime size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t('teachers.editTeacherTooltip')}>
                          <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(teacher)}>
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t('teachers.deleteTeacherTooltip')}>
                          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(teacher.id)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      <TeacherModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onSave={saveTeacher}
        teacher={editingTeacher}
      />

      <TeacherAvailabilityDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        teacher={availabilityTeacher}
        onSave={saveTeacher}
      />
    </div>
  );
}
