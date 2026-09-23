import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getPosts, getPostBySlug, countTags } from "./posts";

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

test("countTags는 published 글 기준으로 태그 집계", () => {
  const d = makeDir({
    "a.md": md({ title: "A", tags: ["x", "y"], created_at: "2025-01-01T00:00:00Z" }, "a"),
    "b.md": md({ title: "B", tags: ["x"], created_at: "2025-01-02T00:00:00Z" }, "b"),
  });
  assert.deepEqual(countTags(getPosts(d)), { total: 2, tags: { x: 2, y: 1 } });
});

test("created_at은 날짜만 써도 됨 (YAML date)", () => {
  const d = makeDir({ "a.md": "---\ntitle: T\ncreated_at: 2026-05-14\n---\n\nx\n" });
  assert.equal(getPosts(d)[0].created_at, "2026-05-14T00:00:00.000Z");
});

test("missing title 에러", () => {
  const d = makeDir({
    "bad.md": md({ excerpt: "e", created_at: "2025-01-01T00:00:00Z", published: true }, "body"),
  });
  assert.throws(() => getPosts(d), /bad\.md: title 누락/);
});

test("invalid created_at 에러", () => {
  const d = makeDir({
    "bad.md": md({ title: "T", created_at: "nope", published: true }, "body"),
  });
  assert.throws(() => getPosts(d), /bad\.md: created_at 누락 또는 잘못됨/);
});

test("unparsable YAML 에러", () => {
  const d = makeDir({
    "bad.md": "---\ntitle: [unclosed\n---\n\nx\n",
  });
  assert.throws(() => getPosts(d), /bad\.md/);
});
