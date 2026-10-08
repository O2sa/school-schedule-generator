import React, { useState } from 'react';
import {
  Box,
  Container,
  Group,
  Button,
  ActionIcon,
  Text,
  Badge,
  Burger,
  Drawer,
  Stack,
  useMantineColorScheme,
  useComputedColorScheme,
} from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import {
  IconCalendarEvent,
  IconSun,
  IconMoon,
  IconLanguage,
  IconArrowRight,
  IconArrowLeft,
  IconBrandGithub,
} from '@tabler/icons-react';
import { useTranslation } from '../../i18n';

interface LandingNavbarProps {
  currentLocale?: 'ar' | 'en';
}

export function LandingNavbar({ currentLocale }: LandingNavbarProps) {
  const { t, dir, locale } = useTranslation();
  const effectiveLocale = currentLocale || locale;
  const navigate = useNavigate();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';
  const [opened, setOpened] = useState(false);

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  const otherLocale = effectiveLocale === 'ar' ? 'en' : 'ar';
  const otherLocaleLabel = currentLocale === 'ar' ? 'English' : 'العربية';

  const scrollTo = (id: string) => {
    setOpened(false);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      component="header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: isDark ? 'rgba(26, 27, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
        transition: 'all 0.25s ease',
      }}
    >
      <Container size="xl" py="sm">
        <Group justify="space-between" align="center">
          {/* Brand Logo & Title */}
          <Link to={`/${effectiveLocale}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group gap="xs">
              <Box
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
                }}
              >
                <IconCalendarEvent size={22} stroke={2.2} />
              </Box>
              <div>
                <Group gap={6} align="center">
                  <Text fw={800} size="md" style={{ letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                    {t('landing.nav.brandTitle')}
                  </Text>
                  <Badge size="xs" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
                    {t('landing.nav.brandBadge')}
                  </Badge>
                </Group>
              </div>
            </Group>
          </Link>

          {/* Desktop Nav Jump Links */}
          <Group gap="lg" visibleFrom="md">
            <Button variant="subtle" color="gray" size="sm" onClick={() => scrollTo('features')}>
              {t('landing.nav.features')}
            </Button>
            <Button variant="subtle" color="gray" size="sm" onClick={() => scrollTo('demo')}>
              {t('landing.nav.demo')}
            </Button>
            <Button variant="subtle" color="gray" size="sm" onClick={() => scrollTo('preview')}>
              {t('landing.nav.preview')}
            </Button>
            <Button
              component="a"
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              variant="subtle"
              color="gray"
              size="sm"
              leftSection={<IconBrandGithub size={16} />}
            >
              GitHub
            </Button>
          </Group>

          {/* Actions: Lang toggle, Theme, Launch CTA */}
          <Group gap="xs">
            {/* Language Switcher Route Link */}
            <Button
              variant="default"
              size="sm"
              radius="md"
              leftSection={<IconLanguage size={16} />}
              onClick={() => navigate(`/${otherLocale}`)}
              style={{ fontWeight: 600 }}
            >
              {otherLocaleLabel}
            </Button>

            {/* Dark / Light Toggle */}
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              aria-label="Toggle theme"
              onClick={toggleTheme}
            >
              {isDark ? <IconSun size={18} color="#f59e0b" /> : <IconMoon size={18} color="#4f46e5" />}
            </ActionIcon>

            {/* Launch App Primary CTA */}
            <Button
              component={Link}
              to="/app"
              size="sm"
              radius="md"
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan' }}
              rightSection={dir === 'rtl' ? <IconArrowLeft size={16} /> : <IconArrowRight size={16} />}
              style={{
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                fontWeight: 700,
              }}
              visibleFrom="sm"
            >
              {t('landing.nav.launchApp')}
            </Button>

            {/* Mobile Hamburger */}
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              hiddenFrom="md"
              size="sm"
              aria-label="Toggle navigation"
            />
          </Group>
        </Group>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Group gap="xs">
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <IconCalendarEvent size={16} />
            </Box>
            <Text fw={700} size="sm">{t('landing.nav.brandTitle')}</Text>
          </Group>
        }
        padding="md"
        size="xs"
      >
        <Stack gap="sm" mt="md">
          <Button variant="light" fullWidth justify="start" onClick={() => scrollTo('features')}>
            {t('landing.nav.features')}
          </Button>
          <Button variant="light" fullWidth justify="start" onClick={() => scrollTo('demo')}>
            {t('landing.nav.demo')}
          </Button>
          <Button variant="light" fullWidth justify="start" onClick={() => scrollTo('preview')}>
            {t('landing.nav.preview')}
          </Button>
          <Button
            component={Link}
            to="/app"
            fullWidth
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
            rightSection={dir === 'rtl' ? <IconArrowLeft size={16} /> : <IconArrowRight size={16} />}
            mt="md"
          >
            {t('landing.nav.launchApp')}
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}
