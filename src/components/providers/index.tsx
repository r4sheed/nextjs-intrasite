"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";

import { LayoutProvider } from "@/hooks/use-layout";
import { ActiveThemeProvider } from "./active-theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ActiveThemeProvider initialTheme="default">
          <LayoutProvider>{children}</LayoutProvider>
        </ActiveThemeProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
