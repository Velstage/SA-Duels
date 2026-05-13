# SA_duel 사이트 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 가상의 격투 게임 SA_duel의 캐릭터 이미지를 스킨별로 정리하고, 폰/컴 어디서든 이미지를 추가·관리할 수 있는 개인 아카이브 사이트 구축

**Architecture:** 순수 HTML/CSS/JS 정적 사이트. 데이터는 Firebase Firestore에 저장, 이미지는 Firebase Storage에 업로드. ES Module 방식으로 Firebase v11 CDN SDK 사용. 빌드 도구 없음.

**Tech Stack:** HTML5, CSS3 (CSS Variables), Vanilla JS (ES6 Modules), Firebase Firestore, Firebase Storage

---

## Firestore 데이터 구조

```
characters/{charId}
  name: string          # "다이애나"
  nameEn: string        # "Diana"
  origin: string        # "SA — ShadeWatch"
  style: string         # "총기류 & 격투술 / 밀리터리 근접전"
  flavor: string[]      # ["ShadeWatch의 엘리트 요원.", "..."]
  thumbnailUrl: string  # Storage URL (나중에 업데이트)
  order: number         # 메인 페이지 표시 순서

skins/{skinId}
  charId: string
  name: string          # "기본"
  theme: string         # "기본"
  order: number

images/{imgId}
  charId: string
  skinId: string
  src: string           # Firebase Storage 다운로드 URL
  tags: string[]
  order: number
  createdAt: timestamp
```

---

## 파일 구조

```
SA_DUEL/
├── index.html           # 메인 페이지 — 캐릭터 목록
├── character.html       # 캐릭터 페이지 (?id=diana)
├── all.html             # 전체 이미지 + 태그 필터링
├── seed.html            # 초기 캐릭터 데이터 시딩 (1회용)
├── css/
│   ├── base.css
│   └── gallery.css
└── js/
    ├── firebase.js      # Firebase 초기화 + db, storage export
    ├── filter.js        # 태그 필터링 순수 함수 (테스트 가능)
    ├── filter.test.js   # filter.js 테스트
    ├── main.js          # 메인 페이지
    ├── character.js     # 캐릭터 페이지 + 관리 UI
    └── all.js           # 전체 페이지
```

---

### Task 1: Firebase 프로젝트 설정

**Files:**
- Create: `js/firebase.js`

- [ ] **Step 1: Firebase 프로젝트 생성**

  1. https://console.firebase.google.com 접속
  2. "프로젝트 추가" → 이름: `sa-duel`
  3. Google Analytics: 비활성화 → 프로젝트 만들기

- [ ] **Step 2: Firestore 활성화**

  1. 왼쪽 메뉴 "Firestore Database" → "데이터베이스 만들기"
  2. **프로덕션 모드**로 시작 → 리전: `asia-northeast3 (서울)` → 완료

- [ ] **Step 3: Storage 활성화**

  1. 왼쪽 메뉴 "Storage" → "시작하기"
  2. 프로덕션 모드 → 동일 리전 → 완료

- [ ] **Step 4: 보안 규칙 설정 (Firestore)**

  Firestore → 규칙 탭:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true;
      }
    }
  }
  ```
  게시 클릭.

- [ ] **Step 5: 보안 규칙 설정 (Storage)**

  Storage → 규칙 탭:
  ```
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /{allPaths=**} {
        allow read, write: if true;
      }
    }
  }
  ```
  게시 클릭.

- [ ] **Step 6: 웹 앱 추가 및 config 복사**

  1. 프로젝트 설정(톱니바퀴) → "앱 추가" → 웹(`</>`)
  2. 앱 닉네임: `sa-duel-web` → 등록
  3. firebaseConfig 객체 복사해두기

- [ ] **Step 7: `js/firebase.js` 작성**

  위에서 복사한 config를 붙여넣기:

  ```javascript
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
  import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

  const firebaseConfig = {
    apiKey: "여기에_붙여넣기",
    authDomain: "여기에_붙여넣기",
    projectId: "여기에_붙여넣기",
    storageBucket: "여기에_붙여넣기",
    messagingSenderId: "여기에_붙여넣기",
    appId: "여기에_붙여넣기"
  };

  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const storage = getStorage(app);
  ```

- [ ] **Step 8: 커밋**

  ```bash
  git add js/firebase.js
  git commit -m "feat: add Firebase config"
  ```

---

### Task 2: 초기 데이터 시딩 (seed.html)

**Files:**
- Create: `seed.html`

캐릭터 4명의 기본 정보를 Firestore에 한 번만 넣는 페이지.

- [ ] **Step 1: `seed.html` 작성**

  ```html
  <!DOCTYPE html>
  <html lang="ko">
  <head>
    <meta charset="UTF-8">
    <title>Seed</title>
  </head>
  <body>
    <button id="btn">시딩 실행</button>
    <pre id="log"></pre>
    <script type="module">
      import { db } from "./js/firebase.js";
      import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

      const characters = {
        diana: {
          name: "다이애나", nameEn: "Diana",
          origin: "SA — ShadeWatch",
          style: "총기류 & 격투술 / 밀리터리 근접전",
          flavor: ["ShadeWatch의 엘리트 요원.", "Operator의 가장 믿을 수 있는 아군."],
          thumbnailUrl: "", order: 0
        },
        victoria: {
          name: "빅토리아", nameEn: "Victoria",
          origin: "SA — Overcharge",
          style: "격투술 & 역장 / 초능력 근접 압박형",
          flavor: ["Stella의 보안팀장. 서류도, 회의도, 전투도 — 모든 것이 완벽하다.", "실패는 용납하지 않는다."],
          thumbnailUrl: "", order: 1
        },
        cassandra: {
          name: "카산드라", nameEn: "Cassandra",
          origin: "SA — Kingdom's Edge",
          style: "마법진 & 격투술 / 함정 기반 트릭키 공세형",
          flavor: ["공략의 여제라 불리는 수수께끼의 모험가.", "그 정체는 몰락한 솔레미 왕국의 왕녀."],
          thumbnailUrl: "", order: 2
        },
        hilda: {
          name: "힐다", nameEn: "Hilda",
          origin: "SA — Last Colony",
          style: "활 & 격투술 / 원거리-근접 혼합형",
          flavor: ["끝난 세계에서 살아남은 자.", "크룬 제2 콜로니가 그녀를 만들었다."],
          thumbnailUrl: "", order: 3
        }
      };

      const log = document.getElementById("log");
      document.getElementById("btn").addEventListener("click", async () => {
        log.textContent = "시딩 시작...\n";
        for (const [id, data] of Object.entries(characters)) {
          await setDoc(doc(db, "characters", id), data);
          log.textContent += `✓ ${id}\n`;
        }
        log.textContent += "완료. 이 페이지는 닫아도 됩니다.";
      });
    </script>
  </body>
  </html>
  ```

- [ ] **Step 2: 브라우저에서 `seed.html` 열고 버튼 클릭**

  Expected: 로그에 `✓ diana`, `✓ victoria`, `✓ cassandra`, `✓ hilda`, `완료` 출력

- [ ] **Step 3: Firebase 콘솔 Firestore에서 4개 문서 확인**

- [ ] **Step 4: 커밋**

  ```bash
  git add seed.html
  git commit -m "feat: add seed page for initial character data"
  ```

---

### Task 3: 태그 필터링 함수 (filter.js) — TDD

**Files:**
- Create: `js/filter.js`
- Create: `js/filter.test.js`

- [ ] **Step 1: `js/filter.test.js` 작성**

  ```javascript
  // 브라우저 콘솔에서 확인용. filter.js 로드 후 실행.
  // 테스트 페이지: <script src="js/filter.js"></script><script src="js/filter.test.js"></script>

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

    const all = filterImages(images, []);
    assert(all.length === 3, "태그 없으면 전체 반환");

    const defeated = filterImages(images, ["패배"]);
    assert(defeated.length === 2, "패배 태그 2개");
    assert(defeated.every(img => img.tags.includes("패배")), "모두 패배 태그 보유");

    const defeatedDefault = filterImages(images, ["패배", "기본"]);
    assert(defeatedDefault.length === 1, "패배 AND 기본 = 1개");
    assert(defeatedDefault[0].src === "a.jpg", "정확한 이미지 반환");

    const none = filterImages(images, ["없는태그"]);
    assert(none.length === 0, "매칭 없으면 빈 배열");

    console.log("모든 테스트 통과");
  })();
  ```

- [ ] **Step 2: 임시 test.html로 실패 확인**

  ```html
  <!-- test.html (임시) -->
  <!DOCTYPE html><html><body>
  <script src="js/filter.js"></script>
  <script src="js/filter.test.js"></script>
  </body></html>
  ```
  브라우저 콘솔 Expected: `ReferenceError: filterImages is not defined`

- [ ] **Step 3: `js/filter.js` 작성**

  ```javascript
  function filterImages(images, selectedTags) {
    if (selectedTags.length === 0) return images;
    return images.filter(img =>
      selectedTags.every(tag => img.tags.includes(tag))
    );
  }
  ```

- [ ] **Step 4: 브라우저 콘솔에서 통과 확인**

  Expected: `모든 테스트 통과`

- [ ] **Step 5: test.html 삭제 후 커밋**

  ```bash
  git add js/filter.js js/filter.test.js
  git commit -m "feat: add tag filter function with tests"
  ```

---

### Task 4: 공통 CSS

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

  body { background: var(--bg); color: var(--text); font-family: var(--font); min-height: 100vh; }

  a { color: inherit; text-decoration: none; }

  .page-header {
    padding: 24px 32px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .page-title { font-size: 1.2rem; letter-spacing: 0.1em; color: var(--accent); }

  .nav-link {
    font-size: 0.82rem;
    color: var(--text-sub);
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: color 0.2s, border-color 0.2s;
    cursor: pointer;
    background: none;
  }

  .nav-link:hover { color: var(--text); border-color: var(--accent); }

  .btn-primary {
    font-size: 0.82rem;
    color: var(--accent);
    padding: 6px 14px;
    border: 1px solid var(--accent);
    border-radius: var(--radius);
    background: none;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-primary:hover { background: var(--accent-dim); }

  /* 모달 */
  .modal-backdrop {
    display: none;
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    z-index: 100;
    align-items: center;
    justify-content: center;
  }

  .modal-backdrop.open { display: flex; }

  .modal {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
    width: 420px;
    max-width: 90vw;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .modal-title { font-size: 1rem; color: var(--text); }

  .modal input[type="text"],
  .modal input[type="file"] {
    width: 100%;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 12px;
    color: var(--text);
    font-family: var(--font);
    font-size: 0.85rem;
  }

  .modal input[type="text"]::placeholder { color: var(--text-dim); }

  .modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
  ```

- [ ] **Step 2: `css/gallery.css` 작성**

  ```css
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
    padding: 28px 32px;
  }

  .gallery-item {
    position: relative;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    border-radius: var(--radius);
    background: var(--bg2);
  }

  .gallery-item img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    display: block;
  }

  .gallery-item:hover img { transform: scale(1.04); }

  .gallery-item .overlay {
    position: absolute; inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 10px;
    background: linear-gradient(transparent 50%, rgba(0,0,0,0.6));
    opacity: 0;
    transition: opacity 0.2s;
  }

  .gallery-item:hover .overlay { opacity: 1; }

  .gallery-item .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .tag {
    font-size: 0.68rem;
    padding: 2px 8px;
    background: rgba(0,0,0,0.6);
    border: 1px solid var(--accent);
    border-radius: 99px;
    color: var(--text);
    white-space: nowrap;
  }

  .tag.active { background: var(--accent-dim); color: var(--accent); }
  ```

- [ ] **Step 3: 커밋**

  ```bash
  git add css/base.css css/gallery.css
  git commit -m "feat: add base and gallery CSS"
  ```

---

### Task 5: 메인 페이지 (index.html + main.js)

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
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 14px;
        padding: 36px 32px;
      }

      .character-card {
        display: block;
        background: var(--bg2);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        overflow: hidden;
        transition: border-color 0.2s, transform 0.2s;
      }

      .character-card:hover { border-color: var(--accent); transform: translateY(-2px); }

      .character-card .thumb {
        width: 100%;
        aspect-ratio: 3 / 4;
        object-fit: cover;
        display: block;
        background: var(--bg3);
      }

      .character-card .info { padding: 12px 14px; }

      .character-card .name { font-size: 0.95rem; }

      .character-card .origin { font-size: 0.72rem; color: var(--text-sub); margin-top: 4px; }

      .loading { padding: 40px 32px; color: var(--text-dim); font-size: 0.85rem; }
    </style>
  </head>
  <body>
    <header class="page-header">
      <span class="page-title">SA_duel</span>
      <a href="all.html" class="nav-link">전체 보기</a>
    </header>
    <div id="root" class="loading">불러오는 중...</div>
    <script type="module" src="js/main.js"></script>
  </body>
  </html>
  ```

- [ ] **Step 2: `js/main.js` 작성**

  ```javascript
  import { db } from "./firebase.js";
  import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

  const root = document.getElementById("root");

  const q = query(collection(db, "characters"), orderBy("order"));
  const snapshot = await getDocs(q);

  const grid = document.createElement("div");
  grid.className = "character-grid";

  snapshot.forEach(docSnap => {
    const id = docSnap.id;
    const char = docSnap.data();
    const card = document.createElement("a");
    card.href = `character.html?id=${id}`;
    card.className = "character-card";
    card.innerHTML = `
      <img class="thumb" src="${char.thumbnailUrl || ''}"
           onerror="this.style.background='var(--bg3)';this.style.display='block'"
           alt="${char.name}">
      <div class="info">
        <div class="name">${char.name}</div>
        <div class="origin">${char.origin}</div>
      </div>
    `;
    grid.appendChild(card);
  });

  root.replaceWith(grid);
  ```

- [ ] **Step 3: 브라우저에서 `index.html` 열어 캐릭터 카드 4개 확인**

  썸네일 없으면 빈 박스로 표시됨 (정상).

- [ ] **Step 4: 커밋**

  ```bash
  git add index.html js/main.js
  git commit -m "feat: add main page reading from Firestore"
  ```

---

### Task 6: 캐릭터 페이지 (character.html + character.js)

**Files:**
- Create: `character.html`
- Create: `js/character.js`

스킨 추가, 이미지 추가(Storage 업로드), 태그 편집 포함.

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
        padding: 36px 32px;
        border-bottom: 1px solid var(--border);
        display: flex;
        gap: 28px;
        align-items: flex-start;
      }

      .profile-thumb {
        width: 130px;
        aspect-ratio: 3 / 4;
        object-fit: cover;
        border-radius: var(--radius);
        background: var(--bg2);
        flex-shrink: 0;
      }

      .profile-info { display: flex; flex-direction: column; gap: 8px; }

      .profile-name { font-size: 1.5rem; }

      .profile-origin { font-size: 0.82rem; color: var(--accent); }

      .profile-style { font-size: 0.78rem; color: var(--text-sub); }

      .profile-flavor { font-size: 0.88rem; color: var(--text-sub); line-height: 1.9; margin-top: 6px; }

      .skin-section { padding: 28px 32px; }

      .skin-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .section-label { font-size: 0.72rem; color: var(--text-dim); letter-spacing: 0.12em; }

      .skin-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }

      .skin-tab {
        padding: 5px 14px;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        font-size: 0.8rem;
        color: var(--text-sub);
        cursor: pointer;
        background: none;
        transition: color 0.2s, border-color 0.2s;
      }

      .skin-tab.active,
      .skin-tab:hover { color: var(--accent); border-color: var(--accent); }

      .gallery-header {
        display: flex;
        justify-content: flex-end;
        padding: 0 32px 12px;
      }

      .empty-state { padding: 20px 0; color: var(--text-dim); font-size: 0.82rem; }
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
      <div class="skin-header">
        <div class="section-label">SKINS</div>
        <button id="btn-add-skin" class="btn-primary">+ 스킨 추가</button>
      </div>
      <div id="skin-tabs" class="skin-tabs"></div>
    </section>

    <div class="gallery-header">
      <button id="btn-add-image" class="btn-primary" style="display:none">+ 이미지 추가</button>
    </div>
    <div id="gallery" class="gallery-grid"></div>

    <!-- 스킨 추가 모달 -->
    <div id="modal-skin" class="modal-backdrop">
      <div class="modal">
        <div class="modal-title">스킨 추가</div>
        <input id="skin-name" type="text" placeholder="스킨 이름 (예: 기본)">
        <input id="skin-theme" type="text" placeholder="테마 (예: 기본, 평상복)">
        <div class="modal-actions">
          <button class="nav-link" id="cancel-skin">취소</button>
          <button class="btn-primary" id="confirm-skin">추가</button>
        </div>
      </div>
    </div>

    <!-- 이미지 추가 모달 -->
    <div id="modal-image" class="modal-backdrop">
      <div class="modal">
        <div class="modal-title">이미지 추가</div>
        <input id="image-file" type="file" accept="image/*">
        <input id="image-tags" type="text" placeholder="태그 (쉼표로 구분, 예: 패배, 기본)">
        <div class="modal-actions">
          <button class="nav-link" id="cancel-image">취소</button>
          <button class="btn-primary" id="confirm-image">업로드</button>
        </div>
      </div>
    </div>

    <script type="module" src="js/character.js"></script>
  </body>
  </html>
  ```

- [ ] **Step 2: `js/character.js` 작성**

  ```javascript
  import { db, storage } from "./firebase.js";
  import {
    doc, getDoc, collection, getDocs, addDoc, query, orderBy, Timestamp
  } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
  import {
    ref, uploadBytes, getDownloadURL
  } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

  const params = new URLSearchParams(location.search);
  const charId = params.get("id");

  // 캐릭터 데이터 로드
  const charDoc = await getDoc(doc(db, "characters", charId));
  if (!charDoc.exists()) {
    document.body.innerHTML = "<p style='padding:40px;color:#666'>캐릭터를 찾을 수 없습니다.</p>";
    throw new Error("Unknown character: " + charId);
  }
  const char = charDoc.data();

  // 프로필 렌더링
  document.title = `${char.name} — SA_duel`;
  document.getElementById("page-title").textContent = char.name;
  document.getElementById("profile-thumb").src = char.thumbnailUrl || "";
  document.getElementById("profile-thumb").alt = char.name;
  document.getElementById("profile-name").textContent = `${char.name}  ${char.nameEn}`;
  document.getElementById("profile-origin").textContent = char.origin;
  document.getElementById("profile-style").textContent = char.style;
  document.getElementById("profile-flavor").innerHTML = char.flavor.join("<br>");

  // 상태
  let currentSkinId = null;
  let skins = [];

  const skinTabsEl = document.getElementById("skin-tabs");
  const galleryEl = document.getElementById("gallery");
  const btnAddImage = document.getElementById("btn-add-image");

  // 스킨 목록 로드
  async function loadSkins() {
    const q = query(collection(db, "skins"), orderBy("order"));
    const snap = await getDocs(q);
    skins = [];
    snap.forEach(d => {
      if (d.data().charId === charId) skins.push({ id: d.id, ...d.data() });
    });
    renderSkinTabs();
  }

  function renderSkinTabs() {
    skinTabsEl.innerHTML = "";
    if (skins.length === 0) {
      skinTabsEl.innerHTML = `<span style="color:var(--text-dim);font-size:0.82rem">등록된 스킨이 없습니다.</span>`;
      btnAddImage.style.display = "none";
      galleryEl.innerHTML = "";
      return;
    }
    skins.forEach((skin, i) => {
      const btn = document.createElement("button");
      btn.className = "skin-tab" + (i === 0 ? " active" : "");
      btn.textContent = skin.name;
      btn.dataset.skinId = skin.id;
      btn.addEventListener("click", () => {
        skinTabsEl.querySelectorAll(".skin-tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentSkinId = skin.id;
        loadGallery(skin.id);
      });
      skinTabsEl.appendChild(btn);
    });
    currentSkinId = skins[0].id;
    btnAddImage.style.display = "";
    loadGallery(skins[0].id);
  }

  // 갤러리 로드
  async function loadGallery(skinId) {
    galleryEl.innerHTML = `<span style="color:var(--text-dim);font-size:0.82rem;padding:0">불러오는 중...</span>`;
    const q = query(collection(db, "images"), orderBy("order"));
    const snap = await getDocs(q);
    const images = [];
    snap.forEach(d => { if (d.data().skinId === skinId) images.push({ id: d.id, ...d.data() }); });

    galleryEl.innerHTML = "";
    if (images.length === 0) {
      galleryEl.innerHTML = `<span style="color:var(--text-dim);font-size:0.82rem">이미지가 없습니다.</span>`;
      return;
    }
    images.forEach(img => galleryEl.appendChild(createImageEl(img)));
  }

  function createImageEl(img) {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.innerHTML = `
      <img src="${img.src}" alt="${img.tags.join(", ")}">
      <div class="overlay">
        <div class="tags">${img.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
      </div>
    `;
    return item;
  }

  // 스킨 추가 모달
  const modalSkin = document.getElementById("modal-skin");
  document.getElementById("btn-add-skin").addEventListener("click", () => modalSkin.classList.add("open"));
  document.getElementById("cancel-skin").addEventListener("click", () => modalSkin.classList.remove("open"));

  document.getElementById("confirm-skin").addEventListener("click", async () => {
    const name = document.getElementById("skin-name").value.trim();
    const theme = document.getElementById("skin-theme").value.trim();
    if (!name || !theme) return;
    await addDoc(collection(db, "skins"), { charId, name, theme, order: skins.length });
    modalSkin.classList.remove("open");
    document.getElementById("skin-name").value = "";
    document.getElementById("skin-theme").value = "";
    await loadSkins();
  });

  // 이미지 추가 모달
  const modalImage = document.getElementById("modal-image");
  btnAddImage.addEventListener("click", () => modalImage.classList.add("open"));
  document.getElementById("cancel-image").addEventListener("click", () => modalImage.classList.remove("open"));

  document.getElementById("confirm-image").addEventListener("click", async () => {
    const fileInput = document.getElementById("image-file");
    const tagsInput = document.getElementById("image-tags").value;
    const file = fileInput.files[0];
    if (!file || !currentSkinId) return;

    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    const storageRef = ref(storage, `images/${charId}/${currentSkinId}/${Date.now()}_${file.name}`);

    const confirmBtn = document.getElementById("confirm-image");
    confirmBtn.textContent = "업로드 중...";
    confirmBtn.disabled = true;

    const snapshot = await uploadBytes(storageRef, file);
    const src = await getDownloadURL(snapshot.ref);

    const q = query(collection(db, "images"), orderBy("order"));
    const snap = await getDocs(q);
    let count = 0;
    snap.forEach(d => { if (d.data().skinId === currentSkinId) count++; });

    await addDoc(collection(db, "images"), {
      charId, skinId: currentSkinId, src, tags, order: count,
      createdAt: Timestamp.now()
    });

    confirmBtn.textContent = "업로드";
    confirmBtn.disabled = false;
    modalImage.classList.remove("open");
    fileInput.value = "";
    document.getElementById("image-tags").value = "";
    await loadGallery(currentSkinId);
  });

  // 초기 로드
  await loadSkins();
  ```

- [ ] **Step 3: 브라우저에서 `character.html?id=diana` 열어 확인**
  - 프로필 표시 확인
  - "스킨 추가" → 모달 확인
  - 스킨 추가 후 탭 생성 확인
  - "이미지 추가" → 파일 선택 → 업로드 확인
  - Firebase 콘솔에서 skins, images 컬렉션 확인

- [ ] **Step 4: 커밋**

  ```bash
  git add character.html js/character.js
  git commit -m "feat: add character page with skin/image management"
  ```

---

### Task 7: 전체 이미지 페이지 (all.html + all.js)

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
        padding: 20px 32px;
        border-bottom: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .filter-label { font-size: 0.72rem; color: var(--text-dim); letter-spacing: 0.1em; }

      .tag-pool { display: flex; flex-wrap: wrap; gap: 6px; min-height: 28px; }

      .tag-btn {
        padding: 3px 12px;
        border: 1px solid var(--border);
        border-radius: 99px;
        font-size: 0.75rem;
        color: var(--text-sub);
        cursor: pointer;
        background: none;
        transition: all 0.15s;
      }

      .tag-btn:hover { border-color: var(--accent); color: var(--text); }

      .tag-btn.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }

      .result-bar {
        padding: 12px 32px 0;
        font-size: 0.75rem;
        color: var(--text-dim);
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
    <div id="result-bar" class="result-bar"></div>
    <div id="gallery" class="gallery-grid"></div>
    <script type="module" src="js/all.js"></script>
  </body>
  </html>
  ```

- [ ] **Step 2: `js/all.js` 작성**

  ```javascript
  import { db } from "./firebase.js";
  import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

  function filterImages(images, selectedTags) {
    if (selectedTags.length === 0) return images;
    return images.filter(img => selectedTags.every(tag => img.tags.includes(tag)));
  }

  // 전체 이미지 로드
  const q = query(collection(db, "images"), orderBy("createdAt"));
  const snap = await getDocs(q);
  const allImages = [];
  snap.forEach(d => allImages.push({ id: d.id, ...d.data() }));

  // 태그 목록 수집
  const tagSet = new Set();
  allImages.forEach(img => img.tags.forEach(t => tagSet.add(t)));
  const allTags = [...tagSet].sort();

  let selectedTags = [];

  const tagPoolEl = document.getElementById("tag-pool");
  const galleryEl = document.getElementById("gallery");
  const resultBarEl = document.getElementById("result-bar");

  function renderGallery() {
    const filtered = filterImages(allImages, selectedTags);
    resultBarEl.textContent = `${filtered.length}개`;
    galleryEl.innerHTML = "";
    filtered.forEach(img => {
      const item = document.createElement("div");
      item.className = "gallery-item";
      item.innerHTML = `
        <img src="${img.src}" alt="${img.tags.join(", ")}">
        <div class="overlay">
          <div class="tags">
            ${img.tags.map(t =>
              `<span class="tag${selectedTags.includes(t) ? " active" : ""}">${t}</span>`
            ).join("")}
          </div>
        </div>
      `;
      galleryEl.appendChild(item);
    });
  }

  function renderTagPool() {
    tagPoolEl.innerHTML = "";
    if (allTags.length === 0) {
      tagPoolEl.innerHTML = `<span style="color:var(--text-dim);font-size:0.78rem">태그 없음</span>`;
      return;
    }
    allTags.forEach(tag => {
      const btn = document.createElement("button");
      btn.className = "tag-btn" + (selectedTags.includes(tag) ? " active" : "");
      btn.textContent = tag;
      btn.addEventListener("click", () => {
        selectedTags = selectedTags.includes(tag)
          ? selectedTags.filter(t => t !== tag)
          : [...selectedTags, tag];
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
  - 이미지가 있으면 갤러리 표시, 태그 버튼 클릭 시 필터링 확인
  - 이미지 없으면 `0개`, 태그 없음 표시 (정상)

- [ ] **Step 4: 커밋**

  ```bash
  git add all.html js/all.js
  git commit -m "feat: add all-images page with tag filtering"
  ```

---

## 이미지 추가 방법 (운영)

캐릭터 페이지(`character.html?id=diana`)에서:
1. 스킨이 없으면 "스킨 추가" 버튼으로 먼저 스킨 생성
2. 스킨 탭 선택 후 "이미지 추가" 버튼
3. 파일 선택 + 태그 입력 (쉼표 구분) → 업로드
