import React from 'react';
import { MantineProvider, DirectionProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from './theme/theme';

export default function App() {
  return (
    <DirectionProvider initialDirection="rtl">
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications position="top-center" />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>نظام الجداول المدرسية الذكي</h1>
          <p>School Schedule Generator - Client / Server Dual Mode</p>
        </div>
      </MantineProvider>
    </DirectionProvider>
  );
}
