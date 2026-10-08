import React, { useEffect } from 'react';
import { Box } from '@mantine/core';
import { useTranslation } from '../i18n';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { StatsRibbon } from '../components/landing/StatsRibbon';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { TimetablePreviewCard } from '../components/landing/TimetablePreviewCard';
import { LandingFooter } from '../components/landing/LandingFooter';

interface LandingPageProps {
  forcedLocale?: 'ar' | 'en';
}

export function LandingPage({ forcedLocale }: LandingPageProps) {
  const { locale, setLocale } = useTranslation();

  // If page was navigated with explicit /ar or /en, sync context locale
  useEffect(() => {
    if (forcedLocale && forcedLocale !== locale) {
      setLocale(forcedLocale);
    }
  }, [forcedLocale, locale, setLocale]);

  const activeLocale = forcedLocale || locale;

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LandingNavbar currentLocale={activeLocale} />
      <Box style={{ flex: 1 }}>
        <HeroSection />
        <StatsRibbon />
        <FeatureGrid />
        <TimetablePreviewCard />
      </Box>
      <LandingFooter />
    </Box>
  );
}
