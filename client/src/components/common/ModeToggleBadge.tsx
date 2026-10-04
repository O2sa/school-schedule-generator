import React, { useState } from 'react';
import { Badge, Button, Group, Modal, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconDeviceDesktop, IconCloud, IconArrowsExchange } from '@tabler/icons-react';
import { useStorageMode } from '../../api/data-context';
import { useTranslation } from '../../i18n';

export function ModeToggleBadge() {
  const [mode, setMode] = useStorageMode();
  const [opened, setOpened] = useState(false);
  const { t } = useTranslation();

  const isClient = mode === 'client';

  const handleSwitch = () => {
    setMode(isClient ? 'server' : 'client');
    setOpened(false);
  };

  return (
    <>
      <Badge
        size="lg"
        variant="light"
        color={isClient ? 'teal' : 'blue'}
        style={{ cursor: 'pointer', textTransform: 'none' }}
        leftSection={
          isClient ? (
            <IconDeviceDesktop size={14} style={{ display: 'block' }} />
          ) : (
            <IconCloud size={14} style={{ display: 'block' }} />
          )
        }
        onClick={() => setOpened(true)}
      >
        {isClient ? t('common.modeClient') : t('common.modeServer')}
      </Badge>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('settings.storageTitle')}
        centered
      >
        <Stack gap="md">
          <Group align="flex-start">
            <ThemeIcon size="xl" radius="md" color={isClient ? 'blue' : 'teal'}>
              <IconArrowsExchange size={24} />
            </ThemeIcon>
            <div style={{ flex: 1 }}>
              <Text fw={600} size="sm">
                {isClient ? t('settings.clientModeTitle') : t('settings.serverModeTitle')}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {isClient ? t('settings.clientModeDesc') : t('settings.serverModeDesc')}
              </Text>
            </div>
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setOpened(false)}>
              {t('common.cancel')}
            </Button>
            <Button color={isClient ? 'blue' : 'teal'} onClick={handleSwitch}>
              {t('common.edit')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
