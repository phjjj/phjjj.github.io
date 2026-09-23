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
      const slug = f.slice(0, -3).normalize("NFC");
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      return {
        id: slug,
        slug,
        title: data.title,
        excerpt: data.excerpt ?? "",
        content,
        image_url: data.image_url ?? "",
        tags: data.tags ?? [],
        created_at: new Date(data.created_at).toISOString(),
        published: data.published !== false,
      };
    })
    .filter((p) => p.published)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getPostBySlug(slug: string, dir: string = POSTS_DIR): Post | null {
  const target = slug.normalize("NFC");
  return getPosts(dir).find((p) => p.slug === target) ?? null;
}
