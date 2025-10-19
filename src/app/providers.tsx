'use client';

import { SessionProvider } from 'next-auth/react';

import { ActiveThemeProvider } from '@/components/active-theme';
import { ThemeProvider } from '@/components/theme-provider';
import { LayoutProvider } from '@/hooks/use-layout';

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
