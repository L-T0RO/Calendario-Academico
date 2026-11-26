import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["test/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  {
    files: ["public/js/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
];