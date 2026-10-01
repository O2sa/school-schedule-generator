import React, { useState } from 'react';
import {
  Button,
  Card,
  Group,
  Table,
  Select,
  Badge,
  ActionIcon,
  Text,
  Center,
  Loader,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useClasses, useClassMutations } from '../api/queries/useSchoolData';
import { PageHeader } from '../components/common/PageHeader';
import { ClassModal } from '../components/forms/ClassModal';
import type { ClassRecord } from '../api/types';

export function Classes() {
  const { data: classes = [], isLoading } = useClasses();
  const { saveClass, deleteClass } = useClassMutations();

  const [selectedGrade, setSelectedGrade] = useState<string | null>('all');
  const [modalOpened, setModalOpened] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRecord | null>(null);

  const filtered = classes.filter((c) => {
    if (!selectedGrade || selectedGrade === 'all') return true;
    return c.gradeLevel === parseInt(selectedGrade, 10);
  });

  const handleEdit = (cls: ClassRecord) => {
    setEditingClass(cls);
    setModalOpened(true);
  };

  const handleAdd = () => {
    setEditingClass(null);
    setModalOpened(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفصل؟')) {
      await deleteClass(id);
    }
  };

  return (
    <div>
      <PageHeader
        title="إدارة الفصول والقاعات الدراسية"
        subtitle={`إجمالي الفصول: ${classes.length} فصل`}
        actions={
          <Button leftSection={<IconPlus size={16} />} color="indigo" onClick={handleAdd}>
            إضافة فصل جديد
          </Button>
        }
      />

      <Card withBorder radius="md" p="md">
        <Group mb="md">
          <Select
            placeholder="تصفية حسب الصف..."
            data={[
              { value: 'all', label: 'جميع الصفوف (1-12)' },
              ...Array.from({ length: 12 }, (_, i) => ({
                value: String(i + 1),
                label: `الصف ${i + 1}`,
              })),
            ]}
            value={selectedGrade}
            onChange={setSelectedGrade}
            style={{ width: 220 }}
          />
        </Group>

        {isLoading ? (
          <Center p="xl">
            <Loader />
          </Center>
        ) : filtered.length === 0 ? (
          <Center p="xl">
            <Text c="dimmed">لا توجد فصول مطابقة.</Text>
          </Center>
        ) : (
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>الصف الدراسي</Table.Th>
                <Table.Th>اسم الفصل / الشعبة</Table.Th>
                <Table.Th>رقم القاعة</Table.Th>
                <Table.Th>الحصص اليومية</Table.Th>
                <Table.Th>الحصص الأسبوعية</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>الإجراءات</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((cls) => (
                <Table.Tr key={cls.id}>
                  <Table.Td>
                    <Badge variant="filled" color="indigo">
                      الصف {cls.gradeLevel}
                    </Badge>
                  </Table.Td>
                  <Table.Td fw={600}>{cls.sectionName}</Table.Td>
                  <Table.Td>
                    <Badge variant="outline" color="gray">
                      قاعة {cls.roomNumber}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{cls.periodsPerDay} حصص</Table.Td>
                  <Table.Td>{cls.periodsPerDay * 5} حصة</Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="center">
                      <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(cls)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(cls.id)}>
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

      <ClassModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onSave={saveClass}
        classRecord={editingClass}
      />
    </div>
  );
}
