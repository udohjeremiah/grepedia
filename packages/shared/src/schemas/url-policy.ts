import { z } from "zod";

const FREE_HOSTING_DOMAIN_SUFFIXES = [
  ".deno.dev",
  ".firebaseapp.com",
  ".fly.dev",
  ".github.io",
  ".glitch.me",
  ".herokuapp.com",
  ".netlify.app",
  ".onrender.com",
  ".pages.dev",
  ".railway.app",
  ".repl.co",
  ".replit.app",
  ".surge.sh",
  ".up.railway.app",
  ".vercel.app",
  ".web.app",
  ".workers.dev",
] as const;

const REGISTRY_PACKAGE_PATH_PATTERNS: { host: string; pattern: RegExp }[] = [
  { host: "anaconda.org", pattern: /^\/[^/]+\/[^/]+/ },
  { host: "central.sonatype.com", pattern: /^\/artifact\// },
  { host: "crates.io", pattern: /^\/crates\// },
  { host: "npmjs.com", pattern: /^\/package\// },
  { host: "nuget.org", pattern: /^\/packages\// },
  { host: "packagist.org", pattern: /^\/packages\// },
  { host: "pkg.go.dev", pattern: /^\/[^/]/ },
  { host: "pub.dev", pattern: /^\/packages\// },
  { host: "pypi.org", pattern: /^\/project\// },
  { host: "repo1.maven.org", pattern: /^\/maven2\// },
  { host: "rubygems.org", pattern: /^\/gems\// },
];

const parseHostname = (value: string) => {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  } catch {
    return;
  }
};

const usesFreeHostingDomain = (hostname: string) =>
  FREE_HOSTING_DOMAIN_SUFFIXES.some(
    (suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix),
  );

export const publicUrlSchema = z
  .url("Please provide a valid URL.")
  .superRefine((value, context) => {
    const hostname = parseHostname(value);
    if (!hostname) return;

    if (usesFreeHostingDomain(hostname)) {
      context.addIssue({
        code: "custom",
        message:
          "To ensure only established tools are added, please link to the product's public production website rather than a free hosting domain.",
      });
    }
  });

const isRegistryPackageUrl = (value: string) => {
  try {
    const url = new URL(value);
    const hostname = parseHostname(value);
    if (!hostname) return false;

    return REGISTRY_PACKAGE_PATH_PATTERNS.some(
      ({ host, pattern }) =>
        (hostname === host || hostname.endsWith(`.${host}`)) &&
        pattern.test(url.pathname),
    );
  } catch {
    return false;
  }
};

export const officialUrlSchema = publicUrlSchema.superRefine(
  (value, context) => {
    if (isRegistryPackageUrl(value)) {
      context.addIssue({
        code: "custom",
        message:
          "Package registry links are not allowed as official URLs. Please use the product's primary website.",
      });
    }
  },
);
