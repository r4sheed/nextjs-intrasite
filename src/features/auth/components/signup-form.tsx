'use client';

import Image from 'next/image';
import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

import { siteFeatures } from '@/lib/config';
import { ROUTES } from '@/lib/navigation';
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
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { LoadingButton } from '@/components/loading-button';
import { FormError, FormSuccess } from '@/components/shared/form-status';

import { register } from '@/features/auth/actions';
import { type RegisterData } from '@/features/auth/actions';
import { AuthFooter } from '@/features/auth/components/auth-footer';
import { SocialProviders } from '@/features/auth/components/social-providers';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const mutation = useMutation<
    ActionSuccess<typeof register>,
    ErrorResponse,
    RegisterInput
  >({
    mutationFn: data => execute(register, data),
  });

  const successMessage = mutation.data?.message?.key;
  const errorMessage = mutation.error?.message?.key;

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordErrors = [
    form.formState.errors.password,
    form.formState.errors.confirmPassword,
  ];

  const onSubmit = (values: RegisterInput) => {
    if (mutation.isPending) return;
    mutation.mutate(values);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            id="form-rhf-signup"
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 md:p-8"
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                  {AUTH_UI_MESSAGES.SIGNUP_TITLE}
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
                  {AUTH_UI_MESSAGES.SIGNUP_SUBTITLE}
                </p>
              </div>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {AUTH_UI_MESSAGES.NAME_LABEL}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                      placeholder={AUTH_UI_MESSAGES.PLACEHOLDER_NAME}
                      disabled={mutation.isPending}
                      required
                    />
                    <FieldDescription>
                      {AUTH_UI_MESSAGES.NAME_DESCRIPTION}
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
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
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          {AUTH_UI_MESSAGES.PASSWORD_LABEL}
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="password"
                          autoComplete="new-password"
                          aria-invalid={fieldState.invalid}
                          placeholder={AUTH_UI_MESSAGES.PLACEHOLDER_PASSWORD}
                          disabled={mutation.isPending}
                          required
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="confirmPassword"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          {AUTH_UI_MESSAGES.CONFIRM_PASSWORD_LABEL}
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="password"
                          autoComplete="new-password"
                          aria-invalid={fieldState.invalid}
                          placeholder={
                            AUTH_UI_MESSAGES.PLACEHOLDER_CONFIRM_PASSWORD
                          }
                          disabled={mutation.isPending}
                          required
                        />
                      </Field>
                    )}
                  />
                </Field>
                <FieldDescription>
                  {AUTH_UI_MESSAGES.PASSWORD_DESCRIPTION}
                </FieldDescription>
                {passwordErrors && <FieldError errors={passwordErrors} />}
              </Field>
              <Field>
                {mutation.isSuccess && <FormSuccess message={successMessage} />}
                {mutation.isError && <FormError message={errorMessage} />}
                <LoadingButton type="submit" loading={mutation.isPending}>
                  {AUTH_UI_MESSAGES.SIGNUP_BUTTON}
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
                {AUTH_UI_MESSAGES.LOGIN_CTA_TEXT}{' '}
                <Link href={ROUTES.AUTH.LOGIN}>
                  {AUTH_UI_MESSAGES.LOGIN_CTA_LINK}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/assets/svg/sign-up-pana.svg"
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
