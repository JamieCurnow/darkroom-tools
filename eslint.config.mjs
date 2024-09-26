import withNuxt from './.nuxt/eslint.config.mjs'
import globals from 'globals'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default withNuxt(
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.ts', '**/*.js', '**/*.vue'],
    ignores: [
      'dist',
      'node_modules',
      '.nuxt',
      '.output',
      '.functions-dist',
      '.firebase',
      'functions/lib',
      '.github'
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'arrow-parens': 'off',
      'prefer-regex-literals': 'off',
      'eol-last': 'error',
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
  }
)
