'use client';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  AUTH_ERROR_MESSAGES,
  AUTH_UI_MESSAGES,
} from '@/features/auth/lib/messages';
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from '@/features/auth/schemas';
import { useAction } from '@/hooks/use-action';
import { ROUTES } from '@/lib/navigation';

export const ResetPasswordForm = () => {
  const { execute, message, isPending } = useAction();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: ResetPasswordInput) => {};

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
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <>
            <FormSuccess message={message.success} />
            <FormError message={message.error} />
            <LoadingButton type="submit" loading={isPending}>
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
