import axios, { type AxiosInstance } from 'axios';
import type {
  IDataService,
  SchoolConfigRecord,
  TeacherRecord,
  ClassRecord,
  SubjectRecord,
  CurriculumRequirementRecord,
  SavedScheduleRecord,
  SchoolBackupPayload,
  SolverOptions,
  SolverProgress,
} from './types';
import { DEFAULT_SCHOOL_CONFIG, generateDemoData, type DemoDataOptions } from './demo-data';
import { runSolver, cancelActiveSolver } from './worker/worker-client';

export class RemoteDataService implements IDataService {
  readonly mode = 'server' as const;
  private http: AxiosInstance;

  constructor(baseURL = '/api/v1') {
    this.http = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  // --- Configuration ---
  async getConfig(): Promise<SchoolConfigRecord> {
    try {
      const res = await this.http.get<{ config: SchoolConfigRecord }>('/school/config');
      return res.data.config || DEFAULT_SCHOOL_CONFIG;
    } catch {
      return DEFAULT_SCHOOL_CONFIG;
    }
  }

  async saveConfig(config: SchoolConfigRecord): Promise<void> {
    await this.http.post('/school/config', { config });
  }

  // --- Teachers ---
  async getTeachers(): Promise<TeacherRecord[]> {
    try {
      const res = await this.http.get<{ teachers: TeacherRecord[] }>('/teachers');
      return res.data.teachers || [];
    } catch {
      return [];
    }
  }

  async saveTeacher(teacher: Omit<TeacherRecord, 'id'> & { id?: string }): Promise<TeacherRecord> {
    if (teacher.id) {
      const res = await this.http.patch<{ teacher: TeacherRecord }>(`/teachers/${teacher.id}`, teacher);
      return res.data.teacher;
    }
    const res = await this.http.post<{ teacher: TeacherRecord }>('/teachers', teacher);
    return res.data.teacher;
  }

  async deleteTeacher(id: string): Promise<void> {
    await this.http.delete(`/teachers/${id}`);
  }

  // --- Classes ---
  async getClasses(): Promise<ClassRecord[]> {
    try {
      const res = await this.http.get<{ classes: ClassRecord[] }>('/classes');
      return res.data.classes || [];
    } catch {
      return [];
    }
  }

  async saveClass(cls: Omit<ClassRecord, 'id'> & { id?: string }): Promise<ClassRecord> {
    if (cls.id) {
      const res = await this.http.patch<{ classRecord: ClassRecord }>(`/classes/${cls.id}`, cls);
      return res.data.classRecord;
    }
    const res = await this.http.post<{ classRecord: ClassRecord }>('/classes', cls);
    return res.data.classRecord;
  }

  async deleteClass(id: string): Promise<void> {
    await this.http.delete(`/classes/${id}`);
  }

  // --- Subjects ---
  async getSubjects(): Promise<SubjectRecord[]> {
    try {
      const res = await this.http.get<{ subjects: SubjectRecord[] }>('/subjects');
      return res.data.subjects || [];
    } catch {
      return [];
    }
  }

  async saveSubject(subject: Omit<SubjectRecord, 'id'> & { id?: string }): Promise<SubjectRecord> {
    if (subject.id) {
      const res = await this.http.patch<{ subject: SubjectRecord }>(`/subjects/${subject.id}`, subject);
      return res.data.subject;
    }
    const res = await this.http.post<{ subject: SubjectRecord }>('/subjects', subject);
    return res.data.subject;
  }

  async deleteSubject(id: string): Promise<void> {
    await this.http.delete(`/subjects/${id}`);
  }

  // --- Curriculum Requirements ---
  async getCurriculum(): Promise<CurriculumRequirementRecord[]> {
    try {
      const res = await this.http.get<{ curriculum: CurriculumRequirementRecord[] }>('/curriculum');
      return res.data.curriculum || [];
    } catch {
      return [];
    }
  }

  async saveCurriculumItem(
    item: Omit<CurriculumRequirementRecord, 'id'> & { id?: string }
  ): Promise<CurriculumRequirementRecord> {
    if (item.id) {
      const res = await this.http.patch<{ item: CurriculumRequirementRecord }>(`/curriculum/${item.id}`, item);
      return res.data.item;
    }
    const res = await this.http.post<{ item: CurriculumRequirementRecord }>('/curriculum', item);
    return res.data.item;
  }

  async deleteCurriculumItem(id: string): Promise<void> {
    await this.http.delete(`/curriculum/${id}`);
  }

  // --- Timetables ---
  async getSchedules(): Promise<SavedScheduleRecord[]> {
    try {
      const res = await this.http.get<{ schedules: SavedScheduleRecord[] }>('/schedules');
      return res.data.schedules || [];
    } catch {
      return [];
    }
  }

  async getActiveSchedule(): Promise<SavedScheduleRecord | null> {
    try {
      const res = await this.http.get<{ schedule: SavedScheduleRecord }>('/schedules/active');
      return res.data.schedule || null;
    } catch {
      return null;
    }
  }

  async setActiveSchedule(id: string): Promise<void> {
    await this.http.post(`/schedules/${id}/active`);
  }

  async saveSchedule(schedule: SavedScheduleRecord): Promise<void> {
    await this.http.post('/schedules', schedule);
  }

  async deleteSchedule(id: string): Promise<void> {
    await this.http.delete(`/schedules/${id}`);
  }

  // --- Solver Execution ---
  async generateSchedule(
    options?: SolverOptions,
    onProgress?: (progress: SolverProgress) => void
  ): Promise<SavedScheduleRecord> {
    const [config, teachers, classes, subjects, curriculum] = await Promise.all([
      this.getConfig(),
      this.getTeachers(),
      this.getClasses(),
      this.getSubjects(),
      this.getCurriculum(),
    ]);

    const schedule = await runSolver(
      { config, teachers, classes, subjects, curriculum, options },
      onProgress
    );

    await this.saveSchedule(schedule);
    await this.setActiveSchedule(schedule.id);
    return schedule;
  }

  cancelGeneration(): void {
    cancelActiveSolver();
  }

  // --- Backup & Portability ---
  async exportBackup(): Promise<SchoolBackupPayload> {
    const [config, teachers, classes, subjects, curriculum, schedules] = await Promise.all([
      this.getConfig(),
      this.getTeachers(),
      this.getClasses(),
      this.getSubjects(),
      this.getCurriculum(),
      this.getSchedules(),
    ]);

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      config,
      teachers,
      classes,
      subjects,
      curriculum,
      schedules,
    };
  }

  async importBackup(payload: SchoolBackupPayload): Promise<void> {
    await this.http.post('/backup/import', payload);
  }

  async preloadDemoData(options?: DemoDataOptions): Promise<void> {
    const demo = generateDemoData(options);
    await this.importBackup({
      version: 1,
      exportedAt: new Date().toISOString(),
      config: demo.config,
      teachers: demo.teachers,
      classes: demo.classes,
      subjects: demo.subjects,
      curriculum: demo.curriculum,
      schedules: [],
    });
  }
}
