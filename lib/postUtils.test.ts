import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDate } from "./postUtils";

test("formatDate는 실행 환경 시간대와 무관하게 KST 날짜", () => {
  assert.equal(formatDate("2026-05-14T15:39:13.975547+00:00"), "2026. 05. 15");
  assert.equal(formatDate("2026-05-14T11:13:16+00:00"), "2026. 05. 14");
});
