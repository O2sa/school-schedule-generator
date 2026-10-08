import React from 'react';
import { Card, Group, Stack, Text, Badge, Box } from '@mantine/core';

export interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  icon: any;
  gradient?: string;
  badgeLabel?: string;
  badgeColor?: string;
  subtext?: string;
  onClick?: () => void;
}

export function DashboardMetricCard({
  title,
  value,
  icon: Icon,
  gradient = 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
  badgeLabel,
  badgeColor = 'indigo',
  subtext,
  onClick,
}: DashboardMetricCardProps) {
  return (
    <Card
      padding="lg"
      radius="lg"
      withBorder
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Group justify="space-between" align="flex-start" mb="sm">
        <Box
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
          }}
        >
          <Icon size={24} stroke={2} />
        </Box>
        {badgeLabel && (
          <Badge color={badgeColor} variant="light" size="sm" radius="xl">
            {badgeLabel}
          </Badge>
        )}
      </Group>

      <Stack gap={2}>
        <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: '0.5px' }}>
          {title}
        </Text>
        <Text size="xl" fw={800} style={{ fontSize: '1.85rem', lineHeight: 1.1 }}>
          {value}
        </Text>
        {subtext && (
          <Text size="xs" c="dimmed" mt={4}>
            {subtext}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
