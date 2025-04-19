
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapView from '@/components/MapView';
import IncidentReporter from '@/components/IncidentReporter';
import { Map, Flag, Navigation, Mic } from "lucide-react";

const Home = () => {
  const [userName, setUserName] = useState<string>(() => {
    const user = localStorage.getItem('safeStrideUser');
    return user ? JSON.parse(user).name : 'User';
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b py-4 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Safe Stride</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Welcome, {userName}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 container mx-auto p-4">
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="map" className="flex gap-1 items-center">
              <Navigation className="h-4 w-4" />
              <span>Navigate</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex gap-1 items-center">
              <Flag className="h-4 w-4" />
              <span>Report</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex gap-1 items-center">
              <Map className="h-4 w-4" />
              <span>Heatmap</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map">
            <MapView />
          </TabsContent>
          
          <TabsContent value="report">
            <IncidentReporter />
          </TabsContent>
          
          <TabsContent value="heatmap">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Viewing crime hotspots in a 20 mile radius of your location.
                Red areas indicate higher concentrations of reported incidents.
              </p>
              <MapView showHeatmap={true} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;
