import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import {
  detectUserLocale,
  I18nProvider,
  useTranslation,
  ar,
  en,
} from '../src/i18n';
import { LanguageToggle } from '../src/components/common/LanguageToggle';

describe('i18n - System Locale Detection & Persistence', () => {
  const originalNavigator = window.navigator;

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
    window.localStorage.clear();
  });

  it('detects Arabic when navigator.language begins with "ar"', () => {
    Object.defineProperty(window, 'navigator', {
      value: { language: 'ar-SA', languages: ['ar-SA', 'ar'] },
      configurable: true,
    });
    expect(detectUserLocale()).toBe('ar');
  });

  it('detects English when navigator.language begins with "en"', () => {
    Object.defineProperty(window, 'navigator', {
      value: { language: 'en-US', languages: ['en-US', 'en'] },
      configurable: true,
    });
    expect(detectUserLocale()).toBe('en');
  });

  it('falls back to "ar" default when system language is unsupported', () => {
    Object.defineProperty(window, 'navigator', {
      value: { language: 'fr-FR', languages: ['fr-FR'] },
      configurable: true,
    });
    expect(detectUserLocale()).toBe('ar');
  });

  it('prioritizes saved localStorage locale over navigator.language', () => {
    window.localStorage.setItem('app_locale', 'en');
    Object.defineProperty(window, 'navigator', {
      value: { language: 'ar-SA' },
      configurable: true,
    });
    expect(detectUserLocale()).toBe('en');

    window.localStorage.setItem('app_locale', 'ar');
    Object.defineProperty(window, 'navigator', {
      value: { language: 'en-US' },
      configurable: true,
    });
    expect(detectUserLocale()).toBe('ar');
  });
});

describe('i18n - Dictionary Completeness & Integrity', () => {
  function getDeepKeys(obj: Record<string, any>, prefix = ''): string[] {
    let keys: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        keys = keys.concat(getDeepKeys(v, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  }

  it('ensures Arabic and English have matching dictionary keys', () => {
    const arKeys = getDeepKeys(ar).sort();
    const enKeys = getDeepKeys(en).sort();

    const missingInEn = arKeys.filter((k) => !enKeys.includes(k));
    const missingInAr = enKeys.filter((k) => !arKeys.includes(k));

    expect(missingInEn).toEqual([]);
    expect(missingInAr).toEqual([]);
  });

  it('contains all required top-level application domains', () => {
    const requiredSections = [
      'nav',
      'common',
      'dashboard',
      'teachers',
      'teacherModal',
      'availabilityDrawer',
      'classes',
      'classModal',
      'subjects',
      'curriculum',
      'generator',
      'scheduleView',
      'settings',
      'landing',
    ];

    for (const section of requiredSections) {
      expect(ar).toHaveProperty(section);
      expect(en).toHaveProperty(section);
    }
  });
});

describe('i18n - React Context & Hooks Provider', () => {
  function TestConsumer() {
    const { locale, dir, t, toggleLocale, setLocale } = useTranslation();
    return (
      <div>
        <span data-testid="locale">{locale}</span>
        <span data-testid="dir">{dir}</span>
        <span data-testid="nav-dashboard">{t('nav.dashboard')}</span>
        <span data-testid="period-number">
          {t('common.periodNumber', { number: 3 })}
        </span>
        <span data-testid="days-count">
          {Array.isArray(t('common.days')) ? t('common.days').length : 0}
        </span>
        <button data-testid="toggle-btn" onClick={toggleLocale}>
          Toggle
        </button>
        <button data-testid="set-en-btn" onClick={() => setLocale('en')}>
          Set EN
        </button>
        <button data-testid="set-ar-btn" onClick={() => setLocale('ar')}>
          Set AR
        </button>
      </div>
    );
  }

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders initial Arabic locale with RTL direction and updates document', () => {
    render(
      <I18nProvider initialLocale="ar">
        <TestConsumer />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale').textContent).toBe('ar');
    expect(screen.getByTestId('dir').textContent).toBe('rtl');
    expect(screen.getByTestId('nav-dashboard').textContent).toBe('الرئيسية');
    expect(screen.getByTestId('period-number').textContent).toBe('الحصة 3');
    expect(screen.getByTestId('days-count').textContent).toBe('7');

    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(window.localStorage.getItem('app_locale')).toBe('ar');
  });

  it('renders English locale with LTR direction and updates document', () => {
    render(
      <I18nProvider initialLocale="en">
        <TestConsumer />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale').textContent).toBe('en');
    expect(screen.getByTestId('dir').textContent).toBe('ltr');
    expect(screen.getByTestId('nav-dashboard').textContent).toBe('Dashboard');
    expect(screen.getByTestId('period-number').textContent).toBe('Period 3');

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(window.localStorage.getItem('app_locale')).toBe('en');
  });

  it('toggles dynamically between Arabic and English', () => {
    render(
      <I18nProvider initialLocale="ar">
        <TestConsumer />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale').textContent).toBe('ar');
    expect(screen.getByTestId('nav-dashboard').textContent).toBe('الرئيسية');

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-btn'));
    });

    expect(screen.getByTestId('locale').textContent).toBe('en');
    expect(screen.getByTestId('dir').textContent).toBe('ltr');
    expect(screen.getByTestId('nav-dashboard').textContent).toBe('Dashboard');
    expect(document.documentElement.dir).toBe('ltr');
    expect(window.localStorage.getItem('app_locale')).toBe('en');

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-btn'));
    });

    expect(screen.getByTestId('locale').textContent).toBe('ar');
    expect(screen.getByTestId('dir').textContent).toBe('rtl');
    expect(screen.getByTestId('nav-dashboard').textContent).toBe('الرئيسية');
    expect(document.documentElement.dir).toBe('rtl');
  });
});

describe('i18n - LanguageToggle Component', () => {
  it('renders LanguageToggle and switches locale on click', () => {
    render(
      <MantineProvider>
        <I18nProvider initialLocale="ar">
          <LanguageToggle />
        </I18nProvider>
      </MantineProvider>
    );

    // In Arabic mode, the toggle invites the user to switch to English
    const toggleBtn = screen.getByRole('button');
    expect(toggleBtn).toBeDefined();
    expect(screen.getByText('English')).toBeDefined();

    act(() => {
      fireEvent.click(toggleBtn);
    });

    // Now in English mode, the toggle invites the user to switch to Arabic
    expect(screen.getByText('العربية')).toBeDefined();
    expect(document.documentElement.dir).toBe('ltr');
  });
});
