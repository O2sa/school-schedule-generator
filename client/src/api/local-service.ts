import { db } from './db';
import { DEFAULT_SCHOOL_CONFIG, generateArabicK12DemoData } from './demo-data';
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

export class LocalDataService implements IDataService {
  readonly mode = 'client' as const;

  // --- Configuration ---
  async getConfig(): Promise<SchoolConfigRecord> {
    const entry = await db.config.get('school_config');
    if (entry) return entry.value;
    return DEFAULT_SCHOOL_CONFIG;
  }

  async saveConfig(config: SchoolConfigRecord): Promise<void> {
    await db.config.put({ key: 'school_config', value: config });
  }

  // --- Teachers ---
  async getTeachers(): Promise<TeacherRecord[]> {
    return await db.teachers.toArray();
  }

  async saveTeacher(teacher: Omit<TeacherRecord, 'id'> & { id?: string }): Promise<TeacherRecord> {
    const id = teacher.id || crypto.randomUUID();
    const record: TeacherRecord = { ...teacher, id };
    await db.teachers.put(record);
    return record;
  }

  async deleteTeacher(id: string): Promise<void> {
    await db.teachers.delete(id);
    // Cascade remove curriculum
    await db.curriculum.where('teacherId').equals(id).delete();
  }

  // --- Classes ---
  async getClasses(): Promise<ClassRecord[]> {
    return await db.classes.orderBy('gradeLevel').toArray();
  }

  async saveClass(cls: Omit<ClassRecord, 'id'> & { id?: string }): Promise<ClassRecord> {
    const id = cls.id || crypto.randomUUID();
    const record: ClassRecord = { ...cls, id };
    await db.classes.put(record);
    return record;
  }

  async deleteClass(id: string): Promise<void> {
    await db.classes.delete(id);
    await db.curriculum.where('classId').equals(id).delete();
  }

  // --- Subjects ---
  async getSubjects(): Promise<SubjectRecord[]> {
    return await db.subjects.toArray();
  }

  async saveSubject(subject: Omit<SubjectRecord, 'id'> & { id?: string }): Promise<SubjectRecord> {
    const id = subject.id || crypto.randomUUID();
    const record: SubjectRecord = { ...subject, id };
    await db.subjects.put(record);
    return record;
  }

  async deleteSubject(id: string): Promise<void> {
    await db.subjects.delete(id);
    await db.curriculum.where('subjectId').equals(id).delete();
  }

  // --- Curriculum Requirements ---
  async getCurriculum(): Promise<CurriculumRequirementRecord[]> {
    return await db.curriculum.toArray();
  }

  async saveCurriculumItem(
    item: Omit<CurriculumRequirementRecord, 'id'> & { id?: string }
  ): Promise<CurriculumRequirementRecord> {
    const id = item.id || crypto.randomUUID();
    const record: CurriculumRequirementRecord = { ...item, id };
    await db.curriculum.put(record);
    return record;
  }

  async deleteCurriculumItem(id: string): Promise<void> {
    await db.curriculum.delete(id);
  }

  // --- Timetables ---
  async getSchedules(): Promise<SavedScheduleRecord[]> {
    return await db.schedules.orderBy('createdAt').reverse().toArray();
  }

  async getActiveSchedule(): Promise<SavedScheduleRecord | null> {
    const active = await db.schedules.filter((s) => s.isActive).first();
    if (active) return active;
    return (await db.schedules.toCollection().last()) || null;
  }

  async setActiveSchedule(id: string): Promise<void> {
    await db.transaction('rw', db.schedules, async () => {
      const all = await db.schedules.toArray();
      for (const s of all) {
        await db.schedules.update(s.id, { isActive: s.id === id });
      }
    });
  }

  async saveSchedule(schedule: SavedScheduleRecord): Promise<void> {
    await db.schedules.put(schedule);
  }

  async deleteSchedule(id: string): Promise<void> {
    await db.schedules.delete(id);
  }

  // --- Solver Execution ---
  async generateSchedule(
    options?: SolverOptions,
    onProgress?: (progress: SolverProgress) => void
  ): Promise<SavedScheduleRecord> {
    // Will be fully wired via worker-client in Task 4
    const config = await this.getConfig();
    const schedule: SavedScheduleRecord = {
      id: crypto.randomUUID(),
      name: `جدول ${config.academicYear} - ${new Date().toLocaleTimeString('ar-SA')}`,
      createdAt: new Date().toISOString(),
      isActive: true,
      status: 'solved',
      solveTimeMs: 0,
      backtrackCount: 0,
      assignments: [],
    };
    await this.saveSchedule(schedule);
    await this.setActiveSchedule(schedule.id);
    return schedule;
  }

  cancelGeneration(): void {
    // No-op placeholder until worker hook in Task 4
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
    await db.transaction('rw', [db.config, db.teachers, db.classes, db.subjects, db.curriculum, db.schedules], async () => {
      await Promise.all([
        db.config.clear(),
        db.teachers.clear(),
        db.classes.clear(),
        db.subjects.clear(),
        db.curriculum.clear(),
        db.schedules.clear(),
      ]);

      if (payload.config) {
        await db.config.put({ key: 'school_config', value: payload.config });
      }
      if (payload.teachers?.length) await db.teachers.bulkPut(payload.teachers);
      if (payload.classes?.length) await db.classes.bulkPut(payload.classes);
      if (payload.subjects?.length) await db.subjects.bulkPut(payload.subjects);
      if (payload.curriculum?.length) await db.curriculum.bulkPut(payload.curriculum);
      if (payload.schedules?.length) await db.schedules.bulkPut(payload.schedules);
    });
  }

  async preloadDemoData(): Promise<void> {
    const demo = generateArabicK12DemoData();
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
