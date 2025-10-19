'use client';

import { useRouter } from 'next/navigation';

import { ROUTES } from '@/lib/navigation';

type LoginButtonMode = 'modal' | 'redirect';

interface LoginButtonProps {
  children: React.ReactNode;
  mode?: LoginButtonMode;
  asChild?: boolean;
}

export const LoginButton = ({
  children,
  mode = 'redirect',
  asChild,
}: LoginButtonProps) => {
  const router = useRouter();

  const onClick = () => {
    router.push(ROUTES.AUTH.LOGIN);
  };

  // TODO: Implement modal
  if (mode === 'modal') {
  }

  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
};
