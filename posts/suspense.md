---
title: "suspenseQuery와 suspense/ErrorBoundary"
excerpt: "useSuspenseQuery와 Suspense, ErrorBoundary를 직접 사용하면서 선언적 비동기 처리의 장단점을 정리했다."
image_url: ""
tags: ["개발","React"]
created_at: "2025-12-14T14:00:00+00:00"
published: true
---

평소에 useQuery만 사용하다가 suspenseQuery를 직접 사용해보면서 어떠한 점이 좋았는지 알아보았다. 그리고 함께 사용할 수 있는 여러 방법들을 배우게되었다.

현재 진행중인 프로젝트의 마지막으로 개발해야하는 페이지는 suspense를 적극적으로 사용해볼 계획이다. 이 경험을 토대로 다음 장/단점을 명확하게 구분하고 다음 프로젝트를 진행할 때도 도움이 되었으면 한다.

## useSuspenseQuery

`useSuspenseQuery`는 항상 데이터를 반환한다. 기존의 `useQuery`는 `undefined`를 반환해서 옵셔널 처리가 수도 없이 생기게 된다.

```tsx
// useQuery 사용
function UserProfile({ userId }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: fetchUser,
  });

  // 각 상태에 대한 처리
  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage />;
  if (!data) return null;

  return (
    <div>
      {/* 옵셔널 체이닝 */}
      <h1>{data?.name}</h1>
      <p>{data?.email}</p>
    </div>
  );
}
```

```tsx
// userSuspenseQuery 사용
function UserProfile({ userId }) {
  const { data } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: fetchUser,
  });

  // 로딩, 에러는 부모 컴포넌트에서 관리

  return (
    <div>
      {/* 데이터가 100% 보장되므로 옵셔널 체이닝(?) 불필요 */}
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}

// 부모 컴포넌트
<ErrorBoundary fallback={<ErrorPage />}>
  <Suspense fallback={<Loading />}>
    <UserProfile />
  </Suspense>
</ErrorBoundary>;
```

이렇게 선언적으로 관리할 수 있다는게, 큰 장점이다.

## Suspense

`<Suspense>`는 자식 요소가 렌더링 되기 전까지 화면에 대체 UI를 보여준다. 기본적으로 React에서 제공하고있다.

```tsx
<Suspense fallback={<Loading />}>
  <SomeComponent />
</Suspense>
```

_자식 컴포넌트의 데이터가 아직 로딩 중이라는 건 어떻게 알까?_

`useSuspenseQuery` 훅은 컴포넌트가 호출되어 렌더링이 되는 도중에 실행이 되는데, 이 때 내부적으로 아직 데이터를 불러오기 전이라면 `Promise` 객체 자체를 `throw` 해버린다. `<Suspense />`는 이를 감지하고 `fallback`을 렌더링 시키게 된다.

## ErrorBoundary

<ErrorBoundary>는 자식 요소 렌더링 중 에러가 발생했을 때, 대체 UI를 보여준다.

suspensive/react, react-error-boundary, @sentry/react에서 제공하고 React 클래스 컴포넌트로 사용할 수 있다.

```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <Suspense fallback={<Loading />}>
    <SomeComponent />
  </Suspense>
</ErrorBoundary>
```

_에러가 났다는 건 어떻게 알까?_

`Suspense`와 원리는 똑같다. `useSuspenseQuery`는 내부적으로 API 요청이 실패(Reject)하면, 이번에는 `Promise`가 아니라 `Error` 객체 자체를 `throw` 해버린다.

자바스크립트 실행 흐름이 멈추고 에러가 상위로 전파되는데, 이를 가장 가까운 <ErrorBoundary>가 `catch`한다. 덕분에 에러가 발생한 부분만 우아하게 처리하고 나머지 앱은 정상적으로 유지할 수 있게 된다.

## 그럼 무조건 useSuspenseQuery가 더 좋은건가?

모든 기술에는 Trade-off가 있듯이, `useSuspenseQuery`도 치명적인 단점이 하나 있다. 바로 **Waterfall 현상**이다.

### useSuspenseQuery의 직렬 처리

`useSuspenseQuery`는 데이터가 없으면 `throw`를 하고 렌더링을 중단해버린다. 만약 하나의 컴포넌트에서 두 개의 데이터를 불러와야 한다면 어떻게 될까?

```tsx
function Dashboard() {
  // 1. 유저 정보를 요청하고, 데이터가 올 때까지 멈춤
  const { data: user } = useSuspenseQuery({ queryKey: ['user'], ... });

  // 2. 위 요청이 끝나고 다시 렌더링 될 때까지 이 코드는 실행조차 되지 않음
  const { data: posts } = useSuspenseQuery({ queryKey: ['posts'], ... });

  return ...
}
```

첫 번째 쿼리가 완료될 때까지 두 번째 쿼리는 시작조차 하지 못한다. 이를 **Waterfall 현상**이라고 하며, 전체 로딩 시간이 길어지는 원인이 된다. 반면에, `useQuery`로 데이터를 2개 이상 불러올 경우에는 병렬적으로 처리가 가능하다.

그럼 Suspense를 쓰면서 병렬 처리는 못 하는 걸까? 다행히 `react-query`는 이를 위해 `useSuspenseQueries`를 제공한다.

```tsx
function Dashboard() {
  // 배열로 묶어서 요청하면 병렬로 처리됨!
  const [{ data: user }, { data: posts }] = useSuspenseQueries({
    queries: [
      { queryKey: ['user'], ... },
      { queryKey: ['posts'], ... },
    ],
  });

  return ...
}
```

### 컴포넌트 depth가 깊어진다

`useSuspenseQuery`의 훅은 자식 컴포넌트에서 사용해야한다. 그래서 의도적으로 컴포넌트를 분리시켜야한다.

이 때, 더 많은 데이터를 제공하기 위해 더 많은 컴포넌트를 렌더링 해야한다면?

```tsx
// 1. 부모 컴포넌트
const UserProfileContainer = ({ id }) => {
  return (
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loader />}>
        {/* 반드시 자식으로 분리해야 동작함 */}
        <UserProfile id={id} />
        <Dashboard />
      </Suspense>
    </ErrorBoundary>
  );
};

// 2. 자식 컴포넌트
const UserProfile = ({ id }) => {
    const { data } = useSuspenseQuery(...);
    return <div>{data.name}</div>;
};

const Dashboard = () => {
    const { data } = useSuspenseQuery(...);
    return <div>{data}</div>;
};
```

추가되는 컴포넌트마다 계속해서 분리를 해줘야한다.

이 문제도 해결할 수 있는데, Suspensive 라이브러리에서 제공하는 `<SuspenseQuery>`를 사용하면 해결이 가능하다.

```tsx
import { SuspenseQuery } from '@suspensive/react-query';

// 수정 제안 코드
const Page = ({ userId }) => (
  <ErrorBoundary fallback="error">
    {/* 유저 프로필 영역 로딩 */}
    <Suspense fallback={<ProfileSkeleton />}>
      <SuspenseQuery {...userQueryOptions(userId)}>
        {({ data: user }) => <UserProfile {...user} />}
      </SuspenseQuery>
    </Suspense>

    {/* 대시보드 영역 로딩 (위와 동시에 병렬로 로딩됨!) */}
    <Suspense fallback={<DashboardSkeleton />}>
      <SuspenseQuery {...dashboardQueryOptions(...)}>
        {({ data }) => <Dashboard {...data} />}
      </SuspenseQuery>
    </Suspense>
  </ErrorBoundary>
);
```

## 마치며

react는 철저한 선언형 아키텍처를 지향하며, 비동기 데이터 처리조차 UI 선언의 일부로 통합하기 위해 <Suspense>를 도입했다. react-query 또한 이 흐름에 동참하여 v5부터 `useSuspenseQuery`를 공식 지원하기 시작했고.

결국 react가 생각하는 방향은 개발자가 오직 '데이터'와 그에 매핑되는 'UI'를 선언하는 데에만 집중하게 만드는 것을 추구하고있다.
