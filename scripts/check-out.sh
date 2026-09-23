#!/usr/bin/env bash
# 빌드 결과 검사. 로컬·CI 공용: bash scripts/check-out.sh
set -euo pipefail

if grep -rl "supabase.co" out; then
  echo "FAIL: out/에 supabase.co 참조가 남아 있음"
  exit 1
fi

expected=$(set +o pipefail; grep -L '^published: false' posts/*.md | wc -l | tr -d ' ')
actual=$(ls out/post/*.html | wc -l | tr -d ' ')
if [ "$expected" != "$actual" ]; then
  echo "FAIL: published 글 $expected개, 생성된 페이지 $actual개"
  exit 1
fi

echo "OK: 글 $actual개"
