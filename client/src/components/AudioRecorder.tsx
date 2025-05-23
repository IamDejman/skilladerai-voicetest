import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  promptText?: string;
  maxRecordingTime?: number; // maximum recording time in seconds
  assessmentType?: string; // type of assessment (e.g., "reading_aloud", "scenario_response")
}

const AudioRecorder = ({ 
  onRecordingComplete, 
  promptText = "The quick brown fox jumps over the lazy dog.", 
  maxRecordingTime = 180, // default 3 minutes
  assessmentType = "general" 
}: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate progress percentage based on recording time
  const progressPercentage = (recordingTime / maxRecordingTime) * 100;

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      // Release audio URL if it exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // State for permission dialog
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  
  // Request fullscreen with permission
  const requestFullscreenWithPermission = () => {
    setShowPermissionDialog(true);
  };
  
  // Request fullscreen function
  const requestFullscreen = async () => {
    try {
      // Hide the navbar when entering fullscreen
      const navbar = document.querySelector('nav');
      if (navbar) {
        navbar.style.display = 'none';
      }
      
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if ((docEl as any).webkitRequestFullscreen) {
        await (docEl as any).webkitRequestFullscreen();
      } else if ((docEl as any).mozRequestFullScreen) {
        await (docEl as any).mozRequestFullScreen();
      } else if ((docEl as any).msRequestFullscreen) {
        await (docEl as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error('Error requesting fullscreen:', error);
      alert('Unable to enter fullscreen mode. Please ensure your browser allows fullscreen.');
    }
  };

  const startRecording = async () => {
    try {
      // Show permission dialog instead of immediately requesting fullscreen
      requestFullscreenWithPermission();
      return; // Exit early - actual recording will start after permission is granted
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };
  
  // The actual recording start function that runs after permission is granted
  const startRecordingAfterPermission = async () => {
    try {
      // Reset state if re-recording
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setIsReviewing(false);
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setIsReviewing(true);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Auto-stop if max recording time is reached
          if (newTime >= maxRecordingTime) {
            stopRecording();
            return maxRecordingTime;
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Unable to access your microphone. Please check your browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitRecording = () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      onRecordingComplete(audioBlob);
      
      // Reset for potential next recording
      setIsReviewing(false);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAssessmentTitle = () => {
    switch (assessmentType) {
      case "reading_aloud":
        return "Reading Assessment";
      case "scenario_response":
        return "Scenario Response";
      case "open_conversation":
        return "Conversation Skills";
      default:
        return "Voice Assessment";
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-neutral">
      {/* Fullscreen Permission Dialog */}
      {showPermissionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-2">Fullscreen Mode Required</h3>
            <p className="mb-4">
              This voice assessment requires fullscreen mode to maintain test integrity. 
              While in fullscreen mode:
            </p>
            <ul className="list-disc pl-5 mb-6 space-y-2">
              <li>You'll need to complete the current recording before exiting</li>
              <li>Exiting fullscreen will automatically submit your recording</li>
              <li>The navigation bar will be hidden during the assessment</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 sm:order-1 order-2"
                onClick={() => setShowPermissionDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 sm:order-2 order-1"
                onClick={async () => {
                  setShowPermissionDialog(false);
                  await requestFullscreen();
                  startRecordingAfterPermission();
                }}
              >
                Enter Fullscreen Mode
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-primary px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center">
          <i className="ri-mic-fill text-white text-lg sm:text-xl mr-2"></i>
          <h3 className="font-nunito font-bold text-white text-base sm:text-lg">{getAssessmentTitle()}</h3>
        </div>
        {isRecording && (
          <div className="text-white font-nunito">
            <span className="font-bold">{formatTime(recordingTime)}</span>
            <span className="text-xs sm:text-sm opacity-70"> / {formatTime(maxRecordingTime)}</span>
          </div>
        )}
      </div>
      
      {isRecording && (
        <div className="bg-white px-2">
          <Progress value={progressPercentage} className="h-1.5" />
        </div>
      )}
      
      <div className="p-4 sm:p-6 bg-white">
        <div className="bg-neutral rounded-lg sm:rounded-xl p-3 sm:p-6 mb-4 sm:mb-6">
          <p className="font-nunito font-bold mb-1 sm:mb-2 text-sm sm:text-base">Please read this aloud:</p>
          <p className="text-sm sm:text-lg font-opensans">{promptText}</p>
        </div>
        
        {isReviewing && audioUrl ? (
          <div className="mb-4 sm:mb-6">
            <p className="font-nunito font-bold mb-2 text-sm sm:text-base">Review your recording:</p>
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              controls 
              className="w-full mb-4" 
            />
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={startRecording}
                className="w-full sm:w-1/2 py-2 sm:py-3 bg-neutral hover:bg-neutral/80 text-text font-nunito font-bold rounded-full transition-colors text-sm sm:text-base"
              >
                <i className="ri-restart-line mr-1.5 sm:mr-2"></i>
                Record Again
              </Button>
              <Button
                onClick={submitRecording}
                className="w-full sm:w-1/2 py-2 sm:py-3 bg-primary hover:bg-primary/90 text-white font-nunito font-bold rounded-full transition-colors text-sm sm:text-base"
              >
                <i className="ri-check-line mr-1.5 sm:mr-2"></i>
                Submit Recording
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center items-center mb-4 sm:mb-6">
              <div className={`audio-wave ${isRecording ? '' : 'inactive'}`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="audio-wave-bar"></div>
                ))}
              </div>
            </div>
            
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isReviewing}
              className={`w-full py-4 sm:py-6 ${
                isRecording
                  ? 'bg-[#F44336] hover:bg-[#D32F2F]'
                  : 'bg-secondary hover:bg-[#1976D2]'
              } text-white font-nunito font-bold rounded-full transition-colors flex items-center justify-center h-auto text-sm sm:text-base`}
            >
              <i className={`${isRecording ? 'ri-stop-line' : 'ri-mic-line'} mr-1.5 sm:mr-2 text-lg sm:text-xl`}></i>
              {isRecording ? 'Stop Recording' : 'Start Speaking'}
            </Button>
            
            <p className="text-center text-xs sm:text-sm mt-3 sm:mt-4 text-text opacity-70">
              {isRecording
                ? 'Click the button to stop recording when you are finished'
                : 'Click the button and start speaking to begin the assessment'}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
