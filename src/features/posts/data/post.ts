import { newsSource } from '@/lib/source';

export const getAllPosts = (): Array<{
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
