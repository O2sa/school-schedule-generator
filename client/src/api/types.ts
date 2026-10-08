/**
 * Core Domain Entities and Contracts for School Timetabling System
 */

export interface UnavailableSlot {
  dayIndex: number;    // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday
  periodIndex: number; // 0 to 6
}

export interface TeacherRecord {
  id: string;
  name: string;
  specialization: string;
  maxDailyPeriods: number;
  maxWeeklyPeriods: number;
  unavailableSlots: UnavailableSlot[];
}

export interface ClassRecord {
  id: string;
  gradeLevel: number;        // 1 to 12
  roomNumber: string;        // e.g. "101", "Lab 2"
  sectionName: string;       // e.g. "1/A", "1/B", "12/Scientific"
  periodsPerDay: number;     // 6 for grades 1-4, 7 for grades 5-12
}

export interface SubjectRecord {
  id: string;
  name: string;
  code: string;
  category: 'core' | 'science' | 'humanities' | 'activity';
}

export interface CurriculumRequirementRecord {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  periodsPerWeek: number;
}

export interface SchoolConfigRecord {
  schoolName: string;
  academicYear: string;
  term: string;
  workingDays: number[];     // [0, 1, 2, 3, 4] for Sunday-Thursday
  periodsPerDayDefault: number;
  gradePeriodsConfig: Record<number, number>; // { 1: 6, 2: 6, 3: 6, 4: 6, 5: 7, ... 12: 7 }
}

export interface TimetableAssignment {
  lectureId: string;
  classId: string;
  teacherId: string;
  subjectId: string;
  dayIndex: number;
  periodIndex: number;
  roomNumber: string;
}

export interface SavedScheduleRecord {
  id: string;
  createdAt: string;
  name: string;
  isActive: boolean;
  status: 'solved' | 'unsat' | 'timeout';
  solveTimeMs: number;
  backtrackCount: number;
  assignments: TimetableAssignment[];
}

export interface SolverProgress {
  step: number;
  assignedCount: number;
  totalLectures: number;
  backtracks: number;
  elapsedMs: number;
}

export interface SchoolBackupPayload {
  version: number;
  exportedAt: string;
  config: SchoolConfigRecord;
  teachers: TeacherRecord[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  curriculum: CurriculumRequirementRecord[];
  schedules: SavedScheduleRecord[];
}

export interface SolverOptions {
  timeoutMs?: number;
  randomSeed?: number;
}

export interface IDataService {
  // Mode identifier
  readonly mode: 'client' | 'server';

  // Config
  getConfig(): Promise<SchoolConfigRecord>;
  saveConfig(config: SchoolConfigRecord): Promise<void>;

  // Teachers
  getTeachers(): Promise<TeacherRecord[]>;
  saveTeacher(teacher: Omit<TeacherRecord, 'id'> & { id?: string }): Promise<TeacherRecord>;
  deleteTeacher(id: string): Promise<void>;

  // Classes / Rooms
  getClasses(): Promise<ClassRecord[]>;
  saveClass(cls: Omit<ClassRecord, 'id'> & { id?: string }): Promise<ClassRecord>;
  deleteClass(id: string): Promise<void>;

  // Subjects
  getSubjects(): Promise<SubjectRecord[]>;
  saveSubject(subject: Omit<SubjectRecord, 'id'> & { id?: string }): Promise<SubjectRecord>;
  deleteSubject(id: string): Promise<void>;

  // Curriculum Requirements
  getCurriculum(): Promise<CurriculumRequirementRecord[]>;
  saveCurriculumItem(item: Omit<CurriculumRequirementRecord, 'id'> & { id?: string }): Promise<CurriculumRequirementRecord>;
  deleteCurriculumItem(id: string): Promise<void>;

  // Timetables
  getSchedules(): Promise<SavedScheduleRecord[]>;
  getActiveSchedule(): Promise<SavedScheduleRecord | null>;
  setActiveSchedule(id: string): Promise<void>;
  saveSchedule(schedule: SavedScheduleRecord): Promise<void>;
  deleteSchedule(id: string): Promise<void>;

  // Solver Execution
  generateSchedule(
    options?: SolverOptions,
    onProgress?: (progress: SolverProgress) => void
  ): Promise<SavedScheduleRecord>;
  cancelGeneration(): void;

  // Backup & Portability
  exportBackup(): Promise<SchoolBackupPayload>;
  importBackup(payload: SchoolBackupPayload): Promise<void>;
  preloadDemoData(options?: { preset?: 'k12' | 'secondary' | 'primary'; language?: 'ar' | 'en' }): Promise<void>;
}
