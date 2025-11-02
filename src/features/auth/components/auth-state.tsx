import type { ReactNode } from 'react';

import Link from 'next/link';

import { AlertCircleIcon, CircleCheck, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { AUTH_LABELS } from '@/features/auth/lib/strings';
import { ROUTES } from '@/lib/navigation';
import { cn } from '@/lib/utils';

type AuthStateVariant = 'primary' | 'destructive';

interface AuthStateProps {
  title?: string;
  message: string;
  variant?: AuthStateVariant;
  className?: string;
  children?: ReactNode;
}

const variantConfig = {
  primary: {
    icon: Info,
    className: 'text-primary',
  },
  destructive: {
    icon: AlertCircleIcon,
    className: 'text-destructive',
  },
};

const AuthState = ({
  title,
  message,
  variant = 'primary',
  className,
  children,
}: AuthStateProps) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia>
          <Icon className={cn('size-10', config.className)} />
        </EmptyMedia>
        {title && <EmptyTitle className={config.className}>{title}</EmptyTitle>}
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col gap-4">
          {children && <EmptyContent>{children}</EmptyContent>}
          <Link href={ROUTES.AUTH.LOGIN}>
            <Button variant="outline" size="sm">
              {AUTH_LABELS.backToLoginButton}
            </Button>{' '}
          </Link>
        </div>
      </EmptyContent>
    </Empty>
  );
};

export { AuthState };


