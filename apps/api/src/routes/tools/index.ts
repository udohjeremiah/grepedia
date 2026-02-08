import type { FastifyPluginAsync } from "fastify";

import addTool from "./add-tool.js";
import getToolsCount from "./get-tools-count.js";

const tools: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.register(getToolsCount);

  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook("onRequest", fastify.requireUser);
    protectedRoutes.register(addTool);
  });
};

export default tools;
