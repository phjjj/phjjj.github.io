# PHJ.dev

개발 기록 노트 — https://phjjj.github.io

Next.js static export + GitHub Pages. `main`에 push하면 GitHub Actions가 빌드·배포한다.

## 글 쓰기

1. `posts/<slug>.md` 추가 (파일명이 URL: `/post/<slug>/`)

   ```md
   ---
   title: "제목"
   excerpt: "목록에 보이는 요약"
   image_url: ""
   tags: ["개발", "React"]
   created_at: "2026-09-23T10:00:00+09:00"
   published: true
   ---

   본문 (markdown, HTML `<img>` 사용 가능)
   ```

2. 이미지는 `public/images/<slug>/`에 두고 `/images/<slug>/파일명`으로 참조. slug나 파일명에 한글·공백이 있으면 URL 인코딩한 경로를 쓴다.
3. `published: false`면 빌드에서 제외 (초안).
4. `git push` → 배포 확인은 Actions 탭.

## 개발

```bash
npm run dev      # http://localhost:3001
npm test         # lib/*.test.ts
npm run build    # out/ 생성
bash scripts/check-out.sh   # 빌드 결과 검사 (CI와 동일)
```
