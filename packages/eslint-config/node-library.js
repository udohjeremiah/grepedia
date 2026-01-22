import { baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use Node.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const nodeLibrary = [...baseConfig];
