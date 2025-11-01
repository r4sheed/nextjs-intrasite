'use client';

import type React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

import { siteFeatures } from '@/lib/config';
import { ROUTES } from '@/lib/navigation';
import { type ActionSuccess, type ErrorResponse } from '@/lib/response';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/routes';
import { cn } from '@/lib/utils';

import { execute } from '@/hooks/use-action';

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

import { LoadingButton } from '@/components/loading-button';
import { FormError, FormSuccess } from '@/components/shared/form-status';

import { AuthFooter } from '@/features/auth/components/auth-footer';
import { PasswordInput } from '@/features/auth/components/password-input';
import { SocialProviders } from '@/features/auth/components/social-providers';

import { login } from '@/features/auth/actions';
import { AUTH_ERROR_CODES } from '@/features/auth/lib/codes';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_UI_MESSAGES,
} from '@/features/auth/lib/messages';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';

const useLoginForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlError =
    searchParams.get('error') === 'OAuthAccountNotLinked'
      ? AUTH_ERROR_MESSAGES.OAUTH_ACCOUNT_NOT_LINKED
      : '';

  const isVerifySuccess = searchParams.get('verified') === '1';
  const verifySuccessMessage = isVerifySuccess
    ? AUTH_UI_MESSAGES.EMAIL_VERIFIED
    : undefined;

  const verifyError = searchParams.get('verify_error');
  const verifyErrorMessage = (() => {
    if (!verifyError) return '';

    switch (verifyError) {
      case AUTH_ERROR_CODES.AUTH_TOKEN_NOT_FOUND:
        return AUTH_ERROR_MESSAGES.TOKEN_NOT_FOUND;
      case AUTH_ERROR_CODES.AUTH_TOKEN_EXPIRED:
        return AUTH_ERROR_MESSAGES.TOKEN_EXPIRED;
      default:
        if (verifyError.startsWith('AUTH_')) {
          return AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR;
        }
        return '';
    }
  })();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = useMutation<
    ActionSuccess<typeof login>,
    ErrorResponse,
    LoginInput
  >({
    mutationFn: data => execute(login, data),
    onSuccess: () => {
      router.push(DEFAULT_LOGIN_REDIRECT);
    },
  });

  const successMessage = mutation.data?.message?.key || verifySuccessMessage;
  const errorMessage =
    mutation.error?.message?.key || urlError || verifyErrorMessage;

  const onSubmit = (values: LoginInput) => {
    if (mutation.isPending) return;
    mutation.mutate(values);
  };

  return {
    form,
    onSubmit,
    mutation,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess || isVerifySuccess,
    isError: mutation.isError || !!urlError || verifyError,
    successMessage,
    errorMessage,
  };
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
                <h1 className="text-2xl font-bold">
                  {AUTH_UI_MESSAGES.LOGIN_TITLE}
                </h1>
                <p className="text-muted-foreground text-balance">
                  {AUTH_UI_MESSAGES.LOGIN_SUBTITLE}
                </p>
              </div>

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {AUTH_UI_MESSAGES.EMAIL_LABEL}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      placeholder={AUTH_UI_MESSAGES.PLACEHOLDER_EMAIL}
                      disabled={isPending}
                      required
                    />
                    <FieldDescription>
                      {AUTH_UI_MESSAGES.EMAIL_DESCRIPTION}
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
                      <FieldLabel htmlFor="password">
                        {AUTH_UI_MESSAGES.PASSWORD_LABEL}
                      </FieldLabel>
                      <Link
                        href={ROUTES.AUTH.FORGOT_PASSWORD}
                        className="text-foreground ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        {AUTH_UI_MESSAGES.FORGOT_PASSWORD}
                      </Link>
                    </div>
                    <PasswordInput
                      {...field}
                      id={field.name}
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                      placeholder={AUTH_UI_MESSAGES.PLACEHOLDER_PASSWORD}
                      disabled={isPending}
                      required
                    />
                    <FieldDescription>
                      {AUTH_UI_MESSAGES.PASSWORD_DESCRIPTION}
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
                  {AUTH_UI_MESSAGES.LOGIN_BUTTON}
                </LoadingButton>
              </Field>

              {siteFeatures.socialAuth && (
                <>
                  <FieldSeparator>
                    {AUTH_UI_MESSAGES.OR_CONTINUE_WITH}
                  </FieldSeparator>
                  <Field className="grid grid-cols-2 gap-4">
                    <SocialProviders />
                  </Field>
                </>
              )}

              <FieldDescription className="text-center">
                {AUTH_UI_MESSAGES.SIGNUP_CTA_TEXT}{' '}
                <Link href={ROUTES.AUTH.SIGN_UP}>
                  {AUTH_UI_MESSAGES.SIGNUP_CTA_LINK}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="bg-muted relative hidden md:block">
            <Image
              src="/assets/svg/tablet-login-pana.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-contain dark:brightness-[0.2] dark:grayscale"
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
