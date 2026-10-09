import React from 'react';
import {
  Container,
  SimpleGrid,
  Card,
  Text,
  useComputedColorScheme,
} from '@mantine/core';
import { useTranslation } from '../../i18n';

export function StatsRibbon() {
  const { t } = useTranslation();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';

  const stats = [
    {
      value: t('landing.stats.stat1Value'),
      title: t('landing.stats.stat1Title'),
      desc: t('landing.stats.stat1Desc'),
      gradient: { from: '#4f46e5', to: '#06b6d4' },
    },
    {
      value: t('landing.stats.stat2Value'),
      title: t('landing.stats.stat2Title'),
      desc: t('landing.stats.stat2Desc'),
      gradient: { from: '#06b6d4', to: '#10b981' },
    },
    {
      value: t('landing.stats.stat3Value'),
      title: t('landing.stats.stat3Title'),
      desc: t('landing.stats.stat3Desc'),
      gradient: { from: '#10b981', to: '#f59e0b' },
    },
    {
      value: t('landing.stats.stat4Value'),
      title: t('landing.stats.stat4Title'),
      desc: t('landing.stats.stat4Desc'),
      gradient: { from: '#f59e0b', to: '#ec4899' },
    },
  ];

  return (
    <Container component="section" id="stats" aria-label="Key Performance Metrics" size="xl" py={{ base: 30, md: 50 }}>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        {stats.map((s, idx) => (
          <Card
            key={idx}
            withBorder
            radius="md"
            p="lg"
            style={{
              background: isDark ? 'rgba(26, 27, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              textAlign: 'center',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
          >
            <Text
              fw={900}
              size="2.2rem"
              style={{ lineHeight: 1.1, letterSpacing: '-1px' }}
              variant="gradient"
              gradient={{ from: s.gradient.from, to: s.gradient.to, deg: 90 }}
              mb="xs"
            >
              {s.value}
            </Text>
            <Text fw={700} size="md" mb={4}>{s.title}</Text>
            <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>{s.desc}</Text>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
