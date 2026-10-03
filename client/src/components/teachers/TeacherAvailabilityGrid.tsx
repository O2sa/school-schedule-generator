import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Button,
  Group,
  Text,
  Badge,
  Tooltip,
  Card,
  Stack,
  ActionIcon,
  Alert,
} from '@mantine/core';
import {
  IconCheck,
  IconBan,
  IconAlertTriangle,
  IconSun,
  IconMoon,
  IconX,
} from '@tabler/icons-react';
import type { UnavailableSlot } from '../../api/types';

export interface TeacherAvailabilityGridProps {
  value: UnavailableSlot[];
  onChange: (slots: UnavailableSlot[]) => void;
  workingDays?: number[];
  periodsPerDay?: number;
  maxWeeklyPeriods?: number;
  readOnly?: boolean;
}

const DAY_NAMES: Record<number, string> = {
  0: 'الأحد',
  1: 'الإثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
};

export function TeacherAvailabilityGrid({
  value,
  onChange,
  workingDays = [0, 1, 2, 3, 4],
  periodsPerDay = 7,
  maxWeeklyPeriods,
  readOnly = false,
}: TeacherAvailabilityGridProps) {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [paintMode, setPaintMode] = useState<'block' | 'unblock'>('block');
  const [lastMouseDownTarget, setLastMouseDownTarget] = useState<string | null>(null);

  // Set of blocked slot keys "day__period"
  const blockedSet = useMemo(() => {
    return new Set(value.map((s) => `${s.dayIndex}__${s.periodIndex}`));
  }, [value]);

  // Global mouse up listener for drag-painting
  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const isSlotBlocked = useCallback(
    (day: number, period: number) => blockedSet.has(`${day}__${period}`),
    [blockedSet]
  );

  const applySlotAction = useCallback(
    (day: number, period: number, mode: 'block' | 'unblock') => {
      if (readOnly) return;
      if (mode === 'block') {
        if (!isSlotBlocked(day, period)) {
          onChange([...value, { dayIndex: day, periodIndex: period }]);
        }
      } else {
        if (isSlotBlocked(day, period)) {
          onChange(value.filter((s) => !(s.dayIndex === day && s.periodIndex === period)));
        }
      }
    },
    [isSlotBlocked, onChange, value, readOnly]
  );

  const handleCellMouseDown = (day: number, period: number) => {
    if (readOnly) return;
    const key = `${day}__${period}`;
    setLastMouseDownTarget(key);
    const currentlyBlocked = isSlotBlocked(day, period);
    const mode = currentlyBlocked ? 'unblock' : 'block';
    setPaintMode(mode);
    setIsMouseDown(true);
    applySlotAction(day, period, mode);
  };

  const handleCellClick = (day: number, period: number) => {
    if (readOnly) return;
    const key = `${day}__${period}`;
    if (lastMouseDownTarget === key) {
      setLastMouseDownTarget(null);
      return;
    }
    const currentlyBlocked = isSlotBlocked(day, period);
    applySlotAction(day, period, currentlyBlocked ? 'unblock' : 'block');
  };

  const handleCellMouseEnter = (day: number, period: number) => {
    if (readOnly || !isMouseDown) return;
    applySlotAction(day, period, paintMode);
  };

  // Toggle entire day
  const toggleDay = (day: number) => {
    if (readOnly) return;
    const allBlocked = Array.from({ length: periodsPerDay }, (_, p) => isSlotBlocked(day, p)).every(
      Boolean
    );
    if (allBlocked) {
      // Unblock all periods for this day
      onChange(value.filter((s) => s.dayIndex !== day));
    } else {
      // Block all periods for this day
      const newSlots = [...value.filter((s) => s.dayIndex !== day)];
      for (let p = 0; p < periodsPerDay; p++) {
        newSlots.push({ dayIndex: day, periodIndex: p });
      }
      onChange(newSlots);
    }
  };

  // Toggle entire period across all working days
  const togglePeriod = (period: number) => {
    if (readOnly) return;
    const allBlocked = workingDays.every((d) => isSlotBlocked(d, period));
    if (allBlocked) {
      // Unblock this period across all working days
      onChange(value.filter((s) => s.periodIndex !== period));
    } else {
      // Block this period across all working days
      const newSlots = [...value.filter((s) => s.periodIndex !== period)];
      for (const d of workingDays) {
        newSlots.push({ dayIndex: d, periodIndex: period });
      }
      onChange(newSlots);
    }
  };

  // Presets
  const handleClearAll = () => {
    if (readOnly) return;
    onChange([]);
  };

  const handleBlockAll = () => {
    if (readOnly) return;
    const all: UnavailableSlot[] = [];
    for (const d of workingDays) {
      for (let p = 0; p < periodsPerDay; p++) {
        all.push({ dayIndex: d, periodIndex: p });
      }
    }
    onChange(all);
  };

  const handleBlockFirstPeriod = () => {
    if (readOnly) return;
    const remaining = value.filter((s) => s.periodIndex !== 0);
    for (const d of workingDays) {
      remaining.push({ dayIndex: d, periodIndex: 0 });
    }
    onChange(remaining);
  };

  const handleBlockLastPeriods = () => {
    if (readOnly) return;
    const lastPeriods = [periodsPerDay - 2, periodsPerDay - 1].filter((p) => p >= 0);
    const remaining = value.filter((s) => !lastPeriods.includes(s.periodIndex));
    for (const d of workingDays) {
      for (const p of lastPeriods) {
        remaining.push({ dayIndex: d, periodIndex: p });
      }
    }
    onChange(remaining);
  };

  // Calculate metrics
  const totalSlots = workingDays.length * periodsPerDay;
  const activeBlockedCount = value.filter(
    (s) => workingDays.includes(s.dayIndex) && s.periodIndex < periodsPerDay
  ).length;
  const availableSlotsCount = totalSlots - activeBlockedCount;
  const isUnderCapacity = maxWeeklyPeriods ? availableSlotsCount < maxWeeklyPeriods : false;

  return (
    <Stack gap="sm">
      {/* Presets Toolbar */}
      {!readOnly && (
        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              color="teal"
              leftSection={<IconCheck size={14} />}
              onClick={handleClearAll}
            >
              إتاحة الكل
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              leftSection={<IconX size={14} />}
              onClick={handleBlockAll}
            >
              تفريغ الكل
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="orange"
              leftSection={<IconSun size={14} />}
              onClick={handleBlockFirstPeriod}
            >
              تفريغ الحصة الأولى
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="indigo"
              leftSection={<IconMoon size={14} />}
              onClick={handleBlockLastPeriods}
            >
              تفريغ الحصص الأخيرة
            </Button>
          </Group>

          {/* Stats Badges */}
          <Group gap="xs">
            <Badge variant="light" color="teal" size="md">
              {availableSlotsCount} متاحة
            </Badge>
            <Badge variant="light" color="red" size="md">
              {activeBlockedCount} محظورة
            </Badge>
          </Group>
        </Group>
      )}

      {/* Capacity Warning */}
      {isUnderCapacity && (
        <Alert
          color="orange"
          icon={<IconAlertTriangle size={16} />}
          title="تحذير نقص الطاقة الاستيعابية"
          p="xs"
        >
          الفترات المتاحة للمعلم ({availableSlotsCount}) أقل من النصاب الأسبوعي المطلوب ({maxWeeklyPeriods} حصة).
        </Alert>
      )}

      {/* Main Grid */}
      <Card withBorder radius="md" p={6} style={{ overflowX: 'auto', userSelect: 'none' }}>
        <Table withTableBorder withColumnBorders style={{ textAlign: 'center' }}>
          <Table.Thead>
            <Table.Tr style={{ background: 'var(--mantine-color-gray-1)' }}>
              <Table.Th style={{ textAlign: 'center', width: 90 }}>اليوم / الحصة</Table.Th>
              {Array.from({ length: periodsPerDay }, (_, p) => (
                <Table.Th
                  key={p}
                  style={{
                    textAlign: 'center',
                    cursor: readOnly ? 'default' : 'pointer',
                    userSelect: 'none',
                  }}
                  data-testid={`period-header-${p}`}
                  onClick={() => togglePeriod(p)}
                >
                  <Tooltip label={readOnly ? '' : 'انقر لتبديل الحصة للأسبوع كاملاً'}>
                    <Text size="xs" fw={700}>
                      الحصة {p + 1}
                    </Text>
                  </Tooltip>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {workingDays.map((d) => {
              const dayName = DAY_NAMES[d] || `يوم ${d}`;
              const dayBlockedCount = Array.from({ length: periodsPerDay }, (_, p) =>
                isSlotBlocked(d, p)
              ).filter(Boolean).length;
              const isDayAllBlocked = dayBlockedCount === periodsPerDay;

              return (
                <Table.Tr key={d}>
                  <Table.Td
                    fw={700}
                    style={{
                      background: isDayAllBlocked
                        ? 'var(--mantine-color-red-0)'
                        : 'var(--mantine-color-gray-0)',
                      cursor: readOnly ? 'default' : 'pointer',
                      fontSize: '0.82rem',
                    }}
                    data-testid={`day-header-${d}`}
                    onClick={() => toggleDay(d)}
                  >
                    <Tooltip label={readOnly ? '' : 'انقر لتفريغ أو إتاحة اليوم كاملاً'}>
                      <div>
                        <Text size="xs" fw={700} c={isDayAllBlocked ? 'red.8' : undefined}>
                          {dayName}
                        </Text>
                        <Text size="9px" c="dimmed">
                          {isDayAllBlocked ? 'غير متاح' : `${periodsPerDay - dayBlockedCount} متاحة`}
                        </Text>
                      </div>
                    </Tooltip>
                  </Table.Td>

                  {Array.from({ length: periodsPerDay }, (_, p) => {
                    const blocked = isSlotBlocked(d, p);
                    return (
                      <Table.Td
                        key={p}
                        p={3}
                        style={{ verticalAlign: 'middle' }}
                      >
                        <Tooltip
                          label={
                            readOnly
                              ? blocked
                                ? 'غير متاح'
                                : 'متاح'
                              : blocked
                              ? 'محظور (انقر أو اسحب للإتاحة)'
                              : 'متاح للتدريس (انقر أو اسحب للحظر)'
                          }
                          openDelay={400}
                        >
                          <Card
                            withBorder
                            p={4}
                            radius="sm"
                            data-testid={`avail-slot-${d}-${p}`}
                            data-blocked={blocked ? 'true' : 'false'}
                            onClick={() => handleCellClick(d, p)}
                            onMouseDown={() => handleCellMouseDown(d, p)}
                            onMouseEnter={() => handleCellMouseEnter(d, p)}
                            style={{
                              background: blocked
                                ? 'var(--mantine-color-red-1)'
                                : 'var(--mantine-color-teal-0)',
                              borderColor: blocked
                                ? 'var(--mantine-color-red-4)'
                                : 'var(--mantine-color-teal-2)',
                              cursor: readOnly ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: 38,
                              transition: 'all 0.1s ease',
                              opacity: blocked ? 0.95 : 1,
                            }}
                          >
                            <Group gap={4} justify="center">
                              {blocked ? (
                                <>
                                  <IconBan size={15} color="var(--mantine-color-red-7)" />
                                  <Text size="10px" fw={700} c="red.9">
                                    محظور
                                  </Text>
                                </>
                              ) : (
                                <>
                                  <IconCheck size={14} color="var(--mantine-color-teal-7)" />
                                  <Text size="10px" fw={600} c="teal.9">
                                    متاح
                                  </Text>
                                </>
                              )}
                            </Group>
                          </Card>
                        </Tooltip>
                      </Table.Td>
                    );
                  })}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}
