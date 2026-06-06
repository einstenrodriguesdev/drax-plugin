import { getCollection, type CollectionEntry } from "astro:content";
import { siteConfig } from "../site.config";

export type BlogPost = CollectionEntry<"posts">;

export function postSlug(post: BlogPost): string {
  return post.id.replace(/\.(md|mdx)$/i, "").split("/").filter(Boolean).join("/");
}

export function postPath(post: BlogPost): string {
  const basePath = siteConfig.basePath === "/" ? "" : siteConfig.basePath.replace(/\/$/, "");
  return `${basePath}/${postSlug(post)}/`;
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const now = new Date();
  const posts = await getCollection("posts", ({ data }) => !data.draft && data.publishedAt <= now);
  return posts.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}
