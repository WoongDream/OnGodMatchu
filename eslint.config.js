// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([globalIgnores(['dist', 'storybook-static']), {
  files: ['**/*.{ts,tsx}'],
  extends: [
    js.configs.recommended,
    tseslint.configs.recommended,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
    prettierConfig,
  ],
  plugins: {
    prettier,
  },
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  rules: {
    'prettier/prettier': 'error',

    // 컴포넌트는 화살표 함수만
    'react/function-component-definition': [
      'off',
    ],

    // 중괄호 강제
    curly: ['error', 'all'],

    // 사용하지 않는 변수
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // any 사용 경고
    '@typescript-eslint/no-explicit-any': 'warn',

    // Emotion: styled 금지, css literal 만 사용
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@emotion/styled',
            message: 'Use `css` from `@emotion/react` with the `css` prop instead of styled components.',
          },
        ],
      },
    ],
  },
}, ...storybook.configs["flat/recommended"]]);
