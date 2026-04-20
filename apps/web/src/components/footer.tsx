import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";

import AppLink from "@/components/app-link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t p-4 sm:px-8 md:px-16">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 max-md:flex-col">
        <p className="text-xs text-muted-foreground">
          &copy; {currentYear} Grepedia. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <AppLink className="text-xs" to="/terms-of-service">
            Terms of Service
          </AppLink>
          <Separator orientation="vertical" />
          <AppLink className="text-xs" to="/privacy-policy">
            Privacy Policy
          </AppLink>
        </div>
        <Button asChild className="size-fit p-0" size="xs" variant="link">
          <a href="https://www.netlify.com" rel="noreferrer" target="_blank">
            This site is powered by Netlify
          </a>
        </Button>
      </div>
    </footer>
  );
}
