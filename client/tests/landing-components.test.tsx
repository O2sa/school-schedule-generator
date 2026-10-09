import 'fake-indexeddb/auto';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { I18nProvider } from '../src/i18n';
import { LandingNavbar } from '../src/components/landing/LandingNavbar';
import { LiveSolverDemo } from '../src/components/landing/LiveSolverDemo';
import { HeroSection } from '../src/components/landing/HeroSection';
import { StatsRibbon } from '../src/components/landing/StatsRibbon';
import { FeatureGrid } from '../src/components/landing/FeatureGrid';
import { TimetablePreviewCard } from '../src/components/landing/TimetablePreviewCard';
import { LandingFooter } from '../src/components/landing/LandingFooter';
import { LandingPage } from '../src/pages/LandingPage';

function renderWithProviders(ui: React.ReactElement, locale: 'ar' | 'en' = 'ar') {
  return render(
    <MantineProvider>
      <I18nProvider initialLocale={locale}>
        <MemoryRouter>{ui}</MemoryRouter>
      </I18nProvider>
    </MantineProvider>
  );
}

describe('Landing Page Components', () => {
  it('renders LandingNavbar with logo, links, and Launch App button', () => {
    renderWithProviders(<LandingNavbar />);
    expect(screen.getByText(/Jadwali|جَدْوَلي/i)).toBeDefined();
    expect(screen.getAllByRole('link', { name: /فتح التطبيق|Launch App/i })[0]).toBeDefined();
  });

  it('renders LiveSolverDemo and triggers simulated solver run', () => {
    vi.useFakeTimers();
    renderWithProviders(<LiveSolverDemo />);

    const runBtn = screen.getByRole('button', { name: /تشغيل محاكاة المحرك|Run Solver Simulation/i });
    expect(runBtn).toBeDefined();

    act(() => {
      fireEvent.click(runBtn);
    });

    // Advance simulation timer
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    // Verify optimal status or completed metrics
    expect(screen.getByText(/تم التوليد بنجاح|Optimal Schedule Generated/i)).toBeDefined();
    vi.useRealTimers();
  });

  it('renders HeroSection with headline, subheadline, and CTAs', () => {
    renderWithProviders(<HeroSection />);
    expect(screen.getByText(/المولّد الذكي للجداول المدرسية|Autonomous School Timetable Generator/i)).toBeDefined();
    expect(screen.getAllByRole('link', { name: /ابدأ الآن مجاناً|Launch Free App/i })[0]).toBeDefined();
  });

  it('renders StatsRibbon with 4 key metrics', () => {
    renderWithProviders(<StatsRibbon />);
    expect(screen.getByText('100%')).toBeDefined();
    expect(screen.getByText('< 2.5s')).toBeDefined();
    expect(screen.getByText('0')).toBeDefined();
    expect(screen.getByText('K-12')).toBeDefined();
  });

  it('renders FeatureGrid with 6 feature cards', () => {
    renderWithProviders(<FeatureGrid />);
    expect(screen.getByText(/محرك قيود ذكي CSP|Intelligent CSP Solver/i)).toBeDefined();
    expect(screen.getByText(/محرر تفاعلي|Drag & Drop Timetable Editor/i)).toBeDefined();
  });

  it('renders TimetablePreviewCard with sample periods and subjects', () => {
    renderWithProviders(<TimetablePreviewCard />);
    expect(screen.getByText(/معاينة واقعية|Explore a Generated Weekly Schedule/i)).toBeDefined();
  });

  it('renders LandingFooter with copyright and links', () => {
    renderWithProviders(<LandingFooter />);
    expect(screen.getByText(/جميع الحقوق محفوظة|All rights reserved/i)).toBeDefined();
  });

  it('renders LandingPage in Arabic mode with RTL', () => {
    renderWithProviders(<LandingPage forcedLocale="ar" />, 'ar');
    expect(screen.getAllByText(/جَدْوَلي|المولّد الذكي/i)[0]).toBeDefined();
  });

  it('renders LandingPage in English mode with LTR', () => {
    renderWithProviders(<LandingPage forcedLocale="en" />, 'en');
    expect(screen.getAllByText(/Jadwali/i)[0]).toBeDefined();
  });
});
