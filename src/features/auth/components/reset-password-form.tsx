'use client';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { LinkUnderline } from '@/components/link-underline';
import { LoadingButton } from '@/components/loading-button';
import { FieldGroup } from '@/components/ui/field';
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
import { Header } from '@/features/auth/components/header';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from '@/features/auth/schemas';
import { ROUTES } from '@/lib/navigation';
import { type Response, Status, getMessage } from '@/lib/result';

export const ResetPasswordForm = () => {
  // Note: This form doesn't have an action implementation yet
  // When implemented, replace the mutationFn with the actual action
  const mutation = useMutation<Response<unknown>, Error, ResetPasswordInput>({
    mutationFn: async (_values: ResetPasswordInput) => {
      // Placeholder - replace with actual reset password action
      throw new Error('Reset password action not implemented yet');
    },
  });

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: ResetPasswordInput) => {
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
            title={AUTH_UI_MESSAGES.RESET_PASSWORD_TITLE}
            description={AUTH_UI_MESSAGES.RESET_PASSWORD_SUBTITLE}
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
          <>
            <FormSuccess message={successMessage} />
            <FormError message={errorMessage} />
            <LoadingButton type="submit" loading={mutation.isPending}>
              {AUTH_UI_MESSAGES.RESET_PASSWORD_BUTTON}
            </LoadingButton>
          </>
          <FormDescription className="text-center">
            <LinkUnderline>
              <Link href={ROUTES.AUTH.LOGIN}>
                {AUTH_UI_MESSAGES.BACK_TO_LOGIN_BUTTON}
              </Link>
            </LinkUnderline>
          </FormDescription>
        </FieldGroup>
      </form>
    </Form>
  );
};
