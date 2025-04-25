import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBiI2qj5PqpdmGhO7a2Nv4Uf9sg2jKGse4",
  authDomain: "belajoia-8c11b.firebaseapp.com",
  projectId: "belajoia-8c11b",
  storageBucket: "belajoia-8c11b.firebasestorage.app",
  messagingSenderId: "465773604109",
  appId: "1:465773604109:web:be91979b40feacc3fe9444",
  measurementId: "G-6K40H21L55"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const storage = getStorage(app);
export { db };
export const auth = getAuth(app);