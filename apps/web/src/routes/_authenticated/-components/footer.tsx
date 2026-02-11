import AppLink from "@/components/app-link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex items-center justify-center border-t p-4 sm:px-8 md:px-16">
      <div className="flex flex-wrap items-center justify-center gap-1">
        <p className="text-xs text-muted-foreground">
          &copy; 2026 - {currentYear} Grepedia. All rights reserved
        </p>
        <span className="text-xs text-muted-foreground">•</span>
        <AppLink className="text-xs" to="/terms-of-service">
          Terms of Service
        </AppLink>
        <span className="text-xs text-muted-foreground">•</span>
        <AppLink className="text-xs" to="/privacy-policy">
          Privacy Policy
        </AppLink>
      </div>
    </footer>
  );
}
