
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getDatabase, ref, get, set } from "firebase/database";
import { MOCK_MATCHES } from "../constants";

const firebaseConfig = {
  apiKey: "AIzaSyAkg3Pj0wPgK3G-qdLSVHOgk2n_4GRjWOw",
  authDomain: "betplusai.firebaseapp.com",
  databaseURL: "https://betplusai-default-rtdb.firebaseio.com",
  projectId: "betplusai",
  storageBucket: "betplusai.firebasestorage.app",
  messagingSenderId: "236151382844",
  appId: "1:236151382844:web:bab19231cb42dff61b3439",
  measurementId: "G-TBHYTSS1R9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Explicitly set persistence to LOCAL to ensure the user stays logged in after refresh
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Firebase Persistence Error:", error);
  });

// Seed the database with mock matches if it's empty
export const seedDatabase = async () => {
  const matchesRef = ref(db, 'matches');
  try {
    const snapshot = await get(matchesRef);
    if (!snapshot.exists()) {
      console.log("Seeding database with initial match data...");
      // Convert array to object for Firebase (using ID as key)
      const matchesObj = MOCK_MATCHES.reduce((acc, match) => {
        acc[match.id] = match;
        return acc;
      }, {} as Record<string, any>);
      
      await set(matchesRef, matchesObj);
      console.log("Database seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
