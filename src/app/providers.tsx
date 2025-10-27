'use client';

import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { ActiveThemeProvider } from '@/components/active-theme';
import { ThemeProvider } from '@/components/theme-provider';
import { LayoutProvider } from '@/hooks/use-layout';

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <SessionProvider session={session}>
        <ThemeProvider>
          <ActiveThemeProvider initialTheme="default">
            <LayoutProvider>{children}</LayoutProvider>
          </ActiveThemeProvider>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
