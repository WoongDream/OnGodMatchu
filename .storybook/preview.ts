import type { Preview } from '@storybook/react-vite';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { ThemeProvider } from '@emotion/react';
import { theme } from '../src/styles/theme';
import '../src/index.css';

const preview: Preview = {
  decorators: [
    withThemeFromJSXProvider({
      themes: { default: theme },
      defaultTheme: 'default',
      Provider: ThemeProvider,
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '390px', height: '844px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '900px' },
        },
      },
      defaultViewport: 'desktop',
    },
  },
};

export default preview;
