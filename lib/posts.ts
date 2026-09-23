import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Post } from "@/types/post";

const POSTS_DIR = path.join(process.cwd(), "posts");

export function getPosts(dir: string = POSTS_DIR): Post[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f): Post => {
      try {
        const slug = f.slice(0, -3).normalize("NFC");
        let data: Record<string, unknown>;
        let content: string;

        try {
          const result = matter(fs.readFileSync(path.join(dir, f), "utf8"));
          data = result.data as Record<string, unknown>;
          content = result.content;
        } catch (cause) {
          throw new Error(`posts/${f}: ${(cause as Error).message}`, { cause });
        }

        if (typeof data.title !== "string") {
          throw new Error(`posts/${f}: title 누락`);
        }

        const date = new Date(data.created_at as string);
        if (Number.isNaN(date.getTime())) {
          throw new Error(`posts/${f}: created_at 누락 또는 잘못됨`);
        }

        return {
          id: slug,
          slug,
          title: data.title,
          excerpt: (data.excerpt as string) ?? "",
          content,
          image_url: (data.image_url as string) ?? "",
          tags: (data.tags as unknown[]) ?? [],
          created_at: date.toISOString(),
          published: data.published !== false,
        };
      } catch (cause) {
        if (cause instanceof Error && cause.message.startsWith("posts/")) {
          throw cause;
        }
        throw new Error(`posts/${f}: ${(cause as Error).message}`, { cause });
      }
    })
    .filter((p) => p.published)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getPostBySlug(slug: string, dir: string = POSTS_DIR): Post | null {
  const target = slug.normalize("NFC");
  return getPosts(dir).find((p) => p.slug === target) ?? null;
}
