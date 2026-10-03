import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { TeacherAvailabilityGrid } from '../src/components/teachers/TeacherAvailabilityGrid';
import type { UnavailableSlot } from '../src/api/types';

function TestGridWrapper(props: {
  initialSlots?: UnavailableSlot[];
  workingDays?: number[];
  periodsPerDay?: number;
  maxWeeklyPeriods?: number;
}) {
  const [slots, setSlots] = useState<UnavailableSlot[]>(props.initialSlots || []);
  return (
    <MantineProvider>
      <TeacherAvailabilityGrid
        value={slots}
        onChange={setSlots}
        workingDays={props.workingDays || [0, 1, 2, 3, 4]}
        periodsPerDay={props.periodsPerDay || 7}
        maxWeeklyPeriods={props.maxWeeklyPeriods || 20}
      />
    </MantineProvider>
  );
}

describe('TeacherAvailabilityGrid', () => {
  it('renders correct days and period headers', () => {
    render(<TestGridWrapper workingDays={[0, 1, 2, 3, 4]} periodsPerDay={6} />);

    // Day headers in Arabic
    expect(screen.getByText('الأحد')).toBeDefined();
    expect(screen.getByText('الخميس')).toBeDefined();

    // Period headers
    expect(screen.getByText('الحصة 1')).toBeDefined();
    expect(screen.getByText('الحصة 6')).toBeDefined();
  });

  it('toggles an individual slot between available and blocked on click', () => {
    render(<TestGridWrapper initialSlots={[]} periodsPerDay={5} />);

    const slotBtn = screen.getByTestId('avail-slot-0-0');
    expect(slotBtn.getAttribute('data-blocked')).toBe('false');

    // Click to block
    fireEvent.click(slotBtn);
    expect(slotBtn.getAttribute('data-blocked')).toBe('true');

    // Click again to unblock
    fireEvent.click(slotBtn);
    expect(slotBtn.getAttribute('data-blocked')).toBe('false');
  });

  it('toggles an entire day when the day header is clicked', () => {
    render(<TestGridWrapper initialSlots={[]} periodsPerDay={4} />);

    const dayHeader = screen.getByTestId('day-header-0'); // Sunday

    // Click day header -> blocks all periods on Sunday
    fireEvent.click(dayHeader);

    expect(screen.getByTestId('avail-slot-0-0').getAttribute('data-blocked')).toBe('true');
    expect(screen.getByTestId('avail-slot-0-1').getAttribute('data-blocked')).toBe('true');
    expect(screen.getByTestId('avail-slot-0-2').getAttribute('data-blocked')).toBe('true');
    expect(screen.getByTestId('avail-slot-0-3').getAttribute('data-blocked')).toBe('true');

    // Other days remain unblocked
    expect(screen.getByTestId('avail-slot-1-0').getAttribute('data-blocked')).toBe('false');

    // Click again -> unblocks the day
    fireEvent.click(dayHeader);
    expect(screen.getByTestId('avail-slot-0-0').getAttribute('data-blocked')).toBe('false');
  });

  it('toggles an entire period column across all days', () => {
    render(<TestGridWrapper initialSlots={[]} workingDays={[0, 1]} periodsPerDay={3} />);

    const periodHeader = screen.getByTestId('period-header-2'); // Period 3 (index 2)

    // Click period header -> blocks period 3 on day 0 and day 1
    fireEvent.click(periodHeader);

    expect(screen.getByTestId('avail-slot-0-2').getAttribute('data-blocked')).toBe('true');
    expect(screen.getByTestId('avail-slot-1-2').getAttribute('data-blocked')).toBe('true');

    // Other periods remain unblocked
    expect(screen.getByTestId('avail-slot-0-0').getAttribute('data-blocked')).toBe('false');

    // Click again -> unblocks
    fireEvent.click(periodHeader);
    expect(screen.getByTestId('avail-slot-0-2').getAttribute('data-blocked')).toBe('false');
  });

  it('applies quick presets correctly', () => {
    render(<TestGridWrapper initialSlots={[]} workingDays={[0, 1]} periodsPerDay={4} />);

    // Click "تفريغ الكل" (Block All)
    const blockAllBtn = screen.getByText('تفريغ الكل');
    fireEvent.click(blockAllBtn);

    expect(screen.getByTestId('avail-slot-0-0').getAttribute('data-blocked')).toBe('true');
    expect(screen.getByTestId('avail-slot-1-3').getAttribute('data-blocked')).toBe('true');

    // Click "إتاحة الكل" (Clear All)
    const clearAllBtn = screen.getByText('إتاحة الكل');
    fireEvent.click(clearAllBtn);

    expect(screen.getByTestId('avail-slot-0-0').getAttribute('data-blocked')).toBe('false');
    expect(screen.getByTestId('avail-slot-1-3').getAttribute('data-blocked')).toBe('false');

    // Click "تفريغ الحصة الأولى" (Block Period 1 across week)
    const blockFirstBtn = screen.getByText('تفريغ الحصة الأولى');
    fireEvent.click(blockFirstBtn);

    expect(screen.getByTestId('avail-slot-0-0').getAttribute('data-blocked')).toBe('true');
    expect(screen.getByTestId('avail-slot-1-0').getAttribute('data-blocked')).toBe('true');
    expect(screen.getByTestId('avail-slot-0-1').getAttribute('data-blocked')).toBe('false');
  });

  it('displays accurate stats counter for available vs blocked slots', () => {
    // 5 days x 4 periods = 20 total slots
    render(
      <TestGridWrapper
        initialSlots={[
          { dayIndex: 0, periodIndex: 0 },
          { dayIndex: 0, periodIndex: 1 },
        ]}
        workingDays={[0, 1, 2, 3, 4]}
        periodsPerDay={4}
      />
    );

    // 2 blocked slots, 18 available slots
    expect(screen.getByText(/2 محظورة/)).toBeDefined();
    expect(screen.getByText(/18 متاحة/)).toBeDefined();
  });
});
