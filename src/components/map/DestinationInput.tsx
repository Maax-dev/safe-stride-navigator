
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DestinationInputProps {
  destination: string;
  setDestination: (value: string) => void;
  onCalculateRoute: () => void;
  isLoading: boolean;
}

const DestinationInput = ({ destination, setDestination, onCalculateRoute, isLoading }: DestinationInputProps) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] p-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg">
      <div className="flex gap-2">
        <Input
          placeholder="Enter destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="flex-grow"
        />
        <Button 
          onClick={onCalculateRoute}
          className="flex-shrink-0"
          disabled={isLoading || !destination}
        >
          Go
        </Button>
      </div>
    </div>
  );
};

export default DestinationInput;
