export function resolveThumbnail(imageUrl: string, _content: string): string | null {
  return imageUrl.trim() || null;
}

// 빌드 서버(UTC)와 브라우저 시간대가 달라도 같은 날짜 → hydration mismatch 방지
// ponytail: KST 고정(+9h, DST 없음). 다른 시간대 독자 기준이 필요하면 클라이언트 전용 렌더로
export function formatDate(dateStr: string): string {
  const d = new Date(new Date(dateStr).getTime() + 9 * 3600_000);
  return `${d.getUTCFullYear()}. ${String(d.getUTCMonth() + 1).padStart(2, "0")}. ${String(d.getUTCDate()).padStart(2, "0")}`;
}
