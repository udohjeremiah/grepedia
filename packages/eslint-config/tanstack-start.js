import { reactLibraryConfig } from "./react-library.js";

/**
 * A custom ESLint configuration for libraries that use TanStack Start.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const tanstackStartConfig = [
  ...reactLibraryConfig,
  {
    files: ["**/vite.config.*"],
    rules: { "import-x/no-default-export": "off" },
  },
  {
    ignores: [
      "**/routeTree.gen.ts",
      ".netlify/**",
      ".output/**",
      ".tanstack/**",
    ],
  },
];
