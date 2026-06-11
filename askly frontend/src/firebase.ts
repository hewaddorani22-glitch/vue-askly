import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyDUdyLaav3--p3Tk4jaMtMxR6EAVPQ8_3w",
  authDomain: "askly-live.firebaseapp.com",
  databaseURL: "https://askly-live-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "askly-live",
  storageBucket: "askly-live.firebasestorage.app",
  messagingSenderId: "1042230972367",
  appId: "1:1042230972367:web:62aa5ab4b659fd04208cba"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)