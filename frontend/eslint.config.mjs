import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: ['node_modules/**'],
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.mjs'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: {
          modules: true,
        },
        project: './tsconfig.json',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react: reactPlugin,
      prettier: prettierPlugin,
      '@next/next': nextPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'react-hooks': hooksPlugin,
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      ...hooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      'no-console': 'off',  // Disable console statement warnings
      'react/prop-types': 'off',
      'prettier/prettier': 'off',  // Disable Prettier formatting errors
      'jsx-a11y/no-autofocus': 'off',
      '@next/next/no-img-element': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': ['off'],  // Disable unused vars check
      'jsx-a11y/label-has-associated-control': 'off',
      'react/function-component-definition': [2, { namedComponents: 'arrow-function' }],
    },
  },
];
