'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

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
import { type LoginData, login } from '@/features/auth/actions';
import { Header } from '@/features/auth/components/header';
import { SocialProviders } from '@/features/auth/components/social-providers';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_UI_MESSAGES,
} from '@/features/auth/lib/messages';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';
import { execute } from '@/hooks/use-action';
import { siteFeatures } from '@/lib/config';
import { ROUTES } from '@/lib/navigation';
import { type ErrorResponse, type SuccessResponse } from '@/lib/result';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/routes';

/**
 * @name LoginForm
 * @description Handles user login, form validation, and calls the server action via TanStack Query.
 */
export const LoginForm = () => {
  const searchParams = useSearchParams();

  // Checks for OAuth errors in the URL
  const urlError =
    searchParams.get('error') === 'OAuthAccountNotLinked'
      ? AUTH_ERROR_MESSAGES.OAUTH_ACCOUNT_NOT_LINKED
      : '';

  const router = useRouter();

  // TanStack Query mutation for the login action.
  const mutation = useMutation<
    SuccessResponse<LoginData>, // TData: Successful return type
    ErrorResponse, // TError: Thrown error type (from the 'execute' adapter)
    LoginInput // TVariables: Input data type
  >({
    mutationFn: data =>
      // Calls the adapter which either returns SuccessResponse or throws ErrorResponse.
      // Type casting is used to narrow the successful return type for TData.
      execute(login, data) as Promise<SuccessResponse<LoginData>>,

    onSuccess: () => {
      // Redirect on successful login
      router.push(DEFAULT_LOGIN_REDIRECT);
    },
  });

  // Extracts success and error messages from the mutation state (using i18n message keys)
  const successMessage = mutation.data?.message?.key;
  const errorMessage = mutation.error?.message?.key;

  // React Hook Form initialization with Zod resolver
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handles the form submission by calling the mutation
  const onSubmit = (values: LoginInput) => {
    // Prevent multiple submissions while pending
    if (mutation.isPending) return;

    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
        <FieldGroup>
          <Header
            title={AUTH_UI_MESSAGES.LOGIN_TITLE}
            description={AUTH_UI_MESSAGES.LOGIN_SUBTITLE}
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
                    disabled={mutation.isPending}
                  />
                </FormControl>
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
                <div className="flex items-center">
                  <FormLabel>{AUTH_UI_MESSAGES.PASSWORD_LABEL}</FormLabel>
                  <Link
                    href={ROUTES.AUTH.FORGOT_PASSWORD}
                    className="ml-auto text-sm"
                  >
                    {AUTH_UI_MESSAGES.FORGOT_PASSWORD}
                  </Link>
                </div>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder={AUTH_UI_MESSAGES.PLACEHOLDER_PASSWORD}
                    autoComplete="current-password"
                    disabled={mutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <>
            {/* Display success/error messages */}
            <FormSuccess message={successMessage} />
            <FormError message={errorMessage || urlError} />

            <LoadingButton type="submit" loading={mutation.isPending}>
              {AUTH_UI_MESSAGES.LOGIN_BUTTON}
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
          {/* Sign Up CTA */}
          <FormDescription className="text-center">
            {AUTH_UI_MESSAGES.SIGNUP_CTA_TEXT}{' '}
            <LinkUnderline>
              <Link href={ROUTES.AUTH.REGISTER}>
                {AUTH_UI_MESSAGES.SIGNUP_CTA_LINK}
              </Link>
            </LinkUnderline>
          </FormDescription>
        </FieldGroup>
      </form>
    </Form>
  );
};
