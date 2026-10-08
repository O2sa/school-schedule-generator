import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Title,
  Card,
  Badge,
  Button,
  SegmentedControl,
  Alert,
  SimpleGrid,
  useComputedColorScheme,
} from '@mantine/core';
import {
  IconSchool,
  IconAtom,
  IconBooks,
  IconSparkles,
  IconAlertCircle,
  IconLanguage,
  IconCheck,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '../../i18n';
import { useDataService } from '../../api/data-context';
import { DEMO_PRESETS, type DemoPresetId, type DemoLanguage } from '../../api/demo-data';

interface DemoDataModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function renderPresetIcon(id: DemoPresetId, isSelected: boolean) {
  const color = isSelected ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-gray-6)';
  switch (id) {
    case 'k12':
      return <IconSchool size={24} color={color} />;
    case 'secondary':
      return <IconAtom size={24} color={color} />;
    case 'primary':
      return <IconBooks size={24} color={color} />;
  }
}

export function DemoDataModal({ opened, onClose, onSuccess }: DemoDataModalProps) {
  const { t, locale } = useTranslation();
  const service = useDataService();
  const colorScheme = useComputedColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedPreset, setSelectedPreset] = useState<DemoPresetId>('k12');
  const [selectedLanguage, setSelectedLanguage] = useState<DemoLanguage>(locale);
  const [loading, setLoading] = useState(false);

  // Sync default selected language with active interface language when modal opens
  useEffect(() => {
    if (opened) {
      setSelectedLanguage(locale);
    }
  }, [opened, locale]);

  const handleLoad = async () => {
    setLoading(true);
    try {
      await service.preloadDemoData({
        preset: selectedPreset,
        language: selectedLanguage,
      });

      const config = await service.getConfig();
      const teachers = await service.getTeachers();
      const classes = await service.getClasses();

      notifications.show({
        title: t('demoModal.successNotificationTitle'),
        message: t('demoModal.successNotificationMessage', {
          schoolName: config.schoolName,
          classes: classes.length,
          teachers: teachers.length,
        }),
        color: 'teal',
        icon: <IconCheck size={18} />,
        autoClose: 5000,
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      notifications.show({
        title: t('common.error'),
        message: errorMsg,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconSparkles size={22} color="var(--mantine-color-teal-6)" />
          <Title order={3} size="h4">
            {t('demoModal.modalTitle')}
          </Title>
        </Group>
      }
      size="lg"
      radius="md"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('demoModal.modalSubtitle')}
        </Text>

        {/* Language Selection */}
        <div>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <IconLanguage size={18} />
              <Text size="sm" fw={600}>
                {t('demoModal.languageSelectLabel')}
              </Text>
            </Group>
          </Group>
          <SegmentedControl
            fullWidth
            value={selectedLanguage}
            onChange={(val) => setSelectedLanguage(val as DemoLanguage)}
            data={[
              { label: t('demoModal.languageArabic'), value: 'ar' },
              { label: t('demoModal.languageEnglish'), value: 'en' },
            ]}
          />
        </div>

        {/* Preset Selection Cards */}
        <div>
          <Text size="sm" fw={600} mb="xs">
            {t('demoModal.selectPresetLabel')}
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
            {DEMO_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;

              return (
                <Card
                  key={preset.id}
                  withBorder
                  radius="md"
                  p="sm"
                  onClick={() => setSelectedPreset(preset.id)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected
                      ? 'var(--mantine-color-teal-6)'
                      : isDark
                      ? 'var(--mantine-color-dark-4)'
                      : 'var(--mantine-color-gray-3)',
                    backgroundColor: isSelected
                      ? isDark
                        ? 'var(--mantine-color-teal-9)'
                        : 'var(--mantine-color-teal-0)'
                      : undefined,
                  }}
                >
                  <Stack gap="xs" justify="space-between" style={{ height: '100%' }}>
                    <div>
                      <Group justify="space-between" align="flex-start" mb={4}>
                        {renderPresetIcon(preset.id, isSelected)}
                        <Badge
                          variant={isSelected ? 'filled' : 'light'}
                          color="teal"
                          size="xs"
                        >
                          {t(preset.badgeKey)}
                        </Badge>
                      </Group>
                      <Text fw={700} size="sm" mb={4}>
                        {t(preset.titleKey)}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={3}>
                        {t(preset.descKey)}
                      </Text>
                    </div>

                    <Group gap={6} mt="xs" wrap="wrap">
                      <Badge variant="outline" size="xs" color="gray">
                        {t('demoModal.classesCount', { count: preset.estimatedClasses })}
                      </Badge>
                      <Badge variant="outline" size="xs" color="gray">
                        {t('demoModal.teachersCount', { count: preset.estimatedTeachers })}
                      </Badge>
                    </Group>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        </div>

        {/* Warning Notice */}
        <Alert
          variant="light"
          color="orange"
          icon={<IconAlertCircle size={18} />}
          radius="md"
        >
          <Text size="xs">
            {t('demoModal.warningNotice')}
          </Text>
        </Alert>

        {/* Modal Actions */}
        <Group justify="flex-end" gap="sm" mt="xs">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('demoModal.cancelButton')}
          </Button>
          <Button
            color="teal"
            leftSection={<IconSparkles size={18} />}
            loading={loading}
            onClick={handleLoad}
          >
            {t('demoModal.loadButton')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
