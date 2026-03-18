import { nodeLibraryConfig } from "./node-library.js";

/**
 * A custom ESLint configuration for libraries that use Fastify.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const fastifyConfig = [...nodeLibraryConfig];
