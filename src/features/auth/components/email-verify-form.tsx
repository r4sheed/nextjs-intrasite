'use client';

import { useCallback, useEffect } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Header } from '@/features/auth/components/header';
import { useAuthAction } from '@/features/auth/hooks/use-auth-action';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { ROUTES } from '@/lib/navigation';

export const EmailVerifyForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { execute, message, isPending } = useAuthAction();

  const onSubmit = useCallback(() => {
    console.log(token);
  }, [token]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="p-6 md:p-8">
      <FieldGroup>
        <Header
          title={AUTH_UI_MESSAGES.EMAIL_VERIFICATION_TITLE}
          description={AUTH_UI_MESSAGES.EMAIL_VERIFICATION_SUBTITLE}
        />
        <div className="flex w-full items-center justify-center p-6 md:p-8">
          <Spinner className="size-12"></Spinner>
        </div>
        <Button>
          <Link href={ROUTES.AUTH.LOGIN}>Back to login</Link>
        </Button>
      </FieldGroup>
    </div>
  );
};
