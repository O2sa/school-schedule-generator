import React, { useState } from 'react';
import {
  Button,
  Card,
  Group,
  Table,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Select,
  Stack,
  Text,
  Center,
  Loader,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useSubjects, useSubjectMutations } from '../api/queries/useSchoolData';
import { PageHeader } from '../components/common/PageHeader';
import type { SubjectRecord } from '../api/types';

export function Subjects() {
  const { data: subjects = [], isLoading } = useSubjects();
  const { saveSubject, deleteSubject } = useSubjectMutations();
  const [modalOpened, setModalOpened] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      code: '',
      category: 'core' as 'core' | 'science' | 'humanities' | 'activity',
    },
    validate: {
      name: (val) => (val.trim().length >= 2 ? null : 'اسم المادة مطلوب'),
      code: (val) => (val.trim().length >= 2 ? null : 'رمز المادة مطلوب'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    await saveSubject(values);
    form.reset();
    setModalOpened(false);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'core':
        return <Badge color="indigo">أساسية</Badge>;
      case 'science':
        return <Badge color="teal">علوم وتقنية</Badge>;
      case 'humanities':
        return <Badge color="orange">إنسانيات</Badge>;
      default:
        return <Badge color="grape">أنشطة ومهارات</Badge>;
    }
  };

  return (
    <div>
      <PageHeader
        title="المواد الدراسية"
        subtitle={`إجمالي المواد المعتمدة: ${subjects.length} مادة`}
        actions={
          <Button leftSection={<IconPlus size={16} />} color="indigo" onClick={() => setModalOpened(true)}>
            إضافة مادة جديدة
          </Button>
        }
      />

      <Card withBorder radius="md" p="md">
        {isLoading ? (
          <Center p="xl"><Loader /></Center>
        ) : subjects.length === 0 ? (
          <Center p="xl"><Text c="dimmed">لا توجد مواد مسجلة.</Text></Center>
        ) : (
          <Table.ScrollContainer minWidth={500}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>رمز المادة</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>اسم المادة</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>التصنيف</Table.Th>
                  <Table.Th style={{ textAlign: 'center', whiteSpace: 'nowrap', width: 80 }}>حذف</Table.Th>
                </Table.Tr>
              </Table.Thead>
            <Table.Tbody>
              {subjects.map((sub) => (
                <Table.Tr key={sub.id}>
                  <Table.Td fw={700}>{sub.code}</Table.Td>
                  <Table.Td fw={600}>{sub.name}</Table.Td>
                  <Table.Td>{getCategoryBadge(sub.category)}</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <ActionIcon variant="subtle" color="red" onClick={() => deleteSubject(sub.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        )}
      </Card>

      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="إضافة مادة دراسية" centered>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput label="اسم المادة" placeholder="مثال: الرياضيات المتقدمة" required {...form.getInputProps('name')} />
            <TextInput label="رمز المادة (Code)" placeholder="مثال: MTH" required {...form.getInputProps('code')} />
            <Select
              label="التصنيف"
              data={[
                { value: 'core', label: 'مادة أساسية' },
                { value: 'science', label: 'علوم وتقنية' },
                { value: 'humanities', label: 'إنسانيات واجتماعيات' },
                { value: 'activity', label: 'أنشطة وفنون وبدنية' },
              ]}
              required
              {...form.getInputProps('category')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setModalOpened(false)}>إلغاء</Button>
              <Button type="submit" color="indigo">حفظ</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
