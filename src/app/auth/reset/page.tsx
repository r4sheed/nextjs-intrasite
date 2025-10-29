import { AuthWrapper } from '@/features/auth/components/auth-wrapper';
import { ResetForm } from '@/features/auth/components/reset-form';

export default function ResetPasswordPage() {
  return (
    <div className="bg-muted flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <AuthWrapper
          image={{
            src: '/assets/svg/forgot-password-amico.svg',
            alt: 'Forgot Password Illustration',
          }}
        >
          <ResetForm />
        </AuthWrapper>
      </div>
    </div>
  );
}
