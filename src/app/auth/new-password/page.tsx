import { AuthWrapper } from '@/features/auth/components/auth-wrapper';
import { NewPasswordForm } from '@/features/auth/components/new-password-form';

export default function NewPasswordPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthWrapper
          image={{
            src: '/assets/svg/forgot-password-pana.svg',
            alt: 'Update Password Illustration',
          }}
        >
          <NewPasswordForm />
        </AuthWrapper>
      </div>
    </div>
  );
}
