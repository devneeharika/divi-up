import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBQ5piO7-OgFUkQVKsXdf78JzhwIk58D_0",
    authDomain: "divi-up-811.firebaseapp.com",
    projectId: "divi-up-811",
    storageBucket: "divi-up-811.firebasestorage.app",
    messagingSenderId: "306259010518",
    appId: "1:306259010518:web:806c6c0b36f74616d43a77",
    measurementId: "G-CH4222QN4E"
};

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

export const auth = getAuth(app);
export const db = getFirestore(app);
