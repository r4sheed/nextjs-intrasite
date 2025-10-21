import { AuthWrapper } from '@/features/auth/components/auth-wrapper';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthWrapper
          image={{
            src: 'assets/svg/tablet-login-pana.svg',
            alt: 'Login Illustration',
          }}
        >
          <LoginForm />
        </AuthWrapper>
      </div>
    </div>
  );
}
