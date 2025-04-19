
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { configManager } from '@/firebase/config';

// This page automatically redirects to the appropriate page
const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const user = localStorage.getItem('safeStrideUser');
    
    // Check if API configuration is set up
    const firebaseConfig = configManager.getConfig();
    const mapboxToken = localStorage.getItem('mapbox_token');
    
    // If API keys are not configured properly, go to setup
    if (
      firebaseConfig.apiKey === "YOUR_API_KEY" || 
      !mapboxToken || 
      mapboxToken === "YOUR_MAPBOX_PUBLIC_TOKEN"
    ) {
      navigate('/setup');
    }
    else if (user) {
      // If authenticated, go to home page
      navigate('/home');
    } else {
      // Otherwise go to login page
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
};

export default Index;
