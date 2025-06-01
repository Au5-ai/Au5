const { defineConfig } = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const unicorn = require("eslint-plugin-unicorn");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      parser: tsParser,
    },

    plugins: {
      "@typescript-eslint": typescriptEslint,
      unicorn,
    },

    extends: compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:unicorn/recommended"
    ),

    rules: {
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: false,
            pascalCase: true,
            kebabCase: true,
          },

          ignore: ["^.*\\.d\\.ts$"],
        },
      ],
    },
  },
  {
    files: ["**/*Service.ts"],

    rules: {
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            pascalCase: true,
          },
        },
      ],
    },
  },
  {
    files: ["**/constants/**/*.ts", "**/utils/**/*.ts"],

    rules: {
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            kebabCase: true,
          },
        },
      ],
    },
  },
]);
