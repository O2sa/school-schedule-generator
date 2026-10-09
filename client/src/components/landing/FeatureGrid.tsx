import React from 'react';
import {
  Container,
  Title,
  Text,
  Badge,
  SimpleGrid,
  Card,
  Box,
  Stack,
  useComputedColorScheme,
} from '@mantine/core';
import {
  IconCpu,
  IconArrowsExchange,
  IconUserCheck,
  IconLanguage,
  IconFileSpreadsheet,
  IconSparkles,
} from '@tabler/icons-react';
import { useTranslation } from '../../i18n';

export function FeatureGrid() {
  const { t } = useTranslation();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';

  const items = [
    {
      icon: <IconCpu size={26} color="#4f46e5" />,
      title: t('landing.features.f1Title'),
      desc: t('landing.features.f1Desc'),
      color: '#4f46e5',
    },
    {
      icon: <IconArrowsExchange size={26} color="#06b6d4" />,
      title: t('landing.features.f2Title'),
      desc: t('landing.features.f2Desc'),
      color: '#06b6d4',
    },
    {
      icon: <IconUserCheck size={26} color="#10b981" />,
      title: t('landing.features.f3Title'),
      desc: t('landing.features.f3Desc'),
      color: '#10b981',
    },
    {
      icon: <IconLanguage size={26} color="#8b5cf6" />,
      title: t('landing.features.f4Title'),
      desc: t('landing.features.f4Desc'),
      color: '#8b5cf6',
    },
    {
      icon: <IconFileSpreadsheet size={26} color="#f59e0b" />,
      title: t('landing.features.f5Title'),
      desc: t('landing.features.f5Desc'),
      color: '#f59e0b',
    },
    {
      icon: <IconSparkles size={26} color="#ec4899" />,
      title: t('landing.features.f6Title'),
      desc: t('landing.features.f6Desc'),
      color: '#ec4899',
    },
  ];

  return (
    <Box component="section" id="features" aria-label={t('landing.features.sectionTitle')} py={{ base: 40, md: 70 }}>
      <Container size="xl">
        <Stack align="center" gap="xs" mb={40} style={{ textAlign: 'center' }}>
          <Badge size="md" variant="light" color="indigo">
            {t('landing.features.tag')}
          </Badge>
          <Title order={2} size="h1" fw={900} style={{ letterSpacing: '-0.5px' }}>
            {t('landing.features.sectionTitle')}
          </Title>
          <Text c="dimmed" size="md" maw={640}>
            {t('landing.features.sectionDesc')}
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {items.map((item, idx) => (
            <Card
              key={idx}
              withBorder
              radius="lg"
              p="xl"
              style={{
                background: isDark ? 'rgba(26, 27, 30, 0.5)' : 'rgba(255, 255, 255, 0.75)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
            >
              <Box
                mb="md"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </Box>
              <Text fw={800} size="lg" mb="xs">
                {item.title}
              </Text>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                {item.desc}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
