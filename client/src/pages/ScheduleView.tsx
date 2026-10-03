import React, { useState, useMemo, useEffect } from 'react';
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
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import {
  IconSchool,
  IconUser,
  IconTable,
  IconPrinter,
  IconInfoCircle,
  IconCpu,
  IconPencil,
  IconCheck,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconDeviceFloppy,
  IconX,
} from '@tabler/icons-react';
import {
  useActiveSchedule,
  useClasses,
  useTeachers,
  useSubjects,
  useSchoolConfig,
  useCurriculum,
  useSchedules,
} from '../api/queries/useSchoolData';
import { useDataService } from '../api/data-context';
import { PageHeader } from '../components/common/PageHeader';
import { ClassTimetable } from '../components/timetable/ClassTimetable';
import { TeacherTimetable } from '../components/timetable/TeacherTimetable';
import { MasterMatrix } from '../components/timetable/MasterMatrix';
import { PrintTimetable } from '../components/timetable/PrintTimetable';
import { useTimetableEditor } from '../hooks/useTimetableEditor';
import { buildTimetableInput } from '../api/worker/solver-adapter';
import type { TimetableInput } from 'school-timetabling-engine';

export function ScheduleView() {
  const navigate = useNavigate();
  const service = useDataService();
  const { data: schedule, isLoading } = useActiveSchedule();
  const { refetch: refetchSchedules } = useSchedules();
  const { data: classes = [] } = useClasses();
  const { data: teachers = [] } = useTeachers();
  const { data: subjects = [] } = useSubjects();
  const { data: config } = useSchoolConfig();
  const { data: curriculum = [] } = useCurriculum();

  const [activeTab, setActiveTab] = useState<'class' | 'teacher' | 'master' | 'print'>('class');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const activeClass = classes.find((c) => c.id === (selectedClassId || classes[0]?.id));
  const activeTeacher = teachers.find((t) => t.id === (selectedTeacherId || teachers[0]?.id));

  // Build TimetableInput representation for engine move validator
  const timetableInput = useMemo<TimetableInput | null>(() => {
    if (!config || classes.length === 0 || teachers.length === 0) return null;
    return buildTimetableInput({ config, classes, teachers, subjects, curriculum });
  }, [config, classes, teachers, subjects, curriculum]);

  // Hook into interactive editing state
  const editor = useTimetableEditor({
    input: timetableInput,
    initialAssignments: schedule?.assignments || [],
    onSave: async (updated) => {
      if (!schedule) return;
      setIsSaving(true);
      try {
        await service.saveSchedule({
          ...schedule,
          assignments: updated,
        });
        await refetchSchedules();
        notifications.show({
          title: 'تم حفظ التعديلات بنجاح',
          message: `تم تحديث الجدول وحفظ ${updated.length} حصة.`,
          color: 'teal',
        });
      } catch (err: unknown) {
        notifications.show({
          title: 'خطأ أثناء الحفظ',
          message: err instanceof Error ? err.message : 'تعذر حفظ التعديلات',
          color: 'red',
        });
      } finally {
        setIsSaving(false);
      }
    },
    onConflict: (validation) => {
      const firstMsg = validation.conflicts[0]?.message || 'تعذر النقل لوجود تعارض في القيود المحددة';
      notifications.show({
        title: 'تعذر نقل الحصة',
        message: firstMsg,
        color: 'red',
      });
    },
  });

  // Global keyboard shortcuts for editing (Ctrl+Z, Ctrl+Y, Esc)
  useEffect(() => {
    if (!editor.isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          editor.redo();
        } else {
          editor.undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        editor.redo();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        editor.clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  // Active assignments to render (draft if editing, otherwise saved)
  const currentAssignments = editor.isEditing ? editor.draftAssignments : (schedule?.assignments || []);

  const editorProps = {
    isEditing: editor.isEditing,
    selectedSlot: editor.selectedSlot,
    validTargets: editor.validTargets,
    onSelectSlot: editor.selectSlot,
    onDropSlot: editor.executeMoveOrSwap,
    onClearSelection: editor.clearSelection,
  };

  return (
    <div>
      <PageHeader
        title="عرض وتحليل الجدول المدرسي"
        subtitle={
          schedule
            ? `الجدول النشط: ${schedule.name} (تم تعيين ${currentAssignments.length} حصة)`
            : 'استعراض الحصص المجدولة وطباعتها'
        }
        actions={
          schedule && schedule.assignments.length > 0 && activeTab !== 'print' && activeTab !== 'master' ? (
            <Button
              variant={editor.isEditing ? 'filled' : 'light'}
              color={editor.isEditing ? 'teal' : 'indigo'}
              leftSection={editor.isEditing ? <IconCheck size={18} /> : <IconPencil size={18} />}
              onClick={editor.toggleEditMode}
            >
              {editor.isEditing ? 'إنهاء التعديل' : 'تعديل الجدول تفاعلياً'}
            </Button>
          ) : undefined
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
          {/* Interactive Edit Toolbar */}
          {editor.isEditing && (
            <Card
              withBorder
              radius="md"
              p="sm"
              mb="md"
              style={{
                background: 'var(--mantine-color-teal-0)',
                borderColor: 'var(--mantine-color-teal-3)',
                boxShadow: '0 4px 12px rgba(32, 201, 151, 0.15)',
              }}
              className="no-print"
            >
              <Group justify="space-between" align="center">
                <Group gap="sm">
                  <Badge color="teal" size="lg" variant="filled">
                    وضع التعديل التفاعلي نشط
                  </Badge>
                  {editor.hasChanges ? (
                    <Badge color="orange" size="md" variant="light">
                      لديك {editor.changeCount} تعديل غير محفوظ
                    </Badge>
                  ) : (
                    <Text size="xs" c="dimmed">
                      اسحب الحصة أو اضغط عليها لنقلها أو تبديلها (يدعم الفأرة وشاشات اللمس)
                    </Text>
                  )}
                </Group>

                <Group gap="xs">
                  <Tooltip label="تراجع (Ctrl+Z)">
                    <ActionIcon
                      variant="light"
                      color="indigo"
                      size="lg"
                      disabled={!editor.canUndo}
                      onClick={editor.undo}
                    >
                      <IconArrowBackUp size={20} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="إعادة (Ctrl+Y)">
                    <ActionIcon
                      variant="light"
                      color="indigo"
                      size="lg"
                      disabled={!editor.canRedo}
                      onClick={editor.redo}
                    >
                      <IconArrowForwardUp size={20} />
                    </ActionIcon>
                  </Tooltip>

                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    disabled={!editor.hasChanges}
                    onClick={editor.discardChanges}
                    leftSection={<IconX size={14} />}
                  >
                    إلغاء التعديلات
                  </Button>

                  <Button
                    color="teal"
                    size="sm"
                    loading={isSaving}
                    disabled={!editor.hasChanges}
                    onClick={editor.saveChanges}
                    leftSection={<IconDeviceFloppy size={16} />}
                  >
                    حفظ التعديلات
                  </Button>
                </Group>
              </Group>
            </Card>
          )}

          {/* View Mode Selector Tabs */}
          <Card withBorder radius="md" p="sm" mb="md" className="no-print">
            <Group justify="space-between" align="center">
              <SegmentedControl
                value={activeTab}
                onChange={(val) => {
                  if (editor.isEditing && (val === 'master' || val === 'print')) {
                    editor.toggleEditMode();
                  }
                  setActiveTab(val as typeof activeTab);
                }}
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
              assignments={currentAssignments}
              teachers={teachers}
              subjects={subjects}
              editorProps={editorProps}
            />
          )}

          {activeTab === 'teacher' && activeTeacher && (
            <TeacherTimetable
              teacher={activeTeacher}
              assignments={currentAssignments}
              classes={classes}
              subjects={subjects}
              editorProps={editorProps}
            />
          )}

          {activeTab === 'master' && (
            <MasterMatrix
              classes={classes}
              teachers={teachers}
              subjects={subjects}
              assignments={currentAssignments}
            />
          )}

          {activeTab === 'print' && config && (
            <PrintTimetable
              config={config}
              classes={classes}
              teachers={teachers}
              subjects={subjects}
              assignments={currentAssignments}
            />
          )}
        </div>
      )}
    </div>
  );
}
