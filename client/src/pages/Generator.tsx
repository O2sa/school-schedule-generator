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
import { DiagnosticsReport, type DiagnosticItem } from '../components/generator/DiagnosticsReport';
import { useTranslation } from '../i18n';
import type { SavedScheduleRecord, SolverProgress } from '../api/types';

export function Generator() {
  const navigate = useNavigate();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';
  const service = useDataService();
  const queryClient = useQueryClient();
  const { mode } = useData();
  const { t } = useTranslation();

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
        const isTimeout = rawMsg.includes('مهلة') || rawMsg.includes('الوقت') || rawMsg.toLowerCase().includes('timeout');
        const isInf = rawMsg.includes('غير قابل') || rawMsg.toLowerCase().includes('infeasible');
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
        title={t('generator.title')}
        subtitle={t('generator.subtitle')}
      />

      {/* Metrics Row */}
      <Grid mb="lg">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Text size="xs" c="dimmed" fw={700}>
              {t('generator.metricClasses')}
            </Text>
            <Title order={3} mt={4}>
              {classes.length} {t('common.classesCount', { count: '' })}
            </Title>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Text size="xs" c="dimmed" fw={700}>
              {t('generator.metricTeachers')}
            </Text>
            <Title order={3} mt={4}>
              {teachers.length} {t('common.teachersCount', { count: '' })}
            </Title>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Text size="xs" c="dimmed" fw={700}>
              {t('generator.metricRequired')}
            </Text>
            <Title order={3} mt={4} c="indigo">
              {totalRequiredLectures} {t('common.periods')}
            </Title>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Text size="xs" c="dimmed" fw={700}>
              {t('generator.metricCapacity')}
            </Text>
            <Title order={3} mt={4} c={totalRequiredLectures === totalClassCapacity ? 'teal' : 'orange'}>
              {totalClassCapacity} {t('common.periods')}
            </Title>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Solver Action Center */}
      <Card withBorder radius="md" p="xl" mb="lg">
        <Stack gap="lg">
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <div>
              <Title order={3}>{t('generator.controlTitle')}</Title>
              <Text size="sm" c="dimmed">
                {t('generator.solverEngine')} {service.mode === 'client' ? t('generator.modeWorker') : t('generator.modeServer')}
              </Text>
            </div>
            <Group wrap="wrap" gap="sm">
              <NumberInput
                label={t('generator.timeoutLabel')}
                value={timeoutSec}
                onChange={(val) => setTimeoutSec(Number(val) || 15)}
                min={5}
                max={60}
                disabled={isSolving}
                style={{ width: 140 }}
              />
              <Button
                size="lg"
                color="indigo"
                leftSection={isSolving ? <IconRefresh className="mantine-rotate" size={20} /> : <IconCpu size={20} />}
                loading={isSolving}
                disabled={classes.length === 0 || curriculum.length === 0}
                onClick={handleStartSolving}
                mt={24}
              >
                {isSolving ? t('generator.solvingBtn') : t('generator.startBtn')}
              </Button>
              {isSolving && (
                <Button size="lg" variant="default" color="red" onClick={handleCancel} mt={24}>
                  {t('generator.cancelBtn')}
                </Button>
              )}
            </Group>
          </Group>

          {isSolving && (
            <Card withBorder p="md" bg={isDark ? "rgba(92, 124, 250, 0.15)" : "var(--mantine-color-indigo-0)"}>
              <Stack gap="xs">
                <Group justify="space-between" wrap="wrap">
                  <Text size="sm" fw={600}>
                    {t('generator.solvingProgress')}
                  </Text>
                  <Badge color="indigo" size="lg">
                    {elapsedMs} {t('generator.msUnit')}
                  </Badge>
                </Group>
                <Progress value={100} animated color="indigo" size="md" radius="xl" />
              </Stack>
            </Card>
          )}

          {lastResult && lastResult.status === 'solved' && (
            <Alert
              color="teal"
              title={t('generator.solvedAlert')}
              icon={<IconCheck size={20} />}
            >
              <Stack gap="xs" mt={4}>
                <Text size="sm">
                  {t('generator.solvedDesc', {
                    count: lastResult.assignments.length,
                    time: lastResult.solveTimeMs,
                  })}
                </Text>
                <Group mt="xs">
                  <Button
                    color="teal"
                    leftSection={<IconCalendarTime size={16} />}
                    onClick={() => navigate('/schedule')}
                  >
                    {t('generator.viewSchedule')}
                  </Button>
                </Group>
              </Stack>
            </Alert>
          )}

          {errorMsg && (
            <Alert color="red" title={t('generator.errorTitle')} icon={<IconExclamationCircle size={20} />}>
              {errorMsg}
            </Alert>
          )}

          {diagnostics && diagnostics.length > 0 && <DiagnosticsReport diagnostics={diagnostics} />}
        </Stack>
      </Card>
    </div>
  );
}
