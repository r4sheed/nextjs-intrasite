import { AuthWrapper } from '@/features/auth/components/auth-wrapper';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

export default function VerifyEmailPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthWrapper
          image={{
            src: '/assets/svg/forgot-password-pana.svg',
            alt: 'Forgot Password Illustration',
          }}
        >
          <ResetPasswordForm />
        </AuthWrapper>
      </div>
    </div>
  );
}
