
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  GeoPoint, 
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";

// Interface for incident data
export interface Incident {
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  audioURL?: string;
  reportedBy: string;
  timestamp: Date | null;
  type: 'theft' | 'assault' | 'harassment' | 'other';
  severity: number; // 1-5 scale
}

// Report a new incident
export const reportIncident = async (incident: Omit<Incident, 'timestamp'>, audioBlob?: Blob) => {
  try {
    // If there's an audio recording, upload it first
    let audioURL;
    if (audioBlob) {
      const audioRef = ref(storage, `incident-audio/${Date.now()}`);
      const snapshot = await uploadBytes(audioRef, audioBlob);
      audioURL = await getDownloadURL(snapshot.ref);
    }
    
    // Create the incident document in Firestore
    const incidentData = {
      ...incident,
      audioURL,
      timestamp: serverTimestamp(),
      location: new GeoPoint(incident.location.lat, incident.location.lng)
    };
    
    const docRef = await addDoc(collection(db, "incidents"), incidentData);
    return docRef.id;
  } catch (error) {
    console.error("Error reporting incident:", error);
    throw error;
  }
};

// Get incidents within a radius (in km) of a location
export const getIncidentsNearby = async (
  lat: number, 
  lng: number, 
  radiusKm: number,
  limit = 100
) => {
  try {
    // Note: This is a simplified approach. In production, you'd use
    // Firebase GeoFirestore or a similar solution for proper geoqueries
    
    // For now, we'll just fetch recent incidents and filter them client-side
    const incidentsRef = collection(db, "incidents");
    const q = query(incidentsRef);
    const querySnapshot = await getDocs(q);
    
    const incidents: (Incident & { id: string })[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const incident = {
        id: doc.id,
        description: data.description,
        location: {
          lat: data.location.latitude,
          lng: data.location.longitude
        },
        audioURL: data.audioURL,
        reportedBy: data.reportedBy,
        timestamp: data.timestamp ? (data.timestamp as Timestamp).toDate() : null,
        type: data.type,
        severity: data.severity
      };
      
      // Calculate distance from provided coordinates (using the Haversine formula)
      const distance = calculateDistance(lat, lng, incident.location.lat, incident.location.lng);
      
      // Only include incidents within the specified radius
      if (distance <= radiusKm) {
        incidents.push(incident);
      }
    });
    
    return incidents;
  } catch (error) {
    console.error("Error fetching nearby incidents:", error);
    throw error;
  }
};

// Calculate distance between two coordinates using the Haversine formula
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
