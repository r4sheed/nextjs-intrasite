'use client';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { LinkUnderline } from '@/components/link-underline';
import { LoadingButton } from '@/components/loading-button';
import { Field, FieldGroup, FieldSeparator } from '@/components/ui/field';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { register } from '@/features/auth/actions';
import { type RegisterData } from '@/features/auth/actions';
import { Header } from '@/features/auth/components/header';
import { SocialProviders } from '@/features/auth/components/social-providers';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { execute } from '@/hooks/use-action';
import { siteFeatures } from '@/lib/config';
import { ROUTES } from '@/lib/navigation';
import { type ErrorResponse, type SuccessResponse } from '@/lib/result';

/**
 * @name RegisterForm
 * @description Handles user registration, form validation, and calls the server action via TanStack Query.
 */
export const RegisterForm = () => {
  // TanStack Query mutation for the registration action.
  // We explicitly define the TData, TError, and TVariables types.
  const mutation = useMutation<
    SuccessResponse<RegisterData>, // TData: Successful return type
    ErrorResponse, // TError: Thrown error type (from 'execute' adapter)
    RegisterInput // TVariables: Input data type
  >({
    mutationFn: data =>
      // Use the execute adapter, which handles error throwing for TanStack Query.
      execute(register, data) as Promise<SuccessResponse<RegisterData>>,
  });

  // Extracts success and error messages using the consistent pattern (i18n keys)
  const successMessage = mutation.data?.message?.key;
  const errorMessage = mutation.error?.message?.key;

  // React Hook Form initialization with Zod resolver
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  // The completion status is better checked via mutation.isSuccess if needed for UI logic,
  // but we can simplify the button disable logic.
  const isCompleted = mutation.isSuccess;

  // Handles the form submission by calling the mutation
  const onSubmit = (values: RegisterInput) => {
    // Prevent multiple submissions while pending
    if (mutation.isPending) return;
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
        <FieldGroup>
          <Header
            title={AUTH_UI_MESSAGES.REGISTER_TITLE}
            description={AUTH_UI_MESSAGES.REGISTER_SUBTITLE}
          />
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{AUTH_UI_MESSAGES.NAME_LABEL}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={AUTH_UI_MESSAGES.PLACEHOLDER_NAME}
                    autoComplete="name"
                    disabled={mutation.isPending || isCompleted}
                  />
                </FormControl>
                <FormDescription>
                  {AUTH_UI_MESSAGES.NAME_DESCRIPTION}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{AUTH_UI_MESSAGES.EMAIL_LABEL}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder={AUTH_UI_MESSAGES.PLACEHOLDER_EMAIL}
                    autoComplete="email"
                    disabled={mutation.isPending || isCompleted}
                  />
                </FormControl>
                <FormDescription>
                  {AUTH_UI_MESSAGES.EMAIL_DESCRIPTION}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{AUTH_UI_MESSAGES.PASSWORD_LABEL}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder={AUTH_UI_MESSAGES.PLACEHOLDER_PASSWORD}
                    autoComplete="new-password"
                    disabled={mutation.isPending || isCompleted}
                  />
                </FormControl>
                <FormDescription>
                  {AUTH_UI_MESSAGES.PASSWORD_DESCRIPTION}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <>
            {/* Error message is now retrieved directly from the thrown error */}
            <FormError message={errorMessage} />
            <FormSuccess message={successMessage} />

            <LoadingButton
              type="submit"
              loading={mutation.isPending}
              disabled={mutation.isPending || isCompleted}
            >
              {AUTH_UI_MESSAGES.REGISTER_BUTTON}
            </LoadingButton>
          </>
          {/* Social Auth Providers (if enabled) */}
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
          {/* Login CTA */}
          <FormDescription className="text-center">
            {AUTH_UI_MESSAGES.LOGIN_CTA_TEXT}{' '}
            <LinkUnderline>
              <Link href={ROUTES.AUTH.LOGIN}>
                {AUTH_UI_MESSAGES.LOGIN_CTA_LINK}
              </Link>
            </LinkUnderline>
          </FormDescription>
        </FieldGroup>
      </form>
    </Form>
  );
};
