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
  Alert,
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

export function Settings() {
  const service = useDataService();
  const [mode, setMode] = useStorageMode();
  const { data: config, saveConfig } = useSchoolConfig();

  const [schoolName, setSchoolName] = useState(config?.schoolName || 'مدرسة الأمل النموذجية للبنين');
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
    alert('تم استيراد النسخة الاحتياطية بنجاح!');
    window.location.reload();
  };

  return (
    <div>
      <PageHeader
        title="الإعدادات والنسخ الاحتياطي"
        subtitle="تخصيص وضع التشغيل وبيانات المدرسة وحفظ واسترجاع قواعد البيانات"
      />

      {/* Mode Configuration */}
      <Card withBorder radius="md" p="lg" mb="xl">
        <Title order={4} mb="xs">
          وضع التخزين والتشغيل (Storage Mode)
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          اختر المكان الذي يتم حفظ ومعالجة بيانات المدرسة فيه:
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
                      وضع المتصفح المحلي (Client Mode) - مستحسن للاستخدام المستقل
                    </Text>
                    <Text size="xs" c="dimmed">
                      البيانات تُخزن في IndexedDB بالمتصفح ويتم التوليد عبر Web Worker دون الحاجة لأي خادم.
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
                      وضع الخادم المركزي (Server Mode) - للربط المؤسسي
                    </Text>
                    <Text size="xs" c="dimmed">
                      البيانات تتزامن مع خادم Express وقاعدة بيانات MongoDB المركزية.
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
          بيانات المدرسة والتقويم
        </Title>
        <Stack gap="md" mt="md" style={{ maxWidth: 500 }}>
          <TextInput
            label="اسم المدرسة"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
          <TextInput
            label="العام الدراسي"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
          <TextInput
            label="الفصل الدراسي"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <Group justify="flex-start">
            <Button color="indigo" onClick={handleSaveConfig}>
              حفظ التعديلات
            </Button>
            {savedSuccess && (
              <Badge color="teal" variant="light" leftSection={<IconCheck size={14} />}>
                تم الحفظ بنجاح
              </Badge>
            )}
          </Group>
        </Stack>
      </Card>

      {/* Backup and Restore */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="xs">
          النسخ الاحتياطي ونقل البيانات (JSON Backup)
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          يمكنك تصدير قاعدة بيانات المدرسة بالكامل ونقلها بين المتصفح والخادم أو بين الأجهزة بسهولة:
        </Text>

        <Group align="flex-end" justify="space-between">
          <Button
            leftSection={<IconDownload size={18} />}
            color="indigo"
            onClick={handleExportBackup}
          >
            تصدير نسخة احتياطية كاملة (JSON)
          </Button>

          <Group align="flex-end">
            <FileInput
              placeholder="اختر ملف النسخة الاحتياطية..."
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
              استيراد النسخة
            </Button>
          </Group>
        </Group>
      </Card>
    </div>
  );
}
