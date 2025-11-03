'use client';

import { useState } from 'react';

import { signIn } from 'next-auth/react';

import { siteFeatures } from '@/lib/config';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/routes';

import { SocialIcons } from '@/components/icons/social-icons';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import { AuthProvider } from '@/features/auth/types/auth-provider';

interface SocialProvidersProps {
  disabled: boolean;
}

export const SocialProviders = ({ disabled }: SocialProvidersProps) => {
  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(
    null
  );

  if (!siteFeatures.socialAuth) {
    return null;
  }

  const onClick = async (provider: AuthProvider) => {
    if (disabled || loadingProvider) return;
    setLoadingProvider(provider);
    await signIn(provider, {
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  };

  const Google = SocialIcons.google;
  const Github = SocialIcons.github;

  return (
    <>
      <Button
        type="button"
        size="lg"
        variant="outline"
        disabled={disabled || loadingProvider !== null}
        onClick={() => onClick(AuthProvider.Google)}
      >
        {loadingProvider === AuthProvider.Google ? (
          <Spinner className="size-5" />
        ) : (
          <Google className="size-5" />
        )}
      </Button>
      <Button
        type="button"
        size="lg"
        variant="outline"
        disabled={disabled || loadingProvider !== null}
        onClick={() => onClick(AuthProvider.GitHub)}
      >
        {loadingProvider === AuthProvider.GitHub ? (
          <Spinner className="size-5" />
        ) : (
          <Github className="size-5" />
        )}
      </Button>
    </>
  );
};
