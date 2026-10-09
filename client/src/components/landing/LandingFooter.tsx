import React from 'react';
import {
  Box,
  Container,
  Group,
  Text,
  Anchor,
  SimpleGrid,
  Stack,
  Button,
  useComputedColorScheme,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import {
  IconCalendarEvent,
  IconBrandGithub,
  IconArrowRight,
  IconArrowLeft,
} from '@tabler/icons-react';
import { useTranslation } from '../../i18n';

export function LandingFooter() {
  const { t, dir } = useTranslation();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';

  return (
    <Box
      component="footer"
      style={{
        borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
        background: isDark ? '#141517' : '#f8f9fa',
        paddingTop: 50,
        paddingBottom: 40,
      }}
    >
      <Container size="xl">
        {/* Pre-Footer Action Box */}
        <Box
          p="xl"
          mb={50}
          style={{
            borderRadius: 16,
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            color: '#fff',
            boxShadow: '0 12px 32px rgba(79, 70, 229, 0.25)',
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <div>
              <Text fw={900} size="1.6rem" style={{ letterSpacing: '-0.5px' }}>
                {t('landing.cta.title')}
              </Text>
              <Text size="sm" style={{ opacity: 0.9, maxWidth: 600 }}>
                {t('landing.cta.desc')}
              </Text>
            </div>

            <Button
              component={Link}
              to="/app"
              size="lg"
              color="dark"
              radius="md"
              style={{
                background: '#fff',
                color: '#4f46e5',
                fontWeight: 800,
              }}
              rightSection={dir === 'rtl' ? <IconArrowLeft size={18} /> : <IconArrowRight size={18} />}
            >
              {t('landing.cta.buttonPrimary')}
            </Button>
          </Group>
        </Box>

        {/* Footer Links & Info */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mb="xl">
          <div>
            <Group gap="xs" mb="xs">
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <IconCalendarEvent size={18} />
              </Box>
              <Text fw={800} size="md">{t('landing.nav.brandTitle')}</Text>
            </Group>
            <Text size="xs" c="dimmed" style={{ lineHeight: 1.6, maxWidth: 300 }}>
              {t('landing.footer.description')}
            </Text>
          </div>

          <div>
            <Text fw={700} size="sm" mb="sm">{t('landing.footer.navigationTitle')}</Text>
            <Stack gap={6}>
              <Anchor component={Link} to="/app" size="xs" c="dimmed">
                {t('landing.footer.appLink')}
              </Anchor>
              <Anchor
                href="#features"
                size="xs"
                c="dimmed"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t('landing.footer.featuresLink')}
              </Anchor>
              <Anchor
                href="#demo"
                size="xs"
                c="dimmed"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t('landing.footer.demoLink')}
              </Anchor>
            </Stack>
          </div>

          <div>
            <Text fw={700} size="sm" mb="sm">{t('landing.footer.resourcesTitle')}</Text>
            <Stack gap={6}>
              <Anchor
                href="https://github.com/O2sa/school-schedule-generator"
                target="_blank"
                rel="noreferrer"
                size="xs"
                c="dimmed"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <IconBrandGithub size={14} />
                {t('landing.footer.githubLink')}
              </Anchor>
              <Text size="xs" c="dimmed">{t('landing.footer.licenseLink')}</Text>
            </Stack>
          </div>
        </SimpleGrid>

        {/* Bottom Copyright */}
        <Box pt="md" style={{ borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}` }}>
          <Text size="xs" c="dimmed" style={{ textAlign: 'center' }}>
            {t('landing.footer.copyright')}
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
