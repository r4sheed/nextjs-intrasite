'use client';

import { useEffect } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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
import { type NewPasswordData, newPassword } from '@/features/auth/actions';
import { AuthState } from '@/features/auth/components/auth-state';
import { Header } from '@/features/auth/components/header';
import { LoadState } from '@/features/auth/components/load-state';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_UI_MESSAGES,
} from '@/features/auth/lib/messages';
import {
  type NewPasswordInput,
  newPasswordSchema,
} from '@/features/auth/schemas';
import { execute } from '@/hooks/use-action';
import { ROUTES } from '@/lib/navigation';
import { type ErrorResponse, type SuccessResponse } from '@/lib/result';

export const NewPasswordForm = () => {
  const form = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      token: '',
    },
  });

  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Use setValue to programmatically set the form value.
      // This makes the token available in the form's state and validation.
      form.setValue('token', token);
    }
  }, [searchParams, token]);

  const mutation = useMutation<
    SuccessResponse<NewPasswordData>,
    ErrorResponse,
    NewPasswordInput
  >({
    mutationFn: data =>
      execute(newPassword, data) as Promise<SuccessResponse<NewPasswordData>>,
  });

  const onSubmit = (values: NewPasswordInput) => {
    // Prevent multiple submissions while pending
    if (mutation.isPending) return;

    mutation.mutate(values);
  };

  const successMessage = mutation.data?.message?.key;
  const errorMessage = mutation.error?.message?.key;

  if (!token) {
    return (
      <AuthState
        title={AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR}
        message={AUTH_ERROR_MESSAGES.TOKEN_NOT_FOUND}
        variant="destructive"
      />
    );
  }

  if (mutation.isPending) {
    // TODO: Add proper title and description
    return (
      <LoadState
        title={AUTH_UI_MESSAGES.VERIFICATION_PROCESSING_TITLE}
        description={AUTH_UI_MESSAGES.VERIFICATION_PROCESSING_DESCRIPTION}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
        <FieldGroup>
          <Header
            title={AUTH_UI_MESSAGES.NEW_PASSWORD_TITLE}
            description={AUTH_UI_MESSAGES.NEW_PASSWORD_SUBTITLE}
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
                <FormMessage />
              </FormItem>
            )}
          />
          <>
            <FormSuccess message={successMessage} />
            <FormError message={errorMessage} />
            <LoadingButton type="submit" loading={mutation.isPending}>
              {AUTH_UI_MESSAGES.NEW_PASSWORD_BUTTON}
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
