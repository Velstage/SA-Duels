import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

// Firebase 콘솔에서 복사한 config를 여기에 붙여넣기
const firebaseConfig = {
  apiKey: "AIzaSyBXurya5D6pgBkdYhydj2lX1wvktG693R4",
  authDomain: "sa-duel.firebaseapp.com",
  projectId: "sa-duel",
  storageBucket: "sa-duel.firebasestorage.app",
  messagingSenderId: "703437854571",
  appId: "1:703437854571:web:d253e06945c3c95d07de2e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
