'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

import Image from 'next/image';
import Link from 'next/link';

import { LoadingButton } from '@/components/loading-button';
import { FormError, FormSuccess } from '@/components/shared/form-status';
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
import { execute } from '@/hooks/use-action';
import { siteFeatures } from '@/lib/config';
import { routes } from '@/lib/navigation';
import { type ActionSuccess, type ErrorResponse } from '@/lib/response';
import { cn } from '@/lib/utils';

const useSignupForm = () => {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const mutation = useMutation<
    ActionSuccess<typeof registerUser>,
    ErrorResponse,
    RegisterInput
  >({
    mutationFn: data => execute(registerUser, data),
  });

  const successMessage = mutation.data?.message?.key;
  const errorMessage = mutation.error?.message?.key;

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
                  {AUTH_LABELS.signupTitle}
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
                  {AUTH_LABELS.signupSubtitle}
                </p>
              </div>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {AUTH_LABELS.nameLabel}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                      placeholder={AUTH_LABELS.namePlaceholder}
                      disabled={isPending}
                      required
                    />
                    <FieldDescription>
                      {AUTH_LABELS.nameDescription}
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
                    <FieldLabel htmlFor={field.name}>
                      {AUTH_LABELS.passwordLabel}
                    </FieldLabel>
                    <PasswordInput
                      {...field}
                      id={field.name}
                      autoComplete="new-password"
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
                <LoadingButton type="submit" loading={isPending}>
                  {AUTH_LABELS.signupButton}
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
                {AUTH_LABELS.loginCtaText}{' '}
                <Link href={routes.auth.login.url}>
                  {AUTH_LABELS.loginCtaLink}
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
};

export { SignupForm };
