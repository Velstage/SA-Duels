# Gallery Masonry Layout

**Date:** 2026-05-14  
**Status:** Approved

## Problem

`gallery.css`의 `.gallery-item`이 `aspect-ratio: 3/4`로 고정되어 있어, 가로형·정사각형 이미지가 `object-fit: cover`로 크롭된다.

## Solution

CSS `columns`를 사용한 메이슨리 레이아웃으로 전환. 이미지 원본 비율을 그대로 유지하고 크롭 없이 표시.

## Changes

**파일: `css/gallery.css`만 수정**

### `.gallery-grid`
- `display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))` 제거
- `columns: 4; column-gap: 10px` 적용

### `.gallery-item`
- `aspect-ratio: 3/4` 제거
- `overflow: hidden` 유지 (border-radius 클리핑용)
- `break-inside: avoid` 추가
- `margin-bottom: 10px` 추가 (gap 대체)

### `.gallery-item img`
- `height: 100%` 제거
- `object-fit: cover` 제거
- `height: auto` 적용

### 반응형 breakpoints
- `> 900px` → 4열
- `600–900px` → 3열
- `< 600px` → 2열

## Out of Scope

- `js/all.js` 변경 없음
- `all.html` 변경 없음
- Firestore 데이터 변경 없음
