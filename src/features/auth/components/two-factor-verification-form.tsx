'use client';

import { useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

import { useRouter, useSearchParams } from 'next/navigation';

import { middlewareConfig } from '@/lib/config';
import { routes } from '@/lib/navigation';
import { type ActionSuccess, type ErrorResponse } from '@/lib/response';

import { execute } from '@/hooks/use-action';

import { FormError } from '@/components/form-status';
import { LoadingButton } from '@/components/loading-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';

import {
  resendTwoFactor,
  verifyTwoFactor,
  type ResendTwoFactorInput,
  type VerifyTwoFactorInput,
} from '@/features/auth/actions';
import { AUTH_CODES, AUTH_LABELS } from '@/features/auth/lib/strings';
import {
  type VerifyTwoFactorCodeInput,
  verifyTwoFactorCodeSchema,
} from '@/features/auth/schemas';

/**
 * Extracts URL parameters required for the 2FA verification flow.
 *
 * @returns Object containing the active session identifier, masked email, any prefilled code,
 * and the localized message fragments for the "code sent" helper text.
 */
const useTwoFactorUrlParams = () => {
  const searchParams = useSearchParams();

  const sessionId = searchParams.get('sessionId');
  const email = searchParams.get('email');
  const codeFromQuery = searchParams.get('code');

  const [codeSentPrefix, codeSentSuffix = ''] =
    AUTH_LABELS.verify2faCodeSent.split('{email}');

  return { sessionId, email, codeFromQuery, codeSentPrefix, codeSentSuffix };
};

/**
 * Creates the verify and resend mutations and tracks redirect state for the 2FA flow.
 *
 * @returns Current session identifier, redirect flag, and TanStack Query mutations for verify / resend actions.
 */
const useTwoFactorMutations = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const sessionId = searchParams.get('sessionId');
  const email = searchParams.get('email');

  const verifyMutation = useMutation<
    ActionSuccess<typeof verifyTwoFactor>,
    ErrorResponse,
    VerifyTwoFactorInput
  >({
    mutationFn: data => execute(verifyTwoFactor, data),
    onSuccess: async data => {
      if (!data.data) {
        console.error('[2FA] Missing data in verification response');
        return;
      }

      setIsRedirecting(true);

      try {
        router.replace(middlewareConfig.defaultLoginRedirect);
      } catch (error) {
        console.error('[2FA] Redirect failed', error);
        setIsRedirecting(false);
      }
    },
  });

  const resendMutation = useMutation<
    ActionSuccess<typeof resendTwoFactor>,
    ErrorResponse,
    ResendTwoFactorInput
  >({
    mutationFn: data => execute(resendTwoFactor, data),
    onSuccess: result => {
      const nextSessionId = result.data?.sessionId;
      if (!nextSessionId) {
        console.error('[2FA] Missing sessionId in resend response');
        return;
      }

      const params = new URLSearchParams();
      params.set('type', '2fa');
      params.set('sessionId', nextSessionId);
      if (email) {
        params.set('email', email);
      }

      router.replace(`${routes.auth.verify.url}?${params.toString()}`, {
        scroll: false,
      });
    },
  });

  return { sessionId, isRedirecting, verifyMutation, resendMutation };
};

/**
 * Automatically submits the verification code when a valid code is provided via URL parameters.
 *
 * @param codeFromQuery Code sourced from the URL query string.
 * @param sessionId Active 2FA session identifier.
 * @param form React Hook Form instance managing the OTP input.
 * @param verifyMutation Mutation used for verifying the code with the server.
 * @param isRedirecting Indicates whether a redirect is already in progress.
 */
const useTwoFactorAutoSubmit = (
  codeFromQuery: string | null,
  sessionId: string | null,
  form: ReturnType<typeof useForm<VerifyTwoFactorCodeInput>>,
  verifyMutation: ReturnType<typeof useTwoFactorMutations>['verifyMutation'],
  isRedirecting: boolean
) => {
  const lastAutoSubmitCode = useRef<string | null>(null);
  const previousSessionId = useRef<string | null>(sessionId);

  const isValidTwoFactorCode = (code: string | null): boolean => {
    return code !== null && /^\d{6}$/.test(code);
  };

  useEffect(() => {
    if (previousSessionId.current === sessionId) {
      return;
    }

    previousSessionId.current = sessionId;
    lastAutoSubmitCode.current = null;
    verifyMutation.reset();
  }, [sessionId, verifyMutation]);

  useEffect(() => {
    if (verifyMutation.status === 'error') {
      return;
    }

    if (!codeFromQuery || !sessionId) {
      return;
    }

    if (!isValidTwoFactorCode(codeFromQuery)) {
      return;
    }

    if (lastAutoSubmitCode.current === codeFromQuery) {
      return;
    }

    lastAutoSubmitCode.current = codeFromQuery;

    void (async () => {
      const currentCode = form.getValues('code');
      if (currentCode !== codeFromQuery) {
        form.setValue('code', codeFromQuery, { shouldValidate: true });
      }

      const isValid = await form.trigger('code');
      if (!isValid) {
        lastAutoSubmitCode.current = null;
        return;
      }

      if (verifyMutation.isPending || isRedirecting) {
        return;
      }

      verifyMutation.mutate({ sessionId, code: codeFromQuery });
    })();
  }, [codeFromQuery, form, sessionId, verifyMutation, isRedirecting]);
};

/**
 * Computes aggregate loading and error state for the verification UI based on the active mutations.
 *
 * @param verifyMutation Mutation returned from useTwoFactorMutations for verifying codes.
 * @param resendMutation Mutation returned from useTwoFactorMutations for resending codes.
 * @param isRedirecting Whether a redirect is currently running.
 * @returns Combined pending flag, translated error message, and a flag indicating if the session is locked.
 */
const useTwoFactorState = (
  verifyMutation: ReturnType<typeof useTwoFactorMutations>['verifyMutation'],
  resendMutation: ReturnType<typeof useTwoFactorMutations>['resendMutation'],
  isRedirecting: boolean
) => {
  const isPending = verifyMutation.isPending || isRedirecting;
  const errorMessage =
    verifyMutation.error?.message?.key || resendMutation.error?.message?.key;

  const isSessionLocked = verifyMutation.error
    ? FATAL_VERIFY_ERROR_CODES.has(verifyMutation.error.code)
    : false;

  return { isPending, errorMessage, isSessionLocked };
};

const FATAL_VERIFY_ERROR_CODES = new Set<string>([
  AUTH_CODES.twoFactorSessionMissing,
  AUTH_CODES.twoFactorMaxAttempts,
  AUTH_CODES.twoFactorCodeExpired,
]);

export const TwoFactorVerificationForm = () => {
  const router = useRouter();
  const urlParams = useTwoFactorUrlParams();
  const { sessionId, isRedirecting, verifyMutation, resendMutation } =
    useTwoFactorMutations();
  const { isPending, errorMessage, isSessionLocked } = useTwoFactorState(
    verifyMutation,
    resendMutation,
    isRedirecting
  );

  const form = useForm<VerifyTwoFactorCodeInput>({
    resolver: zodResolver(verifyTwoFactorCodeSchema),
    defaultValues: { code: '' },
  });

  useTwoFactorAutoSubmit(
    urlParams.codeFromQuery,
    sessionId,
    form,
    verifyMutation,
    isRedirecting
  );

  useEffect(() => {
    if (!sessionId) {
      router.replace(routes.auth.login.url);
    }
  }, [sessionId, router]);

  const onSubmit = (values: VerifyTwoFactorCodeInput) => {
    if (!sessionId) {
      return;
    }

    verifyMutation.mutate({ sessionId, code: values.code });
  };

  const handleResend = () => {
    if (!sessionId) {
      return;
    }

    form.reset();
    resendMutation.mutate({ sessionId });
  };

  if (!sessionId) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">
                {AUTH_LABELS.verify2faTitle}
              </h1>
              <p className="text-muted-foreground text-balance">
                {AUTH_LABELS.verify2faSubtitle}
              </p>
              {urlParams.email && (
                <p className="text-muted-foreground text-sm">
                  {urlParams.codeSentPrefix}
                  <span className="font-medium">{urlParams.email}</span>
                  {urlParams.codeSentSuffix
                    ? ` ${urlParams.codeSentSuffix}`
                    : ''}
                </p>
              )}
            </div>

            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="sr-only">
                    {AUTH_LABELS.otpLabel}
                  </FieldLabel>
                  <InputOTP
                    {...field}
                    id={field.name}
                    maxLength={6}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending || isSessionLocked}
                    containerClassName="gap-4 flex justify-center"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <FieldDescription className="text-center">
                    {AUTH_LABELS.verify2faDescription}
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field>
              {errorMessage && <FormError message={errorMessage} />}

              {isSessionLocked ? (
                <Button
                  type="button"
                  onClick={() => {
                    router.replace(routes.auth.login.url);
                  }}
                  className="w-full"
                >
                  {AUTH_LABELS.backToLoginButton}
                </Button>
              ) : (
                <LoadingButton
                  type="submit"
                  loading={isPending}
                  className="w-full"
                >
                  {AUTH_LABELS.verifyButton}
                </LoadingButton>
              )}

              <Button
                type="button"
                variant="link"
                onClick={handleResend}
                disabled={
                  isPending || resendMutation.isPending || isSessionLocked
                }
                className="w-full"
              >
                {AUTH_LABELS.resendCodeButton}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
