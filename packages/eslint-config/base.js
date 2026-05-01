import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import { importX } from "eslint-plugin-import-x";
import onlyWarn from "eslint-plugin-only-warn";
import * as perfectionist from "eslint-plugin-perfectionist";
import * as sonarjs from "eslint-plugin-sonarjs";
import turboPlugin from "eslint-plugin-turbo";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import * as tseslint from "typescript-eslint";

/**
 * A shared ESLint configuration for the workspace.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  perfectionist.configs["recommended-natural"],
  eslintConfigPrettier,
  {
    plugins: {
      onlyWarn,
      turbo: turboPlugin,
    },
    rules: {
      "import-x/no-default-export": "error",
      "import-x/order": "off",
      "turbo/no-undeclared-env-vars": "warn",
    },
    settings: {
      "import-x/resolver": {
        node: true,
        typescript: { project: "tsconfig.json" },
      },
    },
  },
  {
    files: ["**/eslint.config.*", "**/lint-staged.config.*"],
    rules: { "import-x/no-default-export": "off" },
  },
  {
    ignores: ["dist/**"],
  },
];
