'use client';

import { signIn } from 'next-auth/react';

import { SocialIcons } from '@/components/icons/social-icons';
import { Button } from '@/components/ui/button';
import { AuthProvider } from '@/features/auth/types/auth-provider';
import { siteFeatures } from '@/lib/config';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/routes';

export const SocialLogin = () => {
  if (!siteFeatures.socialAuth) {
    return null;
  }

  const onClick = (provider: AuthProvider) => {
    signIn(provider, {
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  };

  return (
    <>
      <Button
        type="button"
        size="lg"
        variant="outline"
        onClick={() => onClick(AuthProvider.Google)}
      >
        <SocialIcons.google className="size-5" />
      </Button>
      <Button
        type="button"
        size="lg"
        variant="outline"
        onClick={() => onClick(AuthProvider.GitHub)}
      >
        <SocialIcons.github className="size-5" />
      </Button>
    </>
  );
};
