// @ts-check
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // ── Ignore compiled output and generated files ──────────────────────────────
  { ignores: ['lib/**/*', 'generated/**/*'] },

  // ── TypeScript source files ─────────────────────────────────────────────────
  {
    files: ['**/*.ts', '**/*.mts'],
    extends: tseslint.configs.recommended,
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      quotes: ['error', 'single'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // ── Config files (this file, eslint.config.mjs) ─────────────────────────────
  {
    files: ['*.mjs'],
    extends: tseslint.configs.recommended,
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  }
);
