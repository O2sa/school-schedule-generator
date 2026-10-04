import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MantineProvider, useMantineColorScheme, useComputedColorScheme, ActionIcon, Tooltip } from '@mantine/core';
import { theme } from '../src/theme/theme';

describe('System Theme Detection & Auto Color Scheme', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.localStorage.removeItem('mantine-color-scheme-value');
    document.documentElement.removeAttribute('data-mantine-color-scheme');
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    window.localStorage.removeItem('mantine-color-scheme-value');
    document.documentElement.removeAttribute('data-mantine-color-scheme');
  });

  function mockMatchMedia(matchesDark: boolean) {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;
    const mql = {
      matches: matchesDark,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') changeHandler = handler;
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (query === '(prefers-color-scheme: dark)') return mql;
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });
    return {
      triggerChange: (nowDark: boolean) => {
        mql.matches = nowDark;
        if (changeHandler) {
          changeHandler({ matches: nowDark } as MediaQueryListEvent);
        }
      },
    };
  }

  function ThemeConsumer() {
    const { colorScheme, setColorScheme, clearColorScheme, toggleColorScheme } = useMantineColorScheme();
    const computed = useComputedColorScheme('light', { getInitialValueInEffect: true });
    return (
      <div>
        <span data-testid="raw-color-scheme">{colorScheme}</span>
        <span data-testid="computed-color-scheme">{computed}</span>
        <button data-testid="toggle-btn" onClick={() => toggleColorScheme()}>
          Toggle
        </button>
        <button data-testid="set-dark-btn" onClick={() => setColorScheme('dark')}>
          Dark
        </button>
        <button data-testid="set-light-btn" onClick={() => setColorScheme('light')}>
          Light
        </button>
        <button data-testid="set-auto-btn" onClick={() => setColorScheme('auto')}>
          Auto
        </button>
      </div>
    );
  }

  it('detects dark mode from system when prefers-color-scheme: dark matches', () => {
    mockMatchMedia(true);

    render(
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <ThemeConsumer />
      </MantineProvider>
    );

    expect(screen.getByTestId('raw-color-scheme').textContent).toBe('auto');
    expect(screen.getByTestId('computed-color-scheme').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('dark');
  });

  it('detects light mode from system when prefers-color-scheme: dark does not match', () => {
    mockMatchMedia(false);

    render(
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <ThemeConsumer />
      </MantineProvider>
    );

    expect(screen.getByTestId('raw-color-scheme').textContent).toBe('auto');
    expect(screen.getByTestId('computed-color-scheme').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('light');
  });

  it('updates dynamically when system preference changes in auto mode', () => {
    const { triggerChange } = mockMatchMedia(false);

    render(
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <ThemeConsumer />
      </MantineProvider>
    );

    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('light');

    act(() => {
      triggerChange(true);
    });

    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('dark');
  });

  it('allows manual override to light or dark, persisting to localStorage', () => {
    mockMatchMedia(true); // System is dark

    render(
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <ThemeConsumer />
      </MantineProvider>
    );

    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('dark');

    // Manually set light
    act(() => {
      fireEvent.click(screen.getByTestId('set-light-btn'));
    });

    expect(screen.getByTestId('raw-color-scheme').textContent).toBe('light');
    expect(screen.getByTestId('computed-color-scheme').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('light');
    expect(window.localStorage.getItem('mantine-color-scheme-value')).toBe('light');

    // Reset to auto (system)
    act(() => {
      fireEvent.click(screen.getByTestId('set-auto-btn'));
    });

    expect(screen.getByTestId('raw-color-scheme').textContent).toBe('auto');
    expect(screen.getByTestId('computed-color-scheme').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('dark');
  });
});

import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider } from '../src/api/data-context';
import { I18nProvider } from '../src/i18n';
import { AppLayout } from '../src/layouts/AppLayout';

describe('AppLayout Theme Toggle System Integration', () => {
  it('correctly displays sun icon when system theme is dark and moon icon when light', () => {
    // 1. When system is dark
    let matchesDark = true;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: matchesDark,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <I18nProvider initialLocale="en">
            <MantineProvider theme={theme} defaultColorScheme="auto">
              <MemoryRouter initialEntries={['/']}>
                <AppLayout />
              </MemoryRouter>
            </MantineProvider>
          </I18nProvider>
        </DataProvider>
      </QueryClientProvider>
    );

    const toggleBtn = screen.getByLabelText('Toggle color scheme');
    expect(toggleBtn).toBeDefined();

    // When dark, it should offer switching to light (sun icon / title)
    expect(toggleBtn.querySelector('.tabler-icon-sun')).not.toBeNull();
    expect(toggleBtn.querySelector('.tabler-icon-moon')).toBeNull();

    unmount();
  });
});
