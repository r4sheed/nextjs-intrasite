import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { z } from 'zod';
// import rehypePrettyCode from "rehype-pretty-code"

// import { transformers } from "@/lib/highlight-code"

export default defineConfig({
  mdxOptions: {
    // rehypePlugins: (plugins) => {
    //   plugins.shift()
    //   plugins.push([
    //     rehypePrettyCode as any,
    //     {
    //       theme: {
    //         dark: "github-dark",
    //         light: "github-light-default",
    //       },
    //       transformers,
    //     },
    //   ])
    //   return plugins
    // },
  },
});

export const docs = defineDocs({
  dir: 'content/docs',
  // TODO: Fix this when we upgrade to zod v4.
  // docs: {
  //   schema: frontmatterSchema.extend({
  //     links: z.optional(
  //       z.object({
  //         doc: z.string().optional(),
  //         api: z.string().optional(),
  //       })
  //     ),
  //   }),
  // },
});

export const news = defineDocs({
  dir: 'content/news',
  docs: {
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      summary: z.string().optional(),
      image: z.string().optional(),
      date: z.string().optional(),
      author: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
  },
});
