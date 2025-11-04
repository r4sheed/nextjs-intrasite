'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

export function MainNav({
  items,
  className,
  ...props
}: React.ComponentProps<'nav'> & {
  items: ReadonlyArray<{ href: string; label: string }>;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn('items-center', className)} {...props}>
      {items.map(item => (
        <Button key={item.href} variant="ghost" asChild size="sm">
          <Link
            href={item.href}
            className={cn(pathname === item.href && 'text-primary')}
          >
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
