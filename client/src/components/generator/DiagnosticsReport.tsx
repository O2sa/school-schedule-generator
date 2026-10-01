import React from 'react';
import { Alert, Card, Stack, Text, Title, Badge, List, ThemeIcon, Group } from '@mantine/core';
import { IconAlertTriangle, IconInfoCircle, IconBulb } from '@tabler/icons-react';

export interface DiagnosticItem {
  code: string;
  message: string;
  teacherId?: string;
  classId?: string;
  details?: Record<string, unknown>;
}

interface DiagnosticsReportProps {
  diagnostics: DiagnosticItem[];
}

export function DiagnosticsReport({ diagnostics }: DiagnosticsReportProps) {
  const getArabicCodeTitle = (code: string) => {
    switch (code) {
      case 'TEACHER_CAPACITY_EXCEEDED':
        return 'تجاوز الطاقة الاستيعابية للمعلم';
      case 'TEACHER_DAILY_CAPACITY_DEFICIT':
        return 'عجز في السعة اليومية للمعلم';
      case 'CLASS_OVERBOOKED':
        return 'تجاوز نصاب حصص الفصل الدراسي';
      case 'TOTAL_CAPACITY_DEFICIT':
        return 'عجز إجمالي في طاقة الهيئة التعليمية';
      case 'SLOT_SATURATION':
        return 'تشبع الحصص المتاحة لقاعة أو فصل';
      default:
        return 'تعارض في القيود';
    }
  };

  return (
    <Card withBorder radius="md" p="lg" mt="md" style={{ borderColor: 'var(--mantine-color-red-4)' }}>
      <Stack gap="md">
        <Alert
          color="red"
          title="لم يتم العثور على حل متوافق مع كافة القيود"
          icon={<IconAlertTriangle size={20} />}
        >
          اكتشف محرك التحليل الذكي {diagnostics.length} تعارضات تمنع اكتمال الجدول بنسبة 100%. راجع
          التفاصيل أدناه لتعديل الأنصبة أو القيود:
        </Alert>

        <Stack gap="sm">
          {diagnostics.map((d, idx) => (
            <Card key={idx} withBorder p="sm" radius="sm" bg="var(--mantine-color-red-0)">
              <Group justify="space-between" mb={4}>
                <Badge color="red" variant="filled">
                  {getArabicCodeTitle(d.code)}
                </Badge>
                {d.teacherId && (
                  <Badge variant="outline" color="gray">
                    معلم: {d.teacherId}
                  </Badge>
                )}
              </Group>
              <Text size="sm" c="red.9" fw={500}>
                {d.message}
              </Text>
            </Card>
          ))}
        </Stack>

        <Card withBorder p="md" radius="sm" bg="var(--mantine-color-blue-0)">
          <Title order={5} mb="xs" c="blue.9">
            <Group gap="xs">
              <IconBulb size={18} />
              <span>إرشادات سريعة لمعالجة التعارضات:</span>
            </Group>
          </Title>
          <List size="sm" c="blue.8" spacing="xs">
            <List.Item>
              في حال تجاوز طاقة المعلم: قم بزيادة الحد اليومي للحصص من صفحة "المعلمون"، أو وزع بعض الحصص على معلم آخر في "الخطة الدراسية".
            </List.Item>
            <List.Item>
              في حال الحصص المحجوبة: تأكد من عدم حجب فترات طويلة لمعلم يحمل نصاباً مرتفعاً.
            </List.Item>
            <List.Item>
              تحقق من أن مجموع حصص الفصل الأسبوعية يطابق تماماً السعة (30 حصة لصفوف 1-4، و35 حصة لصفوف 5-12).
            </List.Item>
          </List>
        </Card>
      </Stack>
    </Card>
  );
}
