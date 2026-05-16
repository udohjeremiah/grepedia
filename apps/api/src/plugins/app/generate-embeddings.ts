import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    generateEmbeddings(contents: string[]): Promise<number[]>;
  }
}

/**
 * This plugin generates vector embeddings for use in semantic search.
 *
 * @see {@link https://ai.google.dev/gemini-api}
 * @see {@link https://ollama.com}
 */
export default fp(
  async (fastify) => {
    const useGemini =
      fastify.env.NODE_ENV === "production" ||
      fastify.env.AI_PROVIDER === "gemini";

    const generateWithOllama = async (text: string) => {
      const response = await fetch(`${fastify.env.OLLAMA_URL}/api/embeddings`, {
        body: JSON.stringify({
          model: fastify.env.AI_EMBEDDING_MODEL,
          prompt: text,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Ollama embeddings failed");
      }

      const data = (await response.json()) as { embedding: number[] };

      if (!data.embedding || data.embedding.length === 0) {
        throw new Error("Ollama returned empty embeddings");
      }

      return data.embedding;
    };

    const generateWithGemini = async (text: string) => {
      const result = await fastify.gemini.models.embedContent({
        config: { outputDimensionality: 768, taskType: "SEMANTIC_SIMILARITY" },
        contents: text,
        model: fastify.env.AI_EMBEDDING_MODEL,
      });

      const embedding = result.embeddings?.[0]?.values;
      if (!embedding || embedding.length === 0) {
        throw new Error("Gemini returned empty embeddings");
      }

      return embedding;
    };

    const generateEmbeddings = async (contents: string[]) => {
      const combined = contents.filter(Boolean).join("\n");
      if (!combined.trim()) {
        throw new Error("Cannot generate embeddings from empty content");
      }

      return useGemini
        ? generateWithGemini(combined)
        : generateWithOllama(combined);
    };

    fastify.decorate("generateEmbeddings", generateEmbeddings);
  },
  { dependencies: ["gemini"], name: "generate-embeddings" },
);
