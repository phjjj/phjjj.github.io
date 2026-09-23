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
