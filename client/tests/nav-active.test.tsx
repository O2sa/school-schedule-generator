import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider } from '../src/api/data-context';
import { AppLayout } from '../src/layouts/AppLayout';

function renderLayoutAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <MantineProvider>
          <MemoryRouter initialEntries={[path]}>
            <AppLayout />
          </MemoryRouter>
        </MantineProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}

describe('Navigation Active State', () => {
  it('activates only Dashboard when on /app', () => {
    const { unmount } = renderLayoutAt('/app');
    const links = screen.getAllByRole('link');
    const activeLinks = links.filter((l) => l.getAttribute('data-active') === 'true');

    expect(activeLinks).toHaveLength(1);
    expect(activeLinks[0].getAttribute('href')).toBe('/app');
    unmount();
  });

  it('activates only Teachers when on /app/teachers', () => {
    const { unmount } = renderLayoutAt('/app/teachers');
    const links = screen.getAllByRole('link');
    const activeLinks = links.filter((l) => l.getAttribute('data-active') === 'true');

    expect(activeLinks).toHaveLength(1);
    expect(activeLinks[0].getAttribute('href')).toBe('/app/teachers');

    // Dashboard must NOT be active
    const dashboardLink = links.find((l) => l.getAttribute('href') === '/app');
    expect(dashboardLink?.getAttribute('data-active')).toBeNull();
    expect(dashboardLink?.getAttribute('aria-current')).toBeNull();
    unmount();
  });

  it('activates only Classes when on /app/classes', () => {
    const { unmount } = renderLayoutAt('/app/classes');
    const links = screen.getAllByRole('link');
    const activeLinks = links.filter((l) => l.getAttribute('data-active') === 'true');

    expect(activeLinks).toHaveLength(1);
    expect(activeLinks[0].getAttribute('href')).toBe('/app/classes');
    unmount();
  });

  it('activates only Generator when on /app/generator', () => {
    const { unmount } = renderLayoutAt('/app/generator');
    const links = screen.getAllByRole('link');
    const activeLinks = links.filter((l) => l.getAttribute('data-active') === 'true');

    expect(activeLinks).toHaveLength(1);
    expect(activeLinks[0].getAttribute('href')).toBe('/app/generator');
    unmount();
  });
});
