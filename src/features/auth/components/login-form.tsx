'use client';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormError } from '@/components/form-error';
import { LoadingButton } from '@/components/loading-button';
import { FieldGroup, FieldSeparator } from '@/components/ui/field';
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
import { Separator } from '@/components/ui/separator';
import { login } from '@/features/auth/actions';
import { useAuthAction } from '@/features/auth/hooks/use-auth-action';
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';
import { ROUTES } from '@/lib/navigation';

export const LoginForm = () => {
  const { execute, error, isPending } = useAuthAction();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginInput) => {
    execute(() => login(values));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">
              {AUTH_UI_MESSAGES.LOGIN_TITLE}
            </h1>
            <p className="text-muted-foreground text-balance">
              {AUTH_UI_MESSAGES.LOGIN_SUBTITLE}
            </p>
          </div>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>{AUTH_UI_MESSAGES.PASSWORD_LABEL}</FormLabel>
                  <Link
                    href={ROUTES.AUTH.FORGOT_PASSWORD}
                    className="ml-auto text-sm underline-offset-2 hover:underline"
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
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error} />
          <LoadingButton type="submit" loading={isPending}>
            {AUTH_UI_MESSAGES.LOGIN_BUTTON}
          </LoadingButton>
          <FieldSeparator />
          <FormDescription className="text-center">
            <Link href={ROUTES.AUTH.REGISTER}>
              {AUTH_UI_MESSAGES.SIGNUP_CTA}
            </Link>
          </FormDescription>
        </FieldGroup>
      </form>
    </Form>
  );
};
