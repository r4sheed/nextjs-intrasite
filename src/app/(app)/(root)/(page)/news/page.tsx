import { Calendar, Newspaper, UserCircle2 } from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';

import { newsSource } from '@/lib/source';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const revalidate = false;
export const dynamic = 'force-static';

const GRADIENT_PALETTES: string[] = [
  'from-sky-100 to-indigo-200',
  'from-cyan-50 to-teal-100',
  'from-blue-50 to-purple-100',
  'from-emerald-100 to-teal-100',
  'from-sky-50 to-blue-100',
  'from-yellow-100 to-orange-200',
  'from-amber-50 to-red-100',
  'from-lime-50 to-green-100',
  'from-rose-50 to-pink-100',
] as const;

// Determines a specific gradient class based on a unique string (URL).
const getGradientClasses = (url: string): string => {
  // Use a simple hash function (sum of character codes) to get a deterministic number
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash += url.charCodeAt(i);
  }

  // Choose a palette based on the hash remainder
  const paletteIndex = hash % GRADIENT_PALETTES.length;
  const gradientClass = GRADIENT_PALETTES[paletteIndex];

  // Apply diagonal gradient direction
  return `bg-gradient-to-br ${gradientClass}`;
};

// Displays a formatted publication date in a badge with a calendar icon.
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

// Displays up to 3 tags as outline badges with flexible wrapping.
const PostTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-wrap gap-2 pt-2">
    {tags.slice(0, 3).map(tag => (
      <Badge key={tag} variant="outline" className="text-xs">
        {tag}
      </Badge>
    ))}
  </div>
);

// Helper function to get all news posts
const getAllNewsPosts = (): Array<{
  url: string;
  title: string;
  description?: string;
  summary?: string;
  image?: string;
  date?: string;
  author?: string;
  tags?: string[];
}> => {
  const params = newsSource.generateParams();
  const posts: Array<{
    url: string;
    title: string;
    description?: string;
    summary?: string;
    image?: string;
    date?: string;
    author?: string;
    tags?: string[];
  }> = [];

  for (const param of params) {
    const page = newsSource.getPage(param.slug);
    if (page && page.url !== '/news') {
      // Exclude the index page
      posts.push({
        url: page.url,
        title: page.data.title,
        description: page.data.description,
        summary: page.data.summary,
        image: page.data.image,
        date: page.data.date,
        author: page.data.author,
        tags: page.data.tags,
      });
    }
  }

  return posts.sort((a, b) => b.url.localeCompare(a.url)); // Sort by URL descending (newest first)
};

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

      <CardFooter className="flex items-center justify-between gap-4 pt-0">
        {author ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <UserCircle2 className="h-4 w-4" />
            <span className="truncate">{author}</span>
          </div>
        ) : (
          <div />
        )}

        <Button variant="ghost" size="sm" asChild>
          <Link href={url}>Read more</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function NewsPage() {
  const allPosts = getAllNewsPosts();

  return (
    <div className="flex items-stretch text-[1.05rem] sm:text-[15px] xl:w-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="mx-auto flex w-full max-w-4xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300">
          {/* Header Section */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight sm:text-3xl xl:text-4xl">
                  News
                </h1>
                <div className="docs-nav bg-background/80 border-border/50 fixed inset-x-0 bottom-0 isolate z-50 flex items-center gap-2 border-t px-6 py-4 backdrop-blur-sm sm:static sm:z-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:pt-1.5 sm:backdrop-blur-none" />
              </div>
              <p className="text-muted-foreground text-[1.05rem] text-balance sm:text-base">
                Latest news and updates
              </p>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0">
            <div className="space-y-6">
              {allPosts.length === 0 ? (
                <p className="text-muted-foreground">No news posts yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {allPosts.map(post => (
                    <PostPreviewCard
                      key={post.url}
                      url={post.url}
                      title={post.title}
                      description={post.description}
                      summary={post.summary}
                      image={post.image}
                      date={post.date}
                      author={post.author}
                      tags={post.tags}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[calc(100svh-var(--footer-height)+2rem)] w-72 flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="no-scrollbar overflow-y-auto px-8">
          <div className="h-12" />
        </div>
        <div className="flex flex-1 flex-col gap-12 px-6"></div>
      </div>
    </div>
  );
}
