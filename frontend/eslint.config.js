// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // Ignorar saídas e dependências
  globalIgnores(["dist", "node_modules", "coverage"]),

  {
    files: ["**/*.{js,jsx}"],
    ignores: [
      "vite.config.*",
      "eslint.config.*",
      "**/*.config.*",
    ],

    extends: [
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    rules: {
      // Boas práticas gerais
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^[A-Z_]", // ex: constantes em maiúsculo
          argsIgnorePattern: "^_", // parâmetros não usados começando com _
        },
      ],
      "no-console": [
        process.env.NODE_ENV === "production" ? "warn" : "off",
        { allow: ["warn", "error"] },
      ],

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Limpeza e consistência
      "prefer-const": "warn",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-trailing-spaces": "warn",
    },
  },

  // Opcional: regras mais suaves pra testes
  {
    files: ["**/*.test.{js,jsx}", "**/*.spec.{js,jsx}"],
    rules: {
      "no-console": "off",
      "no-unused-expressions": "off",
    },
  },
]);
