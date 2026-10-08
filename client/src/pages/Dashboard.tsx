import React from 'react';
import {
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  Button,
  Badge,
  Box,
  useComputedColorScheme,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import {
  IconUsers,
  IconSchool,
  IconBook,
  IconCalendarTime,
  IconCpu,
  IconSparkles,
  IconArrowRight,
  IconArrowLeft,
} from '@tabler/icons-react';
import {
  useTeachers,
  useClasses,
  useSubjects,
  useActiveSchedule,
  useSchoolConfig,
} from '../api/queries/useSchoolData';
import { useDataService, useStorageMode } from '../api/data-context';
import { PageHeader } from '../components/common/PageHeader';
import { DashboardMetricCard } from '../components/common/DashboardMetricCard';
import { useTranslation } from '../i18n';
import { DemoDataModal } from '../components/common/DemoDataModal';
import { BRAND_GRADIENT } from '../theme/theme';

export function Dashboard() {
  const navigate = useNavigate();
  const service = useDataService();
  const [mode] = useStorageMode();
  const { t, dir } = useTranslation();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';

  const { data: teachers = [], refetch: refetchTeachers } = useTeachers();
  const { data: classes = [], refetch: refetchClasses } = useClasses();
  const { data: subjects = [], refetch: refetchSubjects } = useSubjects();
  const { data: activeSchedule, refetch: refetchSchedule } = useActiveSchedule();
  const { data: config, refetch: refetchConfig } = useSchoolConfig();
  const [demoModalOpen, setDemoModalOpen] = React.useState(false);

  const handleDemoSuccess = async () => {
    await Promise.all([
      refetchConfig(),
      refetchTeachers(),
      refetchClasses(),
      refetchSubjects(),
      refetchSchedule(),
    ]);
  };

  const ArrowIcon = dir === 'rtl' ? IconArrowLeft : IconArrowRight;

  return (
    <div>
      <PageHeader
        categoryBadge={t('nav.dashboard') || 'لوحة القيادة'}
        title={config?.schoolName || t('dashboard.defaultSchoolName')}
        subtitle={t('dashboard.subtitle', {
          year: config?.academicYear || '2026/2027',
          term: config?.term || t('dashboard.defaultTerm'),
        })}
      />

      {/* Hero Welcome Banner */}
      <Card
        withBorder
        radius="lg"
        p="xl"
        mb="xl"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
          borderColor: isDark ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Stack gap="xs" style={{ maxWidth: 700 }}>
            <Group gap="xs" wrap="wrap">
              <Badge color="teal" variant="light" size="sm" radius="xl">
                {mode === 'client' ? t('dashboard.heroBadgeClient') : t('dashboard.heroBadgeServer')}
              </Badge>
              <Badge
                variant="gradient"
                gradient={{ from: 'indigo', to: 'cyan', deg: 90 }}
                size="sm"
                radius="xl"
              >
                {t('dashboard.heroBadgeCSP')}
              </Badge>
            </Group>
            <Title order={2} fw={800} style={{ letterSpacing: '-0.4px' }}>
              {t('dashboard.heroTitle')}
            </Title>
            <Text size="sm" c="dimmed">
              {t('dashboard.heroDesc')}
            </Text>
          </Stack>

          <Group wrap="wrap" gap="sm">
            <Button
              size="md"
              variant="default"
              radius="md"
              leftSection={<IconSparkles size={18} color="var(--mantine-color-indigo-6)" />}
              onClick={() => setDemoModalOpen(true)}
            >
              {t('dashboard.preloadDemo')}
            </Button>
            <Button
              size="md"
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan', deg: 90 }}
              radius="md"
              leftSection={<IconCpu size={18} />}
              onClick={() => navigate('/app/generator')}
              style={{
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                fontWeight: 700,
              }}
            >
              {t('dashboard.generateSchedule')}
            </Button>
          </Group>
        </Group>
      </Card>

      {/* Metric Cards (Landing Page Stats Style) */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <DashboardMetricCard
            title={t('dashboard.statsTeachers')}
            value={teachers.length}
            icon={IconUsers}
            gradient="linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)"
            badgeLabel={teachers.length > 0 ? (dir === 'rtl' ? 'معتمد' : 'Staff') : undefined}
            badgeColor="indigo"
            subtext={t('dashboard.statsTeachersSub')}
            onClick={() => navigate('/app/teachers')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <DashboardMetricCard
            title={t('dashboard.statsClasses')}
            value={classes.length}
            icon={IconSchool}
            gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)"
            badgeLabel={classes.length > 0 ? (dir === 'rtl' ? 'نشط' : 'Active') : undefined}
            badgeColor="teal"
            subtext={t('dashboard.statsClassesSub')}
            onClick={() => navigate('/app/classes')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <DashboardMetricCard
            title={t('dashboard.statsSubjects')}
            value={subjects.length}
            icon={IconBook}
            gradient="linear-gradient(135deg, #d97706 0%, #f59e0b 100%)"
            badgeLabel={subjects.length > 0 ? (dir === 'rtl' ? 'منهج' : 'Courses') : undefined}
            badgeColor="orange"
            subtext={t('dashboard.statsSubjectsSub')}
            onClick={() => navigate('/app/curriculum')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <DashboardMetricCard
            title={t('dashboard.statsActiveSchedule')}
            value={activeSchedule ? t('dashboard.statsActiveScheduleSolved') : t('dashboard.statsActiveScheduleNone')}
            icon={IconCalendarTime}
            gradient={activeSchedule ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)'}
            badgeLabel={activeSchedule ? '0 Clashes' : undefined}
            badgeColor={activeSchedule ? 'teal' : 'gray'}
            subtext={
              activeSchedule
                ? t('dashboard.statsLecturesCount', { count: activeSchedule.assignments.length })
                : t('dashboard.statsNoSchedule')
            }
            onClick={() => navigate('/app/schedule')}
          />
        </Grid.Col>
      </Grid>

      {/* Quick Action Navigation Cards */}
      <Title order={3} mb="md" fw={700}>
        {dir === 'rtl' ? 'الوصول السريع والإدارة' : 'Quick Actions & Management'}
      </Title>

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card
            withBorder
            radius="lg"
            p="lg"
            onClick={() => navigate('/app/teachers')}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack gap="xs">
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <IconUsers size={22} />
              </Box>
              <Title order={4} fw={700}>
                {t('nav.teachers')}
              </Title>
              <Text size="xs" c="dimmed">
                {dir === 'rtl' ? 'إدارة المعلمين وتحديد أنصبة الحصص وتفرغ الأيام' : 'Manage faculty, quotas and availability constraints'}
              </Text>
            </Stack>
            <Group justify="flex-end" mt="md">
              <ArrowIcon size={18} color="var(--mantine-color-indigo-6)" />
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card
            withBorder
            radius="lg"
            p="lg"
            onClick={() => navigate('/app/classes')}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack gap="xs">
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <IconSchool size={22} />
              </Box>
              <Title order={4} fw={700}>
                {t('nav.classes')}
              </Title>
              <Text size="xs" c="dimmed">
                {dir === 'rtl' ? 'تهيئة الفصول الدراسية وتحديد عدد الحصص اليومية' : 'Configure classrooms, grades and daily periods'}
              </Text>
            </Stack>
            <Group justify="flex-end" mt="md">
              <ArrowIcon size={18} color="var(--mantine-color-teal-6)" />
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card
            withBorder
            radius="lg"
            p="lg"
            onClick={() => navigate('/app/curriculum')}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack gap="xs">
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <IconBook size={22} />
              </Box>
              <Title order={4} fw={700}>
                {t('nav.curriculum')}
              </Title>
              <Text size="xs" c="dimmed">
                {dir === 'rtl' ? 'توزيع المواد والخطط الدراسية لكل صف دراسي' : 'Assign subject hours and requirements per class'}
              </Text>
            </Stack>
            <Group justify="flex-end" mt="md">
              <ArrowIcon size={18} color="var(--mantine-color-orange-6)" />
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card
            withBorder
            radius="lg"
            p="lg"
            onClick={() => navigate('/app/schedule')}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack gap="xs">
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: BRAND_GRADIENT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <IconCalendarTime size={22} />
              </Box>
              <Title order={4} fw={700}>
                {t('nav.schedule')}
              </Title>
              <Text size="xs" c="dimmed">
                {dir === 'rtl' ? 'معاينة الجداول الأسبوعية والتعديل والتصدير' : 'View, edit and export verified master schedules'}
              </Text>
            </Stack>
            <Group justify="flex-end" mt="md">
              <ArrowIcon size={18} color="var(--mantine-color-indigo-6)" />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      <DemoDataModal
        opened={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSuccess={handleDemoSuccess}
      />
    </div>
  );
}
