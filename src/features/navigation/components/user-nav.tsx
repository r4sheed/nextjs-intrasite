'use client';

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogIn,
  LogOut,
  Sparkles,
  User,
  UserPlus,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import Link from 'next/link';

import { routes } from '@/lib/routes';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import { NAVIGATION_LABELS } from '@/features/navigation/lib/strings';

/**
 * Generates 2-character initials from a user's name
 * @param name - The user's full name
 * @returns 2 uppercase characters for avatar fallback
 */
const generateInitials = (name: string | undefined | null): string => {
  if (!name || typeof name !== 'string') {
    return '??';
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return '??';
  }

  const words = trimmed.split(/\s+/).filter(word => word.length > 0);

  if (words.length === 0) {
    return '??';
  }

  if (words.length === 1) {
    // Single word: take first 2 characters
    const word = words[0];
    return word ? word.substring(0, 2).toUpperCase() : '??';
  }

  // Multiple words: take first character from first two words
  const first = words[0]?.[0] || '';
  const second = words[1]?.[0] || '';
  return (first + second).toUpperCase() || '??';
};

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * Avatar component for the user menu
 */
const UserAvatar = ({
  user,
  avatarFallback,
}: {
  user: User;
  avatarFallback: string;
}) => (
  <Avatar className="h-8 w-8 rounded-lg">
    <AvatarImage src={user.image ?? undefined} alt={user.name ?? undefined} />
    <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
  </Avatar>
);

/**
 * Dropdown content component based on user authentication status
 */
const UserDropdownContent = ({
  user,
  isGuest,
}: {
  user: User;
  isGuest: boolean;
}) => {
  const { isMobile } = useSidebar();
  const t = useTranslations('navigation');

  return (
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      side={isMobile ? 'bottom' : 'right'}
      align="end"
      sideOffset={4}
    >
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserAvatar
            user={user}
            avatarFallback={generateInitials(user.name)}
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      {isGuest ? (
        <DropdownMenuGroup>
          <Link href={routes.auth.login.url}>
            <DropdownMenuItem>
              <LogIn />
              {t(NAVIGATION_LABELS.loginTitle)}
            </DropdownMenuItem>
          </Link>
          <Link href={routes.auth.signUp.url}>
            <DropdownMenuItem>
              <UserPlus />
              {t(NAVIGATION_LABELS.signUpTitle)}
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
      ) : (
        <>
          <DropdownMenuGroup>
            <Link href={routes.settings.url}>
              <DropdownMenuItem>
                <BadgeCheck />
                {t(NAVIGATION_LABELS.accountTitle)}
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href={routes.auth.logout.url}>
              <DropdownMenuItem>
                <LogOut />
                {t(NAVIGATION_LABELS.logoutTitle)}
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
        </>
      )}
    </DropdownMenuContent>
  );
};

/**
 * User navigation component that renders based on the provided user data.
 * If no user is provided, renders a guest menu with login/signup options.
 */
const UserNav = ({ user }: { user: User | null | undefined }) => {
  const displayUser = user || {
    name: 'Guest', // TODO: i18n
    email: null,
    image: '/assets/avatars/guest.png', // TODO: move to constants
  };
  const isGuest = !user;

  const avatarFallback = generateInitials(displayUser.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar user={displayUser} avatarFallback={avatarFallback} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {displayUser.name}
                </span>
                <span className="truncate text-xs">{displayUser.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <UserDropdownContent user={displayUser} isGuest={isGuest} />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export { UserNav };
