'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { routes } from '@/lib/navigation';

export function ErrorCard() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account.';
      default:
        return 'Something went wrong during authentication.';
    }
  };

  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Oops! - Authentication Error</EmptyTitle>
        <EmptyDescription>{getErrorMessage(error)}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          Need help? <Link href={routes.auth.login.url}>Try signing in again</Link>{' '}
          or <Link href="#">Contact support</Link>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}


