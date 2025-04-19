import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This page automatically redirects to the login page
const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const user = localStorage.getItem('safeStrideUser');
    
    if (user) {
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
