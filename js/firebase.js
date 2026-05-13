import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

// Firebase 콘솔에서 복사한 config를 여기에 붙여넣기
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
