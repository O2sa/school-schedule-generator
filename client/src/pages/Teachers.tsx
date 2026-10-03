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
import type { TeacherRecord } from '../api/types';

export function Teachers() {
  const { data: teachers = [], isLoading } = useTeachers();
  const { saveTeacher, deleteTeacher } = useTeacherMutations();

  const [search, setSearch] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);

  const [drawerOpened, setDrawerOpened] = useState(false);
  const [availabilityTeacher, setAvailabilityTeacher] = useState<TeacherRecord | null>(null);

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specialization.toLowerCase().includes(search.toLowerCase())
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
    if (window.confirm('هل أنت متأكد من حذف هذا المعلم؟')) {
      await deleteTeacher(id);
    }
  };

  return (
    <div>
      <PageHeader
        title="إدارة المعلمين"
        subtitle={`إدارة المعلمين وتحديد أنصبتهم وأوقات توفرهم الأسبوعية (${teachers.length} معلم)`}
        actions={
          <Button leftSection={<IconPlus size={16} />} color="indigo" onClick={handleAdd}>
            إضافة معلم جديد
          </Button>
        }
      />

      <Card withBorder radius="md" p="md">
        <TextInput
          placeholder="البحث بالاسم أو التخصص..."
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
            <Text c="dimmed">لا يوجد معلمون مطابقون للبحث.</Text>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={750}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>اسم المعلم</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>التخصص</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>الحد اليومي</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>النصاب الأسبوعي</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>أوقات التوفر</Table.Th>
                  <Table.Th style={{ textAlign: 'center', whiteSpace: 'nowrap', width: 130 }}>الإجراءات</Table.Th>
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
                  <Table.Td>{teacher.maxDailyPeriods} حصص</Table.Td>
                  <Table.Td>{teacher.maxWeeklyPeriods} حصة</Table.Td>
                  <Table.Td>
                    {teacher.unavailableSlots?.length ? (
                      <Tooltip label="انقر لتعديل أوقات التوفر السريعة">
                        <Badge
                          color="red"
                          variant="light"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleOpenAvailability(teacher)}
                          leftSection={<IconBan size={12} />}
                        >
                          {teacher.unavailableSlots.length} فترات محظورة
                        </Badge>
                      </Tooltip>
                    ) : (
                      <Tooltip label="انقر لتعديل أوقات التوفر السريعة">
                        <Badge
                          color="teal"
                          variant="light"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleOpenAvailability(teacher)}
                          leftSection={<IconCheck size={12} />}
                        >
                          متاح بالكامل
                        </Badge>
                      </Tooltip>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="center">
                      <Tooltip label="تعديل أوقات التوفر">
                        <ActionIcon
                          variant="subtle"
                          color="teal"
                          onClick={() => handleOpenAvailability(teacher)}
                        >
                          <IconCalendarTime size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="تعديل بيانات المعلم">
                        <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(teacher)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="حذف المعلم">
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
