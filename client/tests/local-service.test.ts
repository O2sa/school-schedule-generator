import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { LocalDataService } from '../src/api/local-service';
import { db } from '../src/api/db';

describe('LocalDataService (IndexedDB with Dexie)', () => {
  let service: LocalDataService;

  beforeEach(async () => {
    await db.delete();
    await db.open();
    service = new LocalDataService();
  });

  it('saves and reads school configuration', async () => {
    const config = await service.getConfig();
    expect(config.workingDays).toEqual([0, 1, 2, 3, 4]);

    await service.saveConfig({
      ...config,
      schoolName: 'مدرسة التفوق النموذجية',
    });

    const updated = await service.getConfig();
    expect(updated.schoolName).toBe('مدرسة التفوق النموذجية');
  });

  it('performs CRUD on teachers', async () => {
    const created = await service.saveTeacher({
      name: 'خالد عبدالله',
      specialization: 'فيزياء',
      maxDailyPeriods: 4,
      maxWeeklyPeriods: 18,
      unavailableSlots: [{ dayIndex: 1, periodIndex: 2 }],
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('خالد عبدالله');

    const teachers = await service.getTeachers();
    expect(teachers.length).toBe(1);
    expect(teachers[0].specialization).toBe('فيزياء');

    // Update
    await service.saveTeacher({
      ...created,
      specialization: 'فيزياء متقدمة',
    });

    const updatedList = await service.getTeachers();
    expect(updatedList[0].specialization).toBe('فيزياء متقدمة');

    // Delete
    await service.deleteTeacher(created.id);
    const afterDelete = await service.getTeachers();
    expect(afterDelete.length).toBe(0);
  });

  it('preloads Arabic K-12 demo data', async () => {
    await service.preloadDemoData();

    const classes = await service.getClasses();
    const teachers = await service.getTeachers();
    const subjects = await service.getSubjects();
    const curriculum = await service.getCurriculum();

    expect(classes.length).toBe(24); // 12 grades x 2 rooms
    expect(teachers.length).toBeGreaterThanOrEqual(20);
    expect(subjects.length).toBeGreaterThanOrEqual(10);
    expect(curriculum.length).toBeGreaterThan(0);

    // Verify Grade 1 has 6 periods and Grade 12 has 7 periods
    const grade1 = classes.find((c) => c.gradeLevel === 1);
    const grade12 = classes.find((c) => c.gradeLevel === 12);
    expect(grade1?.periodsPerDay).toBe(6);
    expect(grade12?.periodsPerDay).toBe(7);
  });

  it('exports and imports school database backup', async () => {
    await service.preloadDemoData();
    const backup = await service.exportBackup();

    expect(backup.classes.length).toBe(24);
    expect(backup.teachers.length).toBeGreaterThan(0);

    // Clear db
    await db.classes.clear();
    await db.teachers.clear();
    expect((await service.getClasses()).length).toBe(0);

    // Import backup
    await service.importBackup(backup);
    expect((await service.getClasses()).length).toBe(24);
    expect((await service.getTeachers()).length).toBe(backup.teachers.length);
  });
  it('rejects saving a teacher if needed lectures > available lectures', async () => {
    // 5 working days * 7 periods = 35 total slots.
    // If we block 25 slots, only 10 slots remain available.
    const blockedSlots = [];
    for (let d = 0; d < 5; d++) {
      for (let p = 0; p < 5; p++) {
        blockedSlots.push({ dayIndex: d, periodIndex: p });
      }
    }

    await expect(
      service.saveTeacher({
        name: 'معلم متجاوز السعة',
        specialization: 'فيزياء',
        maxDailyPeriods: 4,
        maxWeeklyPeriods: 18, // 18 needed > 10 available
        unavailableSlots: blockedSlots,
      })
    ).rejects.toThrow();
  });
});
