'use client';

import * as React from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { AUTH_LABELS } from '../lib/strings';

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const t = useTranslations('auth');
    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent dark:hover:bg-transparent"
          onClick={() => setShowPassword(prev => !prev)}
          disabled={props.disabled}
          aria-label={
            showPassword
              ? t(AUTH_LABELS.hidePassword)
              : t(AUTH_LABELS.showPassword)
          }
        >
          {showPassword ? (
            <EyeOff className="text-muted-foreground size-4" />
          ) : (
            <Eye className="text-muted-foreground size-4" />
          )}
        </Button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
