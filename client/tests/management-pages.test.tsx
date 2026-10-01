import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { DataProvider } from '../src/api/data-context';
import { Teachers } from '../src/pages/Teachers';
import { Classes } from '../src/pages/Classes';
import { Subjects } from '../src/pages/Subjects';
import { Curriculum } from '../src/pages/Curriculum';

describe('Management Pages Rendering', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <MantineProvider>{ui}</MantineProvider>
        </DataProvider>
      </QueryClientProvider>
    );
  };

  it('renders Teachers page with header and add button', () => {
    renderWithProviders(<Teachers />);
    expect(screen.getByText('إدارة المعلمين')).toBeDefined();
    expect(screen.getByText('إضافة معلم جديد')).toBeDefined();
  });

  it('renders Classes page with header and grade filter', () => {
    renderWithProviders(<Classes />);
    expect(screen.getByText('إدارة الفصول والقاعات الدراسية')).toBeDefined();
    expect(screen.getByText('إضافة فصل جديد')).toBeDefined();
  });

  it('renders Subjects page with header and add button', () => {
    renderWithProviders(<Subjects />);
    expect(screen.getByText('المواد الدراسية')).toBeDefined();
    expect(screen.getByText('إضافة مادة جديدة')).toBeDefined();
  });

  it('renders Curriculum page with quota calculation header', () => {
    renderWithProviders(<Curriculum />);
    expect(screen.getByText('الخطة الدراسية وتوزيع الحصص')).toBeDefined();
  });
});
