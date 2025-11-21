import { loader } from 'fumadocs-core/source';
import { docs, news } from 'fumadocs-mdx:collections/server';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

export const newsSource = loader({
  baseUrl: '/news',
  source: news.toFumadocsSource(),
});
