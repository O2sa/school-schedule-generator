import React, { useState } from 'react';
import { Badge, Button, Group, Modal, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconDeviceDesktop, IconCloud, IconArrowsExchange } from '@tabler/icons-react';
import { useStorageMode } from '../../api/data-context';

export function ModeToggleBadge() {
  const [mode, setMode] = useStorageMode();
  const [opened, setOpened] = useState(false);

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
        {isClient ? 'وضع المتصفح المحلي' : 'وضع الخادم المركزي'}
      </Badge>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="تغيير وضع التشغيل والتخزين"
        centered
      >
        <Stack gap="md">
          <Group align="flex-start">
            <ThemeIcon size="xl" radius="md" color={isClient ? 'blue' : 'teal'}>
              <IconArrowsExchange size={24} />
            </ThemeIcon>
            <div style={{ flex: 1 }}>
              <Text fw={600} size="sm">
                الوضع الحالي: {isClient ? 'وضع المتصفح المحلي (مستقل)' : 'وضع الخادم المركزي (API)'}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {isClient
                  ? 'البيانات تُخزن في قاعدة بيانات المتصفح (IndexedDB) وتتم معالجة الجدول دون الحاجة لخادم.'
                  : 'البيانات تُخزن على خادم Express وقاعدة بيانات MongoDB المركزية.'}
              </Text>
            </div>
          </Group>

          <Text size="sm">
            هل ترغب في التبديل إلى{' '}
            <Text span fw={700} c={isClient ? 'blue' : 'teal'}>
              {isClient ? 'وضع الخادم المركزي' : 'وضع المتصفح المحلي'}
            </Text>
            ؟
          </Text>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setOpened(false)}>
              إلغاء
            </Button>
            <Button color={isClient ? 'blue' : 'teal'} onClick={handleSwitch}>
              تأكيد التبديل
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
