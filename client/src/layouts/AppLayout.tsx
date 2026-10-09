import React from 'react';
import { Outlet, Link, NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Title,
  Text,
  Badge,
  useMantineColorScheme,
  useComputedColorScheme,
  ActionIcon,
  Tooltip,
  Box,
  Button,
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
  IconHome,
  IconCalendarEvent,
  IconSparkles,
} from '@tabler/icons-react';
import { ModeToggleBadge } from '../components/common/ModeToggleBadge';
import { LanguageToggle } from '../components/common/LanguageToggle';
import { useTranslation } from '../i18n';
import { BRAND_GRADIENT } from '../theme/theme';

export function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();
  const { colorScheme, setColorScheme, clearColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';
  const { t, locale, dir } = useTranslation();

  const navItems = [
    { label: t('nav.dashboard'), to: '/app', icon: IconDashboard },
    { label: t('nav.teachers'), to: '/app/teachers', icon: IconUsers },
    { label: t('nav.classes'), to: '/app/classes', icon: IconSchool },
    { label: t('nav.curriculum'), to: '/app/curriculum', icon: IconBook },
    { label: t('nav.generator'), to: '/app/generator', icon: IconCpu },
    { label: t('nav.schedule'), to: '/app/schedule', icon: IconCalendarTime },
    { label: t('nav.settings'), to: '/app/settings', icon: IconSettings },
  ];

  const landingHref = locale === 'ar' ? '/ar' : '/en';

  return (
    <AppShell
      header={{ height: 68 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="lg"
      style={{
        background: isDark
          ? 'radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.05) 0%, rgba(16, 17, 19, 1) 90%)'
          : 'radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.03) 0%, rgba(248, 250, 252, 1) 90%)',
        minHeight: '100vh',
      }}
    >
      <AppShell.Header
        style={{
          background: isDark ? 'rgba(18, 20, 29, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
          transition: 'all 0.2s ease',
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <RouterNavLink
              to={landingHref}
              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
              title="Return to Landing Page"
            >
              <Group gap="xs">
                <Box
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: BRAND_GRADIENT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
                  }}
                >
                  <IconCalendarEvent size={22} stroke={2.2} />
                </Box>
                <div>
                  <Group gap={6} align="center">
                    <Title order={3} size="h4" visibleFrom="xs" fw={800} style={{ letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                      {t('nav.appTitle')}
                    </Title>
                    <Badge
                      variant="gradient"
                      gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                      size="xs"
                      visibleFrom="md"
                    >
                      {t('landing.nav.brandBadge') || 'CSP Engine'}
                    </Badge>
                  </Group>
                </div>
              </Group>
            </RouterNavLink>
          </Group>

          <Group gap="xs">
            <Button
              component={RouterNavLink}
              to={landingHref}
              variant="subtle"
              size="xs"
              radius="md"
              leftSection={<IconHome size={15} />}
              visibleFrom="sm"
            >
              {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </Button>
            <ModeToggleBadge />
            <LanguageToggle />
            <Tooltip
              label={
                colorScheme === 'auto'
                  ? `${isDark ? t('common.colorSchemeDark') : t('common.colorSchemeLight')} (${t('common.colorSchemeSystem')})`
                  : isDark
                  ? t('common.colorSchemeDark')
                  : t('common.colorSchemeLight')
              }
            >
              <ActionIcon
                variant="default"
                size="lg"
                radius="md"
                onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
                onContextMenu={(e) => {
                  e.preventDefault();
                  clearColorScheme();
                }}
                aria-label="Toggle color scheme"
              >
                {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="xs"
        style={{
          background: isDark ? 'rgba(18, 20, 29, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRight: dir === 'rtl' ? 'none' : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
          borderLeft: dir === 'rtl' ? `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}` : 'none',
        }}
      >
        <AppShell.Section grow component={ScrollArea}>
          <Box pt="xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === '/app'
                  ? location.pathname === '/app' || location.pathname === '/app/' || location.pathname === '/app/dashboard'
                  : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  component={Link}
                  to={item.to}
                  label={item.label}
                  leftSection={<Icon size={19} stroke={isActive ? 2.2 : 1.6} />}
                  active={isActive}
                  onClick={close}
                  mb={6}
                  style={{
                    borderRadius: '10px',
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.15s ease',
                  }}
                />
              );
            })}
          </Box>
        </AppShell.Section>

        <AppShell.Section pt="xs">
          <Box
            p="sm"
            style={{
              borderRadius: '12px',
              background: isDark ? 'rgba(79, 70, 229, 0.12)' : 'rgba(79, 70, 229, 0.06)',
              border: `1px solid ${isDark ? 'rgba(79, 70, 229, 0.25)' : 'rgba(79, 70, 229, 0.15)'}`,
            }}
          >
            <Group justify="space-between" mb={4}>
              <Group gap={6}>
                <IconSparkles size={16} color="var(--mantine-color-indigo-5)" />
                <Text size="xs" fw={700}>
                  {locale === 'ar' ? 'محرك CSP الذكي' : 'Smart CSP Engine'}
                </Text>
              </Group>
              <Badge size="xs" variant="dot" color="teal">
                {locale === 'ar' ? 'جاهز' : 'Ready'}
              </Badge>
            </Group>
            <Text size="xs" c="dimmed" lh={1.3}>
              {locale === 'ar'
                ? 'يعمل محلياً في المتصفح 100% بدون إنترنت'
                : 'Runs 100% offline in browser with zero clashes'}
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
