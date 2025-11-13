'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

import Image from 'next/image';
import Link from 'next/link';

import { routes } from '@/lib/navigation';
import { type ActionSuccess, type ErrorResponse } from '@/lib/response';
import { cn } from '@/lib/utils';

import { execute } from '@/hooks/use-action';

import { FormError, FormSuccess } from '@/components/form-status';
import { LoadingButton } from '@/components/loading-button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { resetPassword } from '@/features/auth/actions';
import { AuthFooter } from '@/features/auth/components/auth-footer';
import { AUTH_LABELS } from '@/features/auth/lib/strings';
import { type ResetInput, resetSchema } from '@/features/auth/schemas';

import type React from 'react';

/**
 * Hook for forgot password form logic
 * @returns Form instance, submit handler, and computed state
 */
const useForgotPasswordForm = () => {
  // Form setup with validation
  const form = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
    },
  });

  // Mutation for password reset
  const mutation = useMutation<
    ActionSuccess<ReturnType<typeof resetPassword>>,
    ErrorResponse,
    ResetInput
  >({
    mutationFn: data => execute(resetPassword, data),
  });

  // Computed state
  const successMessage = mutation.data?.message?.key;
  const errorMessage = mutation.error?.message?.key;

  // Submit handler with pending check
  const onSubmit = (values: ResetInput) => {
    if (mutation.isPending) return;
    mutation.mutate(values);
  };

  return {
    form,
    onSubmit,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    successMessage,
    errorMessage,
  };
};

const ForgotPasswordForm = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => {
  const {
    form,
    onSubmit,
    isPending,
    isSuccess,
    isError,
    successMessage,
    errorMessage,
  } = useForgotPasswordForm();

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            id="form-rhf-forgot-password"
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 md:p-8"
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                  {AUTH_LABELS.forgotPasswordTitle}
                </h1>
                <p className="text-muted-foreground text-balance">
                  {AUTH_LABELS.forgotPasswordSubtitle}
                </p>
              </div>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {AUTH_LABELS.emailLabel}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      placeholder={AUTH_LABELS.emailPlaceholder}
                      disabled={isPending}
                      required
                    />
                    <FieldDescription>
                      {AUTH_LABELS.emailResetDescription}
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                {isSuccess && <FormSuccess message={successMessage} />}
                {isError && <FormError message={errorMessage} />}
                <LoadingButton type="submit" loading={isPending}>
                  {AUTH_LABELS.forgotPasswordButton}
                </LoadingButton>
              </Field>
              <FieldDescription className="text-center">
                {AUTH_LABELS.rememberPasswordCta}{' '}
                <Link href={routes.auth.login.url}>
                  {AUTH_LABELS.backToLoginButton}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/assets/svg/forgot-password-amico.svg"
              alt="Security"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              priority
              fill
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        <AuthFooter />
      </FieldDescription>
    </div>
  );
};

export { ForgotPasswordForm };
