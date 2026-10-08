import { createTheme } from '@mantine/core';

export const BRAND_GRADIENT = 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)';
export const BRAND_GRADIENT_HORIZONTAL = 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)';
export const SUCCESS_GRADIENT = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';

export const theme = createTheme({
  fontFamily: 'Cairo, Tajawal, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace: 'Courier New, monospace',
  primaryColor: 'indigo',
  defaultRadius: 'md',
  headings: {
    fontFamily: 'Cairo, Tajawal, sans-serif',
    fontWeight: '800',
  },
  components: {
    Card: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'xl',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
        overlayProps: {
          blur: 6,
          backgroundOpacity: 0.45,
        },
      },
    },
    Drawer: {
      defaultProps: {
        overlayProps: {
          blur: 6,
          backgroundOpacity: 0.45,
        },
      },
    },
  },
});
