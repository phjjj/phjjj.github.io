---
title: "진행 중인 작업을 Slack 상태로 나타내기"
excerpt: "동료가 뭐하냐고 묻는 횟수를 줄이게 하기"
image_url: ""
tags: ["Slack","자동화"]
created_at: "2026-05-14T15:39:13.975547+00:00"
published: true
---

이번에는 나를 위한 구현이었다.

- 어떤 업무를 하고있는지
- 시킨 업무를 하고있는지
- 올바른 업무 진행하고있는지

한 사람이 어떤 작업을 진행하고있는지에 따라 각자(동료)의 작업 방향이나 계획을 수립하는데 좀 더 도움이 되지않을까 싶었다.

그래서 이번에는 Slack의 상태를 활용하였다.

## 표현하는 방법들

### 데일리 스크럼
애자일 방법론에서 나온 매일 자신이 어떤 작업을 하고있는지 짧게나마 공유하는 방법이다.

어떻게 문제점을 개선할까했을 때, 첫번째로 생각하였고 실제로 아주 소수의 인원으로 GeekBot이라는 슬랙앱을 통해 테스트 겸 동료와 진행상황을 공유할 수 있도록 해보았다.

기능을 구현 중이거나, 작업기간이 정해져있는 업무인 경우에는 스크럼에 포함될 수 있지만 갑작스럽게 생긴 업무는 공유되기가 어렵다는 단점이 있었다.

### 업무 관련 툴
기존에는 구글시트를 사용해서 버그나 기능구현 영역에 담당자가 적혀지고 상태(진행중, 완료 등)를 직접 선택할 수 있었다.

시트에 접속하여 일일이 상태를 바꾸는게 귀찮았고 굳이 '진행중'으로 바꾸지 않고 작업을 완료 후 상태를 변경하는 경우가 많았다. 그리고 이 상태를 '진행중'이라고 바꾼다고 해서 진짜 하는 중인지 신뢰성이 그다지 높진 않았다.

### 슬랙 상태
직원이 휴가를 나갈 경우 메신저의 상태가 휴가로 변경이 되는 것을 확인했다.(자동인줄 알았는데 수동이었다)

사내메신저인 슬랙의 상태를 변경한다면 모든 직원이 볼 수있다. 물론 그걸 원한건 아니지만, 내가 어떤 작업을 하는지 정도는 커스텀해서 표현 할 수 있다고 생각했다.

최근에 이 상태메시지를 이용하여 '** 기능 열심히 구현중'이라고 썼는데 MZ같다고 들었다. 그게 단점이랄까

## 슬랙 상태에 티켓을 표시하기
이번에 사내에 지라같은 시스템을 개발하여서 '티켓'개념이 생겼다. 그러니까 이 티켓으로 버그/기능구현의 상세한 내용이 추상적으로 표현이 가능해졌다.



그래서 내가 작업중인 티켓을 상태에 표시하면 되겠다고 생각했다.

하지만 이것또한 일일이 상태를 바꾸는 건 귀찮음을 유발시킬 뿐이었다.

## 상태를 자동으로 변경하게 하기
어떤 방법이 있을까? 프로젝트 세팅을 할 때 git hooks을 활용하는 husky를 추가했었는데, git hooks을 활용하면 되지 않을까 싶었다.

>
>**Git Hooks**
>
>Git도 다른 버전 관리 시스템처럼 어떤 이벤트가 생겼을 때 자동으로 특정 스크립트를 실행하도록 할 수 있다. 이 훅은 클라이언트 훅과 서버 훅으로 나눌 수 있다. 클라이언트 훅은 커밋이나 Merge 할 때 실행되고 서버 훅은 Push 할 때 서버에서 실행된다. 이 절에서는 어떤 훅이 있고 어떻게 사용하는지 배운다. 
>
>기본 훅 디렉토리는 .git/hooks 이다.


AI에 바로 물어보니 post-checkout이라는 hook이 있었다.

>**post-checkout**
>
>브랜치 변경이나, 체크아웃 시 실행되는 훅

그렇다면 아래 흐름으로 구성하면된다.
1. 티켓이 생긴다.
2. 작업브랜치를 티켓이름으로 생성하고 checkout 한다
3. post-checkout 훅이 실행되면서 스크립트를 실행한다
3. 작업브랜치의 이름을 슬랙의 상태메시지로 변경한다

### 스크립트 추가하기
먼저 레포지토리 내부 .git 폴더에 스크립트를 추가해야한다.
```bash
cd /path/to/your-repo
touch .git/hooks/post-checkout
chmod +x .git/hooks/post-checkout
```
코드는 아래처럼 작성했다.

```sh
#!/bin/zsh

# 슬랙 유저 토큰 (xoxp-...)
SLACK_TOKEN=""

# 현재 브랜치 이름 가져오기
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

# 접미어로 붙일 값: 접두사 뒤가 영문 대문자 프로젝트키-<숫자> 형태일 때만 사용
# 예) fix/T-108 -> "T-108", fix/KA-014 -> "KA-014"
TICKET_SUFFIX=""

# 1. 조건 검사 및 상태 설정
if [[ $BRANCH_NAME == feat/* ]]; then
  STATUS_TEXT="기능 구현 중"
  STATUS_EMOJI=":sparkles:"
  TICKET_SUFFIX="${BRANCH_NAME#feat/}"
elif [[ $BRANCH_NAME == fix/* ]]; then
  STATUS_TEXT="버그 수정 중"
  STATUS_EMOJI=":bug:"
  TICKET_SUFFIX="${BRANCH_NAME#fix/}"
elif [[ $BRANCH_NAME == refactor/* ]]; then
  STATUS_TEXT="리팩터링 중"
  STATUS_EMOJI=":broom:" 
  TICKET_SUFFIX="${BRANCH_NAME#refactor/}"
else
  # 2. main, master 혹은 기타 브랜치일 경우 상태 초기화
  STATUS_TEXT=""
  STATUS_EMOJI=""
fi

if [[ -n "$STATUS_TEXT" ]] && [[ -n "$TICKET_SUFFIX" ]] \
  && [[ "$TICKET_SUFFIX" =~ ^[A-Z]+-[0-9]+$ ]]; then
  STATUS_TEXT="$STATUS_TEXT $TICKET_SUFFIX"
fi

# 3. Slack API 호출 (상태 업데이트 또는 삭제)
curl -s -X POST -H "Authorization: Bearer $SLACK_TOKEN" \
     -H "Content-Type: application/json" \
     --data "{\"profile\": {\"status_text\": \"$STATUS_TEXT\", \"status_emoji\": \"$STATUS_EMOJI\"}}" \
     https://slack.com/api/users.profile.set > /dev/null 2>&1
```

slackAPI의 요청을 보내려면 각 유저의 토큰이 필요하다.

토큰은 봇의 설정 페이지에서 OAuth & Permissions에서 가져 올 수 있고, 사용자 토큰 범위 >
 `users.profile:write`를 허용해야한다.
![이미지](/images/%EC%A7%84%ED%96%89-%EC%A4%91%EC%9D%B8-%EC%9E%91%EC%97%85%EC%9D%84-Slack-%EC%83%81%ED%83%9C%EB%A1%9C-%EB%82%98%ED%83%80%EB%82%B4%EA%B8%B0/1778947815433-3f8che78khm.png)

![이미지](/images/%EC%A7%84%ED%96%89-%EC%A4%91%EC%9D%B8-%EC%9E%91%EC%97%85%EC%9D%84-Slack-%EC%83%81%ED%83%9C%EB%A1%9C-%EB%82%98%ED%83%80%EB%82%B4%EA%B8%B0/1778947901410-ym3x8guq7y.png)

## 결과

![이미지](/images/%EC%A7%84%ED%96%89-%EC%A4%91%EC%9D%B8-%EC%9E%91%EC%97%85%EC%9D%84-Slack-%EC%83%81%ED%83%9C%EB%A1%9C-%EB%82%98%ED%83%80%EB%82%B4%EA%B8%B0/1778948011038-74tik8y82wr.png)
정말 간단하게 설정할 수 있었다. 

조금 아쉬운 점은 티켓의 번호를 보고 다시 티켓내용을 보러 가야한다는게 아쉬운 것 같다. 언젠가 개선할 수 있을지도 모른다.

되게 mz같지만, 누군가에게 조금이나마 도움이 되었으면..ㅇ
