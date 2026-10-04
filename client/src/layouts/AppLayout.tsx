import React from 'react';
import { Outlet, NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Title,
  useMantineColorScheme,
  useComputedColorScheme,
  ActionIcon,
  Tooltip,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconUsers,
  IconSchool,
  IconBook,
  IconCpu,
  IconCalendarTime,
  IconSettings,
  IconSun,
  IconMoon,
} from '@tabler/icons-react';
import { ModeToggleBadge } from '../components/common/ModeToggleBadge';
import { LanguageToggle } from '../components/common/LanguageToggle';
import { useTranslation } from '../i18n';

export function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();
  const { colorScheme, setColorScheme, clearColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const { t } = useTranslation();

  const navItems = [
    { label: t('nav.dashboard'), to: '/', icon: IconDashboard },
    { label: t('nav.teachers'), to: '/teachers', icon: IconUsers },
    { label: t('nav.classes'), to: '/classes', icon: IconSchool },
    { label: t('nav.curriculum'), to: '/curriculum', icon: IconBook },
    { label: t('nav.generator'), to: '/generator', icon: IconCpu },
    { label: t('nav.schedule'), to: '/schedule', icon: IconCalendarTime },
    { label: t('nav.settings'), to: '/settings', icon: IconSettings },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="xs">
              <IconCalendarTime size={26} color="var(--mantine-color-indigo-6)" />
              <Title order={3} size="h4" visibleFrom="xs">
                {t('nav.appTitle')}
              </Title>
            </Group>
          </Group>

          <Group gap="sm">
            <ModeToggleBadge />
            <LanguageToggle />
            <Tooltip
              label={
                colorScheme === 'auto'
                  ? `${computedColorScheme === 'dark' ? t('common.colorSchemeDark') : t('common.colorSchemeLight')} (${t('common.colorSchemeSystem')})`
                  : computedColorScheme === 'dark'
                  ? t('common.colorSchemeDark')
                  : t('common.colorSchemeLight')
              }
            >
              <ActionIcon
                variant="default"
                size="lg"
                onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                onContextMenu={(e) => {
                  e.preventDefault();
                  clearColorScheme();
                }}
                aria-label="Toggle color scheme"
              >
                {computedColorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppShell.Section grow component={ScrollArea}>
          <Box pt="xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  component={RouterNavLink}
                  to={item.to}
                  label={item.label}
                  leftSection={<Icon size={18} stroke={1.5} />}
                  active={isActive}
                  onClick={close}
                  mb={4}
                  style={{ borderRadius: '8px' }}
                />
              );
            })}
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
