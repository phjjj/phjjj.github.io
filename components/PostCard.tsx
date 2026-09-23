import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/types/post";
import { resolveThumbnail } from "@/lib/postUtils";

interface PostCardProps {
  post: Post;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}`;
}

export default function PostCard({ post }: PostCardProps) {
  const thumbnail = resolveThumbnail(post.image_url, post.content);

  return (
    <Link href={`/post/${post.slug}`} scroll={false}>
      <article className="group px-5 flex flex-row justify-between items-center py-6 gap-6 hover:bg-black/4 transition-colors cursor-pointer mb-2">
        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-crimson tracking-[0.12em] mb-1">
            {post.tags.map((t) => t.toUpperCase()).join(" · ")}
          </div>
          <div className="inline-flex items-start gap-2 group-hover:gap-3 transition-all mb-2">
            <h2 className="text-xl md:text-2xl font-bold text-muted break-keep">{post.title}</h2>
          </div>

          <p className="text-subtle text-sm leading-relaxed break-keep line-clamp-2">{post.excerpt}</p>

          <div className="flex items-center gap-3 mt-2">
            <time className="text-xs text-subtle">{formatDate(post.created_at)}</time>
          </div>
        </div>

        {/* Square Thumbnail — fixed 80×80, same on all screens */}
        {thumbnail && (
          <div className="shrink-0 w-20 h-20 overflow-hidden bg-paper relative group-hover:opacity-80 transition-opacity">
            <Image
              src={thumbnail}
              alt={post.title}
              fill
              sizes="5rem"
              className="object-contain grayscale-40 contrast-[0.9]"
            />
          </div>
        )}
      </article>
    </Link>
  );
}
