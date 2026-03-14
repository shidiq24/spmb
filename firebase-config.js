// Import fungsi yang dibutuhkan dari Firebase SDK (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3wWftFl7NbQUUPybaHJfqN-pliKkqRhE",
  authDomain: "spmbspenturi2.firebaseapp.com",
  projectId: "spmbspenturi2",
  storageBucket: "spmbspenturi2.firebasestorage.app",
  messagingSenderId: "344434288989",
  appId: "1:344434288989:web:c0b889d1bcae46ba6560b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Firestore Database
export const db = getFirestore(app);