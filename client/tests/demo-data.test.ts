import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import {
  generateDemoData,
  DEMO_PRESETS,
  type DemoPresetId,
  type DemoLanguage,
} from '../src/api/demo-data';
import { LocalDataService } from '../src/api/local-service';
import { db } from '../src/api/db';

describe('Bilingual Multi-Sample Demo Data Generator', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('exposes 3 pre-configured demo presets with accurate metadata', () => {
    expect(DEMO_PRESETS).toHaveLength(3);
    const ids = DEMO_PRESETS.map((p) => p.id);
    expect(ids).toContain('k12');
    expect(ids).toContain('secondary');
    expect(ids).toContain('primary');
  });

  describe('Preset: Comprehensive K-12', () => {
    it('generates valid Arabic K-12 data with balanced teacher capacities for 24 classes', () => {
      const data = generateDemoData({ preset: 'k12', language: 'ar' });
      expect(data.config.schoolName).toContain('الأندلس');
      expect(data.classes.length).toBe(24);
      expect(data.classes[0].sectionName).toContain('الصف 1');
      expect(data.teachers.length).toBeGreaterThan(20);
      expect(data.subjects.length).toBeGreaterThan(5);
      expect(data.curriculum.length).toBeGreaterThan(100);

      // Verify teacher capacity is not exceeded for any teacher
      const teacherLoads = new Map<string, number>();
      for (const cur of data.curriculum) {
        teacherLoads.set(cur.teacherId, (teacherLoads.get(cur.teacherId) || 0) + cur.periodsPerWeek);
      }
      for (const t of data.teachers) {
        const load = teacherLoads.get(t.id) || 0;
        expect(load).toBeLessThanOrEqual(t.maxWeeklyPeriods);
      }
    });

    it('generates valid English K-12 data with localized names', () => {
      const data = generateDemoData({ preset: 'k12', language: 'en' });
      expect(data.config.schoolName).toBe('Al-Andalus Model Educational Complex');
      expect(data.config.term).toBe('First Semester');
      expect(data.classes.length).toBe(24);
      expect(data.classes[0].sectionName).toBe('Grade 1-A');
      expect(data.classes[23].sectionName).toBe('Grade 12-B');

      // Verify English teacher names and subjects
      const mathTeacher = data.teachers.find((t) => t.name.includes('Mustafa Al-Khatib') || t.name.includes('Math'));
      expect(mathTeacher).toBeDefined();
      const mathSubject = data.subjects.find((s) => s.name === 'Mathematics');
      expect(mathSubject).toBeDefined();
    });
  });

  describe('Preset: Secondary / High School STEM', () => {
    it('generates secondary classes (grades 10-12) with 7 periods/day in Arabic', () => {
      const data = generateDemoData({ preset: 'secondary', language: 'ar' });
      expect(data.config.schoolName).toContain('القمة');
      expect(data.classes.length).toBe(6); // 3 grades x 2 rooms
      expect(data.classes.every((c) => c.gradeLevel >= 10 && c.gradeLevel <= 12)).toBe(true);
      expect(data.classes.every((c) => c.periodsPerDay === 7)).toBe(true);

      // Verify secondary subjects: Physics, Chemistry, Biology, CS
      const subjectNames = data.subjects.map((s) => s.name);
      expect(subjectNames).toContain('الفيزياء');
      expect(subjectNames).toContain('الكيمياء');
      expect(subjectNames).toContain('الأحياء');
      expect(subjectNames).toContain('علوم الحاسب والذكاء الاصطناعي');
    });

    it('generates secondary classes in English with STEM subjects', () => {
      const data = generateDemoData({ preset: 'secondary', language: 'en' });
      expect(data.config.schoolName).toBe('Apex STEM Secondary School');
      expect(data.classes[0].sectionName).toBe('Grade 10-A');
      expect(data.classes[1].sectionName).toBe('Grade 10-B');

      const subjectNames = data.subjects.map((s) => s.name);
      expect(subjectNames).toContain('Physics');
      expect(subjectNames).toContain('Chemistry');
      expect(subjectNames).toContain('Biology');
      expect(subjectNames).toContain('Computer Science');
      expect(subjectNames).toContain('Advanced Mathematics');
    });
  });

  describe('Preset: Primary / Elementary School', () => {
    it('generates primary classes (grades 1-6) with 6 periods/day in Arabic', () => {
      const data = generateDemoData({ preset: 'primary', language: 'ar' });
      expect(data.config.schoolName).toContain('المعرفة');
      expect(data.classes.length).toBe(6);
      expect(data.classes.every((c) => c.periodsPerDay === 6)).toBe(true);
      expect(data.config.periodsPerDayDefault).toBe(6);
      expect(data.subjects.some((s) => s.name.includes('لغتي'))).toBe(true);
    });

    it('generates primary classes in English', () => {
      const data = generateDemoData({ preset: 'primary', language: 'en' });
      expect(data.config.schoolName).toBe('Cedar Grove Primary School');
      expect(data.classes[0].sectionName).toBe('Grade 1');
      expect(data.subjects.some((s) => s.name === 'Language Arts')).toBe(true);
      expect(data.subjects.some((s) => s.name === 'Primary Mathematics')).toBe(true);
    });
  });

  describe('LocalDataService Integration', () => {
    it('preloads secondary preset in English into IndexedDB and overrides config', async () => {
      const service = new LocalDataService();
      await service.preloadDemoData({ preset: 'secondary', language: 'en' });

      const config = await service.getConfig();
      expect(config.schoolName).toBe('Apex STEM Secondary School');

      const classes = await service.getClasses();
      expect(classes.length).toBe(6);
      expect(classes[0].sectionName).toBe('Grade 10-A');

      const teachers = await service.getTeachers();
      expect(teachers.length).toBeGreaterThan(10);
      expect(teachers.some((t) => t.name.includes('Alexander Wright'))).toBe(true);

      const subjects = await service.getSubjects();
      expect(subjects.some((s) => s.name === 'Advanced Mathematics')).toBe(true);
    });
  });
});
