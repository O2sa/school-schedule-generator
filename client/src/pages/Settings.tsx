import React, { useState, useEffect } from 'react';
import {
  Card,
  Group,
  Radio,
  Stack,
  Text,
  Title,
  TextInput,
  NumberInput,
  Button,
  FileInput,
  Badge,
  Chip,
} from '@mantine/core';
import {
  IconDownload,
  IconUpload,
  IconDeviceDesktop,
  IconCloud,
  IconCheck,
  IconCalendarWeek,
} from '@tabler/icons-react';
import { useSchoolConfig } from '../api/queries/useSchoolData';
import { useDataService, useStorageMode } from '../api/data-context';
import { PageHeader } from '../components/common/PageHeader';
import { useTranslation } from '../i18n';

// Ordering: Saturday (6), Sunday (0), Monday (1), Tuesday (2), Wednesday (3), Thursday (4), Friday (5)
const ALL_DAYS_ORDER = [6, 0, 1, 2, 3, 4, 5];

export function Settings() {
  const service = useDataService();
  const [mode, setMode] = useStorageMode();
  const { data: config, saveConfig } = useSchoolConfig();
  const { t } = useTranslation();
  const DAYS: string[] = t('common.days');

  const [schoolName, setSchoolName] = useState(config?.schoolName || t('dashboard.defaultSchoolName'));
  const [academicYear, setAcademicYear] = useState(config?.academicYear || '2026 / 2027');
  const [term, setTerm] = useState(config?.term || t('dashboard.defaultTerm'));
  const [workingDays, setWorkingDays] = useState<number[]>(config?.workingDays || [0, 1, 2, 3, 4]);
  const [periodsPerDayDefault, setPeriodsPerDayDefault] = useState<number>(config?.periodsPerDayDefault || 7);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    if (config) {
      setSchoolName(config.schoolName);
      setAcademicYear(config.academicYear);
      setTerm(config.term);
      if (config.workingDays) {
        setWorkingDays(config.workingDays);
      }
      if (config.periodsPerDayDefault) {
        setPeriodsPerDayDefault(config.periodsPerDayDefault);
      }
    }
  }, [config]);

  const handleSaveConfig = async () => {
    if (!config) return;
    await saveConfig({
      ...config,
      schoolName,
      academicYear,
      term,
      workingDays,
      periodsPerDayDefault,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleToggleDay = (dayIdx: number) => {
    if (workingDays.includes(dayIdx)) {
      if (workingDays.length <= 1) return; // Keep at least one working day
      setWorkingDays(workingDays.filter((d) => d !== dayIdx));
    } else {
      const updated = [...workingDays, dayIdx];
      // Keep logical order
      updated.sort((a, b) => ALL_DAYS_ORDER.indexOf(a) - ALL_DAYS_ORDER.indexOf(b));
      setWorkingDays(updated);
    }
  };

  const isPresetFive =
    workingDays.length === 5 &&
    [0, 1, 2, 3, 4].every((d) => workingDays.includes(d));

  const isPresetSix =
    workingDays.length === 6 &&
    [6, 0, 1, 2, 3, 4].every((d) => workingDays.includes(d));

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

      {/* School Working Days & Default Daily Periods */}
      <Card withBorder radius="md" p="lg" mb="xl">
        <Group justify="space-between" align="center" mb="xs">
          <div>
            <Title order={4} mb={4}>
              {t('settings.workingDaysTitle')}
            </Title>
            <Text size="sm" c="dimmed">
              {t('settings.workingDaysDesc')}
            </Text>
          </div>
          <Badge color="indigo" variant="light" size="lg" leftSection={<IconCalendarWeek size={16} />}>
            {workingDays.length} {t('common.days').length === 7 ? 'Days' : ''}
          </Badge>
        </Group>

        {/* Quick Presets */}
        <Group gap="xs" mt="sm" mb="md">
          <Button
            size="xs"
            variant={isPresetFive ? 'filled' : 'light'}
            color="indigo"
            onClick={() => setWorkingDays([0, 1, 2, 3, 4])}
          >
            {t('settings.presetFiveDays')}
          </Button>
          <Button
            size="xs"
            variant={isPresetSix ? 'filled' : 'light'}
            color="indigo"
            onClick={() => setWorkingDays([6, 0, 1, 2, 3, 4])}
          >
            {t('settings.presetSixDays')}
          </Button>
        </Group>

        {/* Custom Day Chips */}
        <Text size="xs" fw={600} c="dimmed" mb="xs">
          {t('settings.customDays')}
        </Text>
        <Group gap="sm" mb="xl" wrap="wrap">
          {ALL_DAYS_ORDER.map((dayIdx) => {
            const isChecked = workingDays.includes(dayIdx);
            return (
              <Chip
                key={dayIdx}
                checked={isChecked}
                onChange={() => handleToggleDay(dayIdx)}
                variant="filled"
                color="indigo"
              >
                {DAYS[dayIdx]}
              </Chip>
            );
          })}
        </Group>

        {/* Default Class Periods Per Day */}
        <div style={{ maxWidth: 450 }}>
          <NumberInput
            id="defaultPeriodsInput"
            label={t('settings.defaultPeriodsTitle')}
            description={t('settings.defaultPeriodsDesc')}
            min={1}
            max={12}
            step={1}
            value={periodsPerDayDefault}
            onChange={(val) =>
              setPeriodsPerDayDefault(
                typeof val === 'number' ? val : (parseInt(String(val), 10) || 7)
              )
            }
          />
          <Group mt="xs" align="center" gap="sm">
            <Badge color="indigo" variant="light" size="sm">
              {t('settings.weeklyTotalLectures', {
                count: periodsPerDayDefault * workingDays.length,
              })}
            </Badge>
          </Group>
        </div>

        <Group justify="flex-start" mt="xl">
          <Button color="indigo" onClick={handleSaveConfig}>
            {t('settings.saveConfig')}
          </Button>
          {savedSuccess && (
            <Badge color="teal" variant="light" leftSection={<IconCheck size={14} />}>
              {t('settings.savedSuccess')}
            </Badge>
          )}
        </Group>
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
