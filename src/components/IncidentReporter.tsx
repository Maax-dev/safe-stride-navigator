import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MapPin, Square } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const IncidentReporter = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
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

  const startRecording = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Please use Google Chrome or a supported browser.",
        variant: "destructive"
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Transcribed:", transcript);
      submitReport(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);
      toast({
        title: "Speech Recognition Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    toast({ title: "Recording started", description: "Click stop once done." });
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast({ title: "Recording stopped", description: "Processing your report..." });
    }
  };

  const submitReport = async (transcript: string) => {
    if (!location) {
      getCurrentLocation();
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/report_audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          lat: location.lat,
          lon: location.lng,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Report Submitted",
          description: "Thank you for reporting. Your report was logged successfully."
        });
      } else {
        toast({
          title: "Submission Error",
          description: data.error || "An error occurred. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
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
              <span className="text-sm text-muted-foreground">Location detected</span>
            ) : (
              <span className="text-sm text-destructive">Detecting location...</span>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            {!isRecording ? (
              <Button
                size="lg"
                className="w-48 h-48 rounded-full flex flex-col items-center justify-center gap-2"
                onClick={startRecording}
                disabled={isSubmitting || !location}
              >
                <Mic className="h-12 w-12" />
                <span className="text-sm">Start Recording</span>
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-48 h-48 bg-destructive text-white rounded-full flex flex-col items-center justify-center gap-2"
                onClick={stopRecording}
              >
                <Square className="h-12 w-12" />
                <span className="text-sm">Stop Recording</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default IncidentReporter;