'use client';

import { useEffect, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
import {
  AUTH_ERRORS,
  AUTH_INFO,
  AUTH_LABELS,
  AUTH_SUCCESS,
} from '@/features/auth/lib/strings';
import {
  PasswordSchema,
  TwoFactorSchema,
  type PasswordFormData,
  type TwoFactorFormData,
} from '@/features/auth/schemas';

type PasswordFormValues = PasswordFormData;
type TwoFactorFormValues = TwoFactorFormData;

const SecuritySection = () => {
  const session = useSession();
  const user = useCurrentUser();
  const passwordToastIdRef = useRef<string | number | undefined>(undefined);
  const twoFactorToastIdRef = useRef<string | number | undefined>(undefined);

  const passwordFormDefaultValues: PasswordFormValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(PasswordSchema),
    mode: 'onTouched',
    defaultValues: passwordFormDefaultValues,
  });

  const twoFactorForm = useForm<TwoFactorFormValues>({
    resolver: zodResolver(TwoFactorSchema),
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
    PasswordFormData
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
      toast.success(AUTH_SUCCESS.passwordUpdated);
      passwordForm.reset(passwordFormDefaultValues);
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
    TwoFactorFormData
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
      toast.error(AUTH_ERRORS.securitySettingsUpdateFailed);
    },
    onSettled: () => {
      if (twoFactorToastIdRef.current !== undefined) {
        toast.dismiss(twoFactorToastIdRef.current);
        twoFactorToastIdRef.current = undefined;
      }
    },
  });

  const handlePasswordSubmit = (values: PasswordFormData) => {
    if (passwordMutation.isPending) return;

    if (values.newPassword === values.currentPassword) {
      toast.info(AUTH_ERRORS.passwordUnchanged);
      return;
    }

    passwordMutation.mutate(values);
  };

  const handleTwoFactorSubmit = (values: TwoFactorFormData) => {
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
          <CardTitle>{AUTH_LABELS.changePasswordTitle}</CardTitle>
          <CardDescription>
            {AUTH_LABELS.changePasswordDescription}
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
                    <FieldTitle>{AUTH_LABELS.currentPasswordLabel}</FieldTitle>
                    <FieldDescription>
                      {AUTH_LABELS.currentPasswordDescription}
                    </FieldDescription>
                    <PasswordInput
                      {...field}
                      id={field.name}
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                      placeholder={AUTH_LABELS.passwordPlaceholder}
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
                      <FieldTitle>{AUTH_LABELS.newPasswordLabel}</FieldTitle>
                      <PasswordInput
                        {...field}
                        id={field.name}
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                        placeholder={AUTH_LABELS.newPasswordPlaceholder}
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
                      <FieldTitle>
                        {AUTH_LABELS.confirmPasswordLabel}
                      </FieldTitle>
                      <PasswordInput
                        {...field}
                        id={field.name}
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                        placeholder={AUTH_LABELS.confirmPasswordPlaceholder}
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
            {AUTH_LABELS.updatePasswordButton}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{AUTH_LABELS.twoFactorTitle}</CardTitle>
          <CardDescription>{AUTH_LABELS.twoFactorDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            id="form-two-factor-settings"
            onSubmit={twoFactorForm.handleSubmit(handleTwoFactorSubmit)}
            className="space-y-4"
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>{AUTH_LABELS.twoFactorToggleLabel}</FieldTitle>
                <FieldDescription>
                  {AUTH_LABELS.twoFactorToggleDescription}
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
            {AUTH_LABELS.saveChangesButton}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export { SecuritySection };
