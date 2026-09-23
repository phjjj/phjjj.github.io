---
title: "Sentry를 도입하여 에러 로그 쌓기"
excerpt: "간헐적 버그를 해결하기 위해 에러 모니터링 도구(Sentry)를 도입한 과정"
image_url: ""
tags: ["Sentry"]
created_at: "2026-05-01T10:49:31.165739+00:00"
published: true
---

## 도입 배경
- 우리 서비스는 고객사 내부망에서 운영되어 보안상 **원격 접속**이 필수적이다. 버그 제보 시마다 원격에 접속해서 **높은 디버깅 비용과 즉각적인 대응을 어렵게 만들었다.**

- 스테이징 환경에서는 발견되지 않던 버그가 프로덕션에서만 발생할 경우, 에러의 발생 시점, 브라우저 환경, 구체적인 콜스택을 알 수 없어 '추측에 기반한 재현'을 반복해야 했고, 이는 곧 **장애 대응 시간(MTTR)의 지연으로 이어졌다.**

## 세팅 과정 중 트러블슈팅

**문제**
- 개발(스테이징) 서버에서만 소스맵이 업로드되지 않았다.

>Sentry는 빌드된 파일의 소스맵을 업로드받아, 실제 에러가 발생한 코드 위치를 원본 소스 기준으로 추적할 수 있게 해준다.
>소스맵이 있어야 난독화된 번들 코드가 아닌, 내가 실제로 작성한 코드 기준으로 콜스택을 볼 수 있다.


**해결과정**
sentry의 이슈 중 **개발(development)환경 일 때, 소스맵 업로드를 스킵**한다는 깃허브 이슈를 발견했다.

우리 프로젝트의 Dockerfile에는 아래 코드가 있다.

`ENV NODE_ENV=${BUILD_ENV}  # BUILD_ENV=development → NODE_ENV=development 주입`

sentry의 패키지 소스코드를 확인해보았다.
```tsx
// node_modules/@sentry/bundler-plugin-core/dist/cjs/index.js

const isDevMode = process.env["NODE_ENV"] === "development";

function canUploadSourceMaps(options, logger, isDevMode) {
  if (isDevMode) {
    logger.debug("Running in development mode. Will not upload sourcemaps.");
    return false; 
  }
  // ...
}
```
라이브러리 내부에 NODE_EN   === "development"이면 소스맵 업로드를 건너뛰는 로직이 박혀있다. 그것도 logger.debug()로 출력하기 때문에 기본 로그 레벨에서는 이 메시지가 터미널에 보이지 않는다. 에러도 경고도 없이 조용히 스킵되고 있었다.

Dockerfile은 CI/CD 담당 영역이라 프론트 코드에서 해결했다. package.json 빌드 스크립트에서 vite 실행 직전에 NODE_ENV를 덮어쓰도록 했다.

```
"build:development": "NODE_ENV=production vite build --mode development"
```
빌드에도 정상적으로 소스맵 업로드도 확인할 수 있었다.

## 슬랙 알림
안타깝게도 슬랙 알림은 유료였다. 대신 이메일 알림은 무료인데 그 점을 활용했다.

슬랙의 각 채널에는 이메일이 있다.
![이미지](/images/Sentry%EB%A1%9C-%EC%8B%A4%EC%8B%9C%EA%B0%84-%EC%97%90%EB%9F%AC-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EA%B5%AC%EC%B6%95%EC%9C%BC%EB%A1%9C-%EC%9E%A5%EC%95%A0-%EB%8C%80%EC%9D%91-%EC%8B%9C%EA%B0%84-%EB%8B%A8%EC%B6%95%ED%95%98%EA%B8%B0/1778045279837-htqykener2.png)

센추리의 primary 이메일은 변경이 가능하다. 채널 이메일로 변경해준다.
![이미지](/images/Sentry%EB%A1%9C-%EC%8B%A4%EC%8B%9C%EA%B0%84-%EC%97%90%EB%9F%AC-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EA%B5%AC%EC%B6%95%EC%9C%BC%EB%A1%9C-%EC%9E%A5%EC%95%A0-%EB%8C%80%EC%9D%91-%EC%8B%9C%EA%B0%84-%EB%8B%A8%EC%B6%95%ED%95%98%EA%B8%B0/1778045397763-rwmhxra0s0o.png)

초가성비 알림 완성
![이미지](/images/Sentry%EB%A1%9C-%EC%8B%A4%EC%8B%9C%EA%B0%84-%EC%97%90%EB%9F%AC-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EA%B5%AC%EC%B6%95%EC%9C%BC%EB%A1%9C-%EC%9E%A5%EC%95%A0-%EB%8C%80%EC%9D%91-%EC%8B%9C%EA%B0%84-%EB%8B%A8%EC%B6%95%ED%95%98%EA%B8%B0/1778045495067-s877y2wbz4m.png)

팀원초대도 유료이기때문에 세부내용은 계정 하나만 사용해서 볼 수 있다...

## 도입 후 장점

**디버깅 시간 단축**

도입 전에는 버그 제보가 들어오면 재현 방법을 물어보고, 원격 접속을 통해 다시 시도해보는 사이클을 반복했다. 재현이 안 되면 그대로 미궁에 빠졌다.

이제는 에러가 발생한 순간의 스택 트레이스, 사용자가 에러 직전까지 취한 행동 흐름, 브라우저와 OS 환경 정보가 자동으로 쌓인다. 소스맵이 업로드되어 있으니 난독화된 번들 코드가 아닌 내가 작성한 원본 코드 기준으로 정확히 어느 줄에서 터졌는지 바로 확인할 수 있다. 재현을 위한 왕복 커뮤니케이션이 사라졌다.

현재는 채널에서 개인적으로 테스트를 하면서 지켜보고 있는데, 서비스가 초기보다 안정된 상태라 생각보다 활용도가 조금씩 낮아지고 있다.
