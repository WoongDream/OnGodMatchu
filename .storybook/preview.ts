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
  },
};

export default preview;
