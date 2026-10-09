import React, { useState, useEffect } from 'react';
import {
  Card,
  Group,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Box,
  Progress,
  useComputedColorScheme,
} from '@mantine/core';
import {
  IconCpu,
  IconCheck,
  IconReload,
  IconShieldCheck,
  IconClock,
  IconUsers,
  IconBooks,
} from '@tabler/icons-react';
import { useTranslation } from '../../i18n';

export function LiveSolverDemo() {
  const { t } = useTranslation();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const [lectures, setLectures] = useState(240);
  const [teachers, setTeachers] = useState(47);
  const [conflicts, setConflicts] = useState(0);
  const [solveTime, setSolveTime] = useState(124);
  const [status, setStatus] = useState<'optimal' | 'running' | 'ready'>('optimal');

  const runSimulation = () => {
    setIsRunning(true);
    setStatus('running');
    setProgress(15);
    setLectures(40);
    setConflicts(3);
    setSolveTime(45);

    const timer1 = setTimeout(() => {
      setProgress(65);
      setLectures(180);
      setConflicts(1);
      setSolveTime(88);
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(100);
      setLectures(240);
      setTeachers(47);
      setConflicts(0);
      setSolveTime(124);
      setStatus('optimal');
      setIsRunning(false);
    }, 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  return (
    <Card
      id="demo"
      aria-label={t('landing.solver.title')}
      withBorder
      radius="lg"
      p="lg"
      style={{
        background: isDark ? 'rgba(26, 27, 30, 0.75)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.2)',
        boxShadow: isDark
          ? '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(79, 70, 229, 0.15)'
          : '0 12px 32px rgba(79, 70, 229, 0.12)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <Group justify="space-between" align="center" mb="md" wrap="wrap" gap="xs">
        <Group gap="xs">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <IconCpu size={18} />
          </Box>
          <div>
            <Text fw={700} size="sm">{t('landing.solver.title')}</Text>
            <Text size="xs" c="dimmed">{t('landing.solver.subtitle')}</Text>
          </div>
        </Group>

        <Badge
          color={status === 'optimal' ? 'teal' : status === 'running' ? 'indigo' : 'gray'}
          variant="light"
          size="md"
          leftSection={status === 'optimal' ? <IconCheck size={12} /> : undefined}
        >
          {status === 'optimal'
            ? t('landing.solver.statusOptimal')
            : status === 'running'
            ? t('landing.solver.statusSolving')
            : t('landing.solver.statusReady')}
        </Badge>
      </Group>

      {/* Progress Bar */}
      <Progress
        value={progress}
        animated={isRunning}
        color={status === 'optimal' ? 'teal' : 'indigo'}
        size="sm"
        radius="xl"
        mb="md"
      />

      {/* Real-time Metric Cards */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs" mb="md">
        <Box
          p="xs"
          style={{
            borderRadius: 8,
            background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
            textAlign: 'center',
          }}
        >
          <Group justify="center" gap={4} mb={2}>
            <IconBooks size={14} color="#3b82f6" />
            <Text size="xs" c="dimmed">{t('landing.solver.metricLectures')}</Text>
          </Group>
          <Text fw={800} size="lg" c="blue">{lectures}</Text>
        </Box>

        <Box
          p="xs"
          style={{
            borderRadius: 8,
            background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
            textAlign: 'center',
          }}
        >
          <Group justify="center" gap={4} mb={2}>
            <IconUsers size={14} color="#8b5cf6" />
            <Text size="xs" c="dimmed">{t('landing.solver.metricTeachers')}</Text>
          </Group>
          <Text fw={800} size="lg" c="grape">{teachers}</Text>
        </Box>

        <Box
          p="xs"
          style={{
            borderRadius: 8,
            background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
            textAlign: 'center',
          }}
        >
          <Group justify="center" gap={4} mb={2}>
            <IconShieldCheck size={14} color="#10b981" />
            <Text size="xs" c="dimmed">{t('landing.solver.metricConflicts')}</Text>
          </Group>
          <Text fw={800} size="lg" c={conflicts === 0 ? 'teal' : 'red'}>{conflicts}</Text>
        </Box>

        <Box
          p="xs"
          style={{
            borderRadius: 8,
            background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
            textAlign: 'center',
          }}
        >
          <Group justify="center" gap={4} mb={2}>
            <IconClock size={14} color="#f59e0b" />
            <Text size="xs" c="dimmed">{t('landing.solver.metricTime')}</Text>
          </Group>
          <Text fw={800} size="lg" c="yellow">{solveTime}ms</Text>
        </Box>
      </SimpleGrid>

      {/* Action Footer */}
      <Group justify="space-between" align="center" wrap="wrap" gap="xs">
        <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
          {t('landing.solver.simulationNotice')}
        </Text>

        <Button
          size="xs"
          variant="light"
          color="indigo"
          leftSection={<IconReload size={14} />}
          loading={isRunning}
          onClick={runSimulation}
        >
          {isRunning ? t('landing.solver.runningBtn') : t('landing.solver.runBtn')}
        </Button>
      </Group>
    </Card>
  );
}
