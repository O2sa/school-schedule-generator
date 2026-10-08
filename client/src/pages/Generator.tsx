import React, { useState, useEffect } from 'react';
import {
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  Button,
  Progress,
  NumberInput,
  Badge,
  Alert,
  Box,
  useComputedColorScheme,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  IconCpu,
  IconCheck,
  IconRefresh,
  IconCalendarTime,
  IconExclamationCircle,
  IconRocket,
  IconSparkles,
} from '@tabler/icons-react';
import {
  useClasses,
  useTeachers,
  useCurriculum,
  useSchoolConfig,
  useSchedules,
} from '../api/queries/useSchoolData';
import { useData, useDataService } from '../api/data-context';
import { PageHeader } from '../components/common/PageHeader';
import { DashboardMetricCard } from '../components/common/DashboardMetricCard';
import { DiagnosticsReport, type DiagnosticItem } from '../components/generator/DiagnosticsReport';
import { useTranslation } from '../i18n';
import type { SavedScheduleRecord, SolverProgress } from '../api/types';
import { BRAND_GRADIENT } from '../theme/theme';

export function Generator() {
  const navigate = useNavigate();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';
  const service = useDataService();
  const queryClient = useQueryClient();
  const { mode } = useData();
  const { t, dir } = useTranslation();

  const { data: classes = [] } = useClasses();
  const { data: teachers = [] } = useTeachers();
  const { data: curriculum = [] } = useCurriculum();
  const { data: config } = useSchoolConfig();
  const { refetch: refetchSchedules } = useSchedules();

  const [timeoutSec, setTimeoutSec] = useState<number>(15);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [progress, setProgress] = useState<SolverProgress | null>(null);
  const [lastResult, setLastResult] = useState<SavedScheduleRecord | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSolving) {
      const start = Date.now();
      interval = setInterval(() => {
        setElapsedMs(Date.now() - start);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isSolving]);

  const totalRequiredLectures = curriculum.reduce((acc, c) => acc + c.periodsPerWeek, 0);
  const totalClassCapacity = classes.reduce((acc, c) => acc + c.periodsPerDay * 5, 0);

  const handleStartSolving = async () => {
    setIsSolving(true);
    setDiagnostics(null);
    setErrorMsg(null);
    setLastResult(null);
    setElapsedMs(0);

    try {
      const schedule = await service.generateSchedule(
        { timeoutMs: timeoutSec * 1000 },
        (p) => setProgress(p)
      );

      setLastResult(schedule);
      queryClient.setQueryData(['activeSchedule', mode], schedule);
      await Promise.all([
        refetchSchedules(),
        queryClient.invalidateQueries({ queryKey: ['activeSchedule', mode] }),
        queryClient.invalidateQueries({ queryKey: ['schedules', mode] }),
      ]);
    } catch (err: unknown) {
      const e = err as { message?: string; diagnostics?: DiagnosticItem[] };
      if (e?.diagnostics && Array.isArray(e.diagnostics)) {
        setDiagnostics(e.diagnostics);
      } else {
        const rawMsg = e?.message || '';
        const isTimeout = rawMsg.toLowerCase().includes('timeout') || rawMsg.includes('مهلة');
        const isInf = rawMsg.toLowerCase().includes('infeasible') || rawMsg.includes('غير قابل للحل');
        const displayMsg = isTimeout
          ? t('generator.timeoutDesc')
          : isInf
          ? t('generator.infeasibleDesc')
          : rawMsg || t('generator.errorTitle');
        setErrorMsg(displayMsg);
      }
    } finally {
      setIsSolving(false);
    }
  };

  const handleCancel = () => {
    service.cancelGeneration();
    setIsSolving(false);
  };

  return (
    <div>
      <PageHeader
        categoryBadge={t('nav.generator') || 'محرك الذكاء الاصطناعي'}
        title={t('generator.title')}
        subtitle={t('generator.subtitle')}
      />

      {/* Metrics Row */}
      <Grid mb="lg">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <DashboardMetricCard
            title={t('generator.metricClasses')}
            value={`${classes.length} ${t('common.classesCount', { count: '' })}`}
            icon={IconCpu}
            gradient="linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <DashboardMetricCard
            title={t('generator.metricTeachers')}
            value={`${teachers.length} ${t('common.teachersCount', { count: '' })}`}
            icon={IconCpu}
            gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <DashboardMetricCard
            title={t('generator.metricRequired')}
            value={`${totalRequiredLectures} ${t('common.periods')}`}
            icon={IconCpu}
            gradient="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <DashboardMetricCard
            title={t('generator.metricCapacity')}
            value={`${totalClassCapacity} ${t('common.periods')}`}
            icon={IconCpu}
            gradient={totalRequiredLectures === totalClassCapacity ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'}
            badgeLabel={totalRequiredLectures === totalClassCapacity ? (dir === 'rtl' ? 'متطابق' : 'Balanced') : (dir === 'rtl' ? 'تفاوت' : 'Differs')}
            badgeColor={totalRequiredLectures === totalClassCapacity ? 'teal' : 'orange'}
          />
        </Grid.Col>
      </Grid>

      {/* Solver Action Center */}
      <Card
        withBorder
        radius="lg"
        p="xl"
        mb="lg"
        style={{
          background: isDark ? 'rgba(26, 27, 30, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Stack gap="lg">
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <div>
              <Group gap="xs" mb={4}>
                <Title order={3} fw={800}>
                  {t('generator.controlTitle')}
                </Title>
                <Badge variant="light" color="indigo" size="sm" radius="xl">
                  CSP Solver
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {t('generator.solverEngine')} {service.mode === 'client' ? t('generator.modeWorker') : t('generator.modeServer')}
              </Text>
            </div>
            <Group wrap="wrap" gap="sm" align="flex-end">
              <NumberInput
                label={t('generator.timeoutLabel')}
                value={timeoutSec}
                onChange={(val) => setTimeoutSec(Number(val) || 15)}
                min={5}
                max={60}
                disabled={isSolving}
                radius="md"
                style={{ width: 140 }}
              />
              <Button
                size="lg"
                variant="gradient"
                gradient={{ from: 'indigo', to: 'cyan', deg: 90 }}
                radius="md"
                leftSection={isSolving ? <IconRefresh className="mantine-rotate" size={20} /> : <IconRocket size={20} />}
                loading={isSolving}
                disabled={classes.length === 0 || curriculum.length === 0}
                onClick={handleStartSolving}
                style={{
                  boxShadow: '0 4px 16px rgba(79, 70, 229, 0.35)',
                  fontWeight: 700,
                }}
              >
                {isSolving ? t('generator.solvingBtn') : t('generator.startBtn')}
              </Button>
              {isSolving && (
                <Button size="lg" variant="default" color="red" radius="md" onClick={handleCancel}>
                  {t('generator.cancelBtn')}
                </Button>
              )}
            </Group>
          </Group>

          {/* Live Telemetry Display */}
          {isSolving && (
            <Card
              withBorder
              radius="lg"
              p="lg"
              style={{
                background: isDark ? 'rgba(79, 70, 229, 0.12)' : 'rgba(79, 70, 229, 0.04)',
                borderColor: 'rgba(79, 70, 229, 0.25)',
              }}
            >
              <Stack gap="sm">
                <Group justify="space-between" wrap="wrap">
                  <Group gap="xs">
                    <IconSparkles size={18} color="var(--mantine-color-indigo-5)" />
                    <Text size="sm" fw={700}>
                      {t('generator.solvingProgress')}
                    </Text>
                    <Badge variant="dot" color="indigo" size="sm">
                      {dir === 'rtl' ? 'استدلال وفحص استباقي...' : 'Forward Checking & Propagation...'}
                    </Badge>
                  </Group>
                  <Badge color="indigo" size="lg" radius="md" variant="filled">
                    {elapsedMs} {t('generator.msUnit')}
                  </Badge>
                </Group>
                <Progress
                  value={100}
                  animated
                  size="md"
                  radius="xl"
                  color="indigo"
                  style={{
                    boxShadow: '0 0 12px rgba(79, 70, 229, 0.35)',
                  }}
                />
              </Stack>
            </Card>
          )}

          {/* Outcome Status */}
          {lastResult && lastResult.status === 'solved' && (
            <Card
              withBorder
              radius="lg"
              p="lg"
              style={{
                background: isDark ? 'rgba(5, 150, 105, 0.12)' : 'rgba(5, 150, 105, 0.06)',
                borderColor: 'rgba(5, 150, 105, 0.3)',
              }}
            >
              <Stack gap="xs">
                <Group justify="space-between" wrap="wrap">
                  <Group gap="xs">
                    <IconCheck size={24} color="var(--mantine-color-teal-6)" />
                    <Title order={4} fw={800} c="teal">
                      {t('generator.solvedAlert')}
                    </Title>
                    <Badge color="teal" size="sm" variant="filled" radius="xl">
                      0 Clashes Guaranteed
                    </Badge>
                  </Group>
                  <Button
                    color="teal"
                    variant="filled"
                    radius="md"
                    leftSection={<IconCalendarTime size={18} />}
                    onClick={() => navigate('/app/schedule')}
                    style={{ fontWeight: 700 }}
                  >
                    {t('generator.viewSchedule')}
                  </Button>
                </Group>
                <Text size="sm" c="dimmed">
                  {t('generator.solvedDesc', {
                    count: lastResult.assignments.length,
                    time: lastResult.solveTimeMs,
                  })}
                </Text>
              </Stack>
            </Card>
          )}

          {errorMsg && (
            <Alert color="red" radius="md" title={t('generator.errorTitle')} icon={<IconExclamationCircle size={20} />}>
              {errorMsg}
            </Alert>
          )}

          {diagnostics && diagnostics.length > 0 && <DiagnosticsReport diagnostics={diagnostics} />}
        </Stack>
      </Card>
    </div>
  );
}
