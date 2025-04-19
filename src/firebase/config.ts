
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
    
    // Return the default config
    return {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID"
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
