import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface VideoRecorderProps {
  isActive: boolean;
  onRecordingComplete?: (videoBlob: Blob) => void;
  onRecordingStart?: () => void;
  maxDuration?: number; // in milliseconds
  autoStart?: boolean;
  showPreview?: boolean;
}

export function VideoRecorder({
  isActive,
  onRecordingComplete,
  onRecordingStart,
  maxDuration = 3600000, // default 1 hour max
  autoStart = true,
  showPreview = false
}: VideoRecorderProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Initialize webcam access and recording setup
  useEffect(() => {
    if (isActive) {
      initWebcam();
    } else {
      stopRecording();
      cleanup();
    }
    
    return () => {
      stopRecording();
      cleanup();
    };
  }, [isActive]);

  // Auto-start recording when component mounts if autoStart is true
  useEffect(() => {
    if (autoStart && stream && isActive && !recording) {
      startRecording();
    }
  }, [autoStart, stream, isActive]);

  // Set up timer to track recording duration
  useEffect(() => {
    if (recording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          // Check if max duration reached
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1000;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recording, maxDuration]);

  // Initialize webcam access
  const initWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setPermissionDenied(false);
      
      // Log for security audit
      console.log(`[${new Date().toISOString()}] Camera access initialized for assessment verification`);
      
    } catch (error) {
      console.error("Error accessing webcam:", error);
      setPermissionDenied(true);
      
      toast({
        title: "Camera Access Required",
        description: "Please enable camera access to continue with the secure assessment.",
        variant: "destructive",
      });
    }
  };

  // Start recording
  const startRecording = () => {
    if (!stream) return;
    
    chunksRef.current = [];
    
    try {
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordingBlob(videoBlob);
        
        if (onRecordingComplete) {
          onRecordingComplete(videoBlob);
        }
      };
      
      // Start recording
      mediaRecorder.start(1000); // Capture in 1 second chunks
      setRecording(true);
      setRecordingTime(0);
      
      // Notify parent component
      if (onRecordingStart) {
        onRecordingStart();
      }
      
      // Log for security audit
      console.log(`[${new Date().toISOString()}] Assessment recording started`);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording Error",
        description: "There was a problem starting the security recording. Please refresh and try again.",
        variant: "destructive",
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      // Log for security audit
      console.log(`[${new Date().toISOString()}] Assessment recording stopped after ${recordingTime/1000}s`);
    }
  };

  // Clean up resources
  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Format timer display
  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {permissionDenied && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Camera access is required for test security. Please enable your camera and refresh the page.
          </AlertDescription>
        </Alert>
      )}
      
      {showPreview && stream && (
        <div className="relative rounded-md overflow-hidden mb-4 bg-black">
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            playsInline
            className={`w-full h-auto ${showPreview ? 'block' : 'hidden'}`}
          />
          
          {recording && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs flex items-center">
              <span className="mr-1 h-2 w-2 rounded-full bg-white animate-pulse"></span>
              REC {formatTime(recordingTime)}
            </div>
          )}
        </div>
      )}
      
      {!showPreview && recording && (
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-md mb-4">
          <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-sm">Security recording active: {formatTime(recordingTime)}</span>
        </div>
      )}
      
      {!autoStart && (
        <div className="flex gap-2 mt-2">
          {!recording && (
            <Button onClick={startRecording} disabled={!stream || recording} variant="default">
              Start Recording
            </Button>
          )}
          
          {recording && (
            <Button onClick={stopRecording} disabled={!recording} variant="destructive">
              Stop Recording
            </Button>
          )}
        </div>
      )}
    </div>
  );
}