// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // Ignora a pasta de build
  globalIgnores(["dist", "node_modules", "coverage"]),

  {
    files: ["**/*.{js,jsx}"],
    ignores: ["vite.config.js"], // evita lintar configs internas

    // Configurações base e plugins recomendados
    extends: [
      js.configs.recommended, // regras JS padrão
      reactHooks.configs["recommended-latest"], // boas práticas React Hooks
      reactRefresh.configs.vite, // integração com Vite e React Refresh
    ],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node, // útil para projetos com scripts Node (ex: vite.config)
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    rules: {
      // ⚙️ Boas práticas gerais
      "no-unused-vars": ["warn", { varsIgnorePattern: "^[A-Z_]" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // ⚛️ React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // 🔄 Código mais limpo e consistente
      "prefer-const": "warn",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-trailing-spaces": "warn",
    },
  },
]);
