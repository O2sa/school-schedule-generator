import React from 'react';
import { Button, Tooltip, Text } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useTranslation } from '../../i18n';

export function LanguageToggle() {
  const { locale, toggleLocale, t } = useTranslation();

  return (
    <Tooltip label={t('common.languageToggle')}>
      <Button
        variant="default"
        size="sm"
        onClick={toggleLocale}
        leftSection={<IconLanguage size={16} />}
        aria-label="Toggle Language"
        radius="md"
        px={{ base: 8, sm: 'xs' }}
      >
        <Text size="xs" fw={700} visibleFrom="sm">
          {locale === 'ar' ? 'English' : 'العربية'}
        </Text>
        <Text size="xs" fw={800} hiddenFrom="sm">
          {locale === 'ar' ? 'EN' : 'ع'}
        </Text>
      </Button>
    </Tooltip>
  );
}
