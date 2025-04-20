
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapView from '@/components/MapView';
import IncidentReporter from '@/components/IncidentReporter';
import { Navigation, Flag } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [userName, setUserName] = useState<string>(() => {
    const user = localStorage.getItem('safeStrideUser');
    return user ? JSON.parse(user).name : 'User';
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('safeStrideUser');
    localStorage.removeItem('safeStrideToken'); // if stored
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b py-4 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Safe Stride</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {userName}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 container mx-auto p-4 flex flex-col">
        <Tabs defaultValue="map" className="w-full flex-grow flex flex-col">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="map" className="flex gap-1 items-center">
              <Navigation className="h-4 w-4" />
              <span>Navigate</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex gap-1 items-center">
              <Flag className="h-4 w-4" />
              <span>Report</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="flex-grow h-[calc(100vh-200px)]">
            <MapView />
          </TabsContent>
          
          <TabsContent value="report">
            <IncidentReporter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;
