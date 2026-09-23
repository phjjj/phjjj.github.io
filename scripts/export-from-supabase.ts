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
