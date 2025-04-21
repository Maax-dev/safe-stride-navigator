
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Map, Activity } from "lucide-react";

interface ViewToggleProps {
  showHeatmap: boolean;
  onToggle: (checked: boolean) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ showHeatmap, onToggle }) => {
  return (
    <div className="absolute bottom-6 left-4 z-[1000] bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 hover:bg-white">
      <Map className={`h-5 w-5 ${!showHeatmap ? 'text-primary' : 'text-muted-foreground'}`} />
      <Switch
        checked={showHeatmap}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
      <Activity className={`h-5 w-5 ${showHeatmap ? 'text-primary' : 'text-muted-foreground'}`} />
    </div>
  );
};

export default ViewToggle;
