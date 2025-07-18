// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBTsCT12j1Oqgq1LzYRFMJVsjQ66F4sOLA',
  authDomain: 'w2w1-82882.firebaseapp.com',
  projectId: 'w2w1-82882',
  storageBucket: 'w2w1-82882.appspot.com',
  messagingSenderId: '600836991384',
  appId: '1:600836991384:web',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
