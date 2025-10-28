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
import { Header } from '@/features/auth/components/header';
import { SocialProviders } from '@/features/auth/components/social-providers';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { siteFeatures } from '@/lib/config';
import { ROUTES } from '@/lib/navigation';
import { Status, getMessage } from '@/lib/result';

export const RegisterForm = () => {
  const mutation = useMutation({
    mutationFn: register,
  });

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  // Consider the form completed when the action succeeded
  const isCompleted = mutation.data?.status === Status.Success;

  const onSubmit = (values: RegisterInput) => {
    if (isCompleted) {
      return;
    }
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
            title={AUTH_UI_MESSAGES.REGISTER_TITLE}
            description={AUTH_UI_MESSAGES.REGISTER_SUBTITLE}
          />
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
                    disabled={mutation.isPending}
                  />
                </FormControl>
                <FormDescription>
                  {AUTH_UI_MESSAGES.NAME_DESCRIPTION}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
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
                <FormDescription>
                  {AUTH_UI_MESSAGES.EMAIL_DESCRIPTION}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    disabled={mutation.isPending}
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
