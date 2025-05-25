// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyAVoNsKFsc0YtBoufPjCGabjLiF09yw-kw",
  authDomain: "proyectosescolares-61e69.firebaseapp.com",
  projectId: "proyectosescolares-61e69",
  storageBucket: "proyectosescolares-61e69.firebasestorage.app",
  messagingSenderId: "276922117102",
  appId: "1:276922117102:web:5053b8151774824d203cff"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);