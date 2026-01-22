import type { FastifyPluginAsync } from "fastify";

import addTool from "@/routes/tools/add-tool.js";

const tools: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook("onRequest", fastify.requireUser);
    protectedRoutes.register(addTool);
  });
};

export default tools;
