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
import { type ResetData, reset } from '@/features/auth/actions';
import { Header } from '@/features/auth/components/header';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { type ResetInput, resetSchema } from '@/features/auth/schemas';
import { execute } from '@/hooks/use-action';
import { ROUTES } from '@/lib/navigation';
import { type ErrorResponse, type SuccessResponse } from '@/lib/result';

export const ResetForm = () => {
  const mutation = useMutation<
    SuccessResponse<ResetData>,
    ErrorResponse,
    ResetInput
  >({
    mutationFn: data =>
      execute(reset, data) as Promise<SuccessResponse<ResetData>>,
  });

  const form = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: ResetInput) => {
    if (mutation.isPending) return;
    mutation.mutate(values);
  };

  const successMessage = mutation.data?.message?.key;
  const errorMessage = mutation.error?.message?.key;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
        <FieldGroup>
          <Header
            title={AUTH_UI_MESSAGES.FORGOT_PASSWORD_TITLE}
            description={AUTH_UI_MESSAGES.FORGOT_PASSWORD_SUBTITLE}
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
              {AUTH_UI_MESSAGES.FORGOT_PASSWORD_BUTTON}
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
