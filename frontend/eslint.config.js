// Configuração do ESLint: o "revisor automático" do código.
// Usa as regras recomendadas pelo Expo para projetos React Native.
// Rode com: npm run lint
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Pastas que o ESLint não deve revisar.
    ignores: ['node_modules/*', 'android/*', 'ios/*', 'dist/*', '.expo/*'],
  },
]);
