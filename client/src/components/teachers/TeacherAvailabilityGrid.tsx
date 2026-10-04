import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Group,
  Badge,
  Text,
  Alert,
  Tooltip,
  Card,
  Stack,
} from '@mantine/core';
import {
  IconCheck,
  IconBan,
  IconClock,
  IconAlertTriangle,
  IconSparkles,
} from '@tabler/icons-react';
import { useTranslation } from '../../i18n';
import type { UnavailableSlot } from '../../api/types';

interface TeacherAvailabilityGridProps {
  value: UnavailableSlot[];
  onChange?: (slots: UnavailableSlot[]) => void;
  workingDays?: number[];
  periodsPerDay?: number;
  readOnly?: boolean;
  maxWeeklyPeriods?: number;
}

export function TeacherAvailabilityGrid({
  value = [],
  onChange,
  workingDays = [0, 1, 2, 3, 4],
  periodsPerDay = 7,
  readOnly = false,
  maxWeeklyPeriods,
}: TeacherAvailabilityGridProps) {
  const { t } = useTranslation();
  const dayNames: string[] = t('common.days');
  const [internalSlots, setInternalSlots] = useState<UnavailableSlot[]>(value);

  // Drag-to-paint gesture state
  const isDraggingRef = useRef(false);
  const dragModeRef = useRef<'block' | 'unblock' | null>(null);
  const lastMouseDownTarget = useRef<string | null>(null);

  useEffect(() => {
    setInternalSlots(value);
  }, [value]);

  const updateSlots = (newSlots: UnavailableSlot[]) => {
    setInternalSlots(newSlots);
    onChange?.(newSlots);
  };

  const isBlocked = (day: number, period: number) => {
    return internalSlots.some(
      (slot) => slot.dayIndex === day && slot.periodIndex === period
    );
  };

  const toggleSlot = (day: number, period: number) => {
    if (readOnly) return;
    if (isBlocked(day, period)) {
      updateSlots(
        internalSlots.filter(
          (s) => !(s.dayIndex === day && s.periodIndex === period)
        )
      );
    } else {
      updateSlots([...internalSlots, { dayIndex: day, periodIndex: period }]);
    }
  };

  const setSlotState = (day: number, period: number, block: boolean) => {
    if (readOnly) return;
    const currentlyBlocked = isBlocked(day, period);
    if (block && !currentlyBlocked) {
      updateSlots([...internalSlots, { dayIndex: day, periodIndex: period }]);
    } else if (!block && currentlyBlocked) {
      updateSlots(
        internalSlots.filter(
          (s) => !(s.dayIndex === day && s.periodIndex === period)
        )
      );
    }
  };

  // Cell mouse interactions
  const handleCellMouseDown = (day: number, period: number) => {
    if (readOnly) return;
    lastMouseDownTarget.current = `${day}-${period}`;
    isDraggingRef.current = true;
    const currentlyBlocked = isBlocked(day, period);
    const targetMode = currentlyBlocked ? 'unblock' : 'block';
    dragModeRef.current = targetMode;
    setSlotState(day, period, targetMode === 'block');
  };

  const handleCellMouseEnter = (day: number, period: number) => {
    if (readOnly || !isDraggingRef.current || !dragModeRef.current) return;
    setSlotState(day, period, dragModeRef.current === 'block');
  };

  const handleCellClick = (day: number, period: number) => {
    if (readOnly) return;
    if (lastMouseDownTarget.current === `${day}-${period}`) {
      lastMouseDownTarget.current = null;
      return;
    }
    toggleSlot(day, period);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      dragModeRef.current = null;
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Row header toggle (whole day)
  const toggleWholeDay = (day: number) => {
    if (readOnly) return;
    const allBlocked = Array.from({ length: periodsPerDay }, (_, p) => p).every(
      (p) => isBlocked(day, p)
    );

    if (allBlocked) {
      updateSlots(internalSlots.filter((s) => s.dayIndex !== day));
    } else {
      const added = Array.from({ length: periodsPerDay }, (_, p) => ({
        dayIndex: day,
        periodIndex: p,
      })).filter((s) => !isBlocked(s.dayIndex, s.periodIndex));
      updateSlots([...internalSlots, ...added]);
    }
  };

  // Column header toggle (whole period across week)
  const toggleWholePeriod = (period: number) => {
    if (readOnly) return;
    const allBlocked = workingDays.every((d) => isBlocked(d, period));

    if (allBlocked) {
      updateSlots(internalSlots.filter((s) => s.periodIndex !== period));
    } else {
      const added = workingDays
        .filter((d) => !isBlocked(d, period))
        .map((d) => ({ dayIndex: d, periodIndex: period }));
      updateSlots([...internalSlots, ...added]);
    }
  };

  // Presets
  const applyPreset = (preset: 'clear_all' | 'block_all' | 'block_first' | 'block_last') => {
    if (readOnly) return;
    if (preset === 'clear_all') {
      updateSlots([]);
    } else if (preset === 'block_all') {
      const all: UnavailableSlot[] = [];
      workingDays.forEach((d) => {
        for (let p = 0; p < periodsPerDay; p++) {
          all.push({ dayIndex: d, periodIndex: p });
        }
      });
      updateSlots(all);
    } else if (preset === 'block_first') {
      const firstPeriods: UnavailableSlot[] = workingDays.map((d) => ({
        dayIndex: d,
        periodIndex: 0,
      }));
      const merged = [
        ...internalSlots.filter((s) => s.periodIndex !== 0),
        ...firstPeriods,
      ];
      updateSlots(merged);
    } else if (preset === 'block_last') {
      const lastPeriods: UnavailableSlot[] = [];
      workingDays.forEach((d) => {
        if (periodsPerDay >= 6) {
          lastPeriods.push({ dayIndex: d, periodIndex: periodsPerDay - 2 });
          lastPeriods.push({ dayIndex: d, periodIndex: periodsPerDay - 1 });
        } else if (periodsPerDay >= 1) {
          lastPeriods.push({ dayIndex: d, periodIndex: periodsPerDay - 1 });
        }
      });
      const merged = [
        ...internalSlots.filter((s) => s.periodIndex < periodsPerDay - 2),
        ...lastPeriods,
      ];
      updateSlots(merged);
    }
  };

  // Metrics
  const totalSlots = workingDays.length * periodsPerDay;
  const blockedSlotsCount = internalSlots.filter(
    (s) => workingDays.includes(s.dayIndex) && s.periodIndex < periodsPerDay
  ).length;
  const availableSlotsCount = totalSlots - blockedSlotsCount;

  const isUnderCapacity = maxWeeklyPeriods ? availableSlotsCount < maxWeeklyPeriods : false;
  const periods = Array.from({ length: periodsPerDay }, (_, i) => i);

  return (
    <Stack gap="sm">
      {/* Presets Toolbar */}
      {!readOnly && (
        <Group justify="space-between" align="center" wrap="wrap" gap="xs">
          <Group gap="xs" wrap="wrap">
            <Button
              size="xs"
              variant="light"
              color="teal"
              leftSection={<IconCheck size={14} />}
              onClick={() => applyPreset('clear_all')}
            >
              {t('availabilityDrawer.presetClearAll')}
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              leftSection={<IconBan size={14} />}
              onClick={() => applyPreset('block_all')}
            >
              {t('availabilityDrawer.presetBlockAll')}
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="indigo"
              leftSection={<IconClock size={14} />}
              onClick={() => applyPreset('block_first')}
            >
              {t('availabilityDrawer.presetBlockFirst')}
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="indigo"
              leftSection={<IconClock size={14} />}
              onClick={() => applyPreset('block_last')}
            >
              {t('availabilityDrawer.presetBlockLast')}
            </Button>
          </Group>

          <Group gap="xs" wrap="wrap">
            <Badge color="red" variant="light" size="sm">
              {t('availabilityDrawer.statsBlocked', { count: blockedSlotsCount })}
            </Badge>
            <Badge color={isUnderCapacity ? 'orange' : 'teal'} variant="filled" size="sm">
              {t('availabilityDrawer.statsAvailable', { count: availableSlotsCount })}
            </Badge>
          </Group>
        </Group>
      )}

      {/* Capacity Warning */}
      {isUnderCapacity && (
        <Alert
          color="red"
          icon={<IconAlertTriangle size={16} />}
          title={t('availabilityDrawer.capacityWarning')}
          p="xs"
          radius="md"
        >
          {t('availabilityDrawer.capacityWarningDesc', {
            available: availableSlotsCount,
            quota: maxWeeklyPeriods ?? 0,
          })}
        </Alert>
      )}

      {/* Main Grid */}
      <Card withBorder radius="md" p={6} style={{ userSelect: 'none' }}>
        <Table.ScrollContainer minWidth={540}>
          <Table withTableBorder withColumnBorders style={{ textAlign: 'center', minWidth: 540 }}>
            <Table.Thead>
              <Table.Tr style={{ background: 'var(--mantine-color-gray-1)' }}>
                <Table.Th style={{ textAlign: 'center', width: 90, minWidth: 80, whiteSpace: 'nowrap' }}>
                  {t('scheduleView.matrixDayFilter')}
                </Table.Th>
                {periods.map((p) => (
                  <Table.Th
                    key={p}
                    data-testid={`period-header-${p}`}
                    style={{
                      textAlign: 'center',
                      minWidth: 54,
                      whiteSpace: 'nowrap',
                      cursor: readOnly ? 'default' : 'pointer',
                    }}
                    onClick={() => toggleWholePeriod(p)}
                  >
                    <Tooltip label={readOnly ? '' : t('common.periodNumber', { number: p + 1 })}>
                      <Text size="xs" fw={700}>
                        {t('common.periodNumber', { number: p + 1 })}
                      </Text>
                    </Tooltip>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {workingDays.map((d) => {
                const dayLabel = dayNames[d] || `اليوم ${d}`;
                return (
                  <Table.Tr key={d}>
                    <Table.Td
                      data-testid={`day-header-${d}`}
                      fw={700}
                      style={{
                        background: 'var(--mantine-color-gray-0)',
                        cursor: readOnly ? 'default' : 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() => toggleWholeDay(d)}
                    >
                      <Tooltip label={readOnly ? '' : dayLabel}>
                        <Text size="xs">{dayLabel}</Text>
                      </Tooltip>
                    </Table.Td>

                    {periods.map((p) => {
                      const blocked = isBlocked(d, p);
                      return (
                        <Table.Td
                          key={p}
                          p={2}
                          data-testid={`avail-slot-${d}-${p}`}
                          data-blocked={blocked ? 'true' : 'false'}
                          onMouseDown={() => handleCellMouseDown(d, p)}
                          onMouseEnter={() => handleCellMouseEnter(d, p)}
                          onClick={() => handleCellClick(d, p)}
                          style={{
                            background: blocked
                              ? 'var(--mantine-color-red-1)'
                              : 'var(--mantine-color-teal-0)',
                            cursor: readOnly ? 'default' : 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <Group justify="center" align="center" style={{ height: 38 }}>
                            {blocked ? (
                              <IconBan size={16} color="var(--mantine-color-red-6)" />
                            ) : (
                              <IconCheck size={16} color="var(--mantine-color-teal-6)" />
                            )}
                          </Group>
                        </Table.Td>
                      );
                    })}
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </Stack>
  );
}
