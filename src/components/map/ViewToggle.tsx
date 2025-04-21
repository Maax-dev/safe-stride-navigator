
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { MapPin, ToggleLeft, ToggleRight } from "lucide-react"; 

interface ViewToggleProps {
  showHeatmap: boolean;
  onToggle: (checked: boolean) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ showHeatmap, onToggle }) => {
  const handleToggle = (checked: boolean) => {
    console.log("Toggle heatmap:", checked);
    onToggle(checked);
  };

  return (
    <div className="absolute bottom-6 left-4 z-[1000] bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 hover:bg-white">
      <MapPin className={`h-5 w-5 ${!showHeatmap ? 'text-primary' : 'text-muted-foreground'}`} />
      <Switch
        checked={showHeatmap}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-primary"
      />
      {showHeatmap ? 
        <ToggleRight className="h-5 w-5 text-primary" /> : 
        <ToggleLeft className="h-5 w-5 text-muted-foreground" />
      }
      <span className="text-xs font-medium ml-1">
        {showHeatmap ? 'Heatmap On' : 'Heatmap Off'}
      </span>
    </div>
  );
};

export default ViewToggle;
