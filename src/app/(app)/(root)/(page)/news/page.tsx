import Image from 'next/image';
import Link from 'next/link';

import { newsSource } from '@/lib/source';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const revalidate = false;
export const dynamic = 'force-static';

// Helper function to get all news posts
function getAllNewsPosts(): Array<{
  url: string;
  title: string;
  description?: string;
  image?: string;
}> {
  const params = newsSource.generateParams();
  const posts: Array<{
    url: string;
    title: string;
    description?: string;
    image?: string;
  }> = [];

  for (const param of params) {
    const page = newsSource.getPage(param.slug);
    if (page && page.url !== '/news') {
      // Exclude the index page
      posts.push({
        url: page.url,
        title: page.data.title || 'Untitled',
        description: page.data.description,
        image: page.data.image,
      });
    }
  }

  return posts.sort((a, b) => b.url.localeCompare(a.url)); // Sort by URL descending (newest first)
}

const PostPrewviewCard = ({
  url,
  title,
  description,
  image,
}: {
  url: string;
  title: string;
  description?: string;
  image?: string;
}) => {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      {image && (
        <CardContent>
          <Image
            src={image}
            alt={title}
            width={400}
            height={200}
            className="h-48 w-full rounded-lg object-cover"
          />
        </CardContent>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardFooter>
        <CardAction>
          <Link href={url}>
            <Button variant="link" size="sm">
              Read more
            </Button>
          </Link>
        </CardAction>
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
        <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300">
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
          <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0">
            <div className="space-y-6">
              {allPosts.length === 0 ? (
                <p className="text-muted-foreground">No news posts yet.</p>
              ) : (
                allPosts.map(post => (
                  <article
                    key={post.url}
                    className="border-border border-b pb-6 last:border-b-0"
                  >
                    <PostPrewviewCard
                      url={post.url}
                      title={post.title}
                      description={post.description}
                      image={post.image}
                    />
                  </article>
                ))
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
