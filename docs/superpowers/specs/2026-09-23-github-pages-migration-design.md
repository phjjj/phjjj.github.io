# GitHub Pages 마이그레이션 설계

- 날짜: 2026-09-23
- 현재: Next.js 16 + Supabase(DB·Storage) + Vercel, `phjjj.xyz`
- 목표: Next.js static export + Markdown 파일 + GitHub Pages, `phjjj.github.io`. 운영비 0원, 외부 서비스는 GitHub만 남김.

## 결정 사항

| 항목 | 결정 |
|---|---|
| 글 관리 | repo의 `posts/<slug>.md`. 브라우저 admin 에디터 제거 |
| 프레임워크 | Next.js 유지, `output: "export"` |
| 이미지 | Supabase Storage → `public/images/<slug>/`로 이전 |
| 주소 | `https://phjjj.github.io` (repo `my-blog` → `phjjj.github.io` 이름 변경) |
| phjjj.xyz | 폐기. 리다이렉트 없음 |
| Vercel·Supabase | 새 사이트 확인 후 삭제 |

## 아키텍처

```
posts/<slug>.md           글 (frontmatter + 본문)
public/images/<slug>/*    이미지
lib/posts.ts              fs로 md 읽기: getPosts(), getPostBySlug()
  ↓ next build (output: "export")
out/                      정적 HTML
  ↓ .github/workflows/deploy.yml
phjjj.github.io
```

### frontmatter

기존 `posts` 테이블 컬럼(`id` 제외)을 그대로 옮긴다. `slug`는 파일명.

```yaml
---
title: "..."
excerpt: "..."
image_url: /images/<slug>/cover.png
tags: [react, nextjs]
created_at: 2026-01-15T00:00:00.000Z
published: true
---
```

- 파싱: `gray-matter` (제목의 `:`, 따옴표 등 YAML 엣지 케이스 대응)
- `published: false` 글은 목록·상세·sitemap에서 제외
- `lib/posts.ts`는 기존 `types/post.ts`의 `Post` 타입을 반환해 컴포넌트 변경을 최소화

## 코드 변경

**삭제**
- `app/admin/`, `app/api/`
- `utils/supabase.ts`, `utils/supabaseAdmin.ts`, `lib/mockData.ts` (`utils/supabase.ts`에서만 사용)
- `scripts/seed-posts.ts`, `scripts/add-january-retrospective.ts`
- 의존성 `@supabase/supabase-js`, `.env.local`의 Supabase 키

**수정**
- `app/page.tsx`, `app/post/[slug]/page.tsx`, `app/sitemap.ts`: `lib/posts` 사용, `revalidate`·`dynamic` 제거
- `components/PostListInfinite.tsx`: `/api/posts` fetch 대신 전체 목록을 prop으로 받아 클라이언트에서 10개씩 표시 (UX 동일)
- `next.config.ts`: `output: "export"`, `images.unoptimized: true`, `remotePatterns`에서 `*.supabase.co` 제거
- `NEXT_PUBLIC_SITE_URL`: `https://phjjj.github.io`
- `app/sitemap.ts`, `app/robots.ts`: static export에서 필요하면 `export const dynamic = "force-static"`

**추가**
- `scripts/export-from-supabase.ts` (1회용, 실행·커밋 후 삭제)
- `.github/workflows/deploy.yml`
- 의존성 `gray-matter`

## 데이터 이전 (`scripts/export-from-supabase.ts`)

1. anon key로 `posts` 전체 조회 (현재 15개, 모두 published)
2. `content`와 `image_url`에서 `*.supabase.co/storage/...` URL 추출 (현재 24개) → `public/images/<slug>/<원래 파일명>`에 다운로드
3. 해당 URL을 `/images/<slug>/<파일명>`으로 치환
4. `posts/<slug>.md`로 저장, `created_at` 원래 값 유지
5. 다운로드 하나라도 실패 시 non-zero exit로 중단
6. 종료 시 이미지별 용량 출력. 500KB 초과 파일은 수동 압축

## 배포 (`.github/workflows/deploy.yml`)

- 트리거: `main` push, 수동 실행(`workflow_dispatch`)
- 단계: checkout → `npm ci` → `npm run lint` → `npm run build` → 빌드 결과 검사 → `actions/upload-pages-artifact` (`out/`) → `actions/deploy-pages`
- 빌드 결과 검사 (실패 시 배포 중단):
  - `out/` 전체에 `supabase.co` 문자열 0건
  - `posts/*.md` 중 published 개수 == `out/post/*.html` 개수

## 전환 순서

| # | 작업 | 담당 |
|---|---|---|
| 1 | 데이터 이전, 코드 수정, 로컬 빌드 검증 | Claude |
| 2 | GitHub repo 이름 `my-blog` → `phjjj.github.io` (Settings → General) | 사용자 |
| 3 | Settings → Pages → Source: GitHub Actions | 사용자 |
| 4 | 로컬 remote 갱신, push, 배포 확인 | Claude |
| 5 | Vercel 프로젝트 삭제 (phjjj.xyz 및 인증 없는 admin API 제거) | 사용자 |
| 6 | Supabase 프로젝트 삭제 | 사용자 |

5·6은 되돌릴 수 없으므로 4의 확인이 끝난 뒤에만 진행한다.

## 검증

로컬 `npm run build` 후:
- `out/post/*.html` 15개
- `out/`에서 `supabase.co` grep 0건
- `out/sitemap.xml`, `out/robots.txt` 생성, 도메인이 `phjjj.github.io`
- `npm run lint` 통과

배포 후 브라우저 확인: 목록 무한스크롤, 글 상세, 목차, 이미지, 코드 하이라이트, 파비콘.

## 알려진 트레이드오프

- `next/image` 자동 최적화 없음 → 원본 이미지 전송. 이전 시 대용량 이미지만 압축으로 대응
- Vercel 서울 엣지 → GitHub Pages(Fastly). 한국 TTFB 소폭 증가 가능 (미실측)
- GitHub Pages 캐시 헤더(`max-age=600`) 변경 불가
- 글 작성은 git push 필요 (웹 에디터 없음)

## 범위 밖

- 댓글, 검색, RSS
- phjjj.xyz 리다이렉트
- 디자인 변경
