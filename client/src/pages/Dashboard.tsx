import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  Button,
  ThemeIcon,
  Badge,
  Alert,
} from '@mantine/core';
import {
  IconUsers,
  IconSchool,
  IconBook,
  IconCpu,
  IconCalendarTime,
  IconDatabaseImport,
  IconCheck,
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

export function Dashboard() {
  const navigate = useNavigate();
  const service = useDataService();
  const [mode] = useStorageMode();

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
        title={config?.schoolName || 'نظام الجداول المدرسية الذكي'}
        subtitle={`العام الدراسي: ${config?.academicYear || '2026/2027'} | ${config?.term || 'الفصل الأول'}`}
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
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Group gap="xs">
              <Badge color="teal" variant="filled" size="lg">
                {mode === 'client' ? 'وضع المتصفح المحلي (مستقل)' : 'وضع الخادم المركزي'}
              </Badge>
              <Badge color="gray" variant="light" size="lg">
                محرك CSP الذكي
              </Badge>
            </Group>
            <Title order={2}>مرحباً بك في المنظومة الذكية لتوليد الجداول</Title>
            <Text size="sm" style={{ opacity: 0.9, maxWidth: 650 }}>
              منصة متطورة لتوزيع الحصص المدرسية وفق معايير المدارس العربية (صفوف 1-12، فترات 6 و7 حصص،
              أسبوع الأحد-الخميس)، مع منع التعارضات بدقة 100%.
            </Text>
          </Stack>

          <Group>
            <Button
              size="md"
              color="teal"
              variant="filled"
              leftSection={<IconSparkles size={18} />}
              loading={preloading}
              onClick={handlePreloadDemo}
            >
              تحميل نموذج مدرسة نموذجية (Demo)
            </Button>
            <Button
              size="md"
              variant="white"
              color="indigo"
              leftSection={<IconCpu size={18} />}
              onClick={() => navigate('/generator')}
            >
              توليد جدول جديد
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
                  الهيئة التعليمية
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
              معلم مسجل بالنظام
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700}>
                  الفصول والقاعات
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
              فصل دراسي (صفوف 1-12)
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700}>
                  المواد الدراسية
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
              مادة معتمدة في الخطة
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700}>
                  حالة الجدول المدرسي
                </Text>
                <Title order={3} mt={4} c={activeSchedule ? 'teal' : 'gray'}>
                  {activeSchedule ? 'مكتمل ونشط' : 'لم يولد بعد'}
                </Title>
              </div>
              <ThemeIcon color={activeSchedule ? 'teal' : 'gray'} variant="light" size="xl" radius="md">
                <IconCalendarTime size={24} />
              </ThemeIcon>
            </Group>
            <Text size="xs" c="dimmed" mt="xs">
              {activeSchedule ? `${activeSchedule.assignments.length} حصة مسندة` : 'اضغط توليد للبدء'}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Quick Launchpad */}
      <Title order={4} mb="md">
        الوصول السريع
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
                  إعداد الفصول والقاعات
                </Text>
                <Text size="xs" c="dimmed">
                  تحديد عدد الحصص لكل صف دراسي (6 أو 7 حصص)
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
                  الخطة الدراسية والأنصبة
                </Text>
                <Text size="xs" c="dimmed">
                  إسناد المواد للمعلمين وتحديد الحصص الأسبوعية
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
                  استعراض وطباعة الجداول
                </Text>
                <Text size="xs" c="dimmed">
                  عرض جداول الفصول والمعلمين والطباعة بصيغة A4
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}
