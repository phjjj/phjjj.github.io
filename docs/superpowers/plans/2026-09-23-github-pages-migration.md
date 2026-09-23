# GitHub Pages 마이그레이션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supabase + Vercel 블로그를 Markdown 파일 + Next.js static export + GitHub Pages(`phjjj.github.io`)로 이전한다.

**Architecture:** 글은 `posts/<slug>.md`(frontmatter + 본문), 이미지는 `public/images/<slug>/`. `lib/posts.ts`가 빌드 시 fs로 읽고, `output: "export"`로 `out/`에 정적 HTML을 만든 뒤 GitHub Actions가 Pages에 배포한다. admin, API route, Supabase는 전부 삭제한다.

**Tech Stack:** Next.js 16.1.6 (App Router), React 19, TypeScript, gray-matter, tsx + `node:test`, GitHub Actions (`actions/deploy-pages`)

**Spec:** `docs/superpowers/specs/2026-09-23-github-pages-migration-design.md`

## Global Constraints

- 사이트 URL: `https://phjjj.github.io` (repo 이름 `phjjj.github.io`, basePath 없음)
- 새 런타임 의존성은 `gray-matter` 하나만 추가
- 기존 `Post` 타입(`types/post.ts`) 유지. `id`는 slug로 채움
- slug는 기존 DB 값 그대로 (한글·공백 포함). 파일명·비교 시 `normalize("NFC")`
- 기존 UI/디자인 변경 없음
- Node 22 (로컬 v22.13.1)
- 되돌릴 수 없는 작업(repo 이름 변경, Pages 설정, Vercel·Supabase 삭제)은 사용자가 직접 수행

## File Map

| 파일 | 작업 | 책임 |
|---|---|---|
| `lib/posts.ts` | Create | md 파일 읽기: `getPosts()`, `getPostBySlug()` |
| `lib/posts.test.ts` | Create | `lib/posts.ts` 검증 (`node:test`) |
| `lib/site.ts` | Create | `SITE_URL` 상수 |
| `scripts/export-from-supabase.ts` | Create → 실행 후 Delete | DB·Storage → md·이미지 1회 이전 |
| `scripts/check-out.sh` | Create | 빌드 결과 검사 (로컬·CI 공용) |
| `.github/workflows/deploy.yml` | Create | 빌드·검사·배포 |
| `posts/*.md`, `public/images/**` | Create (스크립트 생성) | 콘텐츠 |
| `app/page.tsx`, `app/post/[slug]/page.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx`, `app/icon.tsx` | Modify | 데이터 소스·URL 교체 |
| `components/PostListInfinite.tsx` | Modify | fetch → prop 슬라이싱 |
| `next.config.ts`, `package.json` | Modify | export 설정, 스크립트·의존성 |
| `app/admin/`, `app/api/`, `utils/`, `lib/mockData.ts`, `scripts/seed-posts.ts`, `scripts/add-january-retrospective.ts` | Delete | Supabase 전용 |

---

### Task 1: `lib/posts.ts` — Markdown 글 로더

**Files:**
- Create: `lib/posts.ts`
- Test: `lib/posts.test.ts`
- Modify: `package.json` (의존성 `gray-matter`, 스크립트 `test`)

**Interfaces:**
- Consumes: `Post` from `types/post.ts`
- Produces:
  - `getPosts(dir?: string): Post[]` — published만, `created_at` 내림차순
  - `getPostBySlug(slug: string, dir?: string): Post | null`
  - frontmatter 키: `title`, `excerpt`, `image_url`, `tags`, `created_at`, `published` (값은 JSON 형식 = 유효한 YAML)

- [ ] **Step 1: gray-matter 설치, test 스크립트 추가**

```bash
npm install gray-matter
npm pkg set scripts.test="tsx --test lib/*.test.ts"
```

- [ ] **Step 2: 실패하는 테스트 작성**

`lib/posts.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getPosts, getPostBySlug } from "./posts";

function makeDir(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "posts-"));
  for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), body);
  return dir;
}

const md = (fm: Record<string, unknown>, body: string) =>
  `---\n${Object.entries(fm).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("\n")}\n---\n\n${body}\n`;

const dir = makeDir({
  "old.md": md({ title: "Old: 콜론", excerpt: "e", image_url: "", tags: ["a"], created_at: "2025-01-01T00:00:00+00:00", published: true }, "# old"),
  "새 글.md": md({ title: "New", excerpt: "", image_url: "/images/x.png", tags: [], created_at: "2026-03-06T01:54:32.343853+00:00", published: true }, "본문"),
  "draft.md": md({ title: "Draft", created_at: "2026-05-01T00:00:00Z", published: false }, "x"),
  "notes.txt": "ignored",
});

test("published 글만 최신순으로 반환", () => {
  assert.deepEqual(getPosts(dir).map((p) => p.slug), ["새 글", "old"]);
});

test("frontmatter를 Post로 매핑", () => {
  const p = getPostBySlug("old", dir)!;
  assert.equal(p.id, "old");
  assert.equal(p.title, "Old: 콜론");
  assert.deepEqual(p.tags, ["a"]);
  assert.equal(p.created_at, "2025-01-01T00:00:00.000Z");
  assert.equal(p.content.trim(), "# old");
});

test("누락 필드 기본값, 초안은 slug로도 조회 불가", () => {
  assert.equal(getPostBySlug("draft", dir), null);
  const p = getPostBySlug("새 글", dir)!;
  assert.equal(p.image_url, "/images/x.png");
});

test("NFD slug도 NFC 파일과 매칭", () => {
  assert.equal(getPostBySlug("새 글".normalize("NFD"), dir)?.title, "New");
});
```

- [ ] **Step 3: 실패 확인**

Run: `npm test`
Expected: FAIL — `Cannot find module './posts'`

- [ ] **Step 4: 구현**

`lib/posts.ts`:

```ts
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
```

- [ ] **Step 5: 통과 확인**

Run: `npm test`
Expected: `# pass 4`, `# fail 0`

- [ ] **Step 6: Commit**

```bash
git add lib/posts.ts lib/posts.test.ts package.json package-lock.json
git commit -m "feat(posts): markdown 파일 기반 글 로더 추가"
```

---

### Task 2: Supabase 데이터 이전 (1회)

**Files:**
- Create: `scripts/export-from-supabase.ts` (실행 후 Task 3에서 삭제)
- Create (생성물): `posts/*.md` 15개, `public/images/<slug>/*` 24개

**Interfaces:**
- Consumes: `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; Task 1의 frontmatter 형식
- Produces: `getPosts()`가 읽을 `posts/<slug>.md`. 이미지 경로는 `/images/<encodeURIComponent(slug)>/<encodeURIComponent(파일명)>` (공백·한글이 markdown 링크를 깨지 않도록 인코딩)

- [ ] **Step 1: 스크립트 작성**

`scripts/export-from-supabase.ts`:

```ts
import fs from "node:fs";
import path from "node:path";

// ponytail: 1회용 이전 스크립트. 실행·커밋 후 삭제 (git 이력에 보존)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const STORAGE_RE = /https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/[^\s)"'<>]+/g;

interface Row {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  tags: string[] | null;
  created_at: string;
  published: boolean;
}

async function main() {
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 없음");

  const res = await fetch(`${url}/rest/v1/posts?select=*`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`posts 조회 실패: ${res.status}`);
  const rows: Row[] = await res.json();

  fs.mkdirSync("posts", { recursive: true });
  const sizes: [string, number][] = [];

  for (const row of rows) {
    const slug = row.slug.normalize("NFC");
    let content = row.content;
    let imageUrl = row.image_url ?? "";
    const srcs = new Set([...`${imageUrl}\n${content}`.matchAll(STORAGE_RE)].map((m) => m[0]));

    for (const src of srcs) {
      const name = decodeURIComponent(new URL(src).pathname.split("/").pop()!);
      const localPath = path.join("public/images", slug, name);
      const img = await fetch(src);
      if (!img.ok) throw new Error(`이미지 다운로드 실패 ${img.status}: ${src}`);
      const buf = Buffer.from(await img.arrayBuffer());
      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, buf);
      sizes.push([localPath, buf.length]);

      const publicPath = `/images/${encodeURIComponent(slug)}/${encodeURIComponent(name)}`;
      content = content.replaceAll(src, publicPath);
      imageUrl = imageUrl.replaceAll(src, publicPath);
    }

    const fm = {
      title: row.title,
      excerpt: row.excerpt ?? "",
      image_url: imageUrl,
      tags: row.tags ?? [],
      created_at: row.created_at,
      published: row.published,
    };
    const yaml = Object.entries(fm).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("\n");
    fs.writeFileSync(path.join("posts", `${slug}.md`), `---\n${yaml}\n---\n\n${content}\n`);
  }

  console.log(`글 ${rows.length}개, 이미지 ${sizes.length}개`);
  for (const [p, n] of sizes.sort((a, b) => b[1] - a[1])) console.log(`${(n / 1024).toFixed(0).padStart(6)}KB  ${p}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: 실행**

Run: `npx tsx --env-file=.env.local scripts/export-from-supabase.ts`
Expected: `글 15개, 이미지 24개` + 용량 내림차순 목록, exit 0.
(이미지 수가 24와 다르면 중복 URL 때문일 수 있음 — `public/images` 아래 파일이 모든 참조를 커버하는지 Step 3에서 확인)

- [ ] **Step 3: 결과 검증**

```bash
ls posts/*.md | wc -l
grep -rl "supabase.co" posts || echo "OK: supabase 참조 없음"
npm test
```
Expected: `15`, `OK: supabase 참조 없음`, 테스트 통과.

추가로 Node로 모든 글이 파싱되고 로컬 이미지 참조가 실제 파일을 가리키는지 확인:

```bash
npx tsx -e '
import fs from "node:fs";
import { getPosts } from "./lib/posts";
const posts = getPosts();
let missing = 0;
for (const p of posts) for (const m of `${p.image_url}\n${p.content}`.matchAll(/\/images\/[^\s)"'"'"'<>]+/g)) {
  const f = "public" + decodeURIComponent(m[0]);
  if (!fs.existsSync(f)) { console.log("MISSING", p.slug, f); missing++; }
}
console.log(posts.length, "posts, missing", missing);
'
```
Expected: `15 posts, missing 0`

- [ ] **Step 4: 대용량 이미지 압축**

Step 2 출력에서 500KB 초과 + GIF가 아닌 파일마다 (macOS 내장 `sips`):

```bash
sips -Z 1600 -s formatOptions 80 "public/images/<slug>/<file>"
```
Expected: 각 파일 500KB 근처 이하. GIF는 그대로 둠 (sips가 애니메이션을 깨뜨림).
확인: `find public/images -type f -size +500k`

- [ ] **Step 5: Commit**

```bash
git add posts public/images scripts/export-from-supabase.ts
git commit -m "feat(content): Supabase 글·이미지를 markdown 파일로 이전"
```

---

### Task 3: 정적 export 전환 + Supabase 제거

**Files:**
- Create: `lib/site.ts`
- Modify: `app/page.tsx`, `app/post/[slug]/page.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx`, `app/icon.tsx`, `components/PostListInfinite.tsx`, `next.config.ts`, `package.json`
- Delete: `app/admin/`, `app/api/`, `utils/`, `lib/mockData.ts`, `scripts/seed-posts.ts`, `scripts/add-january-retrospective.ts`, `scripts/export-from-supabase.ts`

**Interfaces:**
- Consumes: `getPosts()`, `getPostBySlug()` (Task 1), `posts/*.md` (Task 2)
- Produces: `SITE_URL: string` from `lib/site.ts`; `PostListInfinite` props `{ posts: Post[] }`; `npm run build` → `out/`

- [ ] **Step 1: `lib/site.ts` 생성**

```ts
export const SITE_URL = "https://phjjj.github.io";
```

- [ ] **Step 2: `next.config.ts` 교체**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // ponytail: GitHub Pages엔 이미지 최적화 서버 없음. 원본 전송, 큰 이미지는 이전 시 압축
  images: { unoptimized: true },
};

export default nextConfig;
```

- [ ] **Step 3: `components/PostListInfinite.tsx` 교체**

```tsx
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
```

- [ ] **Step 4: `app/page.tsx` 수정**

import와 데이터 로딩 부분만 교체 (JSX의 hero 헤더는 그대로):

```tsx
import Header from "@/components/Header";
import PostListInfinite from "@/components/PostListInfinite";
import { getPosts } from "@/lib/posts";
import { Github } from "lucide-react";

export default function HomePage() {
  // 목록엔 본문 불필요 → content 제거해 HTML 페이로드 축소
  const posts = getPosts().map((p) => ({ ...p, content: "" }));
```

`revalidate`, `PAGE_SIZE` 상수 삭제. 목록 부분:

```tsx
          <PostListInfinite posts={posts} />
```

- [ ] **Step 5: `app/post/[slug]/page.tsx` 수정**

- import 교체: `import { getPostBySlug, getPosts } from "@/utils/supabase";` → `import { getPostBySlug, getPosts } from "@/lib/posts";`
- `import { SITE_URL } from "@/lib/site";` 추가
- `export const revalidate = 60;` 삭제
- `const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://phj.dev";` 삭제, `${BASE_URL}` → `${SITE_URL}`
- `generateStaticParams`:

```ts
export async function generateStaticParams() {
  // 퍼센트 인코딩된 slug를 쓰면 정적 빌드 경로 길이가 수배로 늘어 ENAMETOOLONG이 납니다.
  return getPosts().map((post) => ({ slug: post.slug }));
}
```

- `await getPostBySlug(...)` 두 곳 → `getPostBySlug(...)` (동기 함수)

- [ ] **Step 6: `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx`, `app/icon.tsx`**

`app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const postEntries: MetadataRoute.Sitemap = getPosts().map((post) => ({
    url: `${SITE_URL}/post/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...postEntries,
  ];
}
```

`app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

`app/layout.tsx`: `const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://phj.dev";` 삭제, `import { SITE_URL } from "@/lib/site";` 추가, `BASE_URL` 2곳 → `SITE_URL`.

`app/icon.tsx`: `export const contentType = "image/png";` 아래에 추가:

```ts
export const dynamic = "force-static";
```

- [ ] **Step 7: Supabase 코드·의존성 삭제**

```bash
git rm -r app/admin app/api utils lib/mockData.ts scripts/seed-posts.ts scripts/add-january-retrospective.ts scripts/export-from-supabase.ts
npm uninstall @supabase/supabase-js dotenv
grep -rn "supabase\|mockData\|NEXT_PUBLIC_SITE_URL\|/api/" app components lib types next.config.ts || echo "OK: 참조 없음"
```
Expected: `OK: 참조 없음`

- [ ] **Step 8: 빌드·검증**

```bash
npm test && npm run lint && npm run build
ls out/post/*.html | wc -l
ls out/sitemap.xml out/robots.txt out/icon*
grep -c "phjjj.github.io" out/sitemap.xml
grep -rl "supabase.co" out || echo "OK"
```
Expected: 빌드 성공, `15`, 세 파일 존재, sitemap에 `16`(홈 + 글 15), `OK`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: static export 전환 및 Supabase·admin 제거"
```

---

### Task 4: 빌드 검사 스크립트 + 배포 workflow

**Files:**
- Create: `scripts/check-out.sh`, `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `out/` (Task 3 빌드), `posts/*.md`
- Produces: `main` push 시 자동 배포

- [ ] **Step 1: `scripts/check-out.sh` 작성**

```bash
#!/usr/bin/env bash
# 빌드 결과 검사. 로컬·CI 공용: bash scripts/check-out.sh
set -euo pipefail

if grep -rl "supabase.co" out; then
  echo "FAIL: out/에 supabase.co 참조가 남아 있음"
  exit 1
fi

expected=$(grep -L '^published: false' posts/*.md | wc -l | tr -d ' ')
actual=$(ls out/post/*.html | wc -l | tr -d ' ')
if [ "$expected" != "$actual" ]; then
  echo "FAIL: published 글 $expected개, 생성된 페이지 $actual개"
  exit 1
fi

echo "OK: 글 $actual개"
```

- [ ] **Step 2: 로컬에서 통과·실패 모두 확인**

```bash
bash scripts/check-out.sh
echo "https://x.supabase.co/a.png" > out/fake.txt && bash scripts/check-out.sh; echo "exit=$?"; rm out/fake.txt
```
Expected: 첫 번째 `OK: 글 15개`, 두 번째 `FAIL: ...supabase.co...` + `exit=1`

- [ ] **Step 3: `.github/workflows/deploy.yml` 작성**

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - run: npm run build
      - run: bash scripts/check-out.sh
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

(Actions 방식 배포는 Jekyll을 거치지 않으므로 `_next/` 폴더용 `.nojekyll` 불필요)

- [ ] **Step 4: Commit (push는 Task 5에서)**

```bash
git add scripts/check-out.sh .github/workflows/deploy.yml
git commit -m "ci: GitHub Pages 배포 workflow 추가"
```

---

### Task 5: repo 이름 변경 + 첫 배포 (사용자 협업)

**Interfaces:**
- Consumes: Task 1~4 커밋
- Produces: `https://phjjj.github.io` 라이브

- [ ] **Step 1 (사용자): repo 이름 변경**
GitHub `phjjj/my-blog` → Settings → General → Repository name: `phjjj.github.io` → Rename.

- [ ] **Step 2 (사용자): Pages 소스 설정**
Settings → Pages → Build and deployment → Source: **GitHub Actions**.

- [ ] **Step 3: remote 갱신 + push**

```bash
git remote set-url origin git@github.com:phjjj/phjjj.github.io.git
git push origin main
gh run watch --exit-status
```
Expected: `build`, `deploy` job 모두 성공.

- [ ] **Step 4: 라이브 검증 (한글·공백 slug 포함 전 글)**

```bash
npx tsx -e '
import { getPosts } from "./lib/posts";
(async () => {
  for (const p of getPosts()) {
    const r = await fetch(`https://phjjj.github.io/post/${encodeURIComponent(p.slug)}`);
    console.log(r.status, p.slug);
  }
})();
'
curl -s -o /dev/null -w "%{http_code} sitemap\n" https://phjjj.github.io/sitemap.xml
```
Expected: 전부 `200`.

만약 한글·공백 slug만 404면: `out/post/`의 실제 파일명과 요청 경로 인코딩 차이. `ls out/post`로 파일명 확인 후 원인을 사용자에게 보고한다 (slug 영문화 여부는 사용자 결정).

- [ ] **Step 5: 브라우저 확인**
`https://phjjj.github.io`에서 확인: 목록(스크롤 시 11~15번째 글 추가 표시), `컬러를 조합하는 법`·`딸깍으로-배포하기` 상세(대표 이미지), 본문 이미지 있는 글(`january-retrospective`), 목차, 코드 하이라이트, 파비콘.
Expected: 콘솔 에러·404 없음.

---

### Task 6: 이전 인프라 정리 (사용자)

Task 5 검증이 끝난 뒤에만 진행. 모두 되돌릴 수 없음.

- [ ] **Step 1 (사용자):** Vercel 대시보드 → 해당 프로젝트 → Settings → Delete Project. phjjj.xyz 도메인 연결도 함께 해제됨. (인증 없는 `/api/admin/posts` 노출이 이 시점에 사라짐)
- [ ] **Step 2 (사용자):** Supabase 대시보드 → 프로젝트 → Settings → General → Delete project.
- [ ] **Step 3 (사용자):** 로컬 `.env.local` 삭제 (service role 키 포함, 더 이상 사용처 없음).
- [ ] **Step 4:** README에 글 작성법 3줄 추가 후 커밋:

```markdown
## 글 쓰기

`posts/<slug>.md` 추가 (frontmatter: title, excerpt, image_url, tags, created_at, published) → 이미지는 `public/images/<slug>/` → `git push`하면 GitHub Actions가 배포.
```

```bash
git add README.md
git commit -m "docs: 글 작성 방법 추가"
git push origin main
```
