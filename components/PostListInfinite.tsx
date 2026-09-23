"use client";

import { useState, useEffect, useRef } from "react";
import PostCard from "./PostCard";
import type { Post } from "@/types/post";

const PAGE_SIZE = 10;

interface PostListInfiniteProps {
  posts: Post[];
}

export default function PostListInfinite({ posts }: PostListInfiniteProps) {
  const [count, setCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = count < posts.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    // count가 바뀔 때마다 새 observer → sentinel이 아직 보이면 즉시 다음 묶음 표시
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setCount((c) => c + PAGE_SIZE);
      },
      { rootMargin: "200px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [count, hasMore]);

  if (posts.length === 0) {
    return (
      <div className="py-24 text-center text-subtle text-sm tracking-widest">
        아직 게시글이 없어요.
      </div>
    );
  }

  return (
    <>
      {posts.slice(0, count).map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <div ref={sentinelRef} className="h-4" aria-hidden />
    </>
  );
}
