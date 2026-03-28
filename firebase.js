import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCAyYLXdZlHMsFVaErLxFROqG8EbBE8ufU",
  authDomain: "medirelay-bcc87.firebaseapp.com",
  projectId: "medirelay-bcc87",
  storageBucket: "medirelay-bcc87.firebasestorage.app",
  messagingSenderId: "955669900122",
  appId: "1:955669900122:web:1774a9eb8764afcadd6163"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
