'use client';

import { useState, useEffect, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

import { useRouter, useSearchParams } from 'next/navigation';

import { middlewareConfig } from '@/lib/config';
import { routes } from '@/lib/navigation';
import { type ActionSuccess, type ErrorResponse } from '@/lib/response';

import { execute } from '@/hooks/use-action';

import { FormError } from '@/components/shared/form-status';
import { LoadingButton } from '@/components/shared/loading-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

import {
  resendTwoFactor,
  verify2fa,
  verifyTwoFactor,
  type ResendTwoFactorInput,
  type VerifyTwoFactorInput,
} from '@/features/auth/actions';
import { AUTH_CODES, AUTH_LABELS } from '@/features/auth/lib/strings';
import {
  type VerifyTwoFactorCodeInput,
  verifyTwoFactorCodeSchema,
} from '@/features/auth/schemas';

const FATAL_VERIFY_ERROR_CODES = new Set<string>([
  AUTH_CODES.twoFactorSessionMissing,
  AUTH_CODES.twoFactorMaxAttempts,
  AUTH_CODES.twoFactorCodeExpired,
]);

export const TwoFactorVerificationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() =>
    searchParams.get('sessionId')
  );
  const lastAutoSubmitCode = useRef<string | null>(null);

  // Get userId and email from query params (passed from login)
  const email = searchParams.get('email'); // masked email
  const [codeSentPrefix, codeSentSuffix = ''] =
    AUTH_LABELS.verify2faCodeSent.split('{email}');
  const codeFromQuery = searchParams.get('code');

  useEffect(() => {
    const latestSessionId = searchParams.get('sessionId');
    if (latestSessionId !== sessionId) {
      setSessionId(latestSessionId);
    }
  }, [searchParams, sessionId]);

  const form = useForm<VerifyTwoFactorCodeInput>({
    resolver: zodResolver(verifyTwoFactorCodeSchema),
    defaultValues: { code: '' },
  });

  // Verify mutation
  const verifyMutation = useMutation<
    ActionSuccess<typeof verifyTwoFactor>,
    ErrorResponse,
    VerifyTwoFactorInput
  >({
    mutationFn: data => execute(verifyTwoFactor, data),
    onSuccess: async data => {
      if (!data.data) {
        console.error('[2FA] No data in verification response');
        return;
      }

      setIsRedirecting(true);

      try {
        // Call server action to complete sign-in (can't call signIn directly - uses Prisma)
        await verify2fa({
          email: data.data.email,
          userId: data.data.userId,
        });

        // Force page refresh to update session
        window.location.href = middlewareConfig.defaultLoginRedirect;
      } catch (error) {
        console.error('[2FA] Sign-in failed:', error);
        setIsRedirecting(false);
      }
    },
  });

  const isVerifyPending = verifyMutation.isPending;
  const verifyError = verifyMutation.error;
  const triggerVerify = verifyMutation.mutate;
  const resetVerify = verifyMutation.reset;

  useEffect(() => {
    lastAutoSubmitCode.current = null;
    resetVerify();
  }, [sessionId, resetVerify]);

  useEffect(() => {
    if (!codeFromQuery || !sessionId) {
      return;
    }

    if (!/^\d{6}$/.test(codeFromQuery)) {
      return;
    }

    if (lastAutoSubmitCode.current === codeFromQuery) {
      return;
    }

    void (async () => {
      const currentCode = form.getValues('code');
      if (currentCode !== codeFromQuery) {
        form.setValue('code', codeFromQuery, { shouldValidate: true });
      }

      const isValid = await form.trigger('code');
      if (!isValid) {
        return;
      }

      if (isVerifyPending || isRedirecting) {
        return;
      }

      lastAutoSubmitCode.current = codeFromQuery;
      triggerVerify({ sessionId, code: codeFromQuery });
    })();
  }, [
    codeFromQuery,
    form,
    sessionId,
    triggerVerify,
    isVerifyPending,
    isRedirecting,
  ]);

  // Resend mutation
  const resendMutation = useMutation<
    ActionSuccess<typeof resendTwoFactor>,
    ErrorResponse,
    ResendTwoFactorInput
  >({
    mutationFn: data => execute(resendTwoFactor, data),
    onSuccess: result => {
      const nextSessionId = result.data?.sessionId;
      if (!nextSessionId) {
        return;
      }

      setSessionId(nextSessionId);

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

  // Redirect if no userId
  useEffect(() => {
    if (!sessionId) {
      router.replace(routes.auth.login.url);
    }
  }, [sessionId, router]);

  const onSubmit = (values: VerifyTwoFactorCodeInput) => {
    if (!sessionId) return;
    triggerVerify({ sessionId, code: values.code });
  };

  const handleResend = () => {
    if (!sessionId) return;
    form.reset(); // Clear the form
    resendMutation.mutate({ sessionId });
  };

  const isPending = isVerifyPending || isRedirecting;

  // Only show error messages, not success messages (we redirect immediately)
  const errorMessage =
    verifyError?.message?.key || resendMutation.error?.message?.key;

  const isSessionLocked = verifyError
    ? FATAL_VERIFY_ERROR_CODES.has(verifyError.code)
    : false;

  if (!sessionId) {
    return null; // Redirecting
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
              {email && (
                <p className="text-muted-foreground text-sm">
                  {codeSentPrefix}
                  <span className="font-medium">{email}</span>
                  {codeSentSuffix ? ` ${codeSentSuffix}` : ''}
                </p>
              )}
            </div>

            <Controller
              name="code"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="code" className="sr-only">
                    {AUTH_LABELS.otpLabel}
                  </FieldLabel>
                  <InputOTP
                    {...field}
                    maxLength={6}
                    id="code"
                    disabled={isPending || isSessionLocked}
                    containerClassName="gap-4 flex justify-center"
                  >
                    <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                      {[0, 1, 2, 3, 4, 5].map(index => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  <FieldDescription className="text-center">
                    {AUTH_LABELS.verify2faDescription}
                  </FieldDescription>
                </Field>
              )}
            />

            <Field>
              {errorMessage && <FormError message={errorMessage} />}

              <LoadingButton
                type="submit"
                loading={isPending}
                disabled={isSessionLocked}
                className="w-full"
              >
                {AUTH_LABELS.verifyButton}
              </LoadingButton>

              <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                disabled={
                  isPending || resendMutation.isPending || isSessionLocked
                }
                className="w-full"
              >
                {AUTH_LABELS.resendCodeButton}
              </Button>

              <Button
                type="button"
                variant="link"
                onClick={() => router.push(routes.auth.login.url)}
                className="w-full"
              >
                {AUTH_LABELS.backToLoginButton}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
