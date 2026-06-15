import eslintReact from "@eslint-react/eslint-plugin";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

import { baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config} */
export const reactLibraryConfig = [
  ...baseConfig,
  eslintReact.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    languageOptions: {
      ...eslintReact.configs.recommended.languageOptions,
      ...jsxA11y.flatConfigs.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "unicorn/prevent-abbreviations": [
        "error",
        {
          replacements: {
            env: false,
            param: false,
            params: false,
            props: false,
            ref: false,
          },
        },
      ],
    },
    settings: { react: { version: "detect" } },
  },
];
