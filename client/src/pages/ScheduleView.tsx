import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Card,
  Group,
  Tabs,
  Select,
  Text,
  Center,
  Loader,
  Alert,
  Button,
  Badge,
  ActionIcon,
  Tooltip,
  useComputedColorScheme,
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
  useCurriculum,
  useSchoolConfig,
  useScheduleActions,
} from '../api/queries/useSchoolData';
import { PageHeader } from '../components/common/PageHeader';
import { ClassTimetable } from '../components/timetable/ClassTimetable';
import { TeacherTimetable } from '../components/timetable/TeacherTimetable';
import { MasterMatrix } from '../components/timetable/MasterMatrix';
import { PrintTimetable } from '../components/timetable/PrintTimetable';
import { useTimetableEditor } from '../hooks/useTimetableEditor';
import { buildTimetableInput } from '../api/worker/solver-adapter';
import { useTranslation } from '../i18n';
import type { TimetableInput, MoveValidationResult, TimetableAssignment } from 'school-timetabling-engine';
import type { ClassRecord, TeacherRecord, SubjectRecord, CurriculumRequirementRecord } from '../api/types';

// Stable empty fallbacks to avoid creating new array instances on each render
const EMPTY_CLASSES: ClassRecord[] = [];
const EMPTY_TEACHERS: TeacherRecord[] = [];
const EMPTY_SUBJECTS: SubjectRecord[] = [];
const EMPTY_CURRICULUM: CurriculumRequirementRecord[] = [];
const EMPTY_ASSIGNMENTS: TimetableAssignment[] = [];

export function ScheduleView() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';

  const { data: schedule, isLoading: scheduleLoading } = useActiveSchedule();
  const { data: classesData, isLoading: classesLoading } = useClasses();
  const { data: teachersData, isLoading: teachersLoading } = useTeachers();
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects();
  const { data: curriculumData, isLoading: curriculumLoading } = useCurriculum();
  const { data: config } = useSchoolConfig();
  const { saveSchedule } = useScheduleActions();

  const classes = classesData ?? EMPTY_CLASSES;
  const teachers = teachersData ?? EMPTY_TEACHERS;
  const subjects = subjectsData ?? EMPTY_SUBJECTS;
  const curriculum = curriculumData ?? EMPTY_CURRICULUM;
  const initialAssignments = schedule?.assignments ?? EMPTY_ASSIGNMENTS;

  const isLoading = scheduleLoading || classesLoading || teachersLoading || subjectsLoading || curriculumLoading;

  const [activeTab, setActiveTab] = useState<'class' | 'teacher' | 'master' | 'print'>('class');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const activeClass = classes.find((c) => c.id === (selectedClassId || classes[0]?.id));
  const activeTeacher = teachers.find((tItem) => tItem.id === (selectedTeacherId || teachers[0]?.id));

  // Build TimetableInput representation for engine move validator
  const timetableInput = useMemo<TimetableInput | null>(() => {
    if (!config || classes.length === 0 || teachers.length === 0) return null;
    return buildTimetableInput({ config, classes, teachers, subjects, curriculum });
  }, [config, classes, teachers, subjects, curriculum]);

  const handleSave = useCallback(
    async (updated: TimetableAssignment[]) => {
      if (!schedule) return;
      setIsSaving(true);
      try {
        await saveSchedule({
          ...schedule,
          assignments: updated,
        });
        notifications.show({
          title: t('common.save'),
          message: t('scheduleView.changesCount', { count: updated.length }),
          color: 'teal',
        });
      } catch (err: unknown) {
        notifications.show({
          title: t('generator.errorTitle'),
          message: err instanceof Error ? err.message : t('common.loading'),
          color: 'red',
        });
      } finally {
        setIsSaving(false);
      }
    },
    [schedule, saveSchedule, t]
  );

  const handleConflict = useCallback(
    (validation: MoveValidationResult) => {
      const firstMsg = validation.conflicts[0]?.message || t('generator.errorTitle');
      notifications.show({
        title: t('generator.errorTitle'),
        message: firstMsg,
        color: 'red',
      });
    },
    [t]
  );

  // Hook into interactive editing state
  const editor = useTimetableEditor({
    input: timetableInput,
    initialAssignments,
    onSave: handleSave,
    onConflict: handleConflict,
  });

  const { isEditing, redo, undo, clearSelection } = editor;

  // Global keyboard shortcuts for editing (Ctrl+Z, Ctrl+Y, Esc)
  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, redo, undo, clearSelection]);

  // Active assignments to render (draft if editing, otherwise saved)
  const currentAssignments = editor.isEditing ? editor.draftAssignments : initialAssignments;

  const editorProps = useMemo(() => ({
    isEditing: editor.isEditing,
    selectedSlot: editor.selectedSlot,
    validTargets: editor.validTargets,
    onSelectSlot: (day: number, period: number, item: any) => {
      editor.selectSlot(day, period, item);
      if (item?.classId) {
        setSelectedClassId(item.classId);
      }
      if (item?.teacherId) {
        setSelectedTeacherId(item.teacherId);
      }
    },
    onDropSlot: editor.executeMoveOrSwap,
    onClearSelection: editor.clearSelection,
  }), [editor]);

  return (
    <div>
      <PageHeader
        title={t('scheduleView.title')}
        subtitle={
          schedule
            ? t('scheduleView.subtitle', {
                name: schedule.name,
                count: currentAssignments.length,
              })
            : t('scheduleView.noSchedule')
        }
        actions={
          schedule && schedule.assignments.length > 0 && activeTab !== 'print' && activeTab !== 'master' ? (
            <Button
              variant={editor.isEditing ? 'filled' : 'light'}
              color={editor.isEditing ? 'teal' : 'indigo'}
              leftSection={editor.isEditing ? <IconCheck size={18} /> : <IconPencil size={18} />}
              onClick={editor.toggleEditMode}
            >
              {editor.isEditing ? t('scheduleView.exitEdit') : t('scheduleView.enterEdit')}
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <Center p="xl"><Loader /></Center>
      ) : !schedule || schedule.assignments.length === 0 ? (
        <Card withBorder radius="md" p="xl">
          <Alert color="indigo" title={t('scheduleView.noScheduleTitle')} icon={<IconInfoCircle size={20} />}>
            <Text size="sm" mb="md">
              {t('scheduleView.noScheduleDesc')}
            </Text>
            <Button
              color="indigo"
              leftSection={<IconCpu size={16} />}
              onClick={() => navigate('/generator')}
            >
              {t('scheduleView.goToGenerator')}
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
                background: isDark ? 'rgba(32, 201, 151, 0.12)' : 'var(--mantine-color-teal-0)',
                borderColor: isDark ? 'rgba(32, 201, 151, 0.35)' : 'var(--mantine-color-teal-3)',
                boxShadow: '0 4px 12px rgba(32, 201, 151, 0.15)',
              }}
              className="no-print"
            >
              <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                <Group gap="sm" wrap="wrap">
                  <Badge color="teal" size="lg" variant="filled">
                    {t('scheduleView.editingBanner')}
                  </Badge>
                  {editor.hasChanges ? (
                    <Badge color="orange" size="md" variant="light">
                      {t('scheduleView.changesCount', { count: editor.changeCount })}
                    </Badge>
                  ) : (
                    <Text size="xs" c="dimmed">
                      {t('scheduleView.editingTip')}
                    </Text>
                  )}
                </Group>

                <Group gap="xs" wrap="wrap">
                  <Tooltip label={t('scheduleView.undo')}>
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

                  <Tooltip label={t('scheduleView.redo')}>
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
                    {t('scheduleView.discard')}
                  </Button>

                  <Button
                    color="teal"
                    size="sm"
                    loading={isSaving}
                    disabled={!editor.hasChanges}
                    onClick={editor.saveChanges}
                    leftSection={<IconDeviceFloppy size={16} />}
                  >
                    {t('scheduleView.saveChanges')}
                  </Button>
                </Group>
              </Group>
            </Card>
          )}

          {/* View Mode Selector Tabs */}
          <Card withBorder radius="md" p="sm" mb="md" className="no-print">
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <Tabs
                value={activeTab}
                onChange={(val) => {
                  if (!val) return;
                  if (editor.isEditing) {
                    editor.clearSelection();
                    if (val === 'master' || val === 'print') {
                      editor.toggleEditMode();
                    }
                  }
                  setActiveTab(val as typeof activeTab);
                }}
                variant="pills"
                color="indigo"
                radius="md"
              >
                <Tabs.List style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <Tabs.Tab value="class" leftSection={<IconSchool size={16} />}>
                    {t('scheduleView.tabClass')}
                  </Tabs.Tab>
                  <Tabs.Tab value="teacher" leftSection={<IconUser size={16} />}>
                    {t('scheduleView.tabTeacher')}
                  </Tabs.Tab>
                  <Tabs.Tab value="master" leftSection={<IconTable size={16} />}>
                    {t('scheduleView.tabMaster')}
                  </Tabs.Tab>
                  <Tabs.Tab value="print" leftSection={<IconPrinter size={16} />}>
                    {t('scheduleView.tabPrint')}
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>

              {activeTab === 'class' && (
                <Select
                  placeholder={t('scheduleView.selectClass')}
                  data={classes.map((c) => ({ value: c.id, label: c.sectionName }))}
                  value={activeClass?.id}
                  onChange={setSelectedClassId}
                  style={{ minWidth: 200, flex: '1 1 200px', maxWidth: '100%' }}
                />
              )}

              {activeTab === 'teacher' && (
                <Select
                  placeholder={t('scheduleView.selectTeacher')}
                  data={teachers.map((tItem) => ({ value: tItem.id, label: `${tItem.name} (${tItem.specialization})` }))}
                  value={activeTeacher?.id}
                  onChange={setSelectedTeacherId}
                  style={{ minWidth: 220, flex: '1 1 220px', maxWidth: '100%' }}
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
              workingDays={config?.workingDays}
            />
          )}

          {activeTab === 'teacher' && activeTeacher && (
            <TeacherTimetable
              teacher={activeTeacher}
              assignments={currentAssignments}
              classes={classes}
              subjects={subjects}
              editorProps={editorProps}
              workingDays={config?.workingDays}
              periodsCount={config?.periodsPerDayDefault}
            />
          )}

          {activeTab === 'master' && (
            <MasterMatrix
              classes={classes}
              teachers={teachers}
              subjects={subjects}
              assignments={currentAssignments}
              workingDays={config?.workingDays}
              periodsCount={config?.periodsPerDayDefault}
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
