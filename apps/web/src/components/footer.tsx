import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";

import { AppLink } from "@/components/app-link";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t p-4 sm:px-8 md:px-16">
      <div className="flex items-center justify-between gap-2 max-md:flex-col">
        <p className="text-xs text-muted-foreground">
          &copy; {currentYear} Grepedia. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <AppLink to="/terms-of-service">Terms of Service</AppLink>
          <Separator orientation="vertical" />
          <AppLink to="/privacy-policy">Privacy Policy</AppLink>
        </div>
        <Button asChild className="size-fit p-0" variant="link">
          <a href="https://www.netlify.com" rel="noreferrer" target="_blank">
            This site is powered by Netlify
          </a>
        </Button>
      </div>
    </footer>
  );
}
