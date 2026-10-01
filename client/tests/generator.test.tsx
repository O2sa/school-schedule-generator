import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { DataProvider } from '../src/api/data-context';
import { Generator } from '../src/pages/Generator';

describe('Generator Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  it('renders Generator page with solver metrics and start button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <MantineProvider>
            <MemoryRouter>
              <Generator />
            </MemoryRouter>
          </MantineProvider>
        </DataProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('توليد الجدول المدرسي الذكي')).toBeDefined();
    expect(screen.getByText('مركز التحكم بالتوليد')).toBeDefined();
    expect(screen.getByText('بدء توليد الجدول')).toBeDefined();
  });
});
