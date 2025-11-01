'use client';

import type React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

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
import { type ResetData, reset } from '@/features/auth/actions';
import { AuthFooter } from '@/features/auth/components/auth-footer';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { type ResetInput, resetSchema } from '@/features/auth/schemas';
import { execute } from '@/hooks/use-action';
import { ROUTES } from '@/lib/navigation';
import { type ErrorResponse, type SuccessResponse } from '@/lib/result';
import { cn } from '@/lib/utils';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const mutation = useMutation<
    SuccessResponse<ResetData>,
    ErrorResponse,
    ResetInput
  >({
    mutationFn: data =>
      execute(reset, data) as Promise<SuccessResponse<ResetData>>,
  });

  const form = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: ResetInput) => {
    if (mutation.isPending) return;
    mutation.mutate(values);
  };

  const successMessage = mutation.data?.message?.key;
  const errorMessage = mutation.error?.message?.key;

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            id="form-rhf-reset-password"
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 md:p-8"
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                  {AUTH_UI_MESSAGES.FORGOT_PASSWORD_TITLE}
                </h1>
                <p className="text-muted-foreground text-balance">
                  {AUTH_UI_MESSAGES.FORGOT_PASSWORD_SUBTITLE}
                </p>
              </div>
              <Field>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-rhf-forgot-password-email">
                        {AUTH_UI_MESSAGES.EMAIL_LABEL}
                      </FieldLabel>
                      <Input
                        {...field}
                        id="form-rhf-forgot-password-email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={fieldState.invalid}
                        placeholder={AUTH_UI_MESSAGES.PLACEHOLDER_EMAIL}
                        disabled={mutation.isPending}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                      <FieldDescription>
                        {AUTH_UI_MESSAGES.EMAIL_RESET_DESCRIPTION}
                      </FieldDescription>
                    </Field>
                  )}
                />
              </Field>
              <Field>
                {mutation.isSuccess && (
                  <FieldDescription className="text-emerald-600">
                    {successMessage}
                  </FieldDescription>
                )}

                {mutation.isError && <FieldError>{errorMessage}</FieldError>}

                <LoadingButton type="submit" loading={mutation.isPending}>
                  {AUTH_UI_MESSAGES.FORGOT_PASSWORD_BUTTON}
                </LoadingButton>
              </Field>
              <FieldDescription className="text-center">
                {AUTH_UI_MESSAGES.REMEMBER_PASSWORD_CTA}{' '}
                <Link href={ROUTES.AUTH.LOGIN}>
                  {AUTH_UI_MESSAGES.BACK_TO_LOGIN_BUTTON}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/assets/svg/forgot-password-amico.svg"
              alt="Security"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
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
}
