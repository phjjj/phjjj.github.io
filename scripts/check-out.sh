#!/usr/bin/env bash
# 빌드 결과 검사. 로컬·CI 공용: bash scripts/check-out.sh
set -euo pipefail

if grep -rl "supabase.co" out; then
  echo "FAIL: out/에 supabase.co 참조가 남아 있음"
  exit 1
fi

# BSD grep(macOS)은 -L로 파일을 출력해도 exit 1 → pipefail 회피
expected=$( (grep -L '^published: false' posts/*.md || true) | wc -l | tr -d ' ')
actual=$(ls out/post/*/index.html | wc -l | tr -d ' ')
if [ "$expected" != "$actual" ]; then
  echo "FAIL: published 글 $expected개, 생성된 페이지 $actual개"
  exit 1
fi

echo "OK: 글 $actual개"
