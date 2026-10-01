import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Grid,
  Group,
  Progress,
  Stack,
  Text,
  Title,
  Badge,
  NumberInput,
  ThemeIcon,
  Alert,
} from '@mantine/core';
import {
  IconCpu,
  IconCheck,
  IconClock,
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
import { useDataService } from '../api/data-context';
import { PageHeader } from '../components/common/PageHeader';
import { DiagnosticsReport, type DiagnosticItem } from '../components/generator/DiagnosticsReport';
import type { SavedScheduleRecord, SolverProgress } from '../api/types';

export function Generator() {
  const navigate = useNavigate();
  const service = useDataService();

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

  // Live timer while solving
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
      await refetchSchedules();
    } catch (err: unknown) {
      const e = err as { message?: string; diagnostics?: DiagnosticItem[] };
      if (e?.diagnostics && Array.isArray(e.diagnostics)) {
        setDiagnostics(e.diagnostics);
      } else {
        setErrorMsg(e?.message || 'حدث خطأ غير متوقع أثناء معالجة الجدول');
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
        title="توليد الجدول المدرسي الذكي"
        subtitle="محرك CSP ذكي يقوم بتوزيع الحصص وحل التعارضات بالكامل وفق القيود المدرسية"
      />

      {/* Metrics Row */}
      <Grid mb="lg">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Text size="xs" c="dimmed" fw={700}>
              إجمالي الفصول والقاعات
            </Text>
            <Title order={3} mt={4}>
              {classes.length} فصل
            </Title>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Text size="xs" c="dimmed" fw={700}>
              إجمالي المعلمين
            </Text>
            <Title order={3} mt={4}>
              {teachers.length} معلم
            </Title>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Text size="xs" c="dimmed" fw={700}>
              الحصص المطلوبة أسبوعياً
            </Text>
            <Title order={3} mt={4} c="indigo">
              {totalRequiredLectures} حصة
            </Title>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Text size="xs" c="dimmed" fw={700}>
              السعة الاستيعابية للفصول
            </Text>
            <Title order={3} mt={4} c={totalRequiredLectures === totalClassCapacity ? 'teal' : 'orange'}>
              {totalClassCapacity} حصة
            </Title>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Solver Action Center */}
      <Card withBorder radius="md" p="xl" mb="lg">
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <div>
              <Title order={3}>مركز التحكم بالتوليد</Title>
              <Text size="sm" c="dimmed">
                وضع المحرك: {service.mode === 'client' ? 'Web Worker محلي في المتصفح' : 'معالجة على خادم النظام'}
              </Text>
            </div>
            <Group>
              <NumberInput
                label="الحد الأقصى للوقت (ثوان)"
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
                {isSolving ? 'جارِ التحليل والتوليد...' : 'بدء توليد الجدول'}
              </Button>
              {isSolving && (
                <Button size="lg" variant="default" color="red" onClick={handleCancel} mt={24}>
                  إلغاء
                </Button>
              )}
            </Group>
          </Group>

          {isSolving && (
            <Card withBorder p="md" bg="var(--mantine-color-indigo-0)">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" fw={600}>
                    معالجة فضاء البحث والتحقق الاستباقي (Forward Checking)...
                  </Text>
                  <Badge color="indigo" size="lg">
                    {elapsedMs} مللي ثانية
                  </Badge>
                </Group>
                <Progress value={100} animated color="indigo" size="md" radius="xl" />
              </Stack>
            </Card>
          )}

          {lastResult && lastResult.status === 'solved' && (
            <Alert
              color="teal"
              title="تم إنشاء الجدول الدراسي بنجاح تام!"
              icon={<IconCheck size={20} />}
            >
              <Stack gap="xs" mt={4}>
                <Text size="sm">
                  تم تعيين جميع الـ {lastResult.assignments.length} حصة بنجاح دون أي تعارض زمني في زمن قدره{' '}
                  <Text span fw={700}>
                    {lastResult.solveTimeMs} مللي ثانية
                  </Text>
                  .
                </Text>
                <Group mt="xs">
                  <Button
                    color="teal"
                    leftSection={<IconCalendarTime size={16} />}
                    onClick={() => navigate('/schedule')}
                  >
                    عرض الجدول المدرسي الآن
                  </Button>
                </Group>
              </Stack>
            </Alert>
          )}

          {errorMsg && (
            <Alert color="red" title="خطأ في التوليد" icon={<IconExclamationCircle size={20} />}>
              {errorMsg}
            </Alert>
          )}

          {diagnostics && diagnostics.length > 0 && <DiagnosticsReport diagnostics={diagnostics} />}
        </Stack>
      </Card>
    </div>
  );
}
