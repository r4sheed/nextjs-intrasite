'use client';

import { useEffect } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { CircleCheckBig, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { verifyEmail } from '@/features/auth/actions/email-verify';
import { Header } from '@/features/auth/components/header';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_UI_MESSAGES,
} from '@/features/auth/lib/messages';
import { useAction } from '@/hooks/use-action';
import { ROUTES } from '@/lib/navigation';

const VerificationResult = ({
  icon: Icon,
  title,
  message,
  success,
}: {
  icon: React.ElementType;
  title: string;
  message: string;
  success: boolean;
}) => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <Icon className="size-10" />
      </EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{message}</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <div className="flex gap-2">
        <Button asChild>
          <Link href={ROUTES.AUTH.LOGIN}>
            {AUTH_UI_MESSAGES.BACK_TO_LOGIN_BUTTON}
          </Link>
        </Button>
      </div>
    </EmptyContent>
  </Empty>
);

const VerificationSuccess = ({ message }: { message: string }) => (
  <VerificationResult
    icon={CircleCheckBig}
    title={AUTH_UI_MESSAGES.VERIFICATION_SUCCESS_TITLE}
    message={message}
    success={true}
  />
);

const VerificationError = ({ message }: { message: string }) => (
  <VerificationResult
    icon={TriangleAlert}
    title={AUTH_UI_MESSAGES.VERIFICATION_FAILED_TITLE}
    message={message}
    success={false}
  />
);

const VerificationLoading = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="default">
        <Spinner className="size-10" />
      </EmptyMedia>
      <EmptyTitle>{AUTH_UI_MESSAGES.VERIFICATION_PROCESSING_TITLE}</EmptyTitle>
      <EmptyDescription>
        {AUTH_UI_MESSAGES.VERIFICATION_PROCESSING_DESCRIPTION}
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
);

const renderForm = (formContent: React.ReactNode) => (
  <div className="p-6 md:p-8">
    <Header
      title={AUTH_UI_MESSAGES.EMAIL_VERIFICATION_TITLE}
      description={AUTH_UI_MESSAGES.EMAIL_VERIFICATION_SUBTITLE}
    />
    {formContent}
  </div>
);

export const EmailVerificationForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { execute, message, isPending } = useAction();
  const { success, error } = message;

  useEffect(() => {
    if (!token || success || error || isPending) {
      return;
    }
    execute(() => verifyEmail(token));
  }, [token, execute, success, error]);

  let content;

  if (!token) {
    content = (
      <VerificationError message={AUTH_ERROR_MESSAGES.TOKEN_NOT_FOUND} />
    );
  } else if (success) {
    content = <VerificationSuccess message={success} />;
  } else if (error) {
    content = (
      <VerificationError
        message={error || AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR}
      />
    );
  } else {
    content = <VerificationLoading />;
  }

  return renderForm(content);
};
