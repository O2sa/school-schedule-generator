import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider, DirectionProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider } from './api/data-context';
import { theme } from './theme/theme';
import { AppLayout } from './layouts/AppLayout';

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <DirectionProvider initialDirection="rtl">
          <MantineProvider theme={theme} defaultColorScheme="light">
            <Notifications position="top-center" />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="teachers" element={<Teachers />} />
                  <Route path="classes" element={<Classes />} />
                  <Route path="subjects" element={<Subjects />} />
                  <Route path="curriculum" element={<Curriculum />} />
                  <Route path="generator" element={<Generator />} />
                  <Route path="schedule" element={<ScheduleView />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </MantineProvider>
        </DirectionProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}
