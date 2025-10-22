import Image, { ImageProps, StaticImageData } from 'next/image';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AuthWrapperProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
  image?: {
    src: string | StaticImageData;
    alt: string;
  } & Omit<ImageProps, 'src' | 'alt' | 'className' | 'fill'>;
}

export const AuthWrapper = ({
  className,
  children,
  image,
  ...props
}: AuthWrapperProps) => {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {children}
          <div className="bg-muted relative hidden md:block">
            {image && (
              <Image
                {...image}
                src={image.src}
                alt={image.alt}
                className="inset-0 h-full w-full object-contain dark:brightness-[0.4] dark:grayscale-50"
                width={image.height || 500}
                height={image.width || 500}
                priority
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
