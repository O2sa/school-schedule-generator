import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider, DirectionProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider } from './api/data-context';
import { I18nProvider, useTranslation } from './i18n';
import { theme } from './theme/theme';
import { AppLayout } from './layouts/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Teachers } from './pages/Teachers';
import { Classes } from './pages/Classes';
import { Subjects } from './pages/Subjects';
import { Curriculum } from './pages/Curriculum';
import { Generator } from './pages/Generator';
import { ScheduleView } from './pages/ScheduleView';
import { Settings } from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppWithI18n() {
  const { dir } = useTranslation();

  return (
    <DirectionProvider key={dir} initialDirection={dir} detectDirection={false}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications position="top-center" />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            {/* Public multilingual landing pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/ar" element={<LandingPage forcedLocale="ar" />} />
            <Route path="/en" element={<LandingPage forcedLocale="en" />} />

            {/* Application suite under /app */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="classes" element={<Classes />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="curriculum" element={<Curriculum />} />
              <Route path="generator" element={<Generator />} />
              <Route path="schedule" element={<ScheduleView />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Route>

            {/* Legacy redirect aliases for backward compatibility */}
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/teachers" element={<Navigate to="/app/teachers" replace />} />
            <Route path="/classes" element={<Navigate to="/app/classes" replace />} />
            <Route path="/subjects" element={<Navigate to="/app/subjects" replace />} />
            <Route path="/curriculum" element={<Navigate to="/app/curriculum" replace />} />
            <Route path="/generator" element={<Navigate to="/app/generator" replace />} />
            <Route path="/schedule" element={<Navigate to="/app/schedule" replace />} />
            <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MantineProvider>
    </DirectionProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <I18nProvider>
          <AppWithI18n />
        </I18nProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}
