# SA_duel 사이트 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 가상의 격투 게임 SA_duel의 캐릭터 이미지를 스킨별로 정리하는 개인 아카이브 사이트 구축

**Architecture:** 순수 HTML/CSS/JS 정적 사이트. 모든 데이터는 `js/data.js`에 정의. 캐릭터 페이지는 `character.html` 단일 파일에 URL 파라미터(`?id=diana`)로 동적 렌더링. 태그 필터링은 클라이언트 사이드 JS로 처리.

**Tech Stack:** HTML5, CSS3 (CSS Variables), Vanilla JS (ES6+), 빌드 도구 없음

---

## 파일 구조

```
SA_DUEL/
├── index.html           # 메인 페이지 — 캐릭터 목록, 전체 페이지 진입
├── character.html       # 캐릭터 페이지 — ?id=diana 형식으로 캐릭터 구분
├── all.html             # 전체 이미지 페이지 — 태그 필터링
├── css/
│   ├── base.css         # CSS 변수, 리셋, 공통 레이아웃
│   └── gallery.css      # 갤러리 그리드 스타일
├── js/
│   ├── data.js          # 캐릭터/스킨/이미지/태그 데이터
│   ├── main.js          # 메인 페이지 렌더링
│   ├── character.js     # 캐릭터 페이지 렌더링
│   ├── all.js           # 전체 페이지 + 태그 필터링
│   └── filter.js        # 태그 필터링 순수 함수 (테스트 가능)
└── images/              # 이미지 폴더 (캐릭터/스킨별)
    ├── diana/
    ├── victoria/
    ├── cassandra/
    └── hilda/
```

---

### Task 1: 데이터 구조 정의 (data.js)

**Files:**
- Create: `js/data.js`

데이터 구조의 기준. 이후 모든 JS 파일이 `SA_DATA`를 참조한다.

- [ ] **Step 1: `js/data.js` 작성**

```javascript
const SA_DATA = {
  characters: {
    diana: {
      name: "다이애나",
      nameEn: "Diana",
      origin: "SA — ShadeWatch",
      style: "총기류 & 격투술 / 밀리터리 근접전",
      flavor: [
        "ShadeWatch의 엘리트 요원.",
        "Operator의 가장 믿을 수 있는 아군."
      ],
      thumbnail: "images/diana/thumb.png",
      skins: [
        // 예시 — 실제 이미지 추가 시 이 형식으로 등록
        // {
        //   id: "default",
        //   name: "기본",
        //   theme: "기본",
        //   images: [
        //     { src: "images/diana/default/001.jpg", tags: ["메인 일러스트"] }
        //   ]
        // }
      ]
    },
    victoria: {
      name: "빅토리아",
      nameEn: "Victoria",
      origin: "SA — Overcharge",
      style: "격투술 & 역장 / 초능력 근접 압박형",
      flavor: [
        "Stella의 보안팀장. 서류도, 회의도, 전투도 — 모든 것이 완벽하다.",
        "실패는 용납하지 않는다."
      ],
      thumbnail: "images/victoria/thumb.png",
      skins: []
    },
    cassandra: {
      name: "카산드라",
      nameEn: "Cassandra",
      origin: "SA — Kingdom's Edge",
      style: "마법진 & 격투술 / 함정 기반 트릭키 공세형",
      flavor: [
        "공략의 여제라 불리는 수수께끼의 모험가.",
        "그 정체는 몰락한 솔레미 왕국의 왕녀."
      ],
      thumbnail: "images/cassandra/thumb.png",
      skins: []
    },
    hilda: {
      name: "힐다",
      nameEn: "Hilda",
      origin: "SA — Last Colony",
      style: "활 & 격투술 / 원거리-근접 혼합형",
      flavor: [
        "끝난 세계에서 살아남은 자.",
        "크룬 제2 콜로니가 그녀를 만들었다."
      ],
      thumbnail: "images/hilda/thumb.png",
      skins: []
    }
  },

  // 전체 캐릭터 순서 (메인 페이지 표시 순서)
  characterOrder: ["diana", "victoria", "cassandra", "hilda"]
};
```

- [ ] **Step 2: 커밋**

```bash
git add js/data.js
git commit -m "feat: add data structure"
```

---

### Task 2: 태그 필터링 함수 (filter.js) — TDD

**Files:**
- Create: `js/filter.js`
- Create: `js/filter.test.js`

필터링 로직만 분리해서 독립적으로 테스트.

- [ ] **Step 1: `js/filter.test.js` 작성**

```javascript
// 브라우저 콘솔에서 실행하거나, filter.js를 로드한 후 실행
// 사용법: <script src="js/filter.js"></script><script src="js/filter.test.js"></script>

(function runTests() {
  const images = [
    { src: "a.jpg", tags: ["패배", "기본"] },
    { src: "b.jpg", tags: ["메인 일러스트", "기본"] },
    { src: "c.jpg", tags: ["패배", "평상복"] }
  ];

  function assert(condition, message) {
    if (!condition) throw new Error("FAIL: " + message);
    console.log("PASS: " + message);
  }

  // 태그 없으면 전체 반환
  const all = filterImages(images, []);
  assert(all.length === 3, "태그 없으면 전체 반환");

  // 단일 태그 필터링
  const defeated = filterImages(images, ["패배"]);
  assert(defeated.length === 2, "패배 태그 2개");
  assert(defeated.every(img => img.tags.includes("패배")), "모두 패배 태그 보유");

  // 복수 태그 AND 필터링
  const defeatedDefault = filterImages(images, ["패배", "기본"]);
  assert(defeatedDefault.length === 1, "패배 AND 기본 = 1개");
  assert(defeatedDefault[0].src === "a.jpg", "정확한 이미지 반환");

  // 매칭 없음
  const none = filterImages(images, ["없는태그"]);
  assert(none.length === 0, "매칭 없으면 빈 배열");

  console.log("모든 테스트 통과");
})();
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

`index.html`에 임시로 두 스크립트를 추가하고 브라우저 콘솔 확인:
```html
<script src="js/filter.js"></script>
<script src="js/filter.test.js"></script>
```
Expected: `ReferenceError: filterImages is not defined`

- [ ] **Step 3: `js/filter.js` 작성**

```javascript
/**
 * @param {Array<{src: string, tags: string[]}>} images
 * @param {string[]} selectedTags
 * @returns {Array<{src: string, tags: string[]}>}
 */
function filterImages(images, selectedTags) {
  if (selectedTags.length === 0) return images;
  return images.filter(img =>
    selectedTags.every(tag => img.tags.includes(tag))
  );
}
```

- [ ] **Step 4: 브라우저 콘솔에서 테스트 통과 확인**

Expected: 콘솔에 `모든 테스트 통과` 출력

- [ ] **Step 5: 임시 스크립트 태그 제거 후 커밋**

```bash
git add js/filter.js js/filter.test.js
git commit -m "feat: add tag filter function with tests"
```

---

### Task 3: 공통 CSS

**Files:**
- Create: `css/base.css`
- Create: `css/gallery.css`

- [ ] **Step 1: `css/base.css` 작성**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #0d0d10;
  --bg2:       #141418;
  --bg3:       #1c1c22;
  --border:    #28282f;
  --text:      #d0d0d8;
  --text-sub:  #60606a;
  --text-dim:  #38383f;
  --accent:    #8888c0;
  --accent-dim:#252540;
  --radius:    8px;
  --font:      'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  min-height: 100vh;
}

a { color: inherit; text-decoration: none; }

.page-header {
  padding: 32px 40px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 1.4rem;
  letter-spacing: 0.1em;
  color: var(--accent);
}

.nav-link {
  font-size: 0.85rem;
  color: var(--text-sub);
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: color 0.2s, border-color 0.2s;
}

.nav-link:hover {
  color: var(--text);
  border-color: var(--accent);
}
```

- [ ] **Step 2: `css/gallery.css` 작성**

```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  padding: 32px 40px;
}

.gallery-item {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--bg2);
  cursor: pointer;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.04);
}

.gallery-item .tags {
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.gallery-item:hover .tags {
  opacity: 1;
}

.tag {
  font-size: 0.7rem;
  padding: 2px 8px;
  background: rgba(0,0,0,0.7);
  border: 1px solid var(--accent);
  border-radius: 99px;
  color: var(--text);
}

.tag.active {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}
```

- [ ] **Step 3: 커밋**

```bash
git add css/base.css css/gallery.css
git commit -m "feat: add base and gallery CSS"
```

---

### Task 4: 메인 페이지 (index.html + main.js)

**Files:**
- Create: `index.html`
- Create: `js/main.js`

- [ ] **Step 1: `index.html` 작성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SA_duel</title>
  <link rel="stylesheet" href="css/base.css">
  <style>
    .character-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      padding: 40px;
    }

    .character-card {
      display: block;
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      transition: border-color 0.2s, transform 0.2s;
    }

    .character-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
    }

    .character-card img {
      width: 100%;
      aspect-ratio: 3 / 4;
      object-fit: cover;
      display: block;
    }

    .character-card .info {
      padding: 12px 14px;
    }

    .character-card .name {
      font-size: 1rem;
      color: var(--text);
    }

    .character-card .origin {
      font-size: 0.75rem;
      color: var(--text-sub);
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <header class="page-header">
    <span class="page-title">SA_duel</span>
    <a href="all.html" class="nav-link">전체 보기</a>
  </header>
  <main id="character-grid" class="character-grid"></main>
  <script src="js/data.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: `js/main.js` 작성**

```javascript
const grid = document.getElementById("character-grid");

SA_DATA.characterOrder.forEach(id => {
  const char = SA_DATA.characters[id];
  const card = document.createElement("a");
  card.href = `character.html?id=${id}`;
  card.className = "character-card";
  card.innerHTML = `
    <img src="${char.thumbnail}" alt="${char.name}" onerror="this.style.display='none'">
    <div class="info">
      <div class="name">${char.name}</div>
      <div class="origin">${char.origin}</div>
    </div>
  `;
  grid.appendChild(card);
});
```

- [ ] **Step 3: 브라우저에서 `index.html` 열어 캐릭터 카드 4개 확인**

- [ ] **Step 4: 커밋**

```bash
git add index.html js/main.js
git commit -m "feat: add main page with character list"
```

---

### Task 5: 캐릭터 페이지 (character.html + character.js)

**Files:**
- Create: `character.html`
- Create: `js/character.js`

- [ ] **Step 1: `character.html` 작성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SA_duel</title>
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/gallery.css">
  <style>
    .profile {
      padding: 40px;
      border-bottom: 1px solid var(--border);
      display: flex;
      gap: 32px;
      align-items: flex-start;
    }

    .profile-thumb {
      width: 140px;
      aspect-ratio: 3 / 4;
      object-fit: cover;
      border-radius: var(--radius);
      background: var(--bg2);
      flex-shrink: 0;
    }

    .profile-info { display: flex; flex-direction: column; gap: 10px; }

    .profile-name { font-size: 1.6rem; color: var(--text); }

    .profile-origin { font-size: 0.85rem; color: var(--accent); }

    .profile-style { font-size: 0.8rem; color: var(--text-sub); }

    .profile-flavor {
      font-size: 0.9rem;
      color: var(--text-sub);
      line-height: 1.8;
      margin-top: 8px;
    }

    .skin-section { padding: 32px 40px; }

    .skin-title {
      font-size: 0.75rem;
      color: var(--text-dim);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .skin-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .skin-tab {
      padding: 6px 14px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 0.8rem;
      color: var(--text-sub);
      cursor: pointer;
      background: none;
      transition: color 0.2s, border-color 0.2s;
    }

    .skin-tab.active,
    .skin-tab:hover {
      color: var(--accent);
      border-color: var(--accent);
    }
  </style>
</head>
<body>
  <header class="page-header">
    <a href="index.html" class="nav-link">← 목록</a>
    <span id="page-title" class="page-title"></span>
    <a href="all.html" class="nav-link">전체 보기</a>
  </header>
  <section class="profile">
    <img id="profile-thumb" class="profile-thumb" src="" alt="">
    <div class="profile-info">
      <div id="profile-name" class="profile-name"></div>
      <div id="profile-origin" class="profile-origin"></div>
      <div id="profile-style" class="profile-style"></div>
      <div id="profile-flavor" class="profile-flavor"></div>
    </div>
  </section>
  <section class="skin-section">
    <div class="skin-title">SKINS</div>
    <div id="skin-tabs" class="skin-tabs"></div>
    <div id="gallery" class="gallery-grid"></div>
  </section>
  <script src="js/data.js"></script>
  <script src="js/character.js"></script>
</body>
</html>
```

- [ ] **Step 2: `js/character.js` 작성**

```javascript
const params = new URLSearchParams(location.search);
const id = params.get("id");
const char = SA_DATA.characters[id];

if (!char) {
  document.body.innerHTML = "<p style='padding:40px;color:#666'>캐릭터를 찾을 수 없습니다.</p>";
  throw new Error("Unknown character: " + id);
}

// 프로필 렌더링
document.title = `${char.name} — SA_duel`;
document.getElementById("page-title").textContent = char.name;
document.getElementById("profile-thumb").src = char.thumbnail;
document.getElementById("profile-thumb").alt = char.name;
document.getElementById("profile-name").textContent = `${char.name}  ${char.nameEn}`;
document.getElementById("profile-origin").textContent = char.origin;
document.getElementById("profile-style").textContent = char.style;
document.getElementById("profile-flavor").innerHTML = char.flavor.join("<br>");

// 스킨 탭 + 갤러리 렌더링
const tabsEl = document.getElementById("skin-tabs");
const galleryEl = document.getElementById("gallery");

function renderGallery(skin) {
  galleryEl.innerHTML = "";
  skin.images.forEach(img => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.innerHTML = `
      <img src="${img.src}" alt="${img.tags.join(", ")}">
      <div class="tags">${img.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
    `;
    galleryEl.appendChild(item);
  });
}

function renderTabs(skins) {
  tabsEl.innerHTML = "";
  skins.forEach((skin, i) => {
    const btn = document.createElement("button");
    btn.className = "skin-tab" + (i === 0 ? " active" : "");
    btn.textContent = skin.name;
    btn.addEventListener("click", () => {
      tabsEl.querySelectorAll(".skin-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderGallery(skin);
    });
    tabsEl.appendChild(btn);
  });
  if (skins.length > 0) renderGallery(skins[0]);
}

if (char.skins.length === 0) {
  galleryEl.innerHTML = "<p style='color:var(--text-dim);font-size:0.85rem'>등록된 스킨이 없습니다.</p>";
} else {
  renderTabs(char.skins);
}
```

- [ ] **Step 3: 브라우저에서 `character.html?id=diana` 열어 프로필 확인**

- [ ] **Step 4: 커밋**

```bash
git add character.html js/character.js
git commit -m "feat: add character page with skin tabs and gallery"
```

---

### Task 6: 전체 이미지 페이지 (all.html + all.js)

**Files:**
- Create: `all.html`
- Create: `js/all.js`

- [ ] **Step 1: `all.html` 작성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>전체 — SA_duel</title>
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/gallery.css">
  <style>
    .filter-bar {
      padding: 24px 40px;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .filter-label {
      font-size: 0.75rem;
      color: var(--text-dim);
      letter-spacing: 0.1em;
    }

    .tag-pool {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .tag-btn {
      padding: 4px 12px;
      border: 1px solid var(--border);
      border-radius: 99px;
      font-size: 0.78rem;
      color: var(--text-sub);
      cursor: pointer;
      background: none;
      transition: all 0.15s;
    }

    .tag-btn:hover { border-color: var(--accent); color: var(--text); }

    .tag-btn.active {
      background: var(--accent-dim);
      border-color: var(--accent);
      color: var(--accent);
    }

    .result-count {
      font-size: 0.78rem;
      color: var(--text-dim);
      padding: 12px 40px 0;
    }
  </style>
</head>
<body>
  <header class="page-header">
    <a href="index.html" class="nav-link">← 목록</a>
    <span class="page-title">전체</span>
    <span></span>
  </header>
  <div class="filter-bar">
    <div class="filter-label">TAGS</div>
    <div id="tag-pool" class="tag-pool"></div>
  </div>
  <div id="result-count" class="result-count"></div>
  <div id="gallery" class="gallery-grid"></div>
  <script src="js/data.js"></script>
  <script src="js/filter.js"></script>
  <script src="js/all.js"></script>
</body>
</html>
```

- [ ] **Step 2: `js/all.js` 작성**

```javascript
// 전체 이미지 수집 (캐릭터/스킨 정보 포함)
const allImages = [];
SA_DATA.characterOrder.forEach(charId => {
  const char = SA_DATA.characters[charId];
  char.skins.forEach(skin => {
    skin.images.forEach(img => {
      allImages.push({ ...img, charId, charName: char.name, skinName: skin.name });
    });
  });
});

// 태그 목록 수집
const tagSet = new Set();
allImages.forEach(img => img.tags.forEach(t => tagSet.add(t)));
const allTags = [...tagSet].sort();

let selectedTags = [];

const tagPoolEl = document.getElementById("tag-pool");
const galleryEl = document.getElementById("gallery");
const countEl = document.getElementById("result-count");

function renderGallery() {
  const filtered = filterImages(allImages, selectedTags);
  countEl.textContent = `${filtered.length}개`;
  galleryEl.innerHTML = "";
  filtered.forEach(img => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.innerHTML = `
      <img src="${img.src}" alt="${img.tags.join(", ")}">
      <div class="tags">${img.tags.map(t => `<span class="tag${selectedTags.includes(t) ? " active" : ""}">${t}</span>`).join("")}</div>
    `;
    galleryEl.appendChild(item);
  });
}

function renderTagPool() {
  tagPoolEl.innerHTML = "";
  allTags.forEach(tag => {
    const btn = document.createElement("button");
    btn.className = "tag-btn" + (selectedTags.includes(tag) ? " active" : "");
    btn.textContent = tag;
    btn.addEventListener("click", () => {
      if (selectedTags.includes(tag)) {
        selectedTags = selectedTags.filter(t => t !== tag);
      } else {
        selectedTags.push(tag);
      }
      renderTagPool();
      renderGallery();
    });
    tagPoolEl.appendChild(btn);
  });
}

renderTagPool();
renderGallery();
```

- [ ] **Step 3: 브라우저에서 `all.html` 열어 확인**
  - 태그 클릭 시 필터링 동작 확인
  - 이미지가 없으면 "0개" 표시, 태그 풀은 비어 있음 (정상)

- [ ] **Step 4: 커밋**

```bash
git add all.html js/all.js
git commit -m "feat: add all-images page with tag filtering"
```

---

## 이미지 추가 방법 (참고)

`js/data.js`의 해당 캐릭터 `skins` 배열에 아래 형식으로 추가:

```javascript
{
  id: "default",          // 스킨 고유 ID (영문 소문자)
  name: "기본",            // 표시될 스킨 이름
  theme: "기본",           // 테마 분류 (크로스 참조용)
  images: [
    { src: "images/diana/default/001.jpg", tags: ["메인 일러스트"] },
    { src: "images/diana/default/002.jpg", tags: ["패배"] }
  ]
}
```
