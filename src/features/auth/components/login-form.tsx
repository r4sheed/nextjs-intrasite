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
import { type ErrorResponse, type SuccessResponse } from '@/lib/result';
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

import { login, type LoginData } from '@/features/auth/actions';
import { AuthFooter } from '@/features/auth/components/auth-footer';
import { SocialProviders } from '@/features/auth/components/social-providers';
import { AUTH_ERROR_MESSAGES, AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const searchParams = useSearchParams();

  const urlError =
    searchParams.get('error') === 'OAuthAccountNotLinked'
      ? AUTH_ERROR_MESSAGES.OAUTH_ACCOUNT_NOT_LINKED
      : '';

  const router = useRouter();

  const mutation = useMutation<SuccessResponse<LoginData>, ErrorResponse, LoginInput>({
    mutationFn: data => execute(login, data) as Promise<SuccessResponse<LoginData>>,
    onSuccess: () => {
      router.push(DEFAULT_LOGIN_REDIRECT);
    },
  });

  const successMessage = mutation.data?.message?.key;
  const errorMessage = mutation.error?.message?.key || urlError;

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginInput) => {
    if (mutation.isPending) return;
    mutation.mutate(values);
  };
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
                <h1 className="text-2xl font-bold">{AUTH_UI_MESSAGES.LOGIN_TITLE}</h1>
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
                      disabled={mutation.isPending}
                      required
                    />
                    <FieldDescription>
                      {AUTH_UI_MESSAGES.EMAIL_DESCRIPTION}
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                      placeholder={AUTH_UI_MESSAGES.PLACEHOLDER_PASSWORD}
                      disabled={mutation.isPending}
                      required
                    />
                    <FieldDescription>
                      {AUTH_UI_MESSAGES.PASSWORD_DESCRIPTION}
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Field>
                {mutation.isError && <FieldError>{errorMessage}</FieldError>}
                {mutation.isSuccess && (
                  <FieldDescription className="text-emerald-600">
                    {successMessage}
                  </FieldDescription>
                )}
                <LoadingButton type="submit" loading={mutation.isPending}>
                  {AUTH_UI_MESSAGES.LOGIN_BUTTON}
                </LoadingButton>
              </Field>
              {siteFeatures.socialAuth && (
                <>
                  <FieldSeparator>{AUTH_UI_MESSAGES.OR_CONTINUE_WITH}</FieldSeparator>
                  <Field className="grid grid-cols-2 gap-4">
                    <SocialProviders />
                  </Field>
                </>
              )}
              <FieldDescription className="text-center">
                {AUTH_UI_MESSAGES.SIGNUP_CTA_TEXT}{' '}
                <Link href={ROUTES.AUTH.REGISTER}>
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
}
