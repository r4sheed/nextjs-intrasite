import { AuthWrapper } from '@/features/auth/components/auth-wrapper';
import { RegisterForm } from '@/features/auth/components/register-form';

export default function RegisterPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthWrapper
          image={{
            src: 'assets/svg/sign-up-pana.svg',
            alt: 'Register Illustration',
          }}
        >
          <RegisterForm />
        </AuthWrapper>
      </div>
    </div>
  );
}
