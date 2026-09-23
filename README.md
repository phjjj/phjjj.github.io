# PHJ.dev

개발 기록 노트 — https://phjjj.github.io

Next.js static export + GitHub Pages. `main`에 push하면 GitHub Actions가 빌드·배포한다.

## 글 쓰기

1. `posts/<slug>.md` 추가 (파일명이 URL: `/post/<slug>/`)

   ```md
   ---
   title: 제목
   excerpt: 목록에 보이는 요약
   tags: [개발, React]
   created_at: 2026-09-23
   ---

   본문 (markdown, HTML `<img>` 사용 가능)
   ```

2. 이미지는 `public/images/<slug>/`에 두고 `/images/<slug>/파일명`으로 참조. slug나 파일명에 한글·공백이 있으면 URL 인코딩한 경로를 쓴다.
3. 필수는 `title`, `created_at`뿐. `excerpt`·`tags`·`image_url`(목록 썸네일)은 선택. 제목에 `:`가 들어가면 따옴표로 감싼다.
4. 초안은 `published: false` (빌드에서 제외). 생략하면 공개.
5. `git push` → 배포 확인은 Actions 탭.

## 개발

```bash
npm run dev      # http://localhost:3001
npm test         # lib/*.test.ts
npm run build    # out/ 생성
bash scripts/check-out.sh   # 빌드 결과 검사 (CI와 동일)
```
