import eslintReact from "@eslint-react/eslint-plugin";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

import { baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config} */
export const reactLibraryConfig = [
  ...baseConfig,
  eslintReact.configs.recommended,
  pluginJsxA11y.flatConfigs.recommended,
  {
    languageOptions: {
      ...eslintReact.configs.recommended.languageOptions,
      ...pluginJsxA11y.flatConfigs.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
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
