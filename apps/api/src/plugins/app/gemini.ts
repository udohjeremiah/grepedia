import { GoogleGenAI } from "@google/genai";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    gemini: GoogleGenAI;
  }
}

/**
 * This plugin initializes and configures Gemini.
 *
 * @see {@link https://aistudio.google.com}
 */
export default fp(
  async (fastify) => {
    const gemini = new GoogleGenAI({
      apiKey: fastify.env.GEMINI_API_KEY,
    });

    fastify.decorate("gemini", gemini);
  },
  { dependencies: ["env"], name: "gemini" },
);
