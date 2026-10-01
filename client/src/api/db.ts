import Dexie, { type EntityTable } from 'dexie';
import type {
  TeacherRecord,
  ClassRecord,
  SubjectRecord,
  CurriculumRequirementRecord,
  SchoolConfigRecord,
  SavedScheduleRecord,
} from './types';

export interface ConfigEntity {
  key: string;
  value: SchoolConfigRecord;
}

export class SchoolScheduleLocalDB extends Dexie {
  config!: EntityTable<ConfigEntity, 'key'>;
  teachers!: EntityTable<TeacherRecord, 'id'>;
  classes!: EntityTable<ClassRecord, 'id'>;
  subjects!: EntityTable<SubjectRecord, 'id'>;
  curriculum!: EntityTable<CurriculumRequirementRecord, 'id'>;
  schedules!: EntityTable<SavedScheduleRecord, 'id'>;

  constructor() {
    super('SchoolScheduleLocalDB');
    this.version(1).stores({
      config: 'key',
      teachers: 'id, name, specialization',
      classes: 'id, gradeLevel, roomNumber, sectionName',
      subjects: 'id, code, name',
      curriculum: 'id, classId, teacherId, subjectId',
      schedules: 'id, createdAt, isActive, status',
    });
  }
}

export const db = new SchoolScheduleLocalDB();
