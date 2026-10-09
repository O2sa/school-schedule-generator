import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider, DirectionProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider } from '../src/api/data-context';
import { I18nProvider } from '../src/i18n';
import { theme } from '../src/theme/theme';
import { AppLayout } from '../src/layouts/AppLayout';
import { LandingPage } from '../src/pages/LandingPage';
import { Dashboard } from '../src/pages/Dashboard';
import { Teachers } from '../src/pages/Teachers';
import { Generator } from '../src/pages/Generator';
import { ScheduleView } from '../src/pages/ScheduleView';

// Mock matchMedia for Mantine
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

function renderRoute(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <I18nProvider>
          <DirectionProvider initialDirection="ltr">
            <MantineProvider theme={theme}>
              <MemoryRouter initialEntries={[initialPath]}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/ar" element={<LandingPage forcedLocale="ar" />} />
                  <Route path="/en" element={<LandingPage forcedLocale="en" />} />

                  <Route path="/app" element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="teachers" element={<Teachers />} />
                    <Route path="generator" element={<Generator />} />
                    <Route path="schedule" element={<ScheduleView />} />
                    <Route path="*" element={<Navigate to="/app" replace />} />
                  </Route>

                  {/* Legacy redirects */}
                  <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="/teachers" element={<Navigate to="/app/teachers" replace />} />
                  <Route path="/generator" element={<Navigate to="/app/generator" replace />} />
                  <Route path="/schedule" element={<Navigate to="/app/schedule" replace />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MemoryRouter>
            </MantineProvider>
          </DirectionProvider>
        </I18nProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}

describe('Product Landing Page & Application Route Integration', () => {
  it('renders landing page at root path /', () => {
    renderRoute('/');
    expect(screen.getAllByRole('link', { name: /launch app|فتح التطبيق|ابدأ الآن/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CSP/i).length).toBeGreaterThan(0);
  });

  it('renders Arabic landing page at /ar with Arabic branding', () => {
    renderRoute('/ar');
    expect(screen.getAllByText(/جَدْوَلي|المولّد الذكي/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /فتح التطبيق|ابدأ الآن/i }).length).toBeGreaterThan(0);
  });

  it('renders English landing page at /en with English branding', () => {
    renderRoute('/en');
    expect(screen.getAllByText(/Jadwali/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Launch App|Get Started/i }).length).toBeGreaterThan(0);
  });

  it('renders management application dashboard under /app', () => {
    renderRoute('/app');
    expect(screen.getByRole('banner')).toBeDefined();
  });

  it('redirects legacy /teachers route to /app/teachers', () => {
    renderRoute('/teachers');
    expect(screen.getByRole('banner')).toBeDefined();
  });

  it('redirects legacy /generator route to /app/generator', () => {
    renderRoute('/generator');
    expect(screen.getByRole('banner')).toBeDefined();
  });

  it('redirects legacy /schedule route to /app/schedule', () => {
    renderRoute('/schedule');
    expect(screen.getByRole('banner')).toBeDefined();
  });

  it('redirects unknown path to landing page', () => {
    renderRoute('/some-nonexistent-page');
    expect(screen.getAllByRole('link', { name: /launch app|فتح التطبيق|ابدأ الآن/i }).length).toBeGreaterThan(0);
  });


  it('renders responsive navigation with language toggle and mobile burger', () => {
    renderRoute('/en');
    expect(screen.getByRole('button', { name: /toggle navigation/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /toggle language/i })).toBeDefined();
  });

  it('updates document title and meta description dynamically based on language', () => {
    const { unmount: unmountAr } = renderRoute('/ar');
    expect(document.title).toContain('جَدْوَلي');
    expect(document.documentElement.getAttribute('lang')).toBe('ar');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    const metaDescAr = document.querySelector('meta[name="description"]');
    expect(metaDescAr?.getAttribute('content')).toContain('جَدْوَلي');
    unmountAr();

    const { unmount: unmountEn } = renderRoute('/en');
    expect(document.title).toContain('Jadwali');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    const metaDescEn = document.querySelector('meta[name="description"]');
    expect(metaDescEn?.getAttribute('content')).toContain('Jadwali');
    unmountEn();
  });

  it('renders semantic main element and sections with navigation IDs', () => {
    const { unmount } = renderRoute('/');
    const mainElem = document.querySelector('main#main-content');
    expect(mainElem).toBeDefined();
    expect(mainElem).not.toBeNull();

    expect(document.getElementById('hero')).not.toBeNull();
    expect(document.getElementById('features')).not.toBeNull();
    expect(document.getElementById('demo')).not.toBeNull();
    expect(document.getElementById('preview')).not.toBeNull();
    unmount();
  });
});
