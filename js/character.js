import { db, storage } from "./firebase.js";
import {
  doc, getDoc, collection, getDocs, addDoc, query, orderBy, Timestamp
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

const charId = location.hash.slice(1);

if (!charId) {
  document.body.innerHTML = "<p style='padding:40px;color:#666'>캐릭터를 찾을 수 없습니다.</p>";
  throw new Error("No character id");
}
const charDoc = await getDoc(doc(db, "characters", charId));
if (!charDoc.exists()) {
  document.body.innerHTML = "<p style='padding:40px;color:#666'>캐릭터를 찾을 수 없습니다.</p>";
  throw new Error("Unknown character: " + charId);
}
const char = charDoc.data();

document.title = `${char.name} — SA_duel`;
document.getElementById("page-title").textContent = char.name;
document.getElementById("profile-thumb").src = `https://firebasestorage.googleapis.com/v0/b/sa-duel.firebasestorage.app/o/thumbnails%2F${char.nameEn.toLowerCase()}_facial.png?alt=media`;
document.getElementById("profile-thumb").alt = char.name;
document.getElementById("profile-name").textContent = `${char.name}  ${char.nameEn}`;
document.getElementById("profile-origin").textContent = char.origin;
document.getElementById("profile-style").textContent = char.style;
document.getElementById("profile-flavor").innerHTML = char.flavor.join("<br>");

let currentSkinId = null;
let skins = [];

const skinTabsEl = document.getElementById("skin-tabs");
const galleryEl = document.getElementById("gallery");
const btnAddImage = document.getElementById("btn-add-image");

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

await loadSkins();
