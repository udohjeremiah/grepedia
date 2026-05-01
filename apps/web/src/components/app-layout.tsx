import type { ComponentProps, ReactNode } from "react";

import { Footer } from "./footer";
import { Header } from "./header";

interface AppLayoutProps {
  children: ReactNode;
  header?: ComponentProps<typeof Header>;
}

export function AppLayout({ children, header }: AppLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header {...header} />
      {children}
      <Footer />
    </div>
  );
}
