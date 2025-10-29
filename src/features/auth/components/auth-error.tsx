import Link from 'next/link';

import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/navigation';

import { AUTH_UI_MESSAGES } from '../lib/messages';

interface AuthErrorProps {
  title?: string;
  message: string;
}

export const AuthErrorState = ({ title, message }: AuthErrorProps) => {
  return (
    <ErrorState variant="error" border={false} title={title} message={message}>
      <Button variant="outline" size="sm" asChild>
        <Link href={ROUTES.AUTH.LOGIN}>
          {AUTH_UI_MESSAGES.BACK_TO_LOGIN_BUTTON}
        </Link>
      </Button>
    </ErrorState>
  );
};
