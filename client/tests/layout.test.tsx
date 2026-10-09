import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider, DirectionProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider } from '../src/api/data-context';
import { AppLayout } from '../src/layouts/AppLayout';

describe('AppLayout Shell', () => {
  it('renders navigation links and mode toggle badge', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <DirectionProvider initialDirection="rtl">
            <MantineProvider>
              <MemoryRouter initialEntries={['/']}>
                <AppLayout />
              </MemoryRouter>
            </MantineProvider>
          </DirectionProvider>
        </DataProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('جَدْوَلي')).toBeDefined();
    expect(screen.getByText('المعلمون')).toBeDefined();
    expect(screen.getByText('الفصول والقاعات')).toBeDefined();
    expect(screen.getByText('توليد الجدول')).toBeDefined();
    expect(screen.getByText('وضع المتصفح المحلي')).toBeDefined();
  });
});
