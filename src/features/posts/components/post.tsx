'use client';

import { Calendar, Newspaper, UserCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { POSTS_LABELS } from '@/features/posts/lib/strings';
import { getGradientClasses } from '@/features/posts/lib/utils';

const PostDate = ({ date }: { date: string }) => (
  <Badge variant="secondary" className="flex items-center gap-1.5 shadow-sm">
    <Calendar className="h-3 w-3" />
    <time className="text-xs">
      {new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}
    </time>
  </Badge>
);

const PostTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-wrap gap-2 pt-2">
    {tags.slice(0, 2).map(tag => (
      <Badge key={tag} variant="outline" className="text-xs">
        {tag}
      </Badge>
    ))}
  </div>
);

const PostPreviewCard = ({
  url,
  title,
  description,
  summary,
  image,
  date,
  author,
  tags,
}: {
  url: string;
  title: string;
  description?: string;
  summary?: string;
  image?: string;
  date?: string;
  author?: string;
  tags?: string[];
}) => {
  const displayText = summary || description;

  const gradientClasses = getGradientClasses(url);

  const t = useTranslations('posts');
  return (
    <Card className="flex h-full flex-col overflow-hidden pt-0">
      <Link href={url} className="group block">
        <div className="bg-muted relative aspect-video w-full overflow-hidden">
          {image ? (
            <Image
              src={image || '/placeholders/image.svg'}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center ${gradientClasses}`}
            >
              <span className="text-muted-foreground/20 text-4xl">
                <Newspaper className="size-8" />
              </span>
            </div>
          )}
          {date && (
            <div className="absolute top-3 right-3">
              <PostDate date={date} />
            </div>
          )}
        </div>
      </Link>

      <CardHeader className="flex-1">
        <Link href={url} className="group">
          <CardTitle className="group-hover:text-primary line-clamp-2 leading-normal transition-colors">
            {title}
          </CardTitle>
        </Link>
        {displayText && (
          <CardDescription className="line-clamp-3">
            {displayText}
          </CardDescription>
        )}
        {tags && tags.length > 0 && <PostTags tags={tags} />}
      </CardHeader>

      <CardFooter className="flex items-center justify-between gap-4">
        {author ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <UserCircle2 className="size-4" />
            <span className="truncate">{author}</span>
          </div>
        ) : (
          <div />
        )}

        <Button variant="ghost" size="sm" asChild>
          <Link href={url}>{t(POSTS_LABELS.readMoreButton)}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { PostPreviewCard };
