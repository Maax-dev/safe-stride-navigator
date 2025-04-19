
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, MapPin } from "lucide-react";

const IncidentReporter = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [textReport, setTextReport] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Get current location
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
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };
  
  // Handle recording start/stop
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      return;
    }
    
    // Get user's location when starting to record
    getCurrentLocation();
    
    // Start recording
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
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };
  
  // Submit incident report
  const submitReport = async () => {
    // Get user's location if not already available
    if (!location) {
      getCurrentLocation();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Import Firebase functionality dynamically to avoid issues if Firebase isn't configured
      const { reportIncident } = await import('@/firebase/incidents');
      
      // Get user info from localStorage
      const userString = localStorage.getItem('safeStrideUser');
      const user = userString ? JSON.parse(userString) : { email: 'anonymous' };
      
      // Create a blob from audio URL if it exists
      let audioBlob;
      if (audioURL) {
        const response = await fetch(audioURL);
        audioBlob = await response.blob();
      }
      
      // Report the incident to Firebase
      await reportIncident(
        {
          description: textReport,
          location: location,
          reportedBy: user.email,
          type: 'other',  // In a real app, we'd let the user select a type
          severity: 3     // Medium severity by default
        },
        audioBlob
      );
      
      // Reset form after submission
      setTextReport('');
      setAudioURL(null);
      
      // Show success feedback
      alert("Incident reported successfully. Thank you for helping keep our community safe.");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("There was a problem submitting your report. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="p-6 shadow-lg bg-background">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Report an Incident</h2>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Share details about any safety concerns to help others stay safe.
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            <Button 
              variant={location ? "outline" : "secondary"}
              size="sm"
              onClick={getCurrentLocation}
              className="flex gap-2 items-center"
            >
              <MapPin className="h-4 w-4" />
              {location ? "Location Added" : "Add Location"}
            </Button>
            {location && (
              <span className="text-xs text-muted-foreground">
                Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
              </span>
            )}
          </div>
          
          <Textarea 
            placeholder="Describe the incident or safety concern..."
            value={textReport}
            onChange={(e) => setTextReport(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Audio Report</p>
          <div className="flex items-center gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              onClick={toggleRecording}
              className="flex gap-2 items-center"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? "Stop Recording" : "Record Audio"}
            </Button>
            
            {isRecording && (
              <div className="flex items-center gap-2">
                <span className="animate-pulse text-destructive">●</span>
                <span className="text-sm text-muted-foreground">Recording...</span>
              </div>
            )}
          </div>
          
          {audioURL && (
            <audio src={audioURL} controls className="w-full mt-2" />
          )}
        </div>
        
        <Button
          className="w-full"
          onClick={submitReport}
          disabled={isSubmitting || (!textReport && !audioURL)}
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
      </div>
    </Card>
  );
};

export default IncidentReporter;
