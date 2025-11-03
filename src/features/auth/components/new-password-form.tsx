'use client';

import type React from 'react';
import { useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

import { routes } from '@/lib/navigation';
import { type ActionSuccess, type ErrorResponse } from '@/lib/response';
import { cn } from '@/lib/utils';

import { execute } from '@/hooks/use-action';

import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';

import { LoadingButton } from '@/components/loading-button';
import { FormError, FormSuccess } from '@/components/shared/form-status';

import { AuthFooter } from '@/features/auth/components/auth-footer';
import { PasswordInput } from '@/features/auth/components/password-input';

import { REDIRECT_TIMEOUT_MS } from '@/features/auth/lib/constants';
import { AUTH_ERRORS, AUTH_LABELS } from '@/features/auth/lib/strings';

import { updatePassword } from '@/features/auth/actions';
import {
  type NewPasswordInput,
  newPasswordSchema,
} from '@/features/auth/schemas';

const useNewPasswordForm = () => {
  const router = useRouter();

  const form = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      token: '',
      password: '',
    },
  });

  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      form.setValue('token', token);
    }
  }, [searchParams, form.setValue, token]);

  const isTokenMissing = !token;

  const mutation = useMutation<
    ActionSuccess<typeof updatePassword>,
    ErrorResponse,
    NewPasswordInput
  >({
    mutationFn: data => execute(updatePassword, data),
    onSuccess: () => {
      const timer = setTimeout(() => {
        router.replace(routes.auth.login.url);
      }, REDIRECT_TIMEOUT_MS);
      return () => clearTimeout(timer);
    },
  });

  const successMessage = mutation.data?.message?.key;
  const errorMessage = isTokenMissing
    ? AUTH_ERRORS.tokenInvalid
    : mutation.error?.message?.key || '';

  const onSubmit = (values: NewPasswordInput) => {
    if (mutation.isPending) return;
    mutation.mutate(values);
  };

  return {
    form,
    onSubmit,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError || isTokenMissing,
    successMessage,
    errorMessage,
  };
};

const NewPasswordForm = ({
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
  } = useNewPasswordForm();

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            id="form-rhf-new-password"
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 md:p-8"
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                  {AUTH_LABELS.newPasswordTitle}
                </h1>
                <p className="text-muted-foreground text-balance">
                  {AUTH_LABELS.newPasswordSubtitle}
                </p>
              </div>

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {AUTH_LABELS.passwordLabel}
                    </FieldLabel>
                    <PasswordInput
                      {...field}
                      id={field.name}
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      placeholder={AUTH_LABELS.passwordPlaceholder}
                      disabled={isPending || isSuccess || isError}
                      required
                    />
                    <FieldDescription>
                      {AUTH_LABELS.passwordDescription}
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
                <LoadingButton
                  type="submit"
                  loading={isPending}
                  disabled={isSuccess || isError}
                >
                  {AUTH_LABELS.newPasswordButton}
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
              src="/assets/svg/forgot-password-pana.svg"
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
};

export { NewPasswordForm };


