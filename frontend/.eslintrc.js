module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'no-empty-pattern': 'warn',
    'no-useless-catch': 'warn',
    'no-prototype-builtins': 'warn',
    'no-useless-escape': 'warn',
    'no-case-declarations': 'warn',
    'no-dupe-class-members': 'error'
  },
  globals: {
    Chart: 'readonly'
  }
}