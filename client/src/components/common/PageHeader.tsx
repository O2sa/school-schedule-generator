import React from 'react';
import { Group, Stack, Title, Text, Badge, Box } from '@mantine/core';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  categoryBadge?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, categoryBadge, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" mb="xl" wrap="wrap" gap="sm">
      <Stack gap={4}>
        {categoryBadge && (
          <Box mb={2}>
            <Badge
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan', deg: 90 }}
              size="xs"
              radius="xl"
              style={{ fontWeight: 700 }}
            >
              {categoryBadge}
            </Badge>
          </Box>
        )}
        <Title order={2} style={{ letterSpacing: '-0.5px', fontWeight: 800 }}>
          {title}
        </Title>
        {subtitle && (
          <Text size="sm" c="dimmed" style={{ maxWidth: 700 }}>
            {subtitle}
          </Text>
        )}
      </Stack>
      {actions && <Group gap="xs" wrap="wrap">{actions}</Group>}
    </Group>
  );
}
