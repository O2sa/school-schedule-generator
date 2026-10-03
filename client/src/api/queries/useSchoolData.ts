import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useData } from '../data-context';
import type {
  TeacherRecord,
  ClassRecord,
  SubjectRecord,
  CurriculumRequirementRecord,
  SchoolConfigRecord,
  SavedScheduleRecord,
  SolverOptions,
  SolverProgress,
} from '../types';

export function useTeachers() {
  const { service, mode } = useData();
  return useQuery({
    queryKey: ['teachers', mode],
    queryFn: () => service.getTeachers(),
  });
}

export function useTeacherMutations() {
  const { service, mode } = useData();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (teacher: Omit<TeacherRecord, 'id'> & { id?: string }) => service.saveTeacher(teacher),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', mode] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => service.deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', mode] });
      queryClient.invalidateQueries({ queryKey: ['curriculum', mode] });
    },
  });

  return { saveTeacher: saveMutation.mutateAsync, deleteTeacher: deleteMutation.mutateAsync };
}

export function useClasses() {
  const { service, mode } = useData();
  return useQuery({
    queryKey: ['classes', mode],
    queryFn: () => service.getClasses(),
  });
}

export function useClassMutations() {
  const { service, mode } = useData();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (cls: Omit<ClassRecord, 'id'> & { id?: string }) => service.saveClass(cls),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', mode] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => service.deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', mode] });
      queryClient.invalidateQueries({ queryKey: ['curriculum', mode] });
    },
  });

  return { saveClass: saveMutation.mutateAsync, deleteClass: deleteMutation.mutateAsync };
}

export function useSubjects() {
  const { service, mode } = useData();
  return useQuery({
    queryKey: ['subjects', mode],
    queryFn: () => service.getSubjects(),
  });
}

export function useSubjectMutations() {
  const { service, mode } = useData();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (sub: Omit<SubjectRecord, 'id'> & { id?: string }) => service.saveSubject(sub),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', mode] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => service.deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', mode] });
      queryClient.invalidateQueries({ queryKey: ['curriculum', mode] });
    },
  });

  return { saveSubject: saveMutation.mutateAsync, deleteSubject: deleteMutation.mutateAsync };
}

export function useCurriculum() {
  const { service, mode } = useData();
  return useQuery({
    queryKey: ['curriculum', mode],
    queryFn: () => service.getCurriculum(),
  });
}

export function useCurriculumMutations() {
  const { service, mode } = useData();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (item: Omit<CurriculumRequirementRecord, 'id'> & { id?: string }) =>
      service.saveCurriculumItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum', mode] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => service.deleteCurriculumItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum', mode] });
    },
  });

  return { saveCurriculumItem: saveMutation.mutateAsync, deleteCurriculumItem: deleteMutation.mutateAsync };
}

export function useSchoolConfig() {
  const { service, mode } = useData();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['config', mode],
    queryFn: () => service.getConfig(),
  });

  const saveMutation = useMutation({
    mutationFn: (config: SchoolConfigRecord) => service.saveConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', mode] });
    },
  });

  return { ...query, saveConfig: saveMutation.mutateAsync };
}

export function useSchedules() {
  const { service, mode } = useData();
  return useQuery({
    queryKey: ['schedules', mode],
    queryFn: () => service.getSchedules(),
  });
}

export function useActiveSchedule() {
  const { service, mode } = useData();
  return useQuery({
    queryKey: ['activeSchedule', mode],
    queryFn: () => service.getActiveSchedule(),
  });
}

export function useScheduleActions() {
  const { service, mode } = useData();
  const queryClient = useQueryClient();

  const activateMutation = useMutation({
    mutationFn: (id: string) => service.setActiveSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', mode] });
      queryClient.invalidateQueries({ queryKey: ['activeSchedule', mode] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => service.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', mode] });
      queryClient.invalidateQueries({ queryKey: ['activeSchedule', mode] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (schedule: SavedScheduleRecord) => service.saveSchedule(schedule),
    onSuccess: (_data, variables) => {
      queryClient.setQueryData(['activeSchedule', mode], variables);
      queryClient.invalidateQueries({ queryKey: ['schedules', mode] });
      queryClient.invalidateQueries({ queryKey: ['activeSchedule', mode] });
    },
  });

  return {
    setActiveSchedule: activateMutation.mutateAsync,
    deleteSchedule: deleteMutation.mutateAsync,
    saveSchedule: saveMutation.mutateAsync,
  };
}
