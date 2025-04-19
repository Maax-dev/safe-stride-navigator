
// Import the Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration manager
const FirebaseConfigManager = {
  getConfig: () => {
    // Try to get config from localStorage first
    const storedConfig = localStorage.getItem('firebase_config');
    if (storedConfig) {
      try {
        return JSON.parse(storedConfig);
      } catch (e) {
        console.error("Invalid stored Firebase config:", e);
      }
    }
    
    // Return the default config with your provided values
    return {
      apiKey: "AIzaSyBdGwGymSi27kX7BYIOw1vDhm_ceeTTtaQ",
      authDomain: "hack-66182.firebaseapp.com",
      projectId: "hack-66182",
      storageBucket: "hack-66182.firebasestorage.app",
      messagingSenderId: "285771933954",
      appId: "1:285771933954:web:fce66a1fddadd0b5a47a1b",
      measurementId: "G-P19HD95HKL"
    };
  },
  
  setConfig: (config) => {
    localStorage.setItem('firebase_config', JSON.stringify(config));
  }
};

// Initialize Firebase with current config
const firebaseConfig = FirebaseConfigManager.getConfig();
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export the config manager for use in setup screens
export const configManager = FirebaseConfigManager;

export default app;
