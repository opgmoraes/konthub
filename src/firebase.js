import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// COLE AQUI O SEU FIREBASE CONFIG (esse abaixo é só um exemplo)
const firebaseConfig = {
  apiKey: "AIzaSyC7Tnd3cdiIYT9f9chUzzW9DVPm9DAFMJE",
  authDomain: "kont-hub.firebaseapp.com",
  projectId: "kont-hub",
  storageBucket: "kont-hub.firebasestorage.app",
  messagingSenderId: "11067807553961",
  appId: "1:1067807553961:web:16c044a6973e4d89d0acb8",
};

// Inicializa o app do Firebase
const app = initializeApp(firebaseConfig);

// Exporta as funções para usarmos nas telas do sistema
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
