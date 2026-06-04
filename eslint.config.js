import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

const quoteRules = {
  quotes: ['error', 'single', { avoidEscape: true }],
};

const lengthRules = {
  'max-len': [
    'error',
    {
      code: 80,
      ignoreComments: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
    },
  ],
};

export default [
  {
    ignores: ['lib/**', 'coverage/**', 'examples/**', 'node_modules/**', 'docs/**', 'performance.ts'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    rules: {
      ...quoteRules,
      ...lengthRules,
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        IDBObjectStoreParameters: 'readonly',
        IDBIndexParameters: 'readonly',
        IDBTransactionMode: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...quoteRules,
      ...lengthRules,
      eqeqeq: ['error', 'always'],
      'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
      'no-console': 'off',
      'no-unused-vars': 'off',
      'prefer-const': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['__tests__/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        fail: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...quoteRules,
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
          disallowTypeAnnotations: false,
        },
      ],
    },
  },
];
