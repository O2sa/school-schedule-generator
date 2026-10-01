import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { LocalDataService } from '../src/api/local-service';
import { db } from '../src/api/db';

describe('End-to-End Core Workflow Integration', () => {
  let service: LocalDataService;

  beforeEach(async () => {
    await db.delete();
    await db.open();
    service = new LocalDataService();
  });

  it('runs complete lifecycle: preload -> solve -> view -> export -> import', async () => {
    // 1. Preload realistic Arabic K-12 demo data
    await service.preloadDemoData();

    const teachers = await service.getTeachers();
    const classes = await service.getClasses();
    const curriculum = await service.getCurriculum();

    expect(teachers.length).toBeGreaterThan(20);
    expect(classes.length).toBe(24);
    expect(curriculum.length).toBeGreaterThan(100);

    // 2. Solve schedule with CSP engine
    const schedule = await service.generateSchedule();

    expect(schedule.status).toBe('solved');
    expect(schedule.assignments.length).toBeGreaterThan(600);

    // 3. Verify active schedule
    const active = await service.getActiveSchedule();
    expect(active?.id).toBe(schedule.id);
    expect(active?.assignments.length).toBe(schedule.assignments.length);

    // 4. Export JSON backup
    const backup = await service.exportBackup();
    expect(backup.schedules.length).toBe(1);
    expect(backup.classes.length).toBe(24);

    // 5. Clear DB and re-import
    await db.classes.clear();
    await db.schedules.clear();
    expect((await service.getClasses()).length).toBe(0);

    await service.importBackup(backup);
    const restoredClasses = await service.getClasses();
    const restoredSchedules = await service.getSchedules();

    expect(restoredClasses.length).toBe(24);
    expect(restoredSchedules.length).toBe(1);
    expect(restoredSchedules[0].assignments.length).toBe(schedule.assignments.length);
  });
});
