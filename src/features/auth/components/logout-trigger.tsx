'use client';

import { logoutUser } from '@/features/auth/actions/logout-user';

interface LogoutTriggerProps {
  children?: React.ReactNode;
}

const LogoutTrigger = ({ children }: LogoutTriggerProps) => {
  const handleLogout = () => {
    logoutUser();
  };

  return (
    <span onClick={handleLogout} className="cursor-pointer">
      {children}
    </span>
  );
};

export { LogoutTrigger };
