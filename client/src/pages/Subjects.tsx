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
import { useTranslation } from '../i18n';
import type { SubjectRecord } from '../api/types';

export function Subjects() {
  const { data: subjects = [], isLoading } = useSubjects();
  const { saveSubject, deleteSubject } = useSubjectMutations();
  const { t } = useTranslation();
  const [modalOpened, setModalOpened] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      code: '',
      category: 'core' as 'core' | 'science' | 'humanities' | 'activity',
    },
    validate: {
      name: (val) => (val.trim().length >= 2 ? null : t('subjects.nameLabel')),
      code: (val) => (val.trim().length >= 2 ? null : t('subjects.codeLabel')),
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
        return <Badge color="indigo">{t('subjects.catCore')}</Badge>;
      case 'science':
        return <Badge color="teal">{t('subjects.catScience')}</Badge>;
      case 'humanities':
        return <Badge color="orange">{t('subjects.catHumanities')}</Badge>;
      default:
        return <Badge color="grape">{t('subjects.catActivity')}</Badge>;
    }
  };

  return (
    <div>
      <PageHeader
        title={t('subjects.title')}
        subtitle={t('subjects.subtitle', { count: subjects.length })}
        actions={
          <Button leftSection={<IconPlus size={16} />} color="indigo" onClick={() => setModalOpened(true)}>
            {t('subjects.add')}
          </Button>
        }
      />

      <Card withBorder radius="md" p="md">
        {isLoading ? (
          <Center p="xl"><Loader /></Center>
        ) : subjects.length === 0 ? (
          <Center p="xl"><Text c="dimmed">{t('subjects.empty')}</Text></Center>
        ) : (
          <Table.ScrollContainer minWidth={500}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('subjects.colCode')}</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('subjects.colName')}</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('subjects.colCategory')}</Table.Th>
                  <Table.Th style={{ textAlign: 'center', whiteSpace: 'nowrap', width: 80 }}>{t('subjects.colDelete')}</Table.Th>
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

      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title={t('subjects.modalTitle')} centered>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label={t('subjects.nameLabel')}
              placeholder={t('subjects.namePlaceholder')}
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              label={t('subjects.codeLabel')}
              placeholder={t('subjects.codePlaceholder')}
              required
              {...form.getInputProps('code')}
            />
            <Select
              label={t('subjects.categoryLabel')}
              data={[
                { value: 'core', label: t('subjects.catCore') },
                { value: 'science', label: t('subjects.catScience') },
                { value: 'humanities', label: t('subjects.catHumanities') },
                { value: 'activity', label: t('subjects.catActivity') },
              ]}
              required
              {...form.getInputProps('category')}
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
