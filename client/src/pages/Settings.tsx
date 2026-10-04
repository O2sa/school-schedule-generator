import React, { useState } from 'react';
import {
  Card,
  Group,
  Radio,
  Stack,
  Text,
  Title,
  TextInput,
  Button,
  Divider,
  FileInput,
  Badge,
} from '@mantine/core';
import {
  IconSettings,
  IconDownload,
  IconUpload,
  IconDeviceDesktop,
  IconCloud,
  IconCheck,
} from '@tabler/icons-react';
import { useSchoolConfig } from '../api/queries/useSchoolData';
import { useDataService, useStorageMode } from '../api/data-context';
import { PageHeader } from '../components/common/PageHeader';
import { useTranslation } from '../i18n';

export function Settings() {
  const service = useDataService();
  const [mode, setMode] = useStorageMode();
  const { data: config, saveConfig } = useSchoolConfig();
  const { t } = useTranslation();

  const [schoolName, setSchoolName] = useState(config?.schoolName || 'مدرسة التميز النموذجية');
  const [academicYear, setAcademicYear] = useState(config?.academicYear || '2026 / 2027');
  const [term, setTerm] = useState(config?.term || 'الفصل الدراسي الأول');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleSaveConfig = async () => {
    if (!config) return;
    await saveConfig({
      ...config,
      schoolName,
      academicYear,
      term,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = async () => {
    const payload = await service.exportBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school-schedule-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async () => {
    if (!importFile) return;
    const text = await importFile.text();
    const payload = JSON.parse(text);
    await service.importBackup(payload);
    alert(t('settings.importSuccess'));
    window.location.reload();
  };

  return (
    <div>
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      {/* Mode Configuration */}
      <Card withBorder radius="md" p="lg" mb="xl">
        <Title order={4} mb="xs">
          {t('settings.storageTitle')}
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          {t('settings.storageDesc')}
        </Text>

        <Radio.Group value={mode} onChange={(val) => setMode(val as 'client' | 'server')}>
          <Stack gap="sm">
            <Radio
              value="client"
              label={
                <Group gap="xs">
                  <IconDeviceDesktop size={18} color="var(--mantine-color-teal-6)" />
                  <div>
                    <Text size="sm" fw={600}>
                      {t('settings.clientModeTitle')}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t('settings.clientModeDesc')}
                    </Text>
                  </div>
                </Group>
              }
            />

            <Radio
              value="server"
              label={
                <Group gap="xs">
                  <IconCloud size={18} color="var(--mantine-color-blue-6)" />
                  <div>
                    <Text size="sm" fw={600}>
                      {t('settings.serverModeTitle')}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t('settings.serverModeDesc')}
                    </Text>
                  </div>
                </Group>
              }
            />
          </Stack>
        </Radio.Group>
      </Card>

      {/* General School Info */}
      <Card withBorder radius="md" p="lg" mb="xl">
        <Title order={4} mb="xs">
          {t('settings.schoolInfoTitle')}
        </Title>
        <Stack gap="md" mt="md" style={{ maxWidth: 500 }}>
          <TextInput
            label={t('settings.schoolName')}
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
          <TextInput
            label={t('settings.academicYear')}
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
          <TextInput
            label={t('settings.term')}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <Group justify="flex-start">
            <Button color="indigo" onClick={handleSaveConfig}>
              {t('settings.saveConfig')}
            </Button>
            {savedSuccess && (
              <Badge color="teal" variant="light" leftSection={<IconCheck size={14} />}>
                {t('settings.savedSuccess')}
              </Badge>
            )}
          </Group>
        </Stack>
      </Card>

      {/* Backup and Restore */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="xs">
          {t('settings.backupTitle')}
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          {t('settings.backupDesc')}
        </Text>

        <Group align="flex-end" justify="space-between" wrap="wrap" gap="md">
          <Button
            leftSection={<IconDownload size={18} />}
            color="indigo"
            onClick={handleExportBackup}
          >
            {t('settings.exportBtn')}
          </Button>

          <Group align="flex-end" wrap="wrap" gap="xs">
            <FileInput
              placeholder={t('settings.importFilePlaceholder')}
              accept=".json"
              value={importFile}
              onChange={setImportFile}
              style={{ width: 250 }}
            />
            <Button
              leftSection={<IconUpload size={18} />}
              color="teal"
              disabled={!importFile}
              onClick={handleImportBackup}
            >
              {t('settings.importBtn')}
            </Button>
          </Group>
        </Group>
      </Card>
    </div>
  );
}
