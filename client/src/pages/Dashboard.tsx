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
  ThemeIcon,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import {
  IconUsers,
  IconSchool,
  IconBook,
  IconCalendarTime,
  IconCpu,
  IconSparkles,
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
import { useTranslation } from '../i18n';

export function Dashboard() {
  const navigate = useNavigate();
  const service = useDataService();
  const [mode] = useStorageMode();
  const { t } = useTranslation();

  const { data: teachers = [], refetch: refetchTeachers } = useTeachers();
  const { data: classes = [], refetch: refetchClasses } = useClasses();
  const { data: subjects = [], refetch: refetchSubjects } = useSubjects();
  const { data: activeSchedule, refetch: refetchSchedule } = useActiveSchedule();
  const { data: config } = useSchoolConfig();

  const [preloading, setPreloading] = React.useState(false);

  const handlePreloadDemo = async () => {
    setPreloading(true);
    try {
      await service.preloadDemoData();
      await Promise.all([
        refetchTeachers(),
        refetchClasses(),
        refetchSubjects(),
        refetchSchedule(),
      ]);
    } finally {
      setPreloading(false);
    }
  };

  return (
    <div>
      <PageHeader
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
          background: 'linear-gradient(135deg, var(--mantine-color-indigo-7) 0%, var(--mantine-color-indigo-9) 100%)',
          color: 'white',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Stack gap="xs">
            <Group gap="xs" wrap="wrap">
              <Badge color="teal" variant="filled" size="lg">
                {mode === 'client' ? t('dashboard.heroBadgeClient') : t('dashboard.heroBadgeServer')}
              </Badge>
              <Badge color="gray" variant="light" size="lg">
                {t('dashboard.heroBadgeCSP')}
              </Badge>
            </Group>
            <Title order={2}>{t('dashboard.heroTitle')}</Title>
            <Text size="sm" style={{ opacity: 0.9, maxWidth: 650 }}>
              {t('dashboard.heroDesc')}
            </Text>
          </Stack>

          <Group wrap="wrap" gap="sm">
            <Button
              size="md"
              color="teal"
              variant="filled"
              leftSection={<IconSparkles size={18} />}
              loading={preloading}
              onClick={handlePreloadDemo}
            >
              {t('dashboard.preloadDemo')}
            </Button>
            <Button
              size="md"
              variant="white"
              color="indigo"
              leftSection={<IconCpu size={18} />}
              onClick={() => navigate('/generator')}
            >
              {t('dashboard.generateSchedule')}
            </Button>
          </Group>
        </Group>
      </Card>

      {/* Metric Cards */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700}>
                  {t('dashboard.statsTeachers')}
                </Text>
                <Title order={2} mt={4}>
                  {teachers.length}
                </Title>
              </div>
              <ThemeIcon color="indigo" variant="light" size="xl" radius="md">
                <IconUsers size={24} />
              </ThemeIcon>
            </Group>
            <Text size="xs" c="dimmed" mt="xs">
              {t('dashboard.statsTeachersSub')}
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700}>
                  {t('dashboard.statsClasses')}
                </Text>
                <Title order={2} mt={4}>
                  {classes.length}
                </Title>
              </div>
              <ThemeIcon color="teal" variant="light" size="xl" radius="md">
                <IconSchool size={24} />
              </ThemeIcon>
            </Group>
            <Text size="xs" c="dimmed" mt="xs">
              {t('dashboard.statsClassesSub')}
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700}>
                  {t('dashboard.statsSubjects')}
                </Text>
                <Title order={2} mt={4}>
                  {subjects.length}
                </Title>
              </div>
              <ThemeIcon color="orange" variant="light" size="xl" radius="md">
                <IconBook size={24} />
              </ThemeIcon>
            </Group>
            <Text size="xs" c="dimmed" mt="xs">
              {t('dashboard.statsSubjectsSub')}
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700}>
                  {t('dashboard.statsActiveSchedule')}
                </Text>
                <Title order={3} mt={4} c={activeSchedule ? 'teal' : 'gray'}>
                  {activeSchedule ? t('dashboard.statsActiveScheduleSolved') : t('dashboard.statsActiveScheduleNone')}
                </Title>
              </div>
              <ThemeIcon color={activeSchedule ? 'teal' : 'gray'} variant="light" size="xl" radius="md">
                <IconCalendarTime size={24} />
              </ThemeIcon>
            </Group>
            <Text size="xs" c="dimmed" mt="xs">
              {activeSchedule ? t('dashboard.statsLecturesCount', { count: activeSchedule.assignments.length }) : t('dashboard.statsNoSchedule')}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Quick Launchpad */}
      <Title order={4} mb="md">
        {t('dashboard.quickLaunch')}
      </Title>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card
            withBorder
            radius="md"
            p="md"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/classes')}
          >
            <Group>
              <ThemeIcon size="lg" color="indigo" radius="md">
                <IconSchool size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="sm">
                  {t('dashboard.cardClasses')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('dashboard.cardClassesDesc')}
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card
            withBorder
            radius="md"
            p="md"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/curriculum')}
          >
            <Group>
              <ThemeIcon size="lg" color="teal" radius="md">
                <IconBook size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="sm">
                  {t('dashboard.cardCurriculum')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('dashboard.cardCurriculumDesc')}
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card
            withBorder
            radius="md"
            p="md"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/schedule')}
          >
            <Group>
              <ThemeIcon size="lg" color="blue" radius="md">
                <IconCalendarTime size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="sm">
                  {t('dashboard.cardTimetables')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('dashboard.cardTimetablesDesc')}
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}
