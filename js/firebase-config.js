// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBEqzUbus1kXmcIXwI0QlOIGa3IV1zqXVw",
  authDomain: "ebvmindore.firebaseapp.com",
  projectId: "ebvmindore",
  storageBucket: "ebvmindore.firebasestorage.app",
  messagingSenderId: "545685474288",
  appId: "1:545685474288:web:0bc816ef47dfaf63acab35",
  measurementId: "G-5HL4PRSHV9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export services for use in other files
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

console.log("Firebase initialized successfully");