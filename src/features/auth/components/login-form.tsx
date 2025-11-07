'use client';

import { useState, startTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { siteFeatures } from '@/lib/config';
import { middlewareConfig } from '@/lib/config';
import { routes } from '@/lib/navigation';
import { Status, type ActionSuccess, type ErrorResponse } from '@/lib/response';
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
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { loginUser } from '@/features/auth/actions';
import { AuthFooter } from '@/features/auth/components/auth-footer';
import { PasswordInput } from '@/features/auth/components/password-input';
import { SocialProviders } from '@/features/auth/components/social-providers';
import {
  AUTH_CODES,
  AUTH_ERRORS,
  AUTH_LABELS,
} from '@/features/auth/lib/strings';
import {
  type LoginFormInput,
  loginSchema,
} from '@/features/auth/schemas/login';

import type React from 'react';

/**
 * Hook for extracting URL parameters related to login state
 * @returns Object with URL-based error and success messages
 */
const useUrlParams = () => {
  const searchParams = useSearchParams();

  const urlError =
    searchParams.get('error') === 'OAuthAccountNotLinked'
      ? AUTH_ERRORS.oauthNotLinked
      : '';

  const isVerifySuccess = searchParams.get('verified') === '1';
  const verifySuccessMessage = isVerifySuccess
    ? AUTH_LABELS.verificationSuccessSubtitle
    : undefined;

  const verifyError = searchParams.get('verify_error');
  const verifyErrorMessage = (() => {
    if (!verifyError) return '';

    switch (verifyError) {
      case AUTH_CODES.tokenInvalid:
        return AUTH_ERRORS.tokenInvalid;
      case AUTH_CODES.tokenExpired:
        return AUTH_ERRORS.tokenExpired;
      default:
        return '';
    }
  })();

  return {
    urlError,
    verifySuccessMessage,
    verifyErrorMessage,
    isVerifySuccess,
  };
};

/**
 * Hook for login mutation with redirect logic
 * @returns Object with mutation and redirecting state
 */
const useLoginMutation = () => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const mutation = useMutation<
    ActionSuccess<typeof loginUser>,
    ErrorResponse,
    LoginFormInput
  >({
    mutationFn: data => execute(loginUser, data),
    onSuccess: response => {
      // Server indicated partial success (e.g., 2FA required)
      if (response.status === Status.Partial) return;

      setIsRedirecting(true);

      // Check for redirect requirement (2FA verification)
      if (response.data?.redirectUrl) {
        console.log('redirecting', response.data.redirectUrl);
        router.push(response.data.redirectUrl);
        return;
      }

      startTransition(() => {
        // Refresh server components to update session in SessionProvider
        router.refresh();
      });

      // Normal login success - redirect to dashboard
      router.push(middlewareConfig.defaultLoginRedirect);
    },
    onError: () => {
      // Error is handled by the form state
    },
  });

  return { mutation, isRedirecting };
};

/**
 * Hook for computing form state and messages
 * @param mutation - Login mutation instance
 * @param urlParams - URL parameters from useUrlParams
 * @param isRedirecting - Whether redirect is in progress
 * @returns Computed state object with loading states and messages
 */
const useFormState = (
  mutation: ReturnType<typeof useLoginMutation>['mutation'],
  urlParams: ReturnType<typeof useUrlParams>,
  isRedirecting: boolean
) => {
  const {
    urlError,
    verifySuccessMessage,
    verifyErrorMessage,
    isVerifySuccess,
  } = urlParams;

  const isPending = mutation.isPending || isRedirecting;
  const isSuccess = mutation.isSuccess || isVerifySuccess;
  const isError = mutation.isError || !!urlError || !!verifyErrorMessage;

  const successMessage = mutation.data?.message?.key || verifySuccessMessage;
  const errorMessage =
    mutation.error?.message?.key || urlError || verifyErrorMessage;

  return { isPending, isSuccess, isError, successMessage, errorMessage };
};

/**
 * Main hook for login form logic
 */
const useLoginForm = () => {
  const urlParams = useUrlParams();
  const { mutation, isRedirecting } = useLoginMutation();
  const formState = useFormState(mutation, urlParams, isRedirecting);

  const form = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginFormInput) => {
    if (formState.isPending) {
      return;
    }
    mutation.mutate(values);
  };

  return { form, onSubmit, mutation, ...formState };
};

const LoginForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const {
    form,
    onSubmit,
    isPending,
    isSuccess,
    isError,
    successMessage,
    errorMessage,
  } = useLoginForm();

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            id="form-rhf-login"
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 md:p-8"
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{AUTH_LABELS.loginTitle}</h1>
                <p className="text-muted-foreground text-balance">
                  {AUTH_LABELS.loginSubtitle}
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
                      {AUTH_LABELS.emailDescription}
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center">
                      <FieldLabel htmlFor={field.name}>
                        {AUTH_LABELS.passwordLabel}
                      </FieldLabel>
                      <Link
                        href={routes.auth.forgotPassword.url}
                        className="text-foreground ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        {AUTH_LABELS.forgotPasswordLink}
                      </Link>
                    </div>
                    <PasswordInput
                      {...field}
                      id={field.name}
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                      placeholder={AUTH_LABELS.passwordPlaceholder}
                      disabled={isPending}
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
                  disabled={isSuccess}
                >
                  {AUTH_LABELS.loginButton}
                </LoadingButton>
              </Field>

              {siteFeatures.socialAuth && (
                <>
                  <FieldSeparator>{AUTH_LABELS.orContinueWith}</FieldSeparator>
                  <Field className="grid grid-cols-2 gap-4">
                    <SocialProviders disabled={isPending} />
                  </Field>
                </>
              )}

              <FieldDescription className="text-center">
                {AUTH_LABELS.signupCtaText}{' '}
                <Link href={routes.auth.signUp.url}>
                  {AUTH_LABELS.signupCtaLink}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="bg-muted relative hidden md:block">
            <Image
              src="/assets/svg/tablet-login-pana.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-contain dark:brightness-[0.2] dark:grayscale"
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

export { LoginForm };
