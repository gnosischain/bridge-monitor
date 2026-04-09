import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'

import nextPlugin from '@next/eslint-plugin-next'
import reactPlugin from 'eslint-plugin-react'
import importPlugin from 'eslint-plugin-import'

export default [
  {
    ignores: [
      'node_modules/',
      '.pnp',
      '**/.pnp.js',
      'coverage/',
      '.next/',
      'out/',
      'build/',
      '**/.DS_Store',
      '**/*.d.ts',
      '**/.eslintrc.js',
      '**/.eslintignore',
      '**/.prettierrc.js',
      '**/.prettierignore',
      '**/tsconfig.json',
      '**/next.config.js',
      '**/npm-debug.log*',
      '**/yarn-debug.log*',
      '**/yarn-error.log*',
      '**/.env.local',
      '**/.env.development.local',
      '**/.env.test.local',
      '**/.env.production.local',
      '**/types/generated/**',
      'out_publish/',
      'out_functions/',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  reactPlugin.configs.flat.recommended,

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'writable',
      },
    },
    settings: {
      react: { version: '18.3.1' },
    },
    plugins: {
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
      import: importPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      'import/no-anonymous-default-export': 'warn',

      'import/extensions': 0,
      'import/no-cycle': [0, { ignoreExternal: true }],
      'import/no-unresolved': 0,
      'no-use-before-define': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
      'react/jsx-label-has-associated-control': 0,
      'react/jsx-sort-props': 2,
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false, classes: false, variables: true },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-constant-binary-expression': 'error',
    },
  },

  prettierRecommended,
]
