'use client';

import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { routes } from '@/lib/navigation';
import { type ActionSuccess, type ErrorResponse } from '@/lib/response';
import { translateFieldErrors } from '@/lib/translation';
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

import { updatePassword } from '@/features/auth/actions';
import { AuthFooter } from '@/features/auth/components/auth-footer';
import { PasswordInput } from '@/features/auth/components/password-input';
import { REDIRECT_TIMEOUT_MS } from '@/features/auth/lib/config';
import { AUTH_ERRORS, AUTH_LABELS } from '@/features/auth/lib/strings';
import {
  type NewPasswordInput,
  newPasswordSchema,
} from '@/features/auth/schemas';

import type React from 'react';

/**
 * Hook for extracting and setting token and email from URL parameters
 * @param form - React Hook Form instance
 * @returns Object with token and email values and missing params flags
 */
const useTokenFromUrl = (
  form: ReturnType<typeof useForm<NewPasswordInput>>
) => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Set token and email in form when URL params change
  useEffect(() => {
    if (token) {
      form.setValue('token', token);
    }
    if (email) {
      form.setValue('email', email);
    }
  }, [searchParams, form, token, email]);

  return {
    token,
    email,
    isTokenMissing: !token,
    isEmailMissing: !email,
  };
};

/**
 * Hook for new password mutation with redirect logic
 * @returns TanStack Query mutation for password update
 */
const useNewPasswordMutation = () => {
  const router = useRouter();

  return useMutation<
    ActionSuccess<ReturnType<typeof updatePassword>>,
    ErrorResponse,
    NewPasswordInput
  >({
    mutationFn: data => execute(updatePassword, data),
    onSuccess: () => {
      // Redirect to login after successful password update
      const timer = setTimeout(() => {
        router.replace(routes.auth.login.url);
      }, REDIRECT_TIMEOUT_MS);
      return () => clearTimeout(timer);
    },
  });
};

/**
 * Hook for computing form state and messages
 * @param mutation - Password update mutation
 * @param isTokenMissing - Whether token is missing from URL
 * @param isEmailMissing - Whether email is missing from URL
 * @returns Computed state object with loading states and messages
 */
const useNewPasswordState = (
  mutation: ReturnType<typeof useNewPasswordMutation>,
  isTokenMissing: boolean,
  isEmailMissing: boolean
) => {
  const successMessage = mutation.data?.message?.key;
  const errorMessage =
    isTokenMissing || isEmailMissing
      ? AUTH_ERRORS.tokenInvalid
      : mutation.error?.message?.key || '';

  return {
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError || isTokenMissing || isEmailMissing,
    successMessage,
    errorMessage,
  };
};

/**
 * Main hook for new password form logic
 * Combines token extraction, mutation, and state management
 * @returns Form instance, submit handler, and computed state
 */
const useNewPasswordForm = () => {
  const form = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      token: '',
      password: '',
    },
  });

  const { isTokenMissing, isEmailMissing } = useTokenFromUrl(form);
  const mutation = useNewPasswordMutation();
  const state = useNewPasswordState(mutation, isTokenMissing, isEmailMissing);

  const onSubmit = (values: NewPasswordInput) => {
    if (state.isPending) return;
    mutation.mutate(values);
  };

  return {
    form,
    onSubmit,
    ...state,
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

  const t = useTranslations('auth');

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
                  {t(AUTH_LABELS.newPasswordTitle)}
                </h1>
                <p className="text-muted-foreground text-balance">
                  {t(AUTH_LABELS.newPasswordSubtitle)}
                </p>
              </div>

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t(AUTH_LABELS.password)}
                    </FieldLabel>
                    <PasswordInput
                      {...field}
                      id={field.name}
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      placeholder={t(AUTH_LABELS.passwordPlaceholder)}
                      disabled={isPending || isSuccess || isError}
                      required
                    />
                    <FieldDescription>
                      {t(AUTH_LABELS.passwordDescription)}
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError
                        errors={translateFieldErrors(t, fieldState.error)}
                      />
                    )}
                  </Field>
                )}
              />

              <Field>
                {isSuccess && successMessage && (
                  <FormSuccess message={successMessage} />
                )}
                {isError && errorMessage && (
                  <FormError message={errorMessage} />
                )}

                <LoadingButton
                  type="submit"
                  loading={isPending}
                  disabled={isSuccess || isError}
                >
                  {t(AUTH_LABELS.newPasswordButton)}
                </LoadingButton>
              </Field>

              <FieldDescription className="text-center">
                {t(AUTH_LABELS.rememberPasswordCtaText)}{' '}
                <Link href={routes.auth.login.url}>
                  {t(AUTH_LABELS.backToLoginButton)}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="bg-muted relative hidden md:block">
            <Image
              src="/assets/svg/forgot-password-pana.svg"
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

export { NewPasswordForm };
