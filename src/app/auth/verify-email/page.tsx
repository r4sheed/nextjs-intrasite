import { AuthWrapper } from '@/features/auth/components/auth-wrapper';
import { EmailVerificationForm } from '@/features/auth/components/verification-form';

export default function VerifyEmailPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthWrapper
          image={{
            src: '/assets/svg/two-factor-authentication-pana.svg',
            alt: 'Verification Illustration',
          }}
        >
          <EmailVerificationForm />
        </AuthWrapper>
      </div>
    </div>
  );
}
