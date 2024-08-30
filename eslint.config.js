import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import eslintReact from 'eslint-plugin-react'
import hooksPlugin from 'eslint-plugin-react-hooks'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      react: eslintReact,
      'react-hooks': hooksPlugin,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',

      // Trust the developer
      '@typescript-eslint/ban-ts-comment': 'off',

      // `any` has perfectly valid use cases in advanced types.
      '@typescript-eslint/no-explicit-any': 'off',

      ...hooksPlugin.configs.recommended.rules,
      ...eslintReact.configs.recommended.rules,

      // For now JS users can live with their choices
      'react/prop-types': 'off',
    },

    ignores: ['dist/**/*'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    files: ['**/*.{ts, tsx}'],
  },
)
