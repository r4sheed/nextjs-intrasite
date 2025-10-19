import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

interface LinkUnderlineProps {
  className?: string;
  asChild?: boolean;
  children: React.ReactNode;
}

const LinkUnderline: React.FC<LinkUnderlineProps> = ({
  className,
  asChild = false,
  children,
}) => {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      className={cn(
        'hover:text-primary underline underline-offset-2',
        className
      )}
    >
      {children}
    </Comp>
  );
};

export { LinkUnderline };
