'use client';

import { useEffect, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { type ActionSuccess, type ErrorResponse } from '@/lib/response';

import { execute } from '@/hooks/use-action';

import { FormError } from '@/components/form-status';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldTitle,
} from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

import { updateUserSettings } from '@/features/auth/actions/user-settings';
import { PasswordInput } from '@/features/auth/components/password-input';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useSession } from '@/features/auth/hooks/use-session';
import { AUTH_INFO } from '@/features/auth/lib/strings';
import {
  PasswordSchema,
  TwoFactorSchema,
} from '@/features/auth/schemas/user-settings';

const passwordSchema = PasswordSchema;
const twoFactorSchema = TwoFactorSchema;

type PasswordFormValues = z.infer<typeof passwordSchema>;
type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;

const SecuritySection = () => {
  const session = useSession();
  const user = useCurrentUser();
  const passwordToastIdRef = useRef<string | number | undefined>(undefined);
  const twoFactorToastIdRef = useRef<string | number | undefined>(undefined);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: 'onTouched',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const twoFactorForm = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      twoFactorEnabled: user?.twoFactorEnabled ?? false,
    },
  });

  useEffect(() => {
    twoFactorForm.reset({
      twoFactorEnabled: user?.twoFactorEnabled ?? false,
    });
  }, [user?.twoFactorEnabled, twoFactorForm]);

  const passwordMutation = useMutation<
    ActionSuccess<typeof updateUserSettings>,
    ErrorResponse,
    PasswordFormValues
  >({
    mutationFn: data =>
      execute(updateUserSettings, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }),
    onMutate: () => {
      passwordToastIdRef.current = toast.loading(AUTH_INFO.updatingPassword);
    },
    onSuccess: async () => {
      await session.update();
      toast.success('Password updated successfully');
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: () => {
      // Form level error surface handles messaging; toast is redundant.
    },
    onSettled: () => {
      if (passwordToastIdRef.current !== undefined) {
        toast.dismiss(passwordToastIdRef.current);
        passwordToastIdRef.current = undefined;
      }
    },
  });

  const twoFactorMutation = useMutation<
    ActionSuccess<typeof updateUserSettings>,
    ErrorResponse,
    TwoFactorFormValues
  >({
    mutationFn: data => execute(updateUserSettings, data),
    onMutate: () => {
      twoFactorToastIdRef.current = toast.loading(
        AUTH_INFO.updatingSecuritySettings
      );
    },
    onSuccess: async (result, variables) => {
      await session.update();
      const enabled =
        result.data?.twoFactorEnabled ?? variables.twoFactorEnabled ?? false;
      twoFactorForm.reset({ twoFactorEnabled: enabled });
      toast.success(
        enabled ? AUTH_INFO.twoFactorEnabled : AUTH_INFO.twoFactorDisabled
      );
    },
    onError: () => {
      toast.error('Failed to update security settings. Please try again.');
    },
    onSettled: () => {
      if (twoFactorToastIdRef.current !== undefined) {
        toast.dismiss(twoFactorToastIdRef.current);
        twoFactorToastIdRef.current = undefined;
      }
    },
  });

  const handlePasswordSubmit = (values: PasswordFormValues) => {
    if (passwordMutation.isPending) return;

    const trimmedValues: PasswordFormValues = {
      currentPassword: values.currentPassword.trim(),
      newPassword: values.newPassword.trim(),
      confirmPassword: values.confirmPassword.trim(),
    };

    const defaults = passwordForm.formState.defaultValues ?? {};
    const hasChanges =
      trimmedValues.currentPassword !== (defaults.currentPassword ?? '') ||
      trimmedValues.newPassword !== (defaults.newPassword ?? '') ||
      trimmedValues.confirmPassword !== (defaults.confirmPassword ?? '');

    if (!hasChanges) {
      toast.info(AUTH_INFO.noChangesToSave);
      return;
    }

    passwordMutation.mutate(trimmedValues);
  };

  const handleTwoFactorSubmit = (values: TwoFactorFormValues) => {
    if (twoFactorMutation.isPending) return;

    const currentValue = user?.twoFactorEnabled ?? false;
    if (values.twoFactorEnabled === currentValue) {
      toast.info(AUTH_INFO.noChangesToSave);
      return;
    }

    twoFactorMutation.mutate(values);
  };

  const passwordErrorMessage = passwordMutation.error?.message?.key;
  const twoFactorErrorMessage = twoFactorMutation.error?.message?.key;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="form-password-settings"
            onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
            className="space-y-6"
          >
            <Controller
              name="currentPassword"
              control={passwordForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <FieldTitle>Current Password</FieldTitle>
                    <FieldDescription>
                      Enter your current password
                    </FieldDescription>
                    <PasswordInput
                      {...field}
                      id={field.name}
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                      disabled={passwordMutation.isPending}
                      required
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <Controller
                name="newPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldTitle>New Password</FieldTitle>
                      <PasswordInput
                        {...field}
                        id={field.name}
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                        disabled={passwordMutation.isPending}
                        required
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldTitle>Confirm Password</FieldTitle>
                      <PasswordInput
                        {...field}
                        id={field.name}
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                        disabled={passwordMutation.isPending}
                        required
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            </div>
          </form>
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-[65%]">
            <FormError message={passwordErrorMessage} />
          </div>
          <Button
            type="submit"
            form="form-password-settings"
            disabled={passwordMutation.isPending}
          >
            Update Password
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            id="form-two-factor-settings"
            onSubmit={twoFactorForm.handleSubmit(handleTwoFactorSubmit)}
            className="space-y-4"
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Enable 2FA</FieldTitle>
                <FieldDescription>
                  Use an authenticator app for additional security
                </FieldDescription>
              </FieldContent>
              <Controller
                name="twoFactorEnabled"
                control={twoFactorForm.control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={checked => field.onChange(checked)}
                    disabled={twoFactorMutation.isPending}
                  />
                )}
              />
            </Field>
          </form>
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-[65%]">
            <FormError message={twoFactorErrorMessage} />
          </div>
          <Button
            type="submit"
            form="form-two-factor-settings"
            disabled={twoFactorMutation.isPending}
          >
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export { SecuritySection };
