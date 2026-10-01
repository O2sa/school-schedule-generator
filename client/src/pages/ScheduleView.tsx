import React, { useState } from 'react';
import {
  Card,
  Group,
  SegmentedControl,
  Select,
  Text,
  Center,
  Loader,
  Alert,
  Button,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import {
  IconSchool,
  IconUser,
  IconTable,
  IconPrinter,
  IconInfoCircle,
  IconCpu,
} from '@tabler/icons-react';
import {
  useActiveSchedule,
  useClasses,
  useTeachers,
  useSubjects,
  useSchoolConfig,
} from '../api/queries/useSchoolData';
import { PageHeader } from '../components/common/PageHeader';
import { ClassTimetable } from '../components/timetable/ClassTimetable';
import { TeacherTimetable } from '../components/timetable/TeacherTimetable';
import { MasterMatrix } from '../components/timetable/MasterMatrix';
import { PrintTimetable } from '../components/timetable/PrintTimetable';

export function ScheduleView() {
  const navigate = useNavigate();
  const { data: schedule, isLoading } = useActiveSchedule();
  const { data: classes = [] } = useClasses();
  const { data: teachers = [] } = useTeachers();
  const { data: subjects = [] } = useSubjects();
  const { data: config } = useSchoolConfig();

  const [activeTab, setActiveTab] = useState<'class' | 'teacher' | 'master' | 'print'>('class');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  const activeClass = classes.find((c) => c.id === (selectedClassId || classes[0]?.id));
  const activeTeacher = teachers.find((t) => t.id === (selectedTeacherId || teachers[0]?.id));

  return (
    <div>
      <PageHeader
        title="عرض وتحليل الجدول المدرسي"
        subtitle={
          schedule
            ? `الجدول النشط: ${schedule.name} (تم تعيين ${schedule.assignments.length} حصة)`
            : 'استعراض الحصص المجدولة وطباعتها'
        }
      />

      {isLoading ? (
        <Center p="xl"><Loader /></Center>
      ) : !schedule || schedule.assignments.length === 0 ? (
        <Card withBorder radius="md" p="xl">
          <Alert color="indigo" title="لا يوجد جدول مدرسي مُولد بعد" icon={<IconInfoCircle size={20} />}>
            <Text size="sm" mb="md">
              لم يتم العثور على جدول مدرسي نشط. يمكنك الانتقال إلى صفحة التوليد لبدء حل القيود وإنشاء جدولك الأول.
            </Text>
            <Button
              color="indigo"
              leftSection={<IconCpu size={16} />}
              onClick={() => navigate('/generator')}
            >
              الانتقال إلى توليد الجدول
            </Button>
          </Alert>
        </Card>
      ) : (
        <div>
          {/* View Mode Selector Tabs */}
          <Card withBorder radius="md" p="sm" mb="md" className="no-print">
            <Group justify="space-between" align="center">
              <SegmentedControl
                value={activeTab}
                onChange={(val) => setActiveTab(val as typeof activeTab)}
                data={[
                  { label: 'جدول الفصل (Class)', value: 'class' },
                  { label: 'جدول المعلم (Teacher)', value: 'teacher' },
                  { label: 'الجدول العام للمدرسة (Matrix)', value: 'master' },
                  { label: 'طباعة وتصدير (Print/PDF)', value: 'print' },
                ]}
                color="indigo"
              />

              {activeTab === 'class' && (
                <Select
                  placeholder="اختر الفصل..."
                  data={classes.map((c) => ({ value: c.id, label: c.sectionName }))}
                  value={activeClass?.id}
                  onChange={setSelectedClassId}
                  style={{ width: 220 }}
                />
              )}

              {activeTab === 'teacher' && (
                <Select
                  placeholder="اختر المعلم..."
                  data={teachers.map((t) => ({ value: t.id, label: `${t.name} (${t.specialization})` }))}
                  value={activeTeacher?.id}
                  onChange={setSelectedTeacherId}
                  style={{ width: 240 }}
                />
              )}
            </Group>
          </Card>

          {/* Active Tab View */}
          {activeTab === 'class' && activeClass && (
            <ClassTimetable
              cls={activeClass}
              assignments={schedule.assignments}
              teachers={teachers}
              subjects={subjects}
            />
          )}

          {activeTab === 'teacher' && activeTeacher && (
            <TeacherTimetable
              teacher={activeTeacher}
              assignments={schedule.assignments}
              classes={classes}
              subjects={subjects}
            />
          )}

          {activeTab === 'master' && (
            <MasterMatrix
              classes={classes}
              teachers={teachers}
              subjects={subjects}
              assignments={schedule.assignments}
            />
          )}

          {activeTab === 'print' && config && (
            <PrintTimetable
              config={config}
              classes={classes}
              teachers={teachers}
              subjects={subjects}
              assignments={schedule.assignments}
            />
          )}
        </div>
      )}
    </div>
  );
}
