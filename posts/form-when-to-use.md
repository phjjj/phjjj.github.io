---
title: "form은 언제 사용해야할까?"
excerpt: "버튼 기반 UI 작업을 계기로 form 태그의 역할과 제어형·비제어형 컴포넌트의 차이를 다시 정리했다."
image_url: ""
tags: ["개발","React","HTML"]
created_at: "2025-12-20T00:00:00+00:00"
published: true
---

최근 개발을 할 때, 버튼을 눌러서 사용자가 선택 또는 입력한 값을 서버에 전송하고 응답을 받아 오는 페이지를 많이 작업했는데, 문득 `form`의 사용을 잊고 있었다.

주로 `selct`와 `input`이 있는 컴포넌트가 꽤나 있었는데 이것을 `form`으로 사용하는게 옳은 선택이었는지 궁금해서 역할에 대해 알아보았다.

## form이란?

> HTML `<form>` 요소는 정보를 제출하기 위한 대화형 컨트롤을 포함하는 문서 구획을 나타냅니다. -mdn-

form은 본래 자바스크립트 없이도 완벽하게 서버와 통신할 수 있는 독립적인 태그이다.

```html
<form action="/login" method="POST">
  <input name="id" />
  <button type="submit">로그인</button>
</form>
```

이러한 html이 있다면,

```
Method: POST
URL: /login
Content-Type: application/x-www-form-urlencoded (기본값)
```

이런 식으로 서버에 요청을 보낼 수 있게 된다.

**form은 웹이 처음 등장한 초반에 사용자가 입력한 정보를 서버에 전송하기 위해 생겨난 태그이다.**

### 특징

form은 다양한 입력 컨트롤과 함께 사용되어 사용자의 데이터를 수집하고 서버로 전송할 수 있다.

각 태그들은 `name` 속성을 통해 데이터의 키를 정의하고, 사용자의 입력값을 값으로 담아낸다.

| 태그                  | 설명                                               |
| --------------------- | -------------------------------------------------- |
| `<input>`             | 텍스트 입력 (text, email, password 등)             |
| `<select>`            | 드롭다운 선택                                      |
| `<textarea>`          | 여러 줄 텍스트 입력                                |
| `<input type="file">` | 파일 업로드 (`enctype="multipart/form-data"` 필요) |
| `<button>`            | form 제출 트리거                                   |

**이 외에도 사용할 수 있는 태그들:**

- `<fieldset>`과 `<legend>`: 관련된 입력 필드들을 시각적/논리적으로 그룹화
- `<label>`: 입력 컨트롤의 설명을 제공하고 접근성을 향상
- `<datalist>`: input에 자동완성 옵션을 제공
- `<input type="number">`, `<input type="date">`, `<input type="range">` 등 다양한 입력 타입

아무튼 form은 독립적인 컨테이너로 사용하는게 아니라 여러 입력 필드들과 함께 사용해 서버에 데이터를 쉽게 전송할 수 있다.

## React에서 form을 전송하기

폼의 역할을 상태로 처리가 하게 되면 리액트가 값을 제어하게 되면서 **제어형 컴포넌트**, `ref`나 `formData`로 처리를 하면 **비제어형 컴포넌트**로 설명을 한다.

### 비제어형 컴포넌트 (FormData 사용)

**장점**

- 코드가 간단하고 직관적
- 외부 form 라이브러리(ref 기반)와 연동이 쉬움
- 파일 업로드 시 multipart/form-data 처리 용이

**단점**

- 실시간 유효성 검사 구현이 어려움
- 입력값 변환/포맷팅이 제한적

```tsx
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // FormData를 사용해서 모든 form 값들을 쉽게 수집
  const formData = new FormData(e.currentTarget);
  const formValues = Object.fromEntries(formData);

  console.log('Form data:', formValues);
  // API 호출 등 실제 제출 로직
};

<form onSubmit={handleSubmit}>
  <input name="name" placeholder="이름" />
  <input name="email" type="email" placeholder="이메일" />
  <button type="submit">제출</button>
</form>;
```

### 제어형 컴포넌트 (State로 값 관리)

**장점**

- 실시간 유효성 검사 및 입력값 변환 가능
- 복잡한 폼 로직 구현에 유리

**단점**

- 코드가 더 길어지고 복잡해짐
- 잦은 리렌더링으로 성능 저하 가능성 (사실 크게 문제가 되지는 않음)
- 간단한 폼에서는 불필요한 코드 증가

```tsx
import { useState } from 'react';

const ControlledForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    // API 호출 등 실제 제출 로직
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="이름" />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="이메일"
      />
      <button type="submit">제출</button>
    </form>
  );
};
```

## 언제 사용해야 할까?

React에서는 `form` 없이 `state`와 `onClick`만으로도 충분히 기능을 구현할 수 있다. 하지만 **사용자가 데이터를 선택/입력해서 서버로 보내는 흐름**이 있다면, 껍데기는 `form`을 유지하는 것이 훨씬 유리하다.

`form` 태그를 쓰면 별도 이벤트 핸들러 없이도 Enter 한 번으로 전송이 가능해 키보드 UX가 좋아지고, 키패드에 '전송'이나 '검색' 버튼이 알아서 활성화되는 모바일 최적화가 가능해진다. 또한 스크린 리더 등 보조 기술이 "데이터를 입력하고 제출하는 곳"임을 정확히 인식하여 접근성이 향상된다.

제어형(State)과 비제어형(Ref/FormData) 사이의 정답은 없다. 타이핑과 동시에 에러를 보여주거나 입력값에 따라 UI가 즉각 변해야 할 때는 제어형이 적합하고, 단순 데이터 수집이 목적이거나 필드가 너무 많아 성능 저하가 걱정될 때는 비제어형이 효과적이다. 최근엔 `react-hook-form`으로 두 방식의 장점을 모두 챙길 수 있다.

이번 프로젝트를 진행하며 제어형과 비제어형을 모두 써보니, 요구사항 때문에 비제어형에서 제어형으로 변경하는 경우도 있었는데 결국 기술은 문제를 해결하기 위한 수단일 뿐이라는 걸 다시 느꼈다. 요구사항에 가장 적합한 기술을 선택할 때 비로소 더 견고한 코드가 완성되는 것 같다.
