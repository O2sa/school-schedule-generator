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

  // Dynamic SEO Synchronization for document title, html lang, and meta description
  useEffect(() => {
    const isArabic = activeLocale === 'ar';
    const pageTitle = isArabic
      ? 'جَدْوَلي | المولّد الذكي للجداول المدرسية — جداول خالية من التعارضات'
      : 'Jadwali — Autonomous School Timetable Generator | Conflict-Free Schedules';
    const pageDescription = isArabic
      ? 'جَدْوَلي (Jadwali) — صمم جداول مدرسية نموذجية خالية تماماً من تضارب المعلمين والقاعات في ثوانٍ معدودة. محرك خوارزمي متقدم يعمل محلياً في متصفحك بخصوصية وسرعة فائقة.'
      : 'Jadwali — Produce conflict-free, pedagogically balanced school schedules with zero teacher or classroom collisions in seconds. Runs 100% locally in your browser with enterprise-grade privacy.';

    document.title = pageTitle;

    // Update <html lang> and <html dir>
    document.documentElement.setAttribute('lang', isArabic ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr');

    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', pageDescription);

    // Update Open Graph tags if present
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', pageDescription);
  }, [activeLocale]);

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LandingNavbar currentLocale={activeLocale} />
      <Box component="main" id="main-content" style={{ flex: 1 }}>
        <HeroSection />
        <StatsRibbon />
        <FeatureGrid />
        <TimetablePreviewCard />
      </Box>
      <LandingFooter />
    </Box>
  );
}
