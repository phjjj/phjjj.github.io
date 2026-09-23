---
title: "페이지 닫기 또는 새로고침 시, API 요청 보내기"
excerpt: "페이지 이탈 시 API 요청을 보내는 방법을 비교·정리했다."
image_url: ""
tags: ["개발","브라우저","JavaScript"]
created_at: "2026-01-29T00:00:00+00:00"
published: true
---

사용자의 실시간 온/오프라인 유무를 개발해야하는 요구사항이 있었다.

내가 구현해야 하는 사항은 A가 B의 페이지 접속 여부를 알 수 있어야하는데, 이걸 구현하려면 

1. B가 페이지를 진입했을 때 online API 호출
2. B가 페이지를 이탈했을 때 offline API 호출
3. A는 폴링으로 서버에 데이터를 지속적으로 요청하여 B의 온/오프라인 상태 확인

3번은 구현이 되어있고, 2번은 고민할 사항이 딱히 없었다. 1번은 처음 구현해보는거라 어떻게 구현했는지에 대해 남기려고 함.

## 문제 상황
처음 생각했을 때, `window.addEventListener('beforeunload', fetch())`에 이벤트를 등록해서 API 요청을 하면 되는거 아닌가? 라고 생각했다. 당연히 안된다! 이유는 아래와 같다.

![이미지](/images/page-unload-api/1771919870942-aqnkvtlzh6s.gif)

1. 페이지를 이탈하면 `beforeunload`함수가 먼저 콜스택에 올라가고, 콜백함수인 `fetch()(또는 axios)`도 콜스택에 올라간다.

2. 콜스택(LIFO)에서 `fetch()` 비동기이므로 `Web API` 스택으로 이동하게된다.

3. 그리고 콜스택에 남은 `beforeunload`도 스택에서 빠지면서, 콜스택이 완전히 비워지는 순간 프로세스가 종료된다. 이 과정에서 `Web API`에서 비동기처리가 되고있던, `fetch()`는 네트워크 요청이 끊기게 된다.

위 같은 상황을 해결하려면 페이지를 이탈해도 `Web API`에 있는 비동기처리가 종료되지 않고 그대로 유지가 되어야한다.

## 해결 방법
두 가지 방법이 있다.
- `navigator.sendBeacon`로 POST 호출하기
- `fetch()`에 `keepalive` 옵션을 주는 방법

나는 '`fetch()`에 `keepalive` 옵션을 주는 방법'을 선택할 수 밖에 없었는데, 이유는 `sendBeacon`은 **헤더 설정을 할 수가 없었다.**

### 1. navigator.sendBeacon (2014년 등장)

sendBeacon은 페이지 이탈 시 비동기 요청을 목적으로 나온 기술이다. 나가는 사용자를 붙잡지(Blocking) 않으면서 브라우저가 데이터를 예약 전송해주는 기술이었지만 단점이 있다.

- 헤더 설정 불가: 인증 토큰(JWT)을 Authorization 헤더에 담아야 하는 우리 시스템에서는 쓸 수가 없었다.

- CORS Preflight 문제: 서버가 application/json만 받는다면 Blob을 써서 보낼 순 있지만, 이 경우 브라우저는 본 요청 전 **CORS Preflight(OPTIONS 요청)** 를 날린다. 찰나의 순간에 "물어보고, 대답받고, 진짜 데이터 보내기"까지 하기엔 시간이 너무 부족하다. 결국 전송에 실패할 확률이 높다.

- POST 요청만 가능: POST 요청만 가능하고 그 외의 다른 자원들은 지원하지 않는다.

>CORS Preflight란?

>브라우저가 보안을 위해 본 요청을 보내기 전, 서버에 미리 날려보는 '사전 확인' 요청입니다.
>"나 이런 헤더(Authorization)랑 이런 데이터(JSON) 보낼 건데 괜찮아?"라고 OPTIONS >메서드로 물어보는 과정이죠. 서버가 "OK"라고 대답해야만 진짜 데이터를 보낼 수 있습니다.



### 2. fetch() + keepalive: true (2018년 등장)

이건 sendBeacon의 장점과 fetch의 유연함을 합친 최신 사양이다.
```ts
window.addEventListener('beforeunload', () => {
  fetch('/api/offline', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ status: 'offline' }),
    keepalive: true // 프로세스가 종료되어도 브라우저가 끝까지 보냄
  });
});
```

keepalive 옵션을 주면 브라우저는 해당 요청을 '페이지 수명 주기'와 분리한다. 덕분에 콜스택이 비워지고 탭이 닫히더라도, 브라우저가 백그라운드에서 전송을 끝까지 책임지고 마무리해준다.

**위 방법으로 새로고침 및 페이지 닫기와 같은 이벤트가 발생했을 때, 정상적으로 호출이 되는것을 확인했다.**

>디버깅 과정에서 새로고침 클릭 후, 네트워크탭을 확인했을 때 `취소됨`이라고 떴지만 서버에는 잘 전송이 되긴했다.

## 그럼 이제 `sendBeacon`은 사용할 일이 없는게 아닐까?

그렇지 않다. 여전히 살아있다는 것은 분명한 사용처가 있다는 의미다.

대표적인 예시가 **구글 애널리틱스(GA)** 다. GA는 `sendBeacon`을 적극 활용하고 있는데, 앞서 단점으로 언급했던 **"CORS Preflight가 발생하지 않는다"** 는 특성이 역설적이게도 이 경우엔 장점이 된다.

GA는 단순 데이터 수집 용도로, 커스텀 헤더(예: Authorization)가 필요 없다. 따라서 `sendBeacon`을 사용하면 페이지가 닫히는 찰나에 OPTIONS 요청을 주고받는 복잡한 과정 없이, **단 한 번의 POST 요청으로 즉시 데이터를 전송**할 수 있다.

또한 GA는 페이지 로딩이나 성능에 영향을 주면 안 되는 서드파티 스크립트다. 가볍고 빠르게 동작해야 하기 때문에 `sendBeacon`의 단순함이 오히려 최적의 선택이 되는 것이다.

## 마치며
단점이 장점으로 될 수도 있구나라는 걸 한 번씩 생각해보면 좋지않을까
