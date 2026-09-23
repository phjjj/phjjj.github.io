"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import PostCard from "./PostCard";
import type { Post } from "@/types/post";
import type { TagCounts } from "@/lib/posts";

const PAGE_SIZE = 10;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}`;
}

interface Props {
  posts: Post[];
  counts: TagCounts;
  recentPosts: Post[];
}

export default function PostListWithFilter({ posts, counts, recentPosts }: Props) {
  const [activeTag, setActiveTag] = useState<string | undefined>();
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  // 정적 export라 searchParams 불가 → 마운트 후 URL의 ?tag= 반영 (HTML엔 전체 목록 유지)
  useEffect(() => {
    const tag = new URLSearchParams(window.location.search).get("tag");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 외부(URL) 상태 1회 동기화, SSR 값과 달라 초기값으로 못 씀
    if (tag) setActiveTag(tag);
  }, []);

  const filtered = useMemo(
    () => (activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts),
    [posts, activeTag],
  );

  function selectTag(tag: string | undefined) {
    setActiveTag(tag);
    setDisplayCount(PAGE_SIZE);
    window.history.replaceState(null, "", tag ? `/?tag=${encodeURIComponent(tag)}` : "/");
  }

  const visible = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  return (
    <>
      {/* Tag Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => selectTag(undefined)}
          className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors ${
            !activeTag
              ? "bg-crimson text-cream border-crimson"
              : "border-border text-subtle hover:text-crimson hover:border-crimson"
          }`}
        >
          전체 ({counts.total})
        </button>
        {Object.entries(counts.tags).map(([tag, count]) => (
          <button
            key={tag}
            onClick={() => selectTag(tag)}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors ${
              activeTag === tag
                ? "bg-crimson text-cream border-crimson"
                : "border-border text-subtle hover:text-crimson hover:border-crimson"
            }`}
          >
            {tag} ({count})
          </button>
        ))}
      </div>

      {/* Content + Sidebar */}
      <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-12">
        <section className="border-t min-w-0">
          {visible.length === 0 ? (
            <div className="py-24 text-center text-subtle text-sm tracking-widest">
              아직 게시글이 없어요.
            </div>
          ) : (
            <>
              {visible.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              {hasMore && (
                <button
                  onClick={() => setDisplayCount((c) => c + PAGE_SIZE)}
                  className="w-full py-6 text-xs text-subtle tracking-widest hover:text-crimson transition-colors"
                >
                  더 보기
                </button>
              )}
            </>
          )}
        </section>

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-8">
          <div>
            <h3 className="text-[11px] font-bold text-crimson tracking-[0.12em] mb-3">CATEGORY</h3>
            {Object.entries(counts.tags).map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => selectTag(tag)}
                className="w-full flex justify-between items-center text-xs text-muted py-1.5 border-b border-border/60 hover:text-crimson transition-colors"
              >
                <span>{tag}</span>
                <span className="text-subtle">{count}</span>
              </button>
            ))}
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-crimson tracking-[0.12em] mb-3">RECENT</h3>
            {recentPosts.map((p) => (
              <Link key={p.id} href={`/post/${p.slug}`} className="block mb-2.5 group">
                <div className="text-xs text-muted leading-snug break-keep group-hover:text-crimson transition-colors line-clamp-2">
                  {p.title}
                </div>
                <div className="text-[10px] text-subtle mt-0.5">{formatDate(p.created_at)}</div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
