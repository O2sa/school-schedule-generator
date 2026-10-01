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
  Stack,
  Loader,
  Center,
} from '@mantine/core';
import { IconPlus, IconSearch, IconEdit, IconTrash } from '@tabler/icons-react';
import { useTeachers, useTeacherMutations } from '../api/queries/useSchoolData';
import { PageHeader } from '../components/common/PageHeader';
import { TeacherModal } from '../components/forms/TeacherModal';
import type { TeacherRecord } from '../api/types';

export function Teachers() {
  const { data: teachers = [], isLoading } = useTeachers();
  const { saveTeacher, deleteTeacher } = useTeacherMutations();

  const [search, setSearch] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);

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

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المعلم؟')) {
      await deleteTeacher(id);
    }
  };

  return (
    <div>
      <PageHeader
        title="إدارة المعلمين"
        subtitle={`إجمالي المعلمين المسجلين: ${teachers.length} معلم`}
        actions={
          <Button leftSection={<IconPlus size={16} />} color="indigo" onClick={handleAdd}>
            إضافة معلم جديد
          </Button>
        }
      />

      <Card withBorder radius="md" p="md">
        <TextInput
          placeholder="بحث بالاسم أو التخصص..."
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
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>اسم المعلم</Table.Th>
                <Table.Th>التخصص</Table.Th>
                <Table.Th>الحد اليومي</Table.Th>
                <Table.Th>الحد الأسبوعي</Table.Th>
                <Table.Th>الحصص المحجوبة</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>الإجراءات</Table.Th>
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
                      <Badge color="red" variant="dot">
                        {teacher.unavailableSlots.length} حصة
                      </Badge>
                    ) : (
                      <Text size="xs" c="dimmed">
                        متاح دائماً
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="center">
                      <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(teacher)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(teacher.id)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <TeacherModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onSave={saveTeacher}
        teacher={editingTeacher}
      />
    </div>
  );
}
