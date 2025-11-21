'use client';

import { useEffect, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  Controller,
  useForm,
  useFormState,
  type FieldNamesMarkedBoolean,
} from 'react-hook-form';
import { toast } from 'sonner';

import { Status, type ActionSuccess, type ErrorResponse } from '@/lib/response';
import { translateFieldErrors } from '@/lib/translation';

import { execute } from '@/hooks/use-action';

import { FormError } from '@/components/form-status';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import { updateUserSettings } from '@/features/auth/actions/user-settings';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useSession } from '@/features/auth/hooks/use-session';
import {
  AUTH_ERRORS,
  AUTH_INFO,
  AUTH_LABELS,
  AUTH_SUCCESS,
} from '@/features/auth/lib/strings';
import {
  UserSettingsSchema,
  type UserSettingsFormData,
} from '@/features/auth/schemas';

/**
 * Hook for managing profile update mutation
 * Handles loading toast, session update, and success/error notifications
 */
const useProfileMutation = (session: ReturnType<typeof useSession>) => {
  const t = useTranslations('auth');

  const toastIdRef = useRef<string | number | undefined>(undefined);

  return useMutation<
    ActionSuccess<ReturnType<typeof updateUserSettings>>,
    ErrorResponse,
    UserSettingsFormData
  >({
    mutationFn: data => execute(updateUserSettings, data),
    onMutate: () => {
      toastIdRef.current = toast.loading(t(AUTH_INFO.updatingProfile));
    },
    onSuccess: async () => {
      await session.update();
      toast.success(t(AUTH_SUCCESS.profileUpdated));
    },
    onError: () => {
      toast.error(t(AUTH_ERRORS.profileUpdateFailed));
    },
    onSettled: () => {
      if (toastIdRef.current !== undefined) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = undefined;
      }
    },
  });
};

/**
 * Get default form values based on user data and OAuth status
 */
const getDefaultFormValues = (
  user: ReturnType<typeof useCurrentUser>,
  isOAuthAccount: boolean
): UserSettingsFormData => {
  return {
    name: user?.name ?? undefined,
    ...(isOAuthAccount ? {} : { email: user?.email ?? undefined }),
  };
};

/**
 * Get updated form values from mutation success data
 */
const getUpdatedFormValues = (
  data: NonNullable<
    ActionSuccess<ReturnType<typeof updateUserSettings>>['data']
  >,
  isOAuthAccount: boolean
): UserSettingsFormData => {
  return {
    name: data.name ?? undefined,
    ...(isOAuthAccount ? {} : { email: data.email }),
  };
};

/**
 * Build form payload for submission
 * Only includes fields that have values
 */
const buildFormPayload = (
  values: UserSettingsFormData,
  dirtyFields: FieldNamesMarkedBoolean<UserSettingsFormData>,
  isOAuthAccount: boolean
): UserSettingsFormData => {
  const payload: UserSettingsFormData = {};

  if (dirtyFields.name && values.name !== undefined) {
    payload.name = values.name;
  }

  if (!isOAuthAccount && dirtyFields.email && values.email !== undefined) {
    payload.email = values.email;
  }

  return payload;
};

const ProfileSection = () => {
  const session = useSession();
  const user = useCurrentUser();
  const t = useTranslations('auth');

  const isOAuthAccount = user?.isOAuthAccount ?? false;

  const mutation = useProfileMutation(session);
  const form = useForm<UserSettingsFormData>({
    resolver: zodResolver(UserSettingsSchema),
    mode: 'onTouched',
    defaultValues: getDefaultFormValues(user, isOAuthAccount),
  });

  const { dirtyFields } = useFormState({ control: form.control });

  const isPending = mutation.isPending;
  const errorMessage = mutation.error?.message?.key;

  // Sync form with user data changes
  useEffect(() => {
    form.reset(getDefaultFormValues(user, isOAuthAccount));
  }, [user, isOAuthAccount, form]);

  // Sync form with mutation success data
  useEffect(() => {
    if (mutation.data?.status === Status.Success && mutation.data.data) {
      form.reset(getUpdatedFormValues(mutation.data.data, isOAuthAccount));
    }
  }, [mutation.data, form, isOAuthAccount]);

  const onSubmit = (values: UserSettingsFormData) => {
    if (isPending) return;
    const payload = buildFormPayload(values, dirtyFields, isOAuthAccount);

    if (Object.keys(payload).length === 0) {
      toast.info(t(AUTH_INFO.noChangesToSave));
      return;
    }
    mutation.mutate(payload);
  };

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>{t(AUTH_LABELS.profileTitle)}</CardTitle>
          <CardDescription>{t(AUTH_LABELS.profileDescription)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/abstract-geometric-shapes.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              {/* TODO: A modal where the user can select or remove avatar */}
              <Button variant="outline" size="sm" disabled={isPending}>
                {t(AUTH_LABELS.changeAvatarButton)}
              </Button>
              <p className="text-muted-foreground text-xs">
                {t(AUTH_LABELS.avatarDescription, { maxSize: '2MB' })}
              </p>
            </div>
          </div>

          <Separator />

          <form
            id="form-rhf-profile"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <FieldTitle>{t(AUTH_LABELS.nameLabel)}</FieldTitle>
                    <FieldDescription>
                      {t(AUTH_LABELS.nameDescription)}
                    </FieldDescription>
                    <div className="flex gap-2">
                      <Input
                        {...field}
                        id={field.name}
                        type="text"
                        autoComplete="name"
                        aria-invalid={fieldState.invalid}
                        placeholder={t(AUTH_LABELS.namePlaceholder)}
                        disabled={isPending}
                        required
                      />
                    </div>
                    {fieldState.invalid && (
                      <FieldError
                        errors={translateFieldErrors(t, fieldState.error)}
                      />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <FieldTitle>{t(AUTH_LABELS.emailLabel)}</FieldTitle>
                    <FieldDescription>
                      {isOAuthAccount
                        ? t(AUTH_LABELS.emailManagedDescription)
                        : t(AUTH_LABELS.emailDescription)}
                    </FieldDescription>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      placeholder={t(AUTH_LABELS.emailPlaceholder)}
                      disabled={isPending || isOAuthAccount}
                      readOnly={isOAuthAccount}
                      required={!isOAuthAccount}
                    />
                    {!isOAuthAccount && (
                      <FieldDescription>
                        {t(AUTH_LABELS.emailNotificationsDescription)}
                      </FieldDescription>
                    )}
                    {isOAuthAccount && (
                      <FieldDescription>
                        {t(AUTH_LABELS.contactSupportDescription)}
                      </FieldDescription>
                    )}
                    {fieldState.invalid && (
                      <FieldError
                        errors={translateFieldErrors(t, fieldState.error)}
                      />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          </form>
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-[65%]">
            {errorMessage && <FormError message={t(errorMessage)} />}
          </div>
          <Button type="submit" form="form-rhf-profile" disabled={isPending}>
            {t(AUTH_LABELS.saveChangesButton)}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export { ProfileSection };
