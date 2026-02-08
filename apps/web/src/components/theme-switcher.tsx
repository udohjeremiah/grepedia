import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { CheckIcon, LaptopIcon, MoonIcon, SunIcon } from "lucide-react";

import { useTheme } from "@/providers/theme-provider";

export default function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost">
          <SunIcon className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <SunIcon /> Light
          {theme === "light" && (
            <div className="ms-auto text-muted-foreground">
              <CheckIcon />
            </div>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <MoonIcon /> Dark
          {theme === "dark" && (
            <div className="ms-auto text-muted-foreground">
              <CheckIcon />
            </div>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <LaptopIcon /> System
          {theme === "system" && (
            <div className="ms-auto text-muted-foreground">
              <CheckIcon />
            </div>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
