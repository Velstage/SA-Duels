import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

function filterImages(images, selectedTags) {
  if (selectedTags.length === 0) return images;
  return images.filter(img => selectedTags.every(tag => img.tags.includes(tag)));
}

const q = query(collection(db, "images"), orderBy("createdAt"));
const snap = await getDocs(q);
const allImages = [];
snap.forEach(d => allImages.push({ id: d.id, ...d.data() }));

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
