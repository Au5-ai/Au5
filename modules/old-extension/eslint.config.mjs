import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,ts,mjs,cjs,cts,mts}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      js,
      unicorn,
    },
    rules: {
      ...unicorn.configs.recommended.rules,
    },
  },
  ...tseslint.configs.recommended,
]);
