import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import * as depend from "eslint-plugin-depend";
import { importX } from "eslint-plugin-import-x";
import onlyWarn from "eslint-plugin-only-warn";
import * as perfectionist from "eslint-plugin-perfectionist";
import security from "eslint-plugin-security";
import * as sonarjs from "eslint-plugin-sonarjs";
import turbo from "eslint-plugin-turbo";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import * as tseslint from "typescript-eslint";

/**
 * A shared ESLint configuration for the workspace.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  depend.configs["flat/recommended"],
  sonarjs.configs.recommended,
  security.configs.recommended,
  unicorn.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  perfectionist.configs["recommended-natural"],
  prettier,
  {
    plugins: {
      onlyWarn,
      turbo,
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "import-x/no-default-export": "error",
      "import-x/order": "off",
      "security/detect-object-injection": "off",
      "turbo/no-undeclared-env-vars": "warn",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          vars: "all",
          varsIgnorePattern: "^_",
        },
      ],
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
