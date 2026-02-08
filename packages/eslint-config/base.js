import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import perfectionist from "eslint-plugin-perfectionist";
import sonarjs from "eslint-plugin-sonarjs";
import turboPlugin from "eslint-plugin-turbo";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  perfectionist.configs["recommended-natural"],
  eslintConfigPrettier,
  {
    plugins: {
      onlyWarn,
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    ignores: ["dist/**"],
  },
];
