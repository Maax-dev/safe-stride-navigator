
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "lucide-react";
import { registerUser, loginUser, onAuthChanged } from '@/api/auth';


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('safeStrideUser');
    if (user) {
      navigate('/home');
    }
  }, [navigate]);
  
  
  const handleRequestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Location access granted:", position.coords);
        setLocationPermission(true);
        // If we got here after logging in, now navigate to home
        if (localStorage.getItem('safeStrideUser')) {
          navigate('/home');
        }
      },
      (error) => {
        console.error("Location access denied:", error);
        setLocationPermission(false);
      }
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Use Firebase Authentication
      if (isSignUp) {
        // Register new user
        await registerUser(email, password, name);
      } else {
        // Login existing user
        await loginUser(email, password);
      }
      
      // Save some user info for easy access
      localStorage.setItem('safeStrideUser', JSON.stringify({ 
        email, 
        name: name || email.split('@')[0]
      }));
      
      // Check if location permission is granted, if not, request it
      if (locationPermission === null) {
        handleRequestLocation();
      } else {
        // Redirect to home page
        navigate('/home');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Authentication failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Navigation className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Safe Stride</h1>
            <p className="text-muted-foreground mt-2">Navigate safely with real-time safety data</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </span>
                ) : (
                  isSignUp ? "Create Account" : "Sign In"
                )}
              </Button>
            </div>
          </form>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm underline text-primary hover:text-primary/80"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
          
          {locationPermission === false && (
            <div className="text-sm text-destructive text-center">
              <p>Location access is required for this app to work properly.</p>
              <button
                type="button"
                onClick={handleRequestLocation}
                className="underline mt-1"
              >
                Grant location access
              </button>
            </div>
          )}
        </div>
      </Card>
      
      <p className="mt-8 text-sm text-center text-muted-foreground">
        Safe Stride helps you choose the safest walking routes<br />
        using real-time safety data.
      </p>
    </div>
  );
};

export default Login;
