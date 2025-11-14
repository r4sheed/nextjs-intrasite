'use client';

import { useState } from 'react';

import { signIn } from 'next-auth/react';

import { siteFeatures } from '@/lib/config';
import { middlewareConfig } from '@/lib/config';

import { SocialIcons } from '@/components/social-icons';
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
      redirectTo: middlewareConfig.defaultLoginRedirect,
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
        title="Sign in with Google"
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
        title="Sign in with GitHub"
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
