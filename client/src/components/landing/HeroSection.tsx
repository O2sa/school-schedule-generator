import React from 'react';
import {
  Box,
  Container,
  Title,
  Text,
  Button,
  Group,
  Badge,
  Stack,
  useComputedColorScheme,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import {
  IconArrowRight,
  IconArrowLeft,
  IconSparkles,
  IconShieldLock,
  IconBolt,
  IconCircleCheck,
} from '@tabler/icons-react';
import { useTranslation } from '../../i18n';
import { LiveSolverDemo } from './LiveSolverDemo';

export function HeroSection() {
  const { t, dir } = useTranslation();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';

  return (
    <Box
      component="section"
      id="hero"
      aria-label={t('landing.hero.title')}
      py={{ base: 30, sm: 50, md: 70 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: isDark
          ? 'radial-gradient(circle at 50% 10%, rgba(79, 70, 229, 0.15) 0%, rgba(26, 27, 30, 0) 70%)'
          : 'radial-gradient(circle at 50% 10%, rgba(79, 70, 229, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
      }}
    >
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Stack align="center" gap="lg" style={{ textAlign: 'center' }}>
          {/* Top Innovation Pill */}
          <Badge
            size="lg"
            radius="xl"
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
            leftSection={<IconSparkles size={14} />}
            style={{
              paddingTop: 4,
              paddingBottom: 4,
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
              textTransform: 'none',
              letterSpacing: '0.2px',
            }}
          >
            {t('landing.hero.badge')}
          </Badge>

          {/* Headline */}
          <Title
            order={1}
            style={{
              fontSize: 'clamp(1.75rem, 5.5vw, 3.6rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-1px',
              maxWidth: 960,
            }}
          >
            {t('landing.hero.title')}{' '}
            <Text
              component="span"
              inherit
              variant="gradient"
              gradient={{ from: '#4f46e5', to: '#06b6d4', deg: 90 }}
            >
              {t('landing.hero.titleHighlight')}
            </Text>
          </Title>

          {/* Subheadline */}
          <Text
            size="lg"
            c="dimmed"
            style={{
              maxWidth: 720,
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              lineHeight: 1.6,
            }}
          >
            {t('landing.hero.subtitle')}
          </Text>

          {/* Action Buttons */}
          <Group gap="sm" mt="xs" justify="center" wrap="nowrap">
            <Button
              component={Link}
              to="/app"
              size="lg"
              h={{ base: 38, sm: 44, md: 50 }}
              px={{ base: 12, sm: 20, md: 28 }}
              fz={{ base: 12.5, sm: 14, md: 16 }}
              radius="md"
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan' }}
              rightSection={dir === 'rtl' ? <IconArrowLeft size={18} /> : <IconArrowRight size={18} />}
              style={{
                boxShadow: '0 6px 20px rgba(79, 70, 229, 0.35)',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              {t('landing.hero.ctaPrimary')}
            </Button>

            <Button
              size="lg"
              h={{ base: 38, sm: 44, md: 50 }}
              px={{ base: 12, sm: 20, md: 28 }}
              fz={{ base: 12.5, sm: 14, md: 16 }}
              radius="md"
              variant="default"
              onClick={() => {
                const el = document.getElementById('demo');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {t('landing.hero.ctaSecondary')}
            </Button>
          </Group>

          {/* Feature Badges Ribbon */}
          <Group gap="lg" mt="sm" wrap="wrap" justify="center">
            <Group gap={6}>
              <IconShieldLock size={16} color="#10b981" />
              <Text size="xs" fw={600} c="dimmed">{t('landing.hero.badgeOffline')}</Text>
            </Group>
            <Group gap={6}>
              <IconCircleCheck size={16} color="#4f46e5" />
              <Text size="xs" fw={600} c="dimmed">{t('landing.hero.badgePrivacy')}</Text>
            </Group>
            <Group gap={6}>
              <IconBolt size={16} color="#f59e0b" />
              <Text size="xs" fw={600} c="dimmed">{t('landing.hero.badgeFast')}</Text>
            </Group>
          </Group>

          {/* Interactive Live Demo Embedded in Hero */}
          <Box id="demo" w="100%" maw={880} mt="xl">
            <LiveSolverDemo />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
