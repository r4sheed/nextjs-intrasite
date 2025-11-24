import { getTranslations } from 'next-intl/server';

import { OpenInV0Cta } from '@/components/open-in-v0-cta';

import { PostPreviewCard } from '@/features/posts/components/post';
import { getAllPosts } from '@/features/posts/data/post';
import { POSTS_LABELS } from '@/features/posts/lib/strings';
export const revalidate = false;
export const dynamic = 'force-static';
export const dynamicParams = false;

export default async function PostsPage() {
  const t = await getTranslations('posts');

  const data = getAllPosts();
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
                  {t(POSTS_LABELS.pageTitle)}
                </h1>
                <div className="docs-nav bg-background/80 border-border/50 fixed inset-x-0 bottom-0 isolate z-50 flex items-center gap-2 border-t px-6 py-4 backdrop-blur-sm sm:static sm:z-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:pt-1.5 sm:backdrop-blur-none" />
              </div>
              <p className="text-muted-foreground text-[1.05rem] text-balance sm:text-base">
                {t(POSTS_LABELS.pageDescription)}
              </p>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0">
            <div className="space-y-6">
              {data.length === 0 ? (
                <p className="text-muted-foreground">
                  {POSTS_LABELS.noPostsLabel}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {data.map(post => (
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
        <div className="flex flex-1 flex-col gap-12 px-6">
          <OpenInV0Cta />
        </div>
      </div>
    </div>
  );
}
