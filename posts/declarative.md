---
title: "선언형과 명령형"
excerpt: "useSuspense 학습을 계기로 리액트가 권장하는 선언형 프로그래밍의 의미를 탐구했다."
image_url: ""
tags: ["개발","설계"]
created_at: "2025-12-09T00:00:00+00:00"
published: true
---

`useSuspense`에 매력을 느끼고 학습하면서 react가 권장하는 **선언형 프로그래밍**에 대해서 궁금해서 찾아보았다.

## 1. 선언형과 명령형의 차이

| **구분**        | **명령형 (Imperative)**             | **선언형 (Declarative)**     |
| --------------- | ----------------------------------- | ---------------------------- |
| **핵심 질문**   | **How?** (어떻게 도달할까?)         | **What?** (무엇을 보여줄까?) |
| **코드 스타일** | 과정과 절차를 하나하나 나열함       | 결과물(목표 상태)을 정의함   |
| **제어 흐름**   | 개발자가 직접 제어 (if, for, throw) | 라이브러리/프레임워크에 위임 |

**명령형 (Imperative)**

- 과정이 전부 다 보인다.

```tsx
const button = document.getElementById('myButton');

button.addEventListener('click', () => {
  // 1. 현재 화면의 상태를 DOM에서 읽어와야 함 (의존성)
  if (button.innerText === '정상') {
    // 2. 어떻게 바꿀지 하나하나 명령 (절차적)
    button.style.backgroundColor = 'red';
    button.innerText = '에러 발생!';
  } else {
    button.style.backgroundColor = 'blue';
    button.innerText = '정상';
  }
});
```

**선언형 (Declarative)**

- 과정의 상관없이 상태에 따라 보여지는 UI가 바뀐다.

```tsx
function ErrorButton() {
  const [isError, setIsError] = useState(false); // 상태 정의

  return (
    // UI = f(state): 상태에 따라 UI가 어떻게 보일지 '선언'만 해둠
    <button
      style={{ backgroundColor: isError ? 'red' : 'blue' }}
      onClick={() => setIsError(!isError)} // 클릭 시 상태만 변경!
    >
      {isError ? '에러 발생!' : '정상'}
    </button>
  );
}
```

얼마전 토스 과제의 리뷰어들의 대화를 보다가 아래처럼 부모컴포넌트에 위임이 된다면, 부모컴포넌트에 대한 의존성이 높지 않나요? 라는 의문점을 가진 사람이 있었다.

[React Suspense 정말 많이 사용하시나요? · toss-fe-interview frontend-fundamentals-mock-exam-1 · Discussion #77](https://github.com/toss-fe-interview/frontend-fundamentals-mock-exam-1/discussions/77#discussioncomment-15061079)

> 물론 자식 컴포넌트가 특정 환경(Suspense)에 종속된다는 점에서 결합도가 높아진다고 볼 수도 있다.
>
> 하지만 컴포넌트 내부에서 덕지덕지 붙여야 했던 `loading`, `error` 처리 로직을 부모에게 **위임**함으로써, 자식 컴포넌트는 오로지 **성공한 데이터**만 바라볼 수 있게 된다.
>
> 결합도라는 비용을 지불하고, **순수한 UI**라는 더 큰 가치를 얻는 셈이다. 따라서 Suspense를 사용하는 것이 더 고차원의 선언형 프로그래밍에 가깝다고 생각한다.


## 리액트의 철학은 선언형이다

[Who linked React and "UI is a function of state"?](https://www.reddit.com/r/react/comments/n5i2mg/who_linked_react_and_ui_is_a_function_of_state/?tl=ko)

정말 react에서 말했는지 궁금해서 커뮤니티 찾아봤다.. 대충 맞는 듯


`💡UI = f(state)`

- `UI`: 사용자가 화면에서 보는 최종 결과물 (HTML, DOM).
- `f`: 우리가 작성하는 React 컴포넌트.
- `state`: 컴포넌트가 가지고 있는 데이터 (props, state, context 등).

즉, **"상태가 같으면, 언제나 똑같은 화면이 나와야 한다"** 는 뜻이다.



React 상태(state)의 개념이 적용 된 이후에는, **명령형 프로그래밍** 방식인 `버튼을 찾아서, 배경색을 빨강으로 바꾸고, 텍스트를 '에러'로 변경해라.` 를 `내 상태가 isError라면, UI는 빨간색 버튼이어야 한다.` 선언형 프로그래밍 방식으로 패러다임이 바뀌게 된거 같다.

**React를 쓰는 이상 우리는 선언형 프로그래밍을 할 수밖에 없다.**

가끔 컴포넌트 안에 복잡한 분기(if, switch)가 들어가면 마치 명령형 코드를 짜는 듯한 느낌을 받을 때가 있다. 하지만 그것은 선언형이 깨진 것이 아니다. 단지 추상화 레벨이 낮아서 로직이 적나라하게 드러난 상태일 뿐이다.
