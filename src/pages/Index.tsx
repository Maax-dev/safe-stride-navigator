import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { configManager } from '@/firebase/config';

// This page automatically redirects to the appropriate page
const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const user = localStorage.getItem('safeStrideUser');
    
    // If authenticated, go to home page
    if (user) {
      navigate('/home');
    } else {
      // Otherwise go to login page
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
};

export default Index;
