import { reactLibraryConfig } from "./react-library.js";

/**
 * A custom ESLint configuration for libraries that use TanStack Start.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const tanstackStartConfig = [
  ...reactLibraryConfig,
  {
    ignores: [
      "**/routeTree.gen.ts",
      ".netlify/**",
      ".output/**",
      ".tanstack/**",
    ],
  },
];
