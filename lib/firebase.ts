// lib/firebase.ts

// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyCFWn-KUKXQwY5vp2FNtBiiY5HVZhKIUxM",
//   authDomain: "art-fusion-80562.firebaseapp.com",
//   projectId: "art-fusion-80562",
//   appId: "1:628651021504:web:1ca58508748e090c7c8925",
// };

// const app = initializeApp(firebaseConfig);

// export const auth = getAuth(app);
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFWn-KUKXQwY5vp2FNtBiiY5HVZhKIUxM",
  authDomain: "art-fusion-80562.firebaseapp.com",
  projectId: "art-fusion-80562",
  storageBucket: "art-fusion-80562.firebasestorage.app",
  messagingSenderId: "628651021504",
  appId: "1:628651021504:web:1ca58508748e090c7c8925"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);