import { CheerioCrawler, Configuration } from "crawlee";
import fp from "fastify-plugin";
import TurndownService from "turndown";

declare module "fastify" {
  interface FastifyInstance {
    crawlUrl(url: string): Promise<string>;
  }
}

/**
 * This plugin crawls a URL and returns a single LLM-ready markdown string.
 *
 * @see {@link https://crawlee.dev}
 */
export default fp(
  async (fastify) => {
    const crawlUrl = async (url: string): Promise<string> => {
      const pages: string[] = [];

      const turndownService = new TurndownService();

      const crawler = new CheerioCrawler(
        {
          failedRequestHandler({ log, request }) {
            log.error(`Failed to crawl: ${request.loadedUrl}`);
          },
          maxRequestsPerCrawl: fastify.env.CRAWLEE_MAX_PAGES,
          async requestHandler({ $, enqueueLinks, request }) {
            const nonContentElements = ["noscript", "script", "style", "svg"];
            $(nonContentElements.join(",")).remove();

            const title =
              $("title").text()?.trim() ||
              $('meta[property="og:title"]').attr("content") ||
              "No page title";

            const description =
              $('meta[name="description"]').attr("content") ??
              $('meta[property="og:description"]').attr("content") ??
              "No page description";

            const bodyHtml = $("body").html() ?? "";

            const markdown = turndownService.turndown(bodyHtml);
            const cleaned = markdown
              .replaceAll("\r\n", "\n")
              .split("\n")
              .map((line) => line.trimEnd())
              .join("\n");

            const pageText = [
              `URL: ${request.loadedUrl}`,
              `TITLE: ${title}`,
              `DESCRIPTION: ${description}`,
              `---`,
              cleaned,
            ].join("\n");

            pages.push(pageText);

            await enqueueLinks({ strategy: "same-domain" });
          },
        },
        new Configuration({ persistStorage: false }),
      );

      await crawler.run([url]);

      if (pages.length === 0) {
        throw new Error(`No content extracted from ${url}`);
      }

      return pages.join("\n\n---\n\n");
    };

    fastify.decorate("crawlUrl", crawlUrl);
  },
  { name: "crawl-url" },
);
