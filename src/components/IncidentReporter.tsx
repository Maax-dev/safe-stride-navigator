
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MapPin } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const IncidentReporter = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Get current location immediately when component mounts
  React.useEffect(() => {
    getCurrentLocation();
  }, []);
  
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Browser Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive"
      });
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        submitReport(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 30000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Error",
        description: "Unable to access your microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  
  const submitReport = async (audioBlob: Blob) => {
    if (!location) {
      getCurrentLocation();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { reportIncident } = await import('@/firebase/incidents');
      const userString = localStorage.getItem('safeStrideUser');
      const user = userString ? JSON.parse(userString) : { email: 'anonymous' };
      
      await reportIncident(
        {
          description: "Audio report",
          location: location,
          reportedBy: user.email,
          type: 'other',
          severity: 3
        },
        audioBlob
      );
      
      setAudioURL(null);
      toast({
        title: "Success",
        description: "Incident reported successfully. Thank you for helping keep our community safe.",
      });
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your report. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="p-6 shadow-lg bg-background">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Report an Incident</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {location ? (
              <span className="text-sm text-muted-foreground">
                Location detected
              </span>
            ) : (
              <span className="text-sm text-destructive">
                Detecting location...
              </span>
            )}
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              className={`w-48 h-48 rounded-full flex flex-col items-center justify-center gap-2 ${
                isRecording ? 'bg-destructive hover:bg-destructive/90' : ''
              }`}
              onClick={() => isRecording ? undefined : startRecording()}
              disabled={isSubmitting || !location}
            >
              <Mic className={`h-12 w-12 ${isRecording ? 'animate-pulse' : ''}`} />
              <span className="text-sm">
                {isRecording ? 'Recording...' : 'Hold to Report'}
              </span>
            </Button>
            
            {audioURL && (
              <audio src={audioURL} controls className="w-full mt-2" />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default IncidentReporter;
