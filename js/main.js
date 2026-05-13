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
