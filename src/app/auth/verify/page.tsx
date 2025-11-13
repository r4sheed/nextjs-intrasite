import { VerificationRouter } from '@/features/auth/components/verification-router';

export default function VerifyPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <VerificationRouter />
      </div>
    </div>
  );
}
