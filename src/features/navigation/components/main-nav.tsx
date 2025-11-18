'use client';

import { useTranslations } from 'next-intl';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { useNavigationItems } from '@/features/navigation/hooks/use-navigation-items';

const MainNav = ({ className, ...props }: React.ComponentProps<'nav'>) => {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const items = useNavigationItems();

  return (
    <nav className={cn('items-center', className)} {...props}>
      {items.map(item => (
        <Button key={item.href} variant="ghost" asChild size="sm">
          <Link
            href={item.href}
            className={cn(pathname === item.href && 'text-primary')}
          >
            {t(item.title)}
          </Link>
        </Button>
      ))}
    </nav>
  );
};

export { MainNav };
