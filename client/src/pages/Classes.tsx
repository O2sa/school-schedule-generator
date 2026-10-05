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
import { IconPlus, IconSearch, IconEdit, IconTrash } from '@tabler/icons-react';
import { useClasses, useClassMutations, useSchoolConfig } from '../api/queries/useSchoolData';
import { PageHeader } from '../components/common/PageHeader';
import { ClassModal } from '../components/forms/ClassModal';
import { useTranslation } from '../i18n';
import type { ClassRecord } from '../api/types';

export function Classes() {
  const { data: classes = [], isLoading } = useClasses();
  const { saveClass, deleteClass } = useClassMutations();
  const { data: config } = useSchoolConfig();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRecord | null>(null);

  const filtered = classes.filter(
    (c) =>
      c.sectionName.toLowerCase().includes(search.toLowerCase()) ||
      c.roomNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (cls: ClassRecord) => {
    setEditingClass(cls);
    setModalOpened(true);
  };

  const handleAdd = () => {
    setEditingClass(null);
    setModalOpened(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('classes.deleteConfirm'))) {
      await deleteClass(id);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('classes.title')}
        subtitle={t('classes.subtitle', { count: classes.length })}
        actions={
          <Button leftSection={<IconPlus size={16} />} color="indigo" onClick={handleAdd}>
            {t('classes.add')}
          </Button>
        }
      />

      <Card withBorder radius="md" p="md">
        <TextInput
          placeholder={t('classes.search')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          mb="md"
        />

        {isLoading ? (
          <Center p="xl"><Loader /></Center>
        ) : filtered.length === 0 ? (
          <Center p="xl">
            <Text c="dimmed">{t('classes.empty')}</Text>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={650}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('classes.colGrade')}</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('classes.colSection')}</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('classes.colRoom')}</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('classes.colDailyPeriods')}</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('classes.colWeeklyPeriods')}</Table.Th>
                  <Table.Th style={{ textAlign: 'center', whiteSpace: 'nowrap', width: 100 }}>{t('classes.colActions')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((cls) => (
                  <Table.Tr key={cls.id}>
                    <Table.Td>
                      <Badge variant="filled" color="indigo">
                        {t('classes.gradePrefix', { grade: cls.gradeLevel })}
                      </Badge>
                    </Table.Td>
                    <Table.Td fw={600}>{cls.sectionName}</Table.Td>
                    <Table.Td>
                      <Badge variant="outline" color="gray">
                        {t('classes.roomPrefix', { room: cls.roomNumber })}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{t('common.periodsCount', { count: cls.periodsPerDay })}</Table.Td>
                    <Table.Td>{t('common.periodsCount', { count: cls.periodsPerDay * 5 })}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="center">
                        <Tooltip label={t('common.edit')}>
                          <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(cls)}>
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t('common.delete')}>
                          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(cls.id)}>
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

      <ClassModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onSave={saveClass}
        classRecord={editingClass}
        workingDaysCount={config?.workingDays?.length || 5}
        defaultPeriods={config?.periodsPerDayDefault || 6}
      />
    </div>
  );
}
