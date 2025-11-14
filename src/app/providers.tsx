'use client';

import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';

import { LayoutProvider } from '@/hooks/use-layout';

import { ActiveThemeProvider } from '@/components/active-theme';
import { ThemeProvider } from '@/components/theme-provider';

import type { AbstractIntlMessages } from 'next-intl';

export function Providers({
  children,
  session,
  locale,
  messages,
}: {
  children: React.ReactNode;
  session: Session | null;
  locale: string;
  messages: AbstractIntlMessages;
}) {
  const [client] = useState(() => new QueryClient());

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryClientProvider client={client}>
        <SessionProvider session={session}>
          <ThemeProvider>
            <ActiveThemeProvider>
              <LayoutProvider>{children}</LayoutProvider>
            </ActiveThemeProvider>
          </ThemeProvider>
        </SessionProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}
