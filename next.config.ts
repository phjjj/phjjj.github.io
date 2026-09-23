import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // ponytail: GitHub Pages엔 이미지 최적화 서버 없음. 원본 전송, 큰 이미지는 이전 시 압축
  images: { unoptimized: true },
};

export default nextConfig;
