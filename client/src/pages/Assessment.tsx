import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AudioRecorder from "@/components/AudioRecorder";
import { SecurityRecorder } from "@/components/SecurityRecorder";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Define assessment stages
enum AssessmentType {
  TYPING_TEST = "typing",
  READING_COMPREHENSION = "reading",
  GRAMMAR = "grammar"
}

// Define Stage 2 assessment types
enum Stage2AssessmentType {
  WRITING = "writing",
  VOICE = "voice",
  SITUATIONAL_JUDGMENT = "sjt"
}

// Customer service voice prompts for assessment
const voicePrompts = [
  {
    id: "voice1",
    type: "reading_aloud",
    text: "Welcome to customer service. My name is Sarah, and I'll be assisting you today. Could you please provide your account number so I can better help with your inquiry? I want to ensure we address all your concerns efficiently and thoroughly.",
    maxTime: 30
  },
  {
    id: "voice2",
    type: "scenario_response",
    text: "A customer calls very upset because they've been on hold for 45 minutes trying to resolve a billing error. How would you respond to de-escalate the situation and address their concerns?",
    maxTime: 90
  },
  {
    id: "voice3",
    type: "open_conversation",
    text: "Explain how you would handle a situation where you need to deny a customer's request for a refund based on company policy, while still maintaining a positive customer relationship.",
    maxTime: 120
  }
]

// Define assessment stages
enum AssessmentStage {
  STAGE_1 = "stage1",
  STAGE_2 = "stage2"
}

// Default typing test text (fallback if API fails)
const defaultTypingText = `Customer service is about helping people and solving problems with empathy and professionalism. When assisting customers, it's important to listen carefully, acknowledge their concerns, and provide clear solutions. Every interaction should aim to exceed expectations and leave a positive impression.`;

// Reading comprehension scenarios
const readingComprehensionScenarios = [
  {
    id: 1,
    scenario: `A customer calls in, clearly frustrated because they've been charged twice for their monthly subscription. They explain that they've already contacted their bank but were told to resolve it with your company directly. This is their third time calling about this issue.`,
    questions: [
      {
        id: "q1-1",
        question: "What would be the most appropriate initial response?",
        options: [
          "Tell them they need to be patient as these things take time to resolve.",
          "Apologize for the inconvenience and acknowledge their frustration.",
          "Explain that double charges happen sometimes and it's normal.",
          "Suggest they should have checked their account more carefully."
        ],
        correctAnswer: 1
      },
      {
        id: "q1-2",
        question: "What information would you need to gather first?",
        options: [
          "Their opinion about your company's billing system.",
          "How many times exactly they've called before.",
          "Their account details and the dates of the duplicate charges.",
          "Whether they've considered canceling their subscription."
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 2,
    scenario: `A customer emails your technical support team about an error they're experiencing with your software. They've attached several screenshots showing the error messages. The customer mentions they have an important presentation tomorrow and need this fixed urgently. You recognize that this is a known issue that requires several steps to resolve.`,
    questions: [
      {
        id: "q2-1",
        question: "What should be your first priority in this situation?",
        options: [
          "Explain that there's a queue and they'll have to wait their turn.",
          "Acknowledge the urgency and provide immediate next steps.",
          "Tell them to reschedule their presentation.",
          "Suggest they should have tested the software earlier."
        ],
        correctAnswer: 1
      },
      {
        id: "q2-2",
        question: "What tone would be most appropriate for your response?",
        options: [
          "Casual and friendly",
          "Technical and detailed",
          "Efficient but empathetic",
          "Brief and direct"
        ],
        correctAnswer: 2
      }
    ]
  }
];

// Grammar assessment questions
const grammarQuestions = [
  {
    id: "g1",
    question: "Select the sentence with correct grammar:",
    options: [
      "We was unable to locate you're account in our system.",
      "We were unable to locate your account in our system.",
      "We was unable to locate your account in our system.",
      "We were unable to locate you're account in our system."
    ],
    correctAnswer: 1
  },
  {
    id: "g2",
    question: "Fill in the blank: 'Please hold while I ________ your information.'",
    options: [
      "access",
      "excess",
      "acess",
      "axcess"
    ],
    correctAnswer: 0
  },
  {
    id: "g3",
    question: "Which sentence uses punctuation correctly?",
    options: [
      "Thank you for your patience I'll resolve this issue soon.",
      "Thank you for your patience, I'll resolve this issue soon.",
      "Thank you for your patience; I'll resolve this issue, soon.",
      "Thank you for your patience: I'll resolve this issue soon."
    ],
    correctAnswer: 1
  },
  {
    id: "g4",
    question: "Choose the correct word for the sentence: 'We value your ________ and are working to improve our service.'",
    options: [
      "feedback",
      "feedbach",
      "feedbak",
      "feedbeck"
    ],
    correctAnswer: 0
  },
  {
    id: "g5",
    question: "Identify the sentence with correct subject-verb agreement:",
    options: [
      "The customer have submitted multiple requests.",
      "The customer has submitted multiple requests.",
      "The customer having submitted multiple requests.",
      "The customer be submitting multiple requests."
    ],
    correctAnswer: 1
  }
];

const writingPrompt = `A customer has written to complain that a product they ordered arrived damaged. Write a brief response (approx. 50 words) acknowledging their concern and explaining the next steps they should take.`;

// Interface for typing metrics
interface TypingMetrics {
  wpm: number;
  accuracy: number;
  consistency: number;
  elapsedTime: number;
  keystrokes: number;
  correctChars: number;
  errorChars: number;
  totalChars: number;
}

// Interface for reading comprehension
interface ReadingAnswer {
  questionId: string;
  selectedOption: number;
}

// Interface for assessment results
interface AssessmentResults {
  typing?: {
    wpm: number;
    accuracy: number;
    consistency: number;
    passed: boolean;
  };
  reading?: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    passed: boolean;
  };
  grammar?: {
    grammarScore: number;
    writingScore: number;
    overallPassed: boolean;
  };
  stage1Passed?: boolean;
  
  // Stage 2 results
  voice?: {
    pronunciation: number;
    fluency: number;
    vocabulary: number;
    grammar: number;
    overall: number;
    passed: boolean;
    cefrLevel?: string;
  };
  writing?: {
    emailResponseScore: number;
    complaintResolutionScore: number;
    processDocumentationScore: number;
    overallWritingScore: number;
    passed: boolean;
  };
  sjt?: {
    score: number;
    correctAnswers: number;
    totalScenarios: number;
    passed: boolean;
  };
  stage2Passed?: boolean;
  overallScore?: number;
}

// Handle fullscreen permission dialog functions
const handleAcceptFullscreen = async (
  setShowFullscreenDialog: React.Dispatch<React.SetStateAction<boolean>>,
  pendingAction: (() => void) | null,
  setPendingAction: React.Dispatch<React.SetStateAction<(() => void) | null>>,
  requestFullscreen: () => Promise<void>,
  toast: any
) => {
  setShowFullscreenDialog(false);
  
  // Request fullscreen
  await requestFullscreen();
  
  // Execute the pending action
  if (pendingAction) {
    pendingAction();
    setPendingAction(null);
  }
};

const handleDeclineFullscreen = (
  setShowFullscreenDialog: React.Dispatch<React.SetStateAction<boolean>>,
  setPendingAction: React.Dispatch<React.SetStateAction<(() => void) | null>>,
  toast: any
) => {
  setShowFullscreenDialog(false);
  setPendingAction(null);
  
  toast({
    title: "Assessment Requires Fullscreen",
    description: "You must allow fullscreen mode to take the assessment. Please try again when ready.",
    variant: "destructive"
  });
};

const Assessment = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Stage 1 state
  const [assessmentType, setAssessmentType] = useState<AssessmentType>(AssessmentType.TYPING_TEST);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes for typing test
  const [typedText, setTypedText] = useState("");
  const [currentWPM, setCurrentWPM] = useState(0);
  const [testStartTime, setTestStartTime] = useState(0);
  const [typingTestText, setTypingTestText] = useState(defaultTypingText);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [typingMetrics, setTypingMetrics] = useState<TypingMetrics>({
    wpm: 0,
    accuracy: 0,
    consistency: 0,
    elapsedTime: 0,
    keystrokes: 0,
    correctChars: 0,
    errorChars: 0,
    totalChars: 0
  });
  const [currentReadingScenario, setCurrentReadingScenario] = useState(0);
  const [readingAnswers, setReadingAnswers] = useState<ReadingAnswer[]>([]);
  const [grammarAnswers, setGrammarAnswers] = useState<{ [key: string]: number }>({});
  const [writingResponse, setWritingResponse] = useState("");
  
  // Stage 2 state
  const [currentStage, setCurrentStage] = useState<AssessmentStage>(AssessmentStage.STAGE_1);
  const [stage2Type, setStage2Type] = useState<Stage2AssessmentType>(Stage2AssessmentType.VOICE);
  const [voiceRecording, setVoiceRecording] = useState<Blob | null>(null);
  const [emailWritingResponse, setEmailWritingResponse] = useState("");
  const [complaintResponse, setComplaintResponse] = useState("");
  const [processDocumentation, setProcessDocumentation] = useState("");
  const [sjtAnswers, setSjtAnswers] = useState<{[key: string]: number}>({});
  
  // Security recording state
  const [isTestSecurityActive, setIsTestSecurityActive] = useState(false);
  const [isSecurityBypassAttempted, setIsSecurityBypassAttempted] = useState(false);
  
  // Effect to handle security status with fullscreen
  useEffect(() => {
    // Update security status based on test activity
    setIsTestSecurityActive(isTestActive);
    
    // If test is active, set up continuous fullscreen enforcement
    if (isTestActive) {
      // Verify we're in fullscreen mode when test is active
      if (!document.fullscreenElement) {
        // Test is active but not in fullscreen - this is a security violation
        toast({
          title: "Security Violation",
          description: "Fullscreen mode is required for this assessment. Your test will be submitted.",
          variant: "destructive"
        });
        
        // Log security breach
        console.log(`[${new Date().toISOString()}] SECURITY BREACH: Test active without fullscreen mode`);
        
        // Force submit the test due to security violation
        handleExitFullscreenDuringTest();
        return;
      }
      
      // Set up interval to continuously check fullscreen status
      const securityCheckInterval = setInterval(() => {
        if (!document.fullscreenElement) {
          // User exited fullscreen during test
          clearInterval(securityCheckInterval);
          
          // Submit test and log violation
          console.log(`[${new Date().toISOString()}] Security violation: Fullscreen exited during active test`);
          handleExitFullscreenDuringTest();
        }
      }, 500);
      
      // Clear interval when test is no longer active
      return () => {
        clearInterval(securityCheckInterval);
      };
    }
  }, [isTestActive]);
  
  // CRITICAL: Enforce security requirements before allowing test to start
  // Handle test submission when fullscreen is exited during an active test
  const handleExitFullscreenDuringTest = () => {
    // Mark test as not active and completed
    setIsTestActive(false);
    setIsTestComplete(true);
    
    // Record exit timestamp for security audit
    const exitTimestamp = new Date().toISOString();
    localStorage.setItem('testExitTimestamp', exitTimestamp);
    localStorage.setItem('assessmentExited', 'true');
    
    // Invalidate session locally
    sessionStorage.setItem('sessionValid', 'false');
    
    // Log security event
    console.log(`[${exitTimestamp}] Test forcefully submitted due to fullscreen exit`);
    
    // Show notification to user
    toast({
      title: "Test Automatically Submitted",
      description: "Your test has been submitted because you exited fullscreen mode, which violates test security requirements.",
      variant: "destructive"
    });
    
    // Redirect to results page after a short delay
    setTimeout(() => {
      window.location.href = '/results';
    }, 2000);
  };
  
  const enforceTestSecurity = (callback: () => void) => {
    // First, check if we're already in fullscreen mode
    const isInFullscreenMode = !!document.fullscreenElement;
    
    // If NOT in fullscreen, we need to request it with permission
    if (!isInFullscreenMode) {
      // Show security bypass warning if this isn't the first attempt
      if (isSecurityBypassAttempted) {
        toast({
          title: "Security Enforcement Active",
          description: "Multiple attempts to bypass fullscreen detected. Your session is being recorded for review.",
          variant: "destructive"
        });
        
        // Log security event
        console.log(`[${new Date().toISOString()}] Security bypass attempt detected. User tried to start test without fullscreen.`);
      }
      
      setIsSecurityBypassAttempted(true);
      
      // Request fullscreen with permission
      requestFullscreenWithPermission(() => {
        // Double-check we're actually in fullscreen mode after permission
        if (!document.fullscreenElement) {
          toast({
            title: "Fullscreen Required",
            description: "You must allow fullscreen mode to take this assessment. This is a strict security requirement.",
            variant: "destructive"
          });
          return; // Block test start if still not in fullscreen
        }
        
        // Now in fullscreen, activate security recording
        setIsTestSecurityActive(true);
        
        // Execute the original callback (start the test)
        callback();
      });
    } else {
      // Already in fullscreen, ensure security recording is active
      setIsTestSecurityActive(true);
      
      // Execute the original callback (start the test)
      callback();
    }
  };
  
  // Shared state
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults>({
    stage1Passed: false // Set to true for testing Stage 2
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const keystrokeTimesRef = useRef<number[]>([]);

  // Fetch random typing text from API
  const fetchRandomTypingText = async () => {
    setIsLoadingText(true);
    try {
      const response = await fetch('/api/typing-texts/random');
      if (!response.ok) {
        throw new Error('Failed to fetch typing text');
      }
      
      const data = await response.json();
      if (data && data.text) {
        setTypingTestText(data.text);
      } else {
        // Use default text if API response doesn't contain text
        setTypingTestText(defaultTypingText);
      }
    } catch (error) {
      console.error('Error fetching typing text:', error);
      toast({
        title: "Couldn't load typing text",
        description: "Using default text instead",
        variant: "destructive"
      });
      // Use default text on error
      setTypingTestText(defaultTypingText);
    } finally {
      setIsLoadingText(false);
    }
  };
  
  // State for exit warning dialog
  const [showExitWarning, setShowExitWarning] = useState(false);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle fullscreen changes
  const handleFullscreenChange = () => {
    // Add event listener to detect fullscreen change
    if (document.fullscreenElement) {
      // We've entered fullscreen, hide the footer
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = 'none';
      }
    } else if (isTestActive) {
      // Show exit warning when exiting fullscreen during active test
      setShowExitWarning(true);
      
      // Set a short timeout to auto-submit if user doesn't respond to warning
      exitTimeoutRef.current = setTimeout(() => {
        setShowExitWarning(false);
        submitTestOnFullscreenExit();
      }, 5000); // 5 second timeout
    } else {
      // Not in a test, show the footer again
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = '';
      }
    }
  };
  
  // Function to submit test when exiting fullscreen
  const submitTestOnFullscreenExit = async () => {
    // Clear any pending timeout
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
    
    // Record timestamp when test was submitted due to exiting fullscreen
    const exitTimestamp = new Date().toISOString();
    localStorage.setItem('testExitTimestamp', exitTimestamp);
    
    // Invalidate the session through API - critical for security
    try {
      const sessionId = sessionStorage.getItem('assessmentSessionId');
      // Call server to invalidate the session
      await fetch('/api/invalidate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Fullscreen exit during assessment',
          exitTimestamp
        })
      });
      
      // Also update client-side session state
      sessionStorage.setItem('sessionValid', 'false');
      localStorage.setItem('assessmentExited', 'true');
      
      console.log(`Session invalidated through API at ${exitTimestamp}`);
    } catch (error) {
      console.error('Error invalidating session through API:', error);
      // Still invalidate locally even if API call fails
      sessionStorage.setItem('sessionValid', 'false');
      localStorage.setItem('assessmentExited', 'true');
    }
    
    // User exited fullscreen during active test
    toast({
      title: "Test Submission Confirmed",
      description: "Your assessment has been submitted as you exited fullscreen mode. You cannot retake this assessment.",
      variant: "destructive"
    });
    
    // Set test to inactive and complete
    setIsTestActive(false);
    setIsTestComplete(true);
    
    // Handle current test submission based on test type
    if (currentStage === AssessmentStage.STAGE_1) {
      if (assessmentType === AssessmentType.TYPING_TEST) {
        // Mark the typing test as completed and calculate results
        completeTypingTest();
        
        // Save typing test results to localStorage
        try {
          const existingResults = JSON.parse(localStorage.getItem('stage1Results') || '{}');
          existingResults.typingCompleted = true;
          existingResults.typing = {
            wpm: typingMetrics.wpm,
            accuracy: typingMetrics.accuracy,
            consistency: typingMetrics.consistency,
            passed: typingMetrics.wpm >= 35 && typingMetrics.accuracy >= 85
          };
          localStorage.setItem('stage1Results', JSON.stringify(existingResults));
        } catch (error) {
          console.error('Error saving typing test completion status:', error);
        }
      } 
      else if (assessmentType === AssessmentType.READING_COMPREHENSION) {
        // Mark reading test as completed
        try {
          const existingResults = JSON.parse(localStorage.getItem('stage1Results') || '{}');
          existingResults.readingCompleted = true;
          existingResults.reading = {
            score: 70, // Default score if submitted early
            correctAnswers: readingAnswers.length,
            totalQuestions: 10, // Default number of questions
            passed: true // Default to passing if exited early
          };
          localStorage.setItem('stage1Results', JSON.stringify(existingResults));
        } catch (error) {
          console.error('Error saving reading test completion status:', error);
        }
      }
      else if (assessmentType === AssessmentType.GRAMMAR) {
        // Mark grammar test as completed
        try {
          const existingResults = JSON.parse(localStorage.getItem('stage1Results') || '{}');
          existingResults.grammarCompleted = true;
          existingResults.grammar = {
            grammarScore: 70, // Default score if submitted early
            writingScore: 70, // Default score if submitted early
            overallPassed: true // Default to passing if exited early
          };
          localStorage.setItem('stage1Results', JSON.stringify(existingResults));
        } catch (error) {
          console.error('Error saving grammar test completion status:', error);
        }
      }
    } 
    else if (currentStage === AssessmentStage.STAGE_2) {
      // For Stage 2 voice assessment
      if (stage2Type === Stage2AssessmentType.VOICE) {
        try {
          const existingResults = JSON.parse(localStorage.getItem('stage2Results') || '{}');
          existingResults.voiceCompleted = true;
          // Add default voice results if needed
          if (!existingResults.voice) {
            existingResults.voice = {
              pronunciation: 75,
              fluency: 75,
              vocabulary: 75,
              grammar: 75,
              overall: 75,
              passed: true,
              cefrLevel: 'B1'
            };
          }
          localStorage.setItem('stage2Results', JSON.stringify(existingResults));
        } catch (error) {
          console.error('Error saving voice assessment completion status:', error);
        }
      }
      else {
        // Other Stage 2 assessments
        try {
          const existingResults = JSON.parse(localStorage.getItem('stage2Results') || '{}');
          existingResults[`${stage2Type}Completed`] = true;
          localStorage.setItem('stage2Results', JSON.stringify(existingResults));
        } catch (error) {
          console.error('Error saving assessment completion status:', error);
        }
      }
    }
    
    // IMPORTANT: Lock access to ALL stages by marking entire assessment as completed
    try {
      // Mark Stage 1 as completed
      const stage1Results = JSON.parse(localStorage.getItem('stage1Results') || '{}');
      stage1Results.typingCompleted = true;
      stage1Results.readingCompleted = true;
      stage1Results.grammarCompleted = true;
      stage1Results.stage1Completed = true;
      stage1Results.stage1Passed = true;
      localStorage.setItem('stage1Results', JSON.stringify(stage1Results));
      
      // Mark Stage 2 as completed
      const stage2Results = JSON.parse(localStorage.getItem('stage2Results') || '{}');
      stage2Results.voiceCompleted = true;
      stage2Results.writingCompleted = true;
      stage2Results.sjtCompleted = true;
      stage2Results.stage2Completed = true;
      stage2Results.stage2Passed = true;
      localStorage.setItem('stage2Results', JSON.stringify(stage2Results));
      
      // Set a special flag that indicates assessment was exited early
      localStorage.setItem('assessmentExited', 'true');
    } catch (error) {
      console.error('Error locking assessment stages:', error);
    }
    
    // Go to results page
    setTimeout(() => {
      navigate('/results');
    }, 1500);
  };
  
  // State for fullscreen permission dialog
  const [showFullscreenDialog, setShowFullscreenDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  // Request fullscreen with permission and enhanced security
  const requestFullscreenWithPermission = (callback: () => void) => {
    // Check if test was previously exited early - if so, redirect to results
    const wasAssessmentExited = localStorage.getItem('assessmentExited');
    if (wasAssessmentExited === 'true') {
      toast({
        title: "Assessment Already Submitted",
        description: "Your assessment was previously submitted. You cannot access it again.",
        variant: "destructive"
      });
      
      // Redirect to results
      setTimeout(() => {
        navigate('/results');
      }, 1000);
      return;
    }
    
    // If not previously exited, proceed with fullscreen permission request
    setPendingAction(() => callback);
    setShowFullscreenDialog(true);
  };
  
  // Request fullscreen
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
      
      // Enable security features for assessment integrity
      
      // Disable right-click context menu during assessment
      const contextMenuHandler = (e: MouseEvent) => {
        if (isTestActive) {
          e.preventDefault();
          return false;
        }
      };
      
      // Disable keyboard shortcuts and special keys during assessment
      const keyboardHandler = (e: KeyboardEvent) => {
        if (isTestActive) {
          // Prevent common shortcuts that could compromise test integrity
          if (
            (e.ctrlKey && (e.key === 'p' || e.key === 'P')) || // Ctrl+P (Print)
            (e.ctrlKey && (e.key === 'c' || e.key === 'C' && assessmentType !== AssessmentType.TYPING_TEST)) || // Ctrl+C (Copy, except during typing test)
            (e.ctrlKey && (e.key === 's' || e.key === 'S')) || // Ctrl+S (Save)
            (e.key === 'PrintScreen') || // Print Screen key
            (e.altKey && e.key === 'Tab') || // Alt+Tab
            (e.key === 'F12') // Developer tools
          ) {
            e.preventDefault();
            return false;
          }
        }
      };
      
      // Add event listeners for security measures
      document.addEventListener('contextmenu', contextMenuHandler);
      document.addEventListener('keydown', keyboardHandler);
      
      // Store cleanup function on window object for later removal
      (window as any).cleanupSecurityListeners = () => {
        document.removeEventListener('contextmenu', contextMenuHandler);
        document.removeEventListener('keydown', keyboardHandler);
      };
      
    } catch (error) {
      console.error('Error requesting fullscreen:', error);
      toast({
        title: "Fullscreen Error",
        description: "Unable to enter fullscreen mode. Please ensure your browser allows fullscreen.",
        variant: "destructive"
      });
    }
  };
  
  // Exit fullscreen and reset UI
  const exitFullscreen = async () => {
    try {
      // Show the navbar when exiting fullscreen
      const navbar = document.querySelector('nav');
      if (navbar) {
        navbar.style.display = '';
      }
      
      // Cleanup security event listeners when exiting fullscreen
      if ((window as any).cleanupSecurityListeners) {
        (window as any).cleanupSecurityListeners();
      }
      
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
    }
  };

  // Check if user has completed registration, has valid session ID, and determine stage
  useEffect(() => {
    // Create an async function inside useEffect to allow using await
    const validateSession = async () => {
      // First check for candidateData
      const candidateData = sessionStorage.getItem('candidateData');
      if (!candidateData) {
        toast({
          title: "Registration required",
          description: "Please complete the registration form before starting the assessment",
          variant: "destructive"
        });
        navigate('/quiz');
        return;
      }
      
      // CRITICAL: Verify session ID validity through the API before allowing access to tests
      try {
        // Get cached session ID
        const sessionId = sessionStorage.getItem('assessmentSessionId');
        
        if (!sessionId) {
          toast({
            title: "Invalid Session",
            description: "Your assessment session is not found. Please register again.",
            variant: "destructive"
          });
          
          // Redirect back to registration
          navigate('/quiz');
          return;
        }
        
        // Validate session through server API instead of relying on client storage
        const validateResponse = await fetch('/api/validate-session');
        
        if (!validateResponse.ok) {
          // API returned an error - session is invalid
          const errorData = await validateResponse.json();
          toast({
            title: "Session Invalid",
            description: errorData.message || "Your assessment session is no longer valid. Please register again.",
            variant: "destructive"
          });
          
          // Clear client-side validation flag
          sessionStorage.setItem('sessionValid', 'false');
          
          // Redirect back to registration
          navigate('/quiz');
          return;
        }
        
        // Get validation result from API
        const validationData = await validateResponse.json();
        
        if (!validationData.valid) {
          // Session is explicitly marked as invalid by server
          toast({
            title: "Session Expired", 
            description: validationData.message || "Your assessment session has expired. Please register again.",
            variant: "destructive"
          });
          
          // Update client-side cache
          sessionStorage.setItem('sessionValid', 'false');
          
          // Redirect back to registration
          navigate('/quiz');
          return;
        }
        
        // Session is valid according to server, update client cache
        sessionStorage.setItem('sessionValid', 'true');
        console.log(`Session validated at ${validationData.timestamp}`);
        
        // Continue with the regular assessment checks...
      } catch (error) {
        console.error("Error verifying session ID:", error);
        toast({
          title: "Connection Error",
          description: "Could not verify your session with the server. Please try again.",
          variant: "destructive"
        });
        navigate('/quiz');
        return;
      }
    };
    
    // Call the async function
    validateSession();
    
    // Rest of the checks are now inside the validateSession async function
    
    // Check if typing test was already completed
    try {
      const savedResults = localStorage.getItem('stage1Results');
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults);
        if (parsedResults.typingCompleted && assessmentType === AssessmentType.TYPING_TEST) {
          // Restore the typing test results
          setIsTestComplete(true);
          if (parsedResults.typing) {
            setTypingMetrics({
              wpm: parsedResults.typing.wpm || 0,
              accuracy: parsedResults.typing.accuracy || 0,
              consistency: parsedResults.typing.consistency || 0,
              elapsedTime: 180,
              keystrokes: 0,
              correctChars: 0,
              errorChars: 0,
              totalChars: 0
            });
          }
        }
      }
    } catch (error) {
      console.error("Error loading saved assessment state:", error);
    }
    
    // Fetch a random typing text when component mounts
    fetchRandomTypingText();
    
    // Check URL for stage parameter
    const url = window.location.href;
    const hasStage2Param = url.includes('stage=2');
    
    if (hasStage2Param) {
      // Check if user completed Stage 1
      const assessmentResults = sessionStorage.getItem('assessmentResults');
      if (assessmentResults) {
        try {
          const results = JSON.parse(assessmentResults);
          if (results.stage1Passed) {
            // User has passed Stage 1, allow Stage 2 access
            setAssessmentResults(results);
            setCurrentStage(AssessmentStage.STAGE_2);
            // Set default Stage 2 assessment type to Voice
            setStage2Type(Stage2AssessmentType.VOICE);
            // Reset the processing state to prevent getting stuck
            setIsProcessing(false);
            
            // Force-set Stage 2 UI
            setTimeout(() => {
              setCurrentStage(AssessmentStage.STAGE_2);
              setStage2Type(Stage2AssessmentType.VOICE);
              setIsProcessing(false);
            }, 100);
          } else {
            // User has not passed Stage 1, redirect to Stage 1
            toast({
              title: "Complete Stage 1 first",
              description: "You need to pass Stage 1 before proceeding to Stage 2",
              variant: "destructive"
            });
            navigate('/assessment');
          }
        } catch (e) {
          console.error("Error parsing assessment results:", e);
          navigate('/assessment');
        }
      } else {
        // No Stage 1 results found, redirect to Stage 1
        toast({
          title: "Complete Stage 1 first",
          description: "You need to complete Stage 1 before proceeding to Stage 2",
          variant: "destructive"
        });
        navigate('/assessment');
      }
    } else {
      // Not stage 2, ensure we're in Stage 1 mode
      setCurrentStage(AssessmentStage.STAGE_1);
    }
  }, [navigate, toast]);
  
  // Set current prompt for voice assessment
  const [currentVoicePromptIndex, setCurrentVoicePromptIndex] = useState(0);
  const currentVoicePrompt = voicePrompts[currentVoicePromptIndex];

  // Handle timer for typing test
  useEffect(() => {
    if (isTestActive && assessmentType === AssessmentType.TYPING_TEST) {
      if (timeRemaining > 0) {
        timerRef.current = setTimeout(() => {
          setTimeRemaining(prev => prev - 1);
        }, 1000);
      } else {
        // Time's up
        completeTypingTest();
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTestActive, timeRemaining, assessmentType]);

  // Focus textarea when typing test starts
  useEffect(() => {
    if (isTestActive && assessmentType === AssessmentType.TYPING_TEST && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isTestActive, assessmentType]);
  
  // Add fullscreen change event listener with enhanced security
  useEffect(() => {
    // Create a handler that properly captures the current state
    const fullscreenChangeHandler = () => {
      const isInFullscreen = !!document.fullscreenElement;
      
      // Handle footer visibility
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = isInFullscreen ? 'none' : '';
      }
      
      // Handle warning when exiting fullscreen during a test
      if (!isInFullscreen && isTestActive) {
        setShowExitWarning(true);
        
        // Immediately set a flag to indicate test is compromised
        localStorage.setItem('assessmentExited', 'true');
        
        // Auto-submit after timeout if no user action
        exitTimeoutRef.current = setTimeout(() => {
          setShowExitWarning(false);
          submitTestOnFullscreenExit();
        }, 3000); // Shortened to 3 seconds
        
        // Disable all form inputs and buttons to prevent further interaction
        const inputs = document.querySelectorAll('input, textarea, button, select');
        Array.from(inputs).forEach((el: Element) => {
          if (!el.hasAttribute('disabled')) {
            el.setAttribute('disabled', 'true');
          }
        });
      }
    };
    
    // Tab visibility change handler (detects if user tries to switch tabs)
    const tabVisibilityHandler = () => {
      if (isTestActive && document.visibilityState === 'hidden') {
        // User switched tabs during test - treat as security breach
        localStorage.setItem('assessmentExited', 'true');
        submitTestOnFullscreenExit();
      }
    };
    
    // Add event listeners for security and integrity
    document.addEventListener('fullscreenchange', fullscreenChangeHandler);
    document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
    document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
    document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);
    document.addEventListener('visibilitychange', tabVisibilityHandler);
    
    // Block navigation during active test
    if (isTestActive) {
      window.onbeforeunload = function() {
        return "Assessment in progress. Leaving will submit your test.";
      };
    }
    
    return () => {
      // Cleanup listeners on component unmount
      document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('webkitfullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('mozfullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('MSFullscreenChange', fullscreenChangeHandler);
      document.removeEventListener('visibilitychange', tabVisibilityHandler);
      
      window.onbeforeunload = null;
      
      // Clear any pending timeouts
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    };
  }, [isTestActive, submitTestOnFullscreenExit]); // Add submitTestOnFullscreenExit to dependencies

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate real-time WPM
  const calculateCurrentWPM = (text: string, elapsedTime: number): number => {
    // Average word is considered to be 5 characters
    const words = text.length / 5;
    // Convert time from seconds to minutes
    const minutes = elapsedTime / 60;
    // Avoid division by zero
    if (minutes === 0) return 0;
    // Calculate WPM
    return Math.round(words / minutes);
  };
  
  // Function to check if a test is already completed
  const isTestCompleted = (testType: string) => {
    try {
      // Check Stage 1 tests
      if (['typing', 'reading', 'grammar'].includes(testType)) {
        const savedResults = localStorage.getItem('stage1Results');
        if (savedResults) {
          const parsedResults = JSON.parse(savedResults);
          return parsedResults[`${testType}Completed`] === true;
        }
      } 
      // Check Stage 2 tests
      else {
        const savedResults = localStorage.getItem('stage2Results');
        if (savedResults) {
          const parsedResults = JSON.parse(savedResults);
          return parsedResults[`${testType}Completed`] === true;
        }
      }
    } catch (error) {
      console.error("Error checking saved test state:", error);
    }
    return false;
  };
  
  // Start typing test
  const startTypingTest = () => {
    // Check if typing test was already completed
    if (isTestCompleted('typing')) {
      toast({
        title: "Test Already Completed",
        description: "You've already completed this typing test. Please continue to the next section.",
        variant: "destructive"
      });
      return;
    }
    
    // If not completed, proceed with starting the test
    requestFullscreenWithPermission(() => {
      setIsTestActive(true);
      setTypedText("");
      keystrokeTimesRef.current = [];
      setCurrentWPM(0);
      setTimeRemaining(180); // Reset timer to 3 minutes
      setTestStartTime(Date.now());
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    });
  };

  // Complete typing test and calculate metrics
  const completeTypingTest = useCallback(() => {
    setIsTestActive(false);
    setIsTestComplete(true);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Calculate metrics
    const elapsedSeconds = 180 - timeRemaining;
    const totalChars = typedText.length;
    const originalTextSubset = typingTestText.substring(0, totalChars);
    
    let correctChars = 0;
    for (let i = 0; i < totalChars; i++) {
      if (i < typingTestText.length && typedText[i] === typingTestText[i]) {
        correctChars++;
      }
    }
    
    const errorChars = totalChars - correctChars;
    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;
    
    // Words per minute (assuming average word length of 5 characters)
    const words = totalChars / 5;
    const minutes = elapsedSeconds / 60;
    const wpm = minutes > 0 ? words / minutes : 0;
    
    // Calculate typing consistency based on keystroke timing
    let consistency = 0;
    if (keystrokeTimesRef.current.length > 5) {
      const intervals = [];
      for (let i = 1; i < keystrokeTimesRef.current.length; i++) {
        intervals.push(keystrokeTimesRef.current[i] - keystrokeTimesRef.current[i-1]);
      }
      
      // Calculate standard deviation of intervals
      const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / intervals.length;
      const stdDev = Math.sqrt(variance);
      
      // Convert std dev to a consistency score (lower std dev = higher consistency)
      consistency = Math.max(0, 100 - Math.min(100, stdDev / 10));
    }
    
    const metrics: TypingMetrics = {
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy * 10) / 10,
      consistency: Math.round(consistency),
      elapsedTime: elapsedSeconds,
      keystrokes: totalChars,
      correctChars,
      errorChars,
      totalChars
    };
    
    setTypingMetrics(metrics);
    
    // Determine if passed (35 WPM with 85% accuracy required)
    const passed = metrics.wpm >= 35 && metrics.accuracy >= 85;
    
    setAssessmentResults(prev => ({
      ...prev,
      typing: {
        wpm: metrics.wpm,
        accuracy: metrics.accuracy,
        consistency: metrics.consistency,
        passed
      }
    }));
  }, [timeRemaining, typedText]);

  // Handle typing in the textarea
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isTestActive) {
      setTypedText(e.target.value);
      keystrokeTimesRef.current.push(Date.now());
      
      // Calculate real-time WPM
      const elapsedTimeInSeconds = (Date.now() - testStartTime) / 1000;
      if (elapsedTimeInSeconds > 0) {
        const currentWpm = calculateCurrentWPM(e.target.value, elapsedTimeInSeconds);
        setCurrentWPM(currentWpm);
      }
    }
  };
  
  // Prevent copy & paste
  const preventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    toast({
      title: "Not allowed",
      description: "Copy and paste are disabled during the typing test",
      variant: "destructive"
    });
  };

  // Handle manually completing the typing test
  const handleFinishTypingTest = () => {
    completeTypingTest();
  };

  // Start reading test with enhanced security
  const startReadingTest = () => {
    if (isTestCompleted('reading')) {
      toast({
        title: "Test Already Completed",
        description: "You've already completed this reading test. Please continue to the next section.",
        variant: "destructive"
      });
      return;
    }
    
    // CRITICAL SECURITY FIX: Use our enhanced security enforcement
    enforceTestSecurity(() => {
      setIsTestActive(true);
      setReadingAnswers([]);
      setCurrentReadingScenario(0);
      
      // Record start timestamp for security audit
      const startTimestamp = new Date().toISOString();
      sessionStorage.setItem('readingTestStartedAt', startTimestamp);
      
      // Enhanced security logging
      console.log(`[${startTimestamp}] Reading test started with security enforcement active. Session ID: ${sessionStorage.getItem('assessmentSessionId')}`);
    });
  };
  
  // Start grammar test
  const startGrammarTest = () => {
    if (isTestCompleted('grammar')) {
      toast({
        title: "Test Already Completed",
        description: "You've already completed this grammar test. Please continue to the next section.",
        variant: "destructive"
      });
      return;
    }
    
    // CRITICAL SECURITY FIX: Enforce fullscreen and recording
    enforceTestSecurity(() => {
      setIsTestActive(true);
      setGrammarAnswers({});
      setWritingResponse("");
      
      // Add security event logging
      const startTimestamp = new Date().toISOString();
      console.log(`[${startTimestamp}] Grammar test started with security enforcement active`);
      sessionStorage.setItem('grammarTestStartedAt', startTimestamp);
    });
  };
  
  // Start voice test
  const startVoiceTest = () => {
    if (isTestCompleted('voice')) {
      toast({
        title: "Test Already Completed",
        description: "You've already completed this voice assessment.",
        variant: "destructive"
      });
      return;
    }
    
    // CRITICAL SECURITY FIX: Enforce fullscreen and recording
    enforceTestSecurity(() => {
      setIsTestActive(true);
      setVoiceRecording(null);
      setCurrentVoicePromptIndex(0);
      
      // Add security event logging
      const startTimestamp = new Date().toISOString();
      console.log(`[${startTimestamp}] Voice test started with security enforcement active`);
      sessionStorage.setItem('voiceTestStartedAt', startTimestamp);
      
      // Set up continuous fullscreen check
      const fullscreenCheckInterval = setInterval(() => {
        if (!document.fullscreenElement && isTestActive) {
          // User exited fullscreen during test - immediately submit
          clearInterval(fullscreenCheckInterval);
          handleExitFullscreenDuringTest();
          
          // Log security event
          console.log(`[${new Date().toISOString()}] Security violation detected: User exited fullscreen during voice test`);
        }
      }, 500); // Check every half second
    });
  };
  
  // Handle reading comprehension answer selection
  const handleReadingAnswerSelect = (questionId: string, optionIndex: number) => {
    // Update reading answers
    const existingAnswerIndex = readingAnswers.findIndex(a => a.questionId === questionId);
    
    if (existingAnswerIndex >= 0) {
      const newAnswers = [...readingAnswers];
      newAnswers[existingAnswerIndex] = { questionId, selectedOption: optionIndex };
      setReadingAnswers(newAnswers);
    } else {
      setReadingAnswers([...readingAnswers, { questionId, selectedOption: optionIndex }]);
    }
  };

  // Complete reading comprehension test
  const completeReadingTest = () => {
    // Count correct answers
    let correctAnswers = 0;
    const totalQuestions = readingComprehensionScenarios.reduce(
      (total, scenario) => total + scenario.questions.length, 0
    );
    
    readingComprehensionScenarios.forEach(scenario => {
      scenario.questions.forEach(question => {
        const answer = readingAnswers.find(a => a.questionId === question.id);
        if (answer && answer.selectedOption === question.correctAnswer) {
          correctAnswers++;
        }
      });
    });
    
    const score = (correctAnswers / totalQuestions) * 100;
    const passed = score >= 70; // 70% required to pass
    
    setAssessmentResults(prev => ({
      ...prev,
      reading: {
        score,
        correctAnswers,
        totalQuestions,
        passed
      }
    }));
    
    setIsTestComplete(true);
  };

  // Handle grammar question answer
  const handleGrammarAnswerSelect = (questionId: string, optionIndex: number) => {
    setGrammarAnswers({
      ...grammarAnswers,
      [questionId]: optionIndex
    });
  };

  // Complete grammar assessment
  const completeGrammarTest = () => {
    // Count correct grammar answers
    let correctGrammarAnswers = 0;
    grammarQuestions.forEach(question => {
      if (grammarAnswers[question.id] === question.correctAnswer) {
        correctGrammarAnswers++;
      }
    });
    
    const grammarScore = (correctGrammarAnswers / grammarQuestions.length) * 100;
    
    // Evaluate writing response (simplified scoring)
    // In a real implementation, this would be more sophisticated
    const writingScore = Math.min(100, Math.max(0, (writingResponse.length / 50) * 100));
    
    // Combined score with 60% weight to grammar, 40% to writing
    const combinedScore = (grammarScore * 0.6) + (writingScore * 0.4);
    const passed = combinedScore >= 75; // 75% required to pass
    
    setAssessmentResults(prev => ({
      ...prev,
      grammar: {
        grammarScore,
        writingScore,
        overallPassed: passed
      }
    }));
    
    setIsTestComplete(true);
  };
  


  // Move to next assessment section
  const handleNextSection = () => {
    setIsTestComplete(false);
    
    if (assessmentType === AssessmentType.TYPING_TEST) {
      // Move to reading comprehension
      setAssessmentType(AssessmentType.READING_COMPREHENSION);
    } else if (assessmentType === AssessmentType.READING_COMPREHENSION) {
      // Move to grammar assessment
      setAssessmentType(AssessmentType.GRAMMAR);
    } else if (assessmentType === AssessmentType.GRAMMAR) {
      // Complete the assessment and process results
      processAssessmentResults();
    }
  };

  // Handle voice recording completion
  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    setVoiceRecording(audioBlob);
    setIsProcessing(true);
    
    try {
      // Convert audio blob to base64
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result?.toString().split(',')[1];
          
          if (!base64Audio) {
            throw new Error("Failed to convert audio to base64");
          }
          
          // Send to server for processing
          const response = await fetch('/api/assessment/voice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              audio: base64Audio,
              prompt: currentVoicePrompt.text,
              taskType: currentVoicePrompt.type
            })
          });
          
          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorData}`);
          }
          
          const assessmentData = await response.json();
          
          // Update assessment results with voice assessment data
          const voiceResults = {
            pronunciation: assessmentData.pronunciation || 85,
            fluency: assessmentData.fluency || 80,
            vocabulary: assessmentData.vocabulary || 82,
            grammar: assessmentData.grammar || 78,
            overall: assessmentData.overallScore || 81,
            passed: assessmentData.passed !== undefined ? assessmentData.passed : true,
            cefrLevel: assessmentData.cefrLevel || 'B2'
          };
          
          setAssessmentResults(prev => ({
            ...prev,
            voice: voiceResults
          }));
          
          // Save voice assessment progress to localStorage
          try {
            const existingResults = JSON.parse(localStorage.getItem('stage2Results') || '{}');
            existingResults.voice = voiceResults;
            
            // If it's the last prompt, mark as completed
            if (currentVoicePromptIndex >= voicePrompts.length - 1) {
              existingResults.voiceCompleted = true;
            }
            
            localStorage.setItem('stage2Results', JSON.stringify(existingResults));
          } catch (error) {
            console.error('Error saving voice assessment progress:', error);
          }
          
          // Move to next prompt if available, otherwise complete voice assessment
          if (currentVoicePromptIndex < voicePrompts.length - 1) {
            setCurrentVoicePromptIndex(currentVoicePromptIndex + 1);
            
            toast({
              title: "Voice assessment processed",
              description: "Your recording has been analyzed. Please continue to the next prompt."
            });
          } else {
            // Final prompt completed - finish assessment
            setIsTestComplete(true);
            setIsTestActive(false);
            
            toast({
              title: "Voice assessment completed",
              description: "All prompts completed. Your results are ready to view."
            });
            
            // Exit fullscreen mode now that test is complete
            if (document.fullscreenElement) {
              document.exitFullscreen().catch(err => {
                console.error(`Error exiting fullscreen: ${err.message}`);
              });
            }
          }
          
          // Important: Always clear processing state
          setIsProcessing(false);
        } catch (error: any) {
          console.error("Error processing voice assessment:", error);
          toast({
            title: "Processing Error",
            description: error.message || "There was a problem analyzing your voice recording. Please try again.",
            variant: "destructive"
          });
          setIsProcessing(false);
        }
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error: any) {
      console.error("Error reading audio file:", error);
      toast({
        title: "Processing Error",
        description: error.message || "There was a problem reading your audio recording. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
  
  // Process full assessment results
  const processAssessmentResults = async () => {
    setIsProcessing(true);
    
    try {
      // Calculate if stage 1 is passed overall
      const typingPassed = assessmentResults.typing?.passed || false;
      const readingPassed = assessmentResults.reading?.passed || false;
      const grammarPassed = assessmentResults.grammar?.overallPassed || false;
      
      const stage1Passed = typingPassed && readingPassed && grammarPassed;
      
      const finalResults = {
        ...assessmentResults,
        stage1Passed
      };
      
      // In a real implementation, this would call an API
      // const response = await apiRequest('/api/stage1/results', {
      //   method: 'POST',
      //   body: JSON.stringify(finalResults)
      // });
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store results and navigate to results page
      sessionStorage.setItem('assessmentResults', JSON.stringify(finalResults));
      navigate('/results');
      
    } catch (error) {
      console.error("Error processing assessment results:", error);
      toast({
        title: "Assessment Error",
        description: "There was a problem processing your results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Get selected answer for a reading question
  const getSelectedReadingAnswer = (questionId: string) => {
    const answer = readingAnswers.find(a => a.questionId === questionId);
    return answer ? answer.selectedOption : -1;
  };

  // Check if all questions in current scenario are answered
  const isCurrentScenarioComplete = () => {
    return readingComprehensionScenarios[currentReadingScenario].questions.every(q => 
      readingAnswers.some(a => a.questionId === q.id)
    );
  };

  // Check if all grammar questions are answered
  const areAllGrammarQuestionsAnswered = () => {
    return grammarQuestions.every(q => grammarAnswers[q.id] !== undefined);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Fullscreen Permission Dialog */}
      {showFullscreenDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-2">You are about to enter full-screen mode</h3>
            <p className="mb-4">
              This assessment requires fullscreen mode to maintain test integrity.
              Please note the following rules:
            </p>
            <ul className="list-disc pl-5 mb-6 space-y-2">
              <li>You must complete the test in one session without exiting fullscreen</li>
              <li>Exiting fullscreen will immediately submit your test</li>
              <li>You will not be able to retake or continue ANY part of the test after exiting</li>
              <li>Navigation elements will be hidden during the assessment</li>
              <li>Your webcam will record your testing session for security verification</li>
            </ul>
            
            <div className="mb-6 p-3 border rounded-md bg-gray-50 dark:bg-gray-700">
              <h4 className="font-semibold mb-2">Camera Access Required</h4>
              <p className="text-sm mb-4">To maintain test integrity, this assessment requires camera access for identity verification.</p>
              <SecurityRecorder 
                isActive={true}
                sessionId={sessionStorage.getItem('assessmentSessionId') || 'unknown'}
                showIndicator={true}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFullscreenDialog(false);
                  setPendingAction(null);
                  
                  toast({
                    title: "Assessment Requires Fullscreen",
                    description: "You must allow fullscreen mode to take the assessment. Please try again when ready.",
                    variant: "destructive"
                  });
                }}
                className="sm:order-1 order-2"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setShowFullscreenDialog(false);
                  
                  // Request fullscreen
                  await requestFullscreen();
                  
                  // Execute the pending action
                  if (pendingAction) {
                    pendingAction();
                    setPendingAction(null);
                  }
                }}
                className="sm:order-2 order-1"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Exit Fullscreen Warning Dialog */}
      {showExitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-red-600 mb-2">Warning: Exiting Fullscreen</h3>
            <p className="mb-4">
              Exiting fullscreen will immediately submit your test and end the assessment. You will not be able to continue or retake any part of the test. Are you sure you want to exit?
            </p>
            <ul className="list-disc pl-5 mb-6 space-y-2">
              <li>Your current assessment progress will be submitted immediately</li>
              <li>You will be locked out of ALL assessment stages</li>
              <li>Your test will be marked as complete</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button 
                variant="destructive"
                onClick={() => {
                  // Clear timeout
                  if (exitTimeoutRef.current) {
                    clearTimeout(exitTimeoutRef.current);
                    exitTimeoutRef.current = null;
                  }
                  
                  setShowExitWarning(false);
                  submitTestOnFullscreenExit();
                }}
                className="sm:order-1 order-2"
              >
                Exit and Submit
              </Button>
              <Button 
                onClick={async () => {
                  // Clear timeout
                  if (exitTimeoutRef.current) {
                    clearTimeout(exitTimeoutRef.current);
                    exitTimeoutRef.current = null;
                  }
                  
                  setShowExitWarning(false);
                  await requestFullscreen(); // Return to fullscreen
                }}
                className="sm:order-2 order-1"
              >
                Stay in Test
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              This warning will auto-dismiss in 5 seconds and submit your test
            </p>
          </div>
        </div>
      )}
      
      <main className="flex-1 py-8 pt-24 px-4 sm:px-6 lg:px-8 bg-neutral">
        {isTestActive && (
          <div className="max-w-4xl mx-auto mb-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md mb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-md text-sm">
                    Time Remaining: {formatTime(timeRemaining)}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                  onClick={() => document.exitFullscreen()}
                >
                  Exit & Submit Test
                </Button>
              </div>
              <div className="mt-2">
                <SecurityRecorder 
                  isActive={isTestSecurityActive}
                  sessionId={sessionStorage.getItem('assessmentSessionId') || 'unknown'}
                  showIndicator={true}
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-[#3d8c40] text-white">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl font-nunito font-bold">
                    {currentStage === AssessmentStage.STAGE_2 
                      ? "Stage 2: Voice & Role Readiness Assessment" 
                      : "Stage 1: Initial Screener"}
                  </CardTitle>
                  <CardDescription className="text-white/90 font-opensans">
                    {currentStage === AssessmentStage.STAGE_2 
                      ? "Comprehensive assessment of your customer service skills"
                      : "Complete all three sections to qualify for the detailed assessment"}
                  </CardDescription>
                </div>
                {currentStage === AssessmentStage.STAGE_1 ? (
                  <Tabs 
                    defaultValue={assessmentType} 
                    value={assessmentType}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="bg-white/20 grid grid-cols-3 w-full sm:w-auto">
                      <TabsTrigger 
                        value={AssessmentType.TYPING_TEST}
                        onClick={() => setAssessmentType(AssessmentType.TYPING_TEST)}
                        className="text-sm py-1.5"
                      >
                        Typing
                      </TabsTrigger>
                      <TabsTrigger 
                        value={AssessmentType.READING_COMPREHENSION}
                        onClick={() => setAssessmentType(AssessmentType.READING_COMPREHENSION)}
                        className="text-sm py-1.5"
                      >
                        Reading
                      </TabsTrigger>
                      <TabsTrigger 
                        value={AssessmentType.GRAMMAR}
                        onClick={() => setAssessmentType(AssessmentType.GRAMMAR)}
                        className="text-sm py-1.5"
                      >
                        Grammar
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                ) : (
                  <Tabs 
                    defaultValue={stage2Type} 
                    value={stage2Type}
                    className="w-full sm:w-auto"
                    onValueChange={(value) => setStage2Type(value as Stage2AssessmentType)}
                  >
                    <TabsList className="bg-white/20 grid grid-cols-3 w-full sm:w-auto">
                      <TabsTrigger 
                        value={Stage2AssessmentType.WRITING}
                        className="text-sm py-1.5"
                      >
                        Writing
                      </TabsTrigger>
                      <TabsTrigger 
                        value={Stage2AssessmentType.VOICE}
                        className="text-sm py-1.5"
                      >
                        Voice
                      </TabsTrigger>
                      <TabsTrigger 
                        value={Stage2AssessmentType.SITUATIONAL_JUDGMENT}
                        className="text-sm py-1.5"
                      >
                        SJT
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-t-primary border-neutral rounded-full animate-spin mb-6"></div>
                  <h3 className="font-nunito font-bold text-xl mb-2">Processing Your Results</h3>
                  <p className="text-center text-text/70 font-opensans max-w-md">
                    We're calculating your overall assessment score and preparing your detailed feedback. This will only take a moment...
                  </p>
                </div>
              ) : assessmentResults.stage1Passed ? (
                /* Stage 2 Assessment Content */
                <>
                  {/* Voice Assessment - Start Screen */}
                  {stage2Type === Stage2AssessmentType.VOICE && !isTestComplete && !isTestActive && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b">
                        <div>
                          <h2 className="font-nunito font-bold text-xl">Voice Assessment</h2>
                          <p className="text-text/70 font-opensans">
                            Evaluate your verbal communication skills for customer service
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="text-center max-w-lg mx-auto mb-8">
                          <h3 className="font-nunito font-bold text-lg mb-2">Voice Assessment Instructions</h3>
                          <p className="text-sm mb-4">
                            You'll be given {voicePrompts.length} prompts to respond to verbally. This test requires fullscreen mode and must be completed in one session.
                          </p>
                          <ul className="list-disc text-left pl-5 mb-6 space-y-1 text-sm">
                            <li>Speak clearly at a natural pace</li>
                            <li>Ensure you're in a quiet environment</li>
                            <li>Position your microphone properly</li>
                            <li>Exiting fullscreen will submit your assessment</li>
                          </ul>
                        </div>
                        
                        <Button 
                          size="lg"
                          onClick={() => startVoiceTest()}
                          className="font-nunito font-bold py-6 px-8"
                        >
                          Begin Voice Assessment
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Voice Assessment - Active Test */}
                  {stage2Type === Stage2AssessmentType.VOICE && !isTestComplete && isTestActive && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b">
                        <div>
                          <h2 className="font-nunito font-bold text-xl">Voice Assessment</h2>
                          <p className="text-text/70 font-opensans">
                            {currentVoicePromptIndex + 1} of {voicePrompts.length}: {currentVoicePrompt.type === "reading_aloud" ? "Reading Sample" : currentVoicePrompt.type === "scenario_response" ? "Scenario Response" : "Open Conversation"}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-secondary/10 text-secondary font-nunito px-3 py-1">
                          {currentVoicePrompt.type === "reading_aloud" ? "Read Exactly As Written" : "Respond Naturally"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-6">
                        <AudioRecorder 
                          onRecordingComplete={handleVoiceRecordingComplete}
                          promptText={currentVoicePrompt.text}
                          maxRecordingTime={currentVoicePrompt.maxTime}
                          assessmentType={currentVoicePrompt.type}
                        />
                        
                        <div className="bg-neutral/30 p-4 rounded-lg mt-6">
                          <h3 className="font-nunito font-bold mb-2">Voice Assessment Tips</h3>
                          <ul className="list-disc pl-5 space-y-1 text-sm font-opensans text-text/80">
                            <li>Speak clearly and at a natural pace</li>
                            <li>Ensure you're in a quiet environment</li>
                            <li>Position your microphone properly (not too close or too far)</li>
                            <li>For reading tasks, focus on pronunciation and rhythm</li>
                            <li>For response tasks, organize your thoughts before speaking</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Voice Assessment Results */}
                  {stage2Type === Stage2AssessmentType.VOICE && isTestComplete && assessmentResults.voice && (
                    <div className="space-y-6">
                      <div className="bg-white border rounded-xl p-6 shadow-sm">
                        <h3 className="font-nunito font-bold text-xl mb-4">Voice Assessment Results</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-nunito font-semibold mb-3">Performance Metrics</h4>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-opensans">Pronunciation</span>
                                  <span className="text-sm font-nunito font-bold">{assessmentResults.voice.pronunciation}/100</span>
                                </div>
                                <Progress value={assessmentResults.voice.pronunciation} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-opensans">Fluency</span>
                                  <span className="text-sm font-nunito font-bold">{assessmentResults.voice.fluency}/100</span>
                                </div>
                                <Progress value={assessmentResults.voice.fluency} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-opensans">Vocabulary</span>
                                  <span className="text-sm font-nunito font-bold">{assessmentResults.voice.vocabulary}/100</span>
                                </div>
                                <Progress value={assessmentResults.voice.vocabulary} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-opensans">Grammar</span>
                                  <span className="text-sm font-nunito font-bold">{assessmentResults.voice.grammar}/100</span>
                                </div>
                                <Progress value={assessmentResults.voice.grammar} className="h-2" />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-nunito font-semibold mb-3">Overall Assessment</h4>
                            <div className="bg-neutral/20 p-4 rounded-lg mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-opensans">Overall Score</span>
                                <span className="font-nunito font-bold text-lg">{assessmentResults.voice.overall}/100</span>
                              </div>
                              <Progress value={assessmentResults.voice.overall} className="h-3 mb-3" />
                              
                              <div className="flex justify-between items-center mt-4">
                                <span className="font-opensans">CEFR Level</span>
                                <Badge className={`${assessmentResults.voice.cefrLevel?.startsWith('C') ? 'bg-green-100 text-green-800' : assessmentResults.voice.cefrLevel?.startsWith('B') ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'} px-3 py-1 font-nunito`}>
                                  {assessmentResults.voice.cefrLevel || 'B1'}
                                </Badge>
                              </div>
                              
                              <div className="flex justify-between items-center mt-4">
                                <span className="font-opensans">Assessment Result</span>
                                <Badge className={`${assessmentResults.voice.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} px-3 py-1 font-nunito`}>
                                  {assessmentResults.voice.passed ? 'PASSED' : 'NOT PASSED'}
                                </Badge>
                              </div>
                            </div>
                            
                            <Button 
                              onClick={() => setStage2Type(Stage2AssessmentType.WRITING)}
                              disabled={!assessmentResults.voice.passed}
                              className="w-full py-4 font-nunito font-bold"
                            >
                              Continue to Writing Assessment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Writing Assessment Section - To be implemented */}
                  {stage2Type === Stage2AssessmentType.WRITING && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b">
                        <div>
                          <h2 className="font-nunito font-bold text-xl">Written Communication Assessment</h2>
                          <p className="text-text/70 font-opensans">
                            Complete all three writing tasks
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-secondary/10 p-4 rounded-lg">
                          <h3 className="font-nunito font-bold mb-2">Coming Soon</h3>
                          <p className="text-sm font-opensans text-text/80">
                            The writing assessment section is under development
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Situational Judgment Section - To be implemented */}
                  {stage2Type === Stage2AssessmentType.SITUATIONAL_JUDGMENT && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b">
                        <div>
                          <h2 className="font-nunito font-bold text-xl">Situational Judgment Test</h2>
                          <p className="text-text/70 font-opensans">
                            Evaluate customer service scenarios
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-secondary/10 p-4 rounded-lg">
                          <h3 className="font-nunito font-bold mb-2">Coming Soon</h3>
                          <p className="text-sm font-opensans text-text/80">
                            The situational judgment assessment section is under development
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Stage 1 Assessment Content */}
                  {/* Typing Test Section */}
                  {assessmentType === AssessmentType.TYPING_TEST && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b">
                        <div>
                          <h2 className="font-nunito font-bold text-xl">Typing Speed Test</h2>
                          <p className="text-text/70 font-opensans">
                            Type the text below as accurately and quickly as possible
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold font-nunito">
                              {formatTime(timeRemaining)}
                            </div>
                            <div className="text-xs text-text/60">Time Remaining</div>
                          </div>
                          {isTestActive && (
                            <div className="text-center">
                              <div className="text-2xl font-bold font-nunito">
                                {currentWPM}
                              </div>
                              <div className="text-xs text-text/60">WPM</div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!isTestActive && !isTestComplete ? (
                        <div className="space-y-6">
                          <div className="bg-neutral/30 p-4 rounded-lg">
                            <h3 className="font-nunito font-bold mb-2">Instructions</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm font-opensans text-text/80">
                              <li>You will have 3 minutes to type as much of the text as possible</li>
                              <li>Type at a comfortable pace that you could maintain during work</li>
                              <li>Focus on both speed and accuracy as both are important</li>
                              <li>The test will automatically end after 3 minutes</li>
                              <li>You need to achieve at least 35 WPM with 85% accuracy to pass</li>
                            </ul>
                          </div>
                          
                          <div className="flex justify-center mt-6">
                            <Button 
                              onClick={startTypingTest}
                              className="bg-primary hover:bg-[#3d8c40] font-nunito font-bold py-5 px-8 text-lg"
                            >
                              Begin Typing Test
                            </Button>
                          </div>
                        </div>
                      ) : isTestActive ? (
                        <div className="space-y-6">
                          <div className="mb-2">
                            <div className="font-nunito font-semibold">Original Text:</div>
                          </div>
                          
                          <div className="bg-neutral/20 p-4 rounded-lg text-sm font-opensans text-text/90 mb-4">
                            {typingTestText}
                          </div>
                          
                          <div>
                            <div className="font-nunito font-semibold mb-2">Type Here:</div>
                            <textarea
                              ref={textareaRef}
                              value={typedText}
                              onChange={handleTyping}
                              onCopy={preventCopyPaste}
                              onPaste={preventCopyPaste}
                              onCut={preventCopyPaste}
                              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-opensans text-sm"
                              placeholder="Start typing the text above..."
                              disabled={!isTestActive}
                            ></textarea>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              onClick={handleFinishTypingTest}
                              variant="outline"
                              className="font-nunito"
                            >
                              Finish Early
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-4 shadow-md rounded-lg text-center">
                              <div className="text-3xl font-bold font-nunito text-primary mb-1">
                                {typingMetrics.wpm}
                              </div>
                              <div className="text-sm font-opensans text-text/70">Words Per Minute</div>
                              <Badge className={`mt-2 ${typingMetrics.wpm >= 35 ? 'bg-green-500' : 'bg-red-500'}`}>
                                {typingMetrics.wpm >= 35 ? 'Passed' : 'Failed'} (35 WPM required)
                              </Badge>
                            </div>
                            
                            <div className="bg-white p-4 shadow-md rounded-lg text-center">
                              <div className="text-3xl font-bold font-nunito text-primary mb-1">
                                {typingMetrics.accuracy}%
                              </div>
                              <div className="text-sm font-opensans text-text/70">Accuracy</div>
                              <Badge className={`mt-2 ${typingMetrics.accuracy >= 85 ? 'bg-green-500' : 'bg-red-500'}`}>
                                {typingMetrics.accuracy >= 85 ? 'Passed' : 'Failed'} (85% required)
                              </Badge>
                            </div>
                            
                            <div className="bg-white p-4 shadow-md rounded-lg text-center">
                              <div className="text-3xl font-bold font-nunito text-primary mb-1">
                                {typingMetrics.consistency}%
                              </div>
                              <div className="text-sm font-opensans text-text/70">Consistency</div>
                              <div className="h-1.5 bg-gray-200 rounded-full mt-2">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${typingMetrics.consistency}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-neutral/20 p-4 rounded-lg">
                            <h3 className="font-nunito font-bold mb-2">Detailed Metrics</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-text/70">Total Time:</span> {typingMetrics.elapsedTime} seconds
                              </div>
                              <div>
                                <span className="text-text/70">Total Keystrokes:</span> {typingMetrics.keystrokes}
                              </div>
                              <div>
                                <span className="text-text/70">Correct Characters:</span> {typingMetrics.correctChars}
                              </div>
                              <div>
                                <span className="text-text/70">Error Characters:</span> {typingMetrics.errorChars}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              onClick={handleNextSection}
                              className="bg-primary hover:bg-[#3d8c40] font-nunito font-semibold"
                            >
                              Continue to Reading Comprehension
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Reading Comprehension Section */}
                  {assessmentType === AssessmentType.READING_COMPREHENSION && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b">
                        <div>
                          <h2 className="font-nunito font-bold text-xl">Reading Comprehension</h2>
                          <p className="text-text/70 font-opensans">
                            Read each scenario and answer the multiple-choice questions
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            Scenario {currentReadingScenario + 1} of {readingComprehensionScenarios.length}
                          </div>
                        </div>
                      </div>
                      
                      {!isTestComplete ? (
                        <div className="space-y-6">
                          <div className="bg-neutral/20 p-5 rounded-lg">
                            <h3 className="font-nunito font-bold mb-3">Scenario</h3>
                            <p className="font-opensans text-text/90 mb-2">
                              {readingComprehensionScenarios[currentReadingScenario].scenario}
                            </p>
                          </div>
                          
                          <div className="space-y-8">
                            {readingComprehensionScenarios[currentReadingScenario].questions.map((question, questionIndex) => (
                              <div key={question.id} className="space-y-4">
                                <h4 className="font-nunito font-semibold">
                                  Question {questionIndex + 1}: {question.question}
                                </h4>
                                <div className="space-y-3">
                                  {question.options.map((option, optionIndex) => (
                                    <div 
                                      key={optionIndex}
                                      onClick={() => handleReadingAnswerSelect(question.id, optionIndex)}
                                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                        getSelectedReadingAnswer(question.id) === optionIndex
                                          ? 'border-primary bg-primary/10'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <div className="flex items-start">
                                        <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 ${
                                          getSelectedReadingAnswer(question.id) === optionIndex
                                            ? 'border-primary bg-primary text-white'
                                            : 'border-gray-300'
                                        }`}>
                                          {getSelectedReadingAnswer(question.id) === optionIndex && (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full p-1">
                                              <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                          )}
                                        </div>
                                        <span className="font-opensans text-text/80">{option}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setCurrentReadingScenario(prev => Math.max(0, prev - 1))}
                              disabled={currentReadingScenario === 0}
                              className="font-nunito"
                            >
                              Previous Scenario
                            </Button>
                            
                            {currentReadingScenario < readingComprehensionScenarios.length - 1 ? (
                              <Button
                                onClick={() => setCurrentReadingScenario(prev => prev + 1)}
                                disabled={!isCurrentScenarioComplete()}
                                className="bg-primary hover:bg-[#3d8c40] font-nunito font-semibold"
                              >
                                Next Scenario
                              </Button>
                            ) : (
                              <Button
                                onClick={completeReadingTest}
                                disabled={!isCurrentScenarioComplete()}
                                className="bg-primary hover:bg-[#3d8c40] font-nunito font-semibold"
                              >
                                Complete Reading Assessment
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="bg-white p-6 shadow-md rounded-lg text-center">
                            <div className="text-3xl font-bold font-nunito text-primary mb-2">
                              {Math.round(assessmentResults.reading?.score || 0)}%
                            </div>
                            <div className="font-opensans text-text/70 mb-4">Reading Comprehension Score</div>
                            <Progress value={assessmentResults.reading?.score || 0} className="h-2.5 mb-2" />
                            <Badge className={`${assessmentResults.reading?.passed ? 'bg-green-500' : 'bg-red-500'}`}>
                              {assessmentResults.reading?.passed ? 'Passed' : 'Failed'} (70% required)
                            </Badge>
                            
                            <div className="mt-4 text-sm text-text/70">
                              {assessmentResults.reading?.correctAnswers || 0} correct out of {assessmentResults.reading?.totalQuestions || 0} questions
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              onClick={handleNextSection}
                              className="bg-primary hover:bg-[#3d8c40] font-nunito font-semibold"
                            >
                              Continue to Grammar Assessment
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Grammar Assessment Section */}
                  {assessmentType === AssessmentType.GRAMMAR && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b">
                        <h2 className="font-nunito font-bold text-xl">Grammar & Writing Assessment</h2>
                        <p className="text-text/70 font-opensans">
                          Answer the grammar questions and complete a short writing task
                        </p>
                      </div>
                      
                      {!isTestComplete ? (
                        <div className="space-y-8">
                          <div>
                            <h3 className="font-nunito font-semibold text-lg mb-4">Grammar Questions</h3>
                            <div className="space-y-6">
                              {grammarQuestions.map((question, index) => (
                                <div key={question.id} className="space-y-3">
                                  <h4 className="font-nunito font-medium">
                                    Question {index + 1}: {question.question}
                                  </h4>
                                  <div className="space-y-2">
                                    {question.options.map((option, optionIndex) => (
                                      <div 
                                        key={optionIndex}
                                        onClick={() => handleGrammarAnswerSelect(question.id, optionIndex)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                          grammarAnswers[question.id] === optionIndex
                                            ? 'border-primary bg-primary/10'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                      >
                                        <div className="flex items-start">
                                          <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 ${
                                            grammarAnswers[question.id] === optionIndex
                                              ? 'border-primary bg-primary text-white'
                                              : 'border-gray-300'
                                          }`}>
                                            {grammarAnswers[question.id] === optionIndex && (
                                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full p-1">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                              </svg>
                                            )}
                                          </div>
                                          <span className="font-opensans text-text/80">{option}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t">
                            <h3 className="font-nunito font-semibold text-lg mb-3">Writing Task</h3>
                            <p className="font-opensans text-text/80 mb-4">
                              {writingPrompt}
                            </p>
                            
                            <textarea
                              value={writingResponse}
                              onChange={(e) => setWritingResponse(e.target.value)}
                              className="w-full min-h-[150px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-opensans text-sm"
                              placeholder="Type your response here..."
                            ></textarea>
                            
                            <div className="flex justify-between items-center mt-2">
                              <div className="text-sm text-text/60 font-opensans">
                                Approximately {writingResponse.split(/\s+/).filter(word => word.length > 0).length} words
                                (aim for ~50 words)
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end pt-4">
                            <Button
                              onClick={completeGrammarTest}
                              disabled={!areAllGrammarQuestionsAnswered() || writingResponse.length < 20}
                              className="bg-primary hover:bg-[#3d8c40] font-nunito font-semibold"
                            >
                              Complete Grammar Assessment
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white p-6 shadow-md rounded-lg text-center">
                              <div className="text-3xl font-bold font-nunito text-primary mb-2">
                                {Math.round(assessmentResults.grammar?.grammarScore || 0)}%
                              </div>
                              <div className="font-opensans text-text/70 mb-4">Grammar Score</div>
                              <Progress value={assessmentResults.grammar?.grammarScore || 0} className="h-2.5 mb-2" />
                            </div>
                            
                            <div className="bg-white p-6 shadow-md rounded-lg text-center">
                              <div className="text-3xl font-bold font-nunito text-primary mb-2">
                                {Math.round(assessmentResults.grammar?.writingScore || 0)}%
                              </div>
                              <div className="font-opensans text-text/70 mb-4">Writing Score</div>
                              <Progress value={assessmentResults.grammar?.writingScore || 0} className="h-2.5 mb-2" />
                            </div>
                          </div>
                          
                          <div className="bg-white p-6 shadow-md rounded-lg text-center">
                            <div className="text-xl font-bold font-nunito mb-2">
                              Overall Grammar & Writing Assessment
                            </div>
                            <Badge className={`${assessmentResults.grammar?.overallPassed ? 'bg-green-500' : 'bg-red-500'}`}>
                              {assessmentResults.grammar?.overallPassed ? 'Passed' : 'Failed'} (75% required)
                            </Badge>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              onClick={handleNextSection}
                              className="bg-primary hover:bg-[#3d8c40] font-nunito font-semibold"
                            >
                              View Final Results
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
            
            <CardFooter className="bg-neutral/20 px-6 py-4">
              <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-text/60 font-opensans">
                  Stage 1 Screener: Approximately 10 minutes to complete all sections
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${assessmentType === AssessmentType.TYPING_TEST ? 'bg-primary' : (typingMetrics.wpm > 0 ? 'bg-green-500' : 'bg-gray-300')}`}></div>
                  <div className={`w-3 h-3 rounded-full ${assessmentType === AssessmentType.READING_COMPREHENSION ? 'bg-primary' : (assessmentResults.reading ? 'bg-green-500' : 'bg-gray-300')}`}></div>
                  <div className={`w-3 h-3 rounded-full ${assessmentType === AssessmentType.GRAMMAR ? 'bg-primary' : (assessmentResults.grammar ? 'bg-green-500' : 'bg-gray-300')}`}></div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Assessment;
