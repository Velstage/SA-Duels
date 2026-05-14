# Gallery Masonry Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `css/gallery.css`를 수정해 갤러리가 이미지 원본 비율을 유지하는 CSS columns 메이슨리 레이아웃으로 전환한다.

**Architecture:** CSS `columns` 속성 하나로 메이슨리 효과를 구현. `aspect-ratio` 고정과 `object-fit: cover` 크롭을 제거하고 이미지가 자연 비율로 표시되게 한다. 반응형은 미디어 쿼리로 열 수를 조정한다.

**Tech Stack:** Pure CSS (변경 파일 1개)

---

### Task 1: gallery.css — 메이슨리 레이아웃으로 전환

**Files:**
- Modify: `css/gallery.css`

- [ ] **Step 1: 로컬 서버 열고 현재 상태 확인**

  `http://localhost:3000/all.html` 을 브라우저에서 열어 현재 갤러리 레이아웃을 눈으로 기록한다.

- [ ] **Step 2: `.gallery-grid` 규칙 교체**

  `css/gallery.css` 의 `.gallery-grid` 블록을 아래로 교체한다:

  ```css
  .gallery-grid {
    columns: 4;
    column-gap: 10px;
    padding: 28px 32px;
  }
  ```

  (기존의 `display: grid`, `grid-template-columns`, `gap` 제거)

- [ ] **Step 3: `.gallery-item` 규칙 교체**

  기존 `.gallery-item` 블록을 아래로 교체한다:

  ```css
  .gallery-item {
    break-inside: avoid;
    margin-bottom: 10px;
    border-radius: var(--radius);
    background: var(--bg2);
    overflow: hidden;
  }
  ```

  (`aspect-ratio: 3/4` 제거, `position: relative` 는 overlay 때문에 유지)

  수정 후:

  ```css
  .gallery-item {
    position: relative;
    break-inside: avoid;
    margin-bottom: 10px;
    border-radius: var(--radius);
    background: var(--bg2);
    overflow: hidden;
  }
  ```

- [ ] **Step 4: `.gallery-item img` 규칙 교체**

  기존 `.gallery-item img` 블록을 아래로 교체한다:

  ```css
  .gallery-item img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.3s ease;
  }
  ```

  (`height: 100%`, `object-fit: cover` 제거)

- [ ] **Step 5: 반응형 미디어 쿼리 추가**

  파일 끝에 추가한다:

  ```css
  @media (max-width: 900px) {
    .gallery-grid { columns: 3; }
  }

  @media (max-width: 600px) {
    .gallery-grid { columns: 2; }
  }
  ```

- [ ] **Step 6: 브라우저에서 시각 확인**

  `http://localhost:3000/all.html` 새로고침 후 확인:
  - 이미지가 원본 비율 그대로 표시되는가
  - 가로형 이미지가 크롭 없이 가로로 넓게 표시되는가
  - 호버 시 overlay 정상 노출되는가
  - 브라우저 창 폭을 줄였을 때 3열 → 2열로 변하는가

- [ ] **Step 7: 커밋**

  ```bash
  git add css/gallery.css
  git commit -m "feat: switch gallery to CSS columns masonry layout"
  ```
