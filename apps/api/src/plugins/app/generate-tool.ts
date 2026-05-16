import { addToolBodySchema } from "@workspace/shared/schemas/tools/add-tool";
import {
  generatedToolEntrySchema,
  GenerateToolEntry,
} from "@workspace/shared/schemas/tools/generate-tool";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    generateTool(text: string): Promise<GenerateToolEntry>;
  }
}

/**
 * This plugin generates structured tool entries
 * from raw crawled web content using an LLM.
 *
 * @see {@link https://ai.google.dev/gemini-api}
 * @see {@link https://ollama.com}
 */
export default fp(
  async (fastify) => {
    const useGemini =
      fastify.env.NODE_ENV === "production" ||
      fastify.env.AI_PROVIDER === "gemini";

    const SYSTEM_PROMPT = Buffer.from(
      fastify.env.AI_PROMPT_TOOL_GENERATION,
      "base64",
    ).toString("utf8");

    const generateWithOllama = async (text: string) => {
      const response = await fetch(`${fastify.env.OLLAMA_URL}/api/generate`, {
        body: JSON.stringify({
          format: "json",
          model: fastify.env.AI_GENERATION_MODEL,
          prompt:
            `${SYSTEM_PROMPT}\n\n---\n\nCONTENT (UNTRUSTED):\n${text}`.trim(),
          stream: false,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Ollama generation failed");
      }

      const data = (await response.json()) as { response: string };
      if (!data.response) {
        throw new Error("Ollama returned empty response");
      }

      const parsed = JSON.parse(data.response);
      return generatedToolEntrySchema.parse(parsed);
    };

    const generateWithGemini = async (text: string, retries = 3) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const result = await fastify.gemini.models.generateContent({
            config: {
              responseJsonSchema: addToolBodySchema.toJSONSchema(),
              responseMimeType: "application/json",
              systemInstruction: SYSTEM_PROMPT,
            },
            contents: text,
            model: fastify.env.AI_GENERATION_MODEL,
          });

          const raw = result.text;
          if (!raw) throw new Error("Gemini returned empty response");

          const parsed = JSON.parse(raw);
          return generatedToolEntrySchema.parse(parsed);
        } catch (error) {
          const isRetryable =
            error instanceof Error &&
            (error.message.includes("503") || error.message.includes("429"));

          if (isRetryable && attempt < retries) {
            const delay = attempt * 2000;
            fastify.log.warn(
              { attempt, delay },
              "Gemini unavailable, retrying",
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          throw error;
        }
      }

      throw new Error("Gemini failed after all retries");
    };

    const generateTool = async (text: string) => {
      if (!text.trim()) {
        throw new Error("Cannot generate tool entry from empty content");
      }

      return useGemini ? generateWithGemini(text) : generateWithOllama(text);
    };

    fastify.decorate("generateTool", generateTool);
  },
  { dependencies: ["gemini"], name: "generate-tool" },
);
