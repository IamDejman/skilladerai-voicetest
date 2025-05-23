import { useState, useRef, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecurityRecorderProps {
  isActive: boolean;
  sessionId?: string;
  showIndicator?: boolean;
}

/**
 * Security recording component that captures video during assessments
 * This component is designed to be unobtrusive but provide security verification
 */
export function SecurityRecorder({ 
  isActive,
  sessionId = 'unknown',
  showIndicator = true
}: SecurityRecorderProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  // Initialize camera when component becomes active
  useEffect(() => {
    if (isActive && !stream) {
      initCamera();
    }
    
    return () => {
      if (stream) {
        stopRecording();
        cleanupCamera();
      }
    };
  }, [isActive]);

  // Start/stop recording based on active state
  useEffect(() => {
    if (isActive && stream && !recording) {
      startRecording();
    } else if (!isActive && recording) {
      stopRecording();
    }
  }, [isActive, stream]);

  // Timer to track recording duration
  useEffect(() => {
    if (recording) {
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1000);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recording]);

  // Initialize camera access
  const initCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false // No need for audio in security recording
      });
      
      setStream(mediaStream);
      setPermissionDenied(false);
      
      // Security audit log
      console.log(`[${new Date().toISOString()}] Security camera initialized for session ${sessionId}`);
      
    } catch (error) {
      console.error("Error accessing camera for security recording:", error);
      setPermissionDenied(true);
    }
  };

  // Start recording security footage
  const startRecording = () => {
    if (!stream) return;
    
    try {
      const mediaRecorder = new MediaRecorder(stream);
      videoChunksRef.current = [];
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = handleRecordingComplete;
      
      // Start recording in 1-second chunks
      mediaRecorder.start(1000);
      setRecording(true);
      setRecordingDuration(0);
      
      // Security audit log
      console.log(`[${new Date().toISOString()}] Security recording started for session ${sessionId}`);
      
    } catch (error) {
      console.error("Error starting security recording:", error);
    }
  };

  // Stop recording security footage
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      // Security audit log
      console.log(`[${new Date().toISOString()}] Security recording stopped for session ${sessionId}`);
    }
  };
  
  // Process completed recording
  const handleRecordingComplete = () => {
    const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
    
    // In a production environment, we would upload this security recording
    // uploadSecurityRecording(videoBlob, sessionId);
    
    // Security audit log
    console.log(`[${new Date().toISOString()}] Security recording saved: ${Math.round(videoBlob.size/1024)} KB`);
  };

  // Clean up camera resources
  const cleanupCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Format time display
  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (permissionDenied) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Camera access is required for test security verification.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Only show indicator if requested
  if (showIndicator && recording) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
        <span>Security verification active ({formatTime(recordingDuration)})</span>
      </div>
    );
  }
  
  // Return empty div if not showing indicator
  return <div className="hidden"></div>;
}