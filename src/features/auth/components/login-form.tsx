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
import { login } from '@/features/auth/actions';
import { Header } from '@/features/auth/components/header';
import { SocialProviders } from '@/features/auth/components/social-providers';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_UI_MESSAGES,
} from '@/features/auth/lib/messages';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';
import { siteFeatures } from '@/lib/config';
import { ROUTES } from '@/lib/navigation';
import { Status, getMessage } from '@/lib/response';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/routes';

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const urlError =
    searchParams.get('error') === 'OAuthAccountNotLinked'
      ? AUTH_ERROR_MESSAGES.OAUTH_ACCOUNT_NOT_LINKED
      : '';

  const router = useRouter();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: response => {
      if (response.status === Status.Success) {
        router.push(DEFAULT_LOGIN_REDIRECT);
      }
    },
  });

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginInput) => {
    mutation.mutate(values);
  };

  const successMessage =
    mutation.data?.status === Status.Success
      ? getMessage(mutation.data.message)
      : undefined;

  const errorMessage =
    mutation.data?.status === Status.Error
      ? getMessage(mutation.data.message)
      : undefined;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
        <FieldGroup>
          <Header
            title={AUTH_UI_MESSAGES.LOGIN_TITLE}
            description={AUTH_UI_MESSAGES.LOGIN_SUBTITLE}
          />
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
            <FormSuccess message={successMessage} />
            <FormError message={errorMessage || urlError} />
            <LoadingButton type="submit" loading={mutation.isPending}>
              {AUTH_UI_MESSAGES.LOGIN_BUTTON}
            </LoadingButton>
          </>
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
