'use client';

import type { ReactNode } from 'react';

import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';

type ErrorVariant = 'error' | 'warning' | 'info';

interface ErrorStateProps {
  title?: string;
  message: string;
  variant?: ErrorVariant;
  className?: string;
  border?: boolean;
  children?: ReactNode;
}

const variantConfig = {
  error: {
    icon: AlertCircle,
    iconClassName: 'text-destructive',
    borderClassName: 'border-destructive/50',
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: 'text-yellow-600 dark:text-yellow-500',
    borderClassName: 'border-yellow-500/50',
  },
  info: {
    icon: Info,
    iconClassName: 'text-blue-600 dark:text-blue-500',
    borderClassName: 'border-blue-500/50',
  },
};

export function ErrorState({
  title,
  message,
  variant = 'error',
  className,
  border = true,
  children,
}: ErrorStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Empty
      className={cn(
        border && 'border',
        border && config.borderClassName,
        className
      )}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className={config.iconClassName} />
        </EmptyMedia>
        <EmptyTitle className="text-destructive">{title}</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  );
}
