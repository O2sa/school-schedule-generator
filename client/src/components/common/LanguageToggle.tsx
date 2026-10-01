import React from 'react';
import { ActionIcon, Tooltip, useDirection } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';

export function LanguageToggle() {
  const { dir, toggleDirection } = useDirection();

  return (
    <Tooltip label={dir === 'rtl' ? 'Switch to English (LTR)' : 'التبديل إلى العربية (RTL)'}>
      <ActionIcon variant="default" size="lg" onClick={() => toggleDirection()} aria-label="Toggle language direction">
        <IconLanguage size={18} />
      </ActionIcon>
    </Tooltip>
  );
}
