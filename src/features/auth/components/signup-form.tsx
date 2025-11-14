'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import Image from 'next/image';
import Link from 'next/link';

import { siteFeatures } from '@/lib/config';
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
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { registerUser } from '@/features/auth/actions';
import { AuthFooter } from '@/features/auth/components/auth-footer';
import { PasswordInput } from '@/features/auth/components/password-input';
import { SocialProviders } from '@/features/auth/components/social-providers';
import { AUTH_LABELS } from '@/features/auth/lib/strings';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';

/**
 * Hook for signup form logic
 * @returns Form instance, submit handler, and computed state
 */
const useSignupForm = () => {
  // Form setup with validation
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Mutation for user registration
  const mutation = useMutation<
    ActionSuccess<ReturnType<typeof registerUser>>,
    ErrorResponse,
    RegisterInput
  >({
    mutationFn: data => execute(registerUser, data),
  });

  // Computed state
  const successMessage = mutation.data?.message?.key;
  const errorMessage = mutation.error?.message?.key;

  // Submit handler with pending check
  const onSubmit = (values: RegisterInput) => {
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

const SignupForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const {
    form,
    onSubmit,
    isPending,
    isSuccess,
    isError,
    successMessage,
    errorMessage,
  } = useSignupForm();

  const t = useTranslations('auth');

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
                  {t(AUTH_LABELS.signupTitle)}
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
                  {t(AUTH_LABELS.signupSubtitle)}
                </p>
              </div>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t(AUTH_LABELS.name)}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                      placeholder={t(AUTH_LABELS.namePlaceholder)}
                      disabled={isPending || isSuccess}
                      required
                    />
                    <FieldDescription>
                      {t(AUTH_LABELS.nameDescription)}
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError
                        errors={translateFieldErrors(t, fieldState.error)}
                      />
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
                      {t(AUTH_LABELS.email)}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      placeholder={t(AUTH_LABELS.emailPlaceholder)}
                      disabled={isPending || isSuccess}
                      required
                    />
                    <FieldDescription>
                      {t(AUTH_LABELS.emailDescription)}
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError
                        errors={translateFieldErrors(t, fieldState.error)}
                      />
                    )}
                  </Field>
                )}
              />
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
                      disabled={isPending || isSuccess}
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
                  <FormSuccess message={t(successMessage)} />
                )}
                {isError && errorMessage && (
                  <FormError message={t(errorMessage)} />
                )}

                <LoadingButton
                  type="submit"
                  disabled={isSuccess}
                  loading={isPending}
                >
                  {t(AUTH_LABELS.signupButton)}
                </LoadingButton>
              </Field>
              {siteFeatures.socialAuth && (
                <>
                  <FieldSeparator>
                    {t(AUTH_LABELS.orContinueWith)}
                  </FieldSeparator>
                  <Field className="grid grid-cols-2 gap-4">
                    <SocialProviders disabled={isPending} />
                  </Field>
                </>
              )}
              <FieldDescription className="text-center">
                {t(AUTH_LABELS.loginCtaText)}{' '}
                <Link href={routes.auth.login.url}>
                  {t(AUTH_LABELS.loginCtaLink)}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/assets/svg/sign-up-pana.svg"
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

export { SignupForm };
