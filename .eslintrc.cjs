module.exports = {
  env: { browser: true, es2022: true },
  extends: ['eslint:recommended', 'plugin:import/recommended', 'prettier'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: { 'import/no-unresolved': 'off' }
};