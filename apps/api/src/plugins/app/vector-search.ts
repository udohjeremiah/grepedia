import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    generateEmbeddings(contents: string[]): Promise<number[]>;
  }
}

/**
 * This plugin provides utilities for generating
 * vector embeddings for semantic search.
 *
 * - Development: Ollama with nomic-embed-text (via Docker)
 * - Production: Gemini embedding-001 API
 *
 * @see https://www.mongodb.com/docs/atlas/atlas-vector-search
 * @see https://ollama.com/library/nomic-embed-text
 */
export default fp(
  async (fastify) => {
    const isProduction = fastify.env.NODE_ENV === "production";

    const generateWithOllama = async (text: string) => {
      const response = await fetch(`${fastify.env.OLLAMA_URL}/api/embeddings`, {
        body: JSON.stringify({ model: "nomic-embed-text", prompt: text }),
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
        config: {
          outputDimensionality: 768,
          taskType: "SEMANTIC_SIMILARITY",
        },
        contents: text,
        model: "gemini-embedding-001",
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

      return isProduction
        ? generateWithGemini(combined)
        : generateWithOllama(combined);
    };

    fastify.decorate("generateEmbeddings", generateEmbeddings);
  },
  { dependencies: ["gemini"], name: "vector-search" },
);
