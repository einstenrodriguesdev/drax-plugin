import { getPublishedPosts, postPath } from "../lib/posts";
import { siteConfig } from "../site.config";

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export async function GET() {
  const posts = await getPublishedPosts();
  const items = posts
    .map((post) => {
      const url = new URL(postPath(post), siteConfig.url).toString();
      return [
        "<item>",
        `<title>${escapeXml(post.data.title)}</title>`,
        `<description>${escapeXml(post.data.description)}</description>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid>${escapeXml(url)}</guid>`,
        `<pubDate>${post.data.publishedAt.toUTCString()}</pubDate>`,
        "</item>",
      ].join("");
    })
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>${escapeXml(siteConfig.name)}</title><description>${escapeXml(siteConfig.description)}</description><link>${escapeXml(siteConfig.url)}</link>${items}</channel></rss>`;
  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
