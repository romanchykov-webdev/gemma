import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Сначала указываем что игнорировать (важен порядок!)
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/dist/**',
      'next-env.d.ts',
      '.next',
      '.next/**/*',
    ],
  },
  // Потом расширяем конфигурации
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // Потом кастомные правила
  {
    rules: {
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-unused-vars': 'warn', // Сделать warning вместо error
      '@typescript-eslint/no-explicit-any': 'warn', // Сделать warning вместо error
    },
  },
];

export default eslintConfig;
