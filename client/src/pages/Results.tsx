import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Define the feedback form schema
const feedbackFormSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, {
    message: "Comment must be at least 5 characters long."
  }).max(500, {
    message: "Comment cannot exceed 500 characters."
  }),
});

// Define the Stage 1 results type
interface Stage1Results {
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
}

// Define the Stage 2 results type
interface Stage2Results {
  writing?: {
    emailResponseScore: number;
    complaintResolutionScore: number;
    processDocumentationScore: number;
    overallWritingScore: number;
    passed: boolean;
  };
  voice?: {
    pronunciation: number;
    fluency: number;
    vocabulary: number;
    grammar: number;
    overall: number;
    passed: boolean;
    cefrLevel?: string;
  };
  sjt?: {
    score: number;
    correctAnswers: number;
    totalScenarios: number;
    passed: boolean;
  };
  stage2Passed?: boolean;
  overallScore?: number;
  cefrLevel?: string;
  recommendations?: string[];
}

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export default function ResultsPage() {
  const [, navigate] = useLocation();
  const [stage1Result, setStage1Result] = useState<Stage1Results | null>(null);
  const [stage2Result, setStage2Result] = useState<Stage2Results | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // State to control feedback form visibility
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Form for user feedback
  const feedbackForm = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      rating: 5,
      comment: ""
    }
  });
  
  const onSubmit = async (data: FeedbackFormValues) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        toast({
          title: "Feedback submitted",
          description: "Thank you for your feedback!",
          variant: "default"
        });
        feedbackForm.reset();
        
        // Redirect to employee dashboard after feedback submission
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast({
          title: "Error",
          description: "Failed to submit feedback",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    setLoading(true);
    
    // Check for stored assessment data in session storage
    const candidateData = sessionStorage.getItem('candidateData');
    const assessmentResults = sessionStorage.getItem('assessmentResults');
    const stage2Results = sessionStorage.getItem('stage2Results');
    
    // Check for session ID and validity - critical for security
    const sessionId = sessionStorage.getItem('assessmentSessionId');
    const wasSessionValid = sessionStorage.getItem('sessionValid');
    const wasAssessmentExited = localStorage.getItem('assessmentExited');
    
    // Record access timestamp for compliance logging
    const accessTimestamp = new Date().toISOString();
    sessionStorage.setItem('resultsPageAccessedAt', accessTimestamp);
    
    // For security: If the user directly accesses results without completing assessment,
    // we should check for a valid session or valid exit condition
    const hasValidSession = sessionId && wasSessionValid === 'true';
    const hasExitedAssessment = wasAssessmentExited === 'true';
    
    // If the assessment was exited, check exit timestamp and automatically show feedback form
    // This ensures users are prompted for feedback after assessment completion
    if (hasExitedAssessment) {
      const exitTimestamp = localStorage.getItem('testExitTimestamp');
      
      // If this is the first time seeing results after test submission
      // (within last 5 minutes), automatically show the feedback form
      if (exitTimestamp) {
        const exitTime = new Date(exitTimestamp).getTime();
        const currentTime = new Date().getTime();
        const minutesSinceExit = (currentTime - exitTime) / (1000 * 60);
        
        // If exit was recent (within 5 minutes), show feedback form
        if (minutesSinceExit < 5) {
          setShowFeedbackForm(true);
        }
      }
    }
    
    // Only allow results page access if user has a valid session OR has previously exited an assessment
    if (!hasValidSession && !hasExitedAssessment) {
      // If no valid session and no assessment data, redirect to registration
      if (!candidateData && !assessmentResults) {
        console.log("No assessment data or valid session found. Redirecting to registration page.");
        toast({
          title: "Registration Required",
          description: "Please complete registration before starting the assessment",
          variant: "destructive"
        });
        navigate('/quiz');
        return;
      }
    }

    // Check for Stage 1 results
    if (assessmentResults) {
      try {
        setStage1Result(JSON.parse(assessmentResults));
      } catch (e) {
        console.error("Error parsing Stage 1 results:", e);
        setStage1Result(null);
      }
    } else {
      setStage1Result(null);
    }
    
    // Check for Stage 2 results
    if (stage2Results) {
      try {
        setStage2Result(JSON.parse(stage2Results));
      } catch (e) {
        console.error("Error parsing Stage 2 results:", e);
        setStage2Result(null);
      }
    } else {
      setStage2Result(null);
    }
    
    setLoading(false);
  }, [navigate, toast]);
  
  // Add state to track if we're in feedback-only view
  const [feedbackOnlyView, setFeedbackOnlyView] = useState(false);
  // Track if restart is in progress
  const [isRestarting, setIsRestarting] = useState(false);
  
  // Function to restart assessment with new session ID
  const restartAssessment = async () => {
    try {
      setIsRestarting(true);
      // Clear previous session data
      sessionStorage.removeItem('assessmentSessionId');
      sessionStorage.removeItem('sessionValid');
      sessionStorage.removeItem('sessionCreatedAt');
      localStorage.removeItem('assessmentExited');
      localStorage.removeItem('stage1Results');
      localStorage.removeItem('testExitTimestamp');
      
      // Show success message
      toast({
        title: "Assessment Reset",
        description: "You can now start the assessment process again with a new session.",
        variant: "default"
      });
      
      // Redirect to registration to get new session ID
      setTimeout(() => {
        navigate('/quiz');
      }, 1500);
    } catch (error) {
      console.error("Error restarting assessment:", error);
      toast({
        title: "Error",
        description: "Failed to restart assessment. Please try again.",
        variant: "destructive"
      });
      setIsRestarting(false);
    }
  };
  
  // Check if we should show only the feedback form (no navbar/footer)
  useEffect(() => {
    // Check if the URL has a feedback parameter
    const url = new URL(window.location.href);
    const feedbackParam = url.searchParams.get('feedbackOnly');
    
    if (feedbackParam === 'true') {
      setFeedbackOnlyView(true);
      // Auto-show the feedback form
      setShowFeedbackForm(true);
    }
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fb] dark:bg-gray-900">
      {/* Only show navbar when not in feedback-only view */}
      {!feedbackOnlyView && <Navbar />}
      
      <main className={`flex-1 container mx-auto px-4 py-8 ${!feedbackOnlyView ? 'pt-24' : 'pt-8'}`}>
        {!feedbackOnlyView && (
          <h1 className="text-3xl md:text-4xl font-nunito font-bold text-center mb-8">
            Assessment Results
          </h1>
        )}
        
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Stage 1 Results Section */}
              {stage1Result && (
                <Card className="mb-8 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary to-[#3d8c40] text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <CardTitle className="text-2xl font-nunito font-bold">Assessment Results</CardTitle>
                        <CardDescription className="text-white/90 font-opensans">
                          Stage 1: Initial Screener Summary
                        </CardDescription>
                      </div>
                      
                      <Badge className={`${stage1Result.stage1Passed ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-1.5 text-sm font-medium rounded-full`}>
                        {stage1Result.stage1Passed ? 'PASSED' : 'NOT QUALIFIED'}
                      </Badge>
                    </div>
                  </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Typing Test Results */}
                    <div>
                      <div className="bg-white rounded-lg p-4 shadow">
                        <h3 className="font-nunito font-bold mb-2">Typing Assessment</h3>
                        {stage1Result.typing ? (
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Speed (WPM)</span>
                                <span className="font-semibold">{stage1Result.typing.wpm}</span>
                              </div>
                              <Progress value={stage1Result.typing.wpm} max={100} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Accuracy</span>
                                <span className="font-semibold">{stage1Result.typing.accuracy}%</span>
                              </div>
                              <Progress value={stage1Result.typing.accuracy} max={100} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Consistency</span>
                                <span className="font-semibold">{stage1Result.typing.consistency}%</span>
                              </div>
                              <Progress value={stage1Result.typing.consistency} max={100} className="h-2" />
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-sm font-medium">Result</span>
                              <Badge className={`${stage1Result.typing.passed ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                                {stage1Result.typing.passed ? 'PASS' : 'FAIL'}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">Typing assessment not completed</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Reading Comprehension Results */}
                    <div>
                      <div className="bg-white rounded-lg p-4 shadow">
                        <h3 className="font-nunito font-bold mb-2">Reading Assessment</h3>
                        {stage1Result.reading ? (
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Score</span>
                                <span className="font-semibold">{stage1Result.reading.score}%</span>
                              </div>
                              <Progress value={stage1Result.reading.score} max={100} className="h-2" />
                            </div>
                            <div className="text-sm pt-2">
                              <p>Correct Answers: <span className="font-semibold">{stage1Result.reading.correctAnswers}/{stage1Result.reading.totalQuestions}</span></p>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-sm font-medium">Result</span>
                              <Badge className={`${stage1Result.reading.passed ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                                {stage1Result.reading.passed ? 'PASS' : 'FAIL'}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">Reading assessment not completed</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Grammar Test Results */}
                    <div>
                      <div className="bg-white rounded-lg p-4 shadow">
                        <h3 className="font-nunito font-bold mb-2">Grammar Assessment</h3>
                        {stage1Result.grammar ? (
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Grammar Score</span>
                                <span className="font-semibold">{stage1Result.grammar.grammarScore}%</span>
                              </div>
                              <Progress value={stage1Result.grammar.grammarScore} max={100} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Writing Score</span>
                                <span className="font-semibold">{stage1Result.grammar.writingScore}%</span>
                              </div>
                              <Progress value={stage1Result.grammar.writingScore} max={100} className="h-2" />
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-sm font-medium">Result</span>
                              <Badge className={`${stage1Result.grammar.overallPassed ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                                {stage1Result.grammar.overallPassed ? 'PASS' : 'FAIL'}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">Grammar assessment not completed</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )}
              
              {/* Next Steps Section */}
              {stage1Result && !stage2Result && (
                <Card className="mb-8 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardTitle className="text-2xl font-nunito font-bold">Next Steps</CardTitle>
                    <CardDescription className="text-white/90 font-opensans">
                      Continue your assessment journey
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {stage1Result.stage1Passed ? (
                        <>
                          <p className="text-md">Congratulations! You have successfully passed Stage 1 of the assessment.</p>
                          <p className="text-md">You are now eligible to proceed to Stage 2 - Voice & Role Readiness Assessment.</p>
                          <div className="pt-4">
                            <a href="/assessment?stage=2" className="inline-block px-6 py-3 bg-accent hover:bg-accent/90 text-white font-semibold rounded-md transition-colors">
                              Start Stage 2 Assessment
                            </a>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-md">Unfortunately, you did not meet the requirements for Stage 1.</p>
                          <p className="text-md">We recommend practicing your typing, reading, and grammar skills before retaking the assessment.</p>
                          <div className="pt-4">
                            <a href="/assessment" className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-md transition-colors">
                              Retry Stage 1 Assessment
                            </a>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Stage 2 Results Section */}
              {stage2Result && (
                <Card className="mb-8 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-accent to-[#8c3d8d] text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <CardTitle className="text-2xl font-nunito font-bold">Advanced Assessment Results</CardTitle>
                        <CardDescription className="text-white/90 font-opensans">
                          Stage 2: Voice & Role Readiness
                        </CardDescription>
                      </div>
                      
                      <Badge className={`${stage2Result.stage2Passed ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-1.5 text-sm font-medium rounded-full`}>
                        {stage2Result.stage2Passed ? 'CERTIFIED' : 'NOT CERTIFIED'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <Tabs defaultValue="voice">
                      <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="voice">Voice Assessment</TabsTrigger>
                        <TabsTrigger value="writing">Writing Assessment</TabsTrigger>
                        <TabsTrigger value="sjt">Situational Judgment</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="voice">
                        {stage2Result.voice ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h3 className="text-xl font-nunito font-bold mb-4">Voice Performance</h3>
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Pronunciation</span>
                                    <span className="font-semibold">{stage2Result.voice.pronunciation}/100</span>
                                  </div>
                                  <Progress value={stage2Result.voice.pronunciation} max={100} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Fluency</span>
                                    <span className="font-semibold">{stage2Result.voice.fluency}/100</span>
                                  </div>
                                  <Progress value={stage2Result.voice.fluency} max={100} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Vocabulary</span>
                                    <span className="font-semibold">{stage2Result.voice.vocabulary}/100</span>
                                  </div>
                                  <Progress value={stage2Result.voice.vocabulary} max={100} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Grammar</span>
                                    <span className="font-semibold">{stage2Result.voice.grammar}/100</span>
                                  </div>
                                  <Progress value={stage2Result.voice.grammar} max={100} className="h-2" />
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-xl font-nunito font-bold mb-4">Proficiency Level</h3>
                              <div className="flex flex-col items-center bg-gradient-to-b from-green-400 to-yellow-400 rounded-full w-36 h-36 mx-auto justify-center">
                                <span className="text-4xl font-bold text-white">{stage2Result.voice.cefrLevel}</span>
                              </div>
                              <p className="text-center mt-4">
                                Your English proficiency is rated at CEFR level {stage2Result.voice.cefrLevel}, which indicates advanced communication skills.
                              </p>
                            </div>
                            
                            <div className="md:col-span-2">
                              <h3 className="text-xl font-nunito font-bold mb-4">Overall Voice Assessment</h3>
                              <div className="w-full mb-2">
                                <div className="flex justify-between mb-1">
                                  <span>Overall Score</span>
                                  <span className="font-semibold">{stage2Result.voice.overall}/100</span>
                                </div>
                                <Progress value={stage2Result.voice.overall} max={100} className="h-4" />
                              </div>
                              <div className="flex justify-between text-sm mt-2">
                                <span>Beginner</span>
                                <span>Intermediate</span>
                                <span>Advanced</span>
                              </div>
                              <div className="flex justify-between items-center mt-4">
                                <span className="text-base font-medium">Result</span>
                                <Badge className={`${stage2Result.voice.passed ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                                  {stage2Result.voice.passed ? 'PASS' : 'FAIL'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">Voice assessment not completed</p>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="writing">
                        {stage2Result.writing ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h3 className="text-xl font-nunito font-bold mb-4">Writing Skills Assessment</h3>
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Email Response</span>
                                    <span className="font-semibold">{stage2Result.writing.emailResponseScore}/100</span>
                                  </div>
                                  <Progress value={stage2Result.writing.emailResponseScore} max={100} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Complaint Resolution</span>
                                    <span className="font-semibold">{stage2Result.writing.complaintResolutionScore}/100</span>
                                  </div>
                                  <Progress value={stage2Result.writing.complaintResolutionScore} max={100} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Process Documentation</span>
                                    <span className="font-semibold">{stage2Result.writing.processDocumentationScore}/100</span>
                                  </div>
                                  <Progress value={stage2Result.writing.processDocumentationScore} max={100} className="h-2" />
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-xl font-nunito font-bold mb-4">Overall Writing Performance</h3>
                              <div className="w-full mb-2">
                                <div className="flex justify-between mb-1">
                                  <span>Overall Score</span>
                                  <span className="font-semibold">{stage2Result.writing.overallWritingScore}/100</span>
                                </div>
                                <Progress value={stage2Result.writing.overallWritingScore} max={100} className="h-4" />
                              </div>
                              <div className="flex justify-between text-sm mt-2">
                                <span>Basic</span>
                                <span>Proficient</span>
                                <span>Expert</span>
                              </div>
                              <div className="flex justify-between items-center mt-4">
                                <span className="text-base font-medium">Result</span>
                                <Badge className={`${stage2Result.writing.passed ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                                  {stage2Result.writing.passed ? 'PASS' : 'FAIL'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">Writing assessment not completed</p>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="sjt">
                        {stage2Result.sjt ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h3 className="text-xl font-nunito font-bold mb-4">Situational Judgment Test</h3>
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Score</span>
                                    <span className="font-semibold">{stage2Result.sjt.score}/100</span>
                                  </div>
                                  <Progress value={stage2Result.sjt.score} max={100} className="h-2" />
                                </div>
                                <div className="text-sm pt-2">
                                  <p>Correct Responses: <span className="font-semibold">{stage2Result.sjt.correctAnswers}/{stage2Result.sjt.totalScenarios}</span></p>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                  <span className="text-sm font-medium">Result</span>
                                  <Badge className={`${stage2Result.sjt.passed ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                                    {stage2Result.sjt.passed ? 'PASS' : 'FAIL'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-xl font-nunito font-bold mb-4">Interpretation</h3>
                              <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-sm">
                                  Your situational judgment test results indicate how well you can handle typical customer service scenarios.
                                  {stage2Result.sjt.passed 
                                    ? " You've demonstrated good problem-solving and decision-making skills in customer service contexts."
                                    : " There's room for improvement in how you approach complex customer service situations."}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">Situational Judgment assessment not completed</p>
                        )}
                      </TabsContent>
                    </Tabs>
                    
                    {stage2Result.recommendations && stage2Result.recommendations.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-xl font-nunito font-bold mb-4">Improvement Recommendations</h3>
                        <ul className="list-disc pl-5 space-y-2">
                          {stage2Result.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Feedback Form - Enhanced with post-assessment prompt if test was exited */}
              <Card className="mt-8">
                <CardHeader className={showFeedbackForm ? 
                  "bg-gradient-to-r from-green-500 to-green-600 text-white" : 
                  "bg-gray-50"
                }>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle className="text-xl font-nunito font-bold">Your Feedback</CardTitle>
                      <CardDescription className={showFeedbackForm ? "text-white/90" : ""}>
                        {showFeedbackForm 
                          ? "Your assessment is now complete. Please share your experience." 
                          : "Help us improve by sharing your experience with the assessment"
                        }
                      </CardDescription>
                    </div>
                    {showFeedbackForm && (
                      <Badge className="bg-amber-400 text-black px-4 py-1.5 text-sm font-medium rounded-full">
                        ASSESSMENT COMPLETED
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {showFeedbackForm && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            Your assessment has been completed after exiting fullscreen mode. Your session has been secured, and results have been saved.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Form {...feedbackForm}>
                    <form onSubmit={feedbackForm.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={feedbackForm.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-nunito font-bold">How would you rate your experience? (1-5)</FormLabel>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <Button
                                  key={rating}
                                  type="button"
                                  variant={field.value === rating ? "default" : "outline"}
                                  onClick={() => field.onChange(rating)}
                                  className="w-10 h-10 rounded-full"
                                >
                                  {rating}
                                </Button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={feedbackForm.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Comments</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Share your thoughts about the assessment..." {...field} className="resize-none" />
                            </FormControl>
                            <FormDescription>
                              Your feedback helps us improve the assessment experience for everyone.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full sm:w-auto">
                        Submit Feedback
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Add restart assessment button */}
              <div className="mt-8 flex justify-center">
                <Button 
                  onClick={restartAssessment} 
                  disabled={isRestarting} 
                  variant="outline"
                  className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
                >
                  {isRestarting ? 'Restarting...' : 'Start New Assessment'}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      
      {!feedbackOnlyView && <Footer />}
    </div>
  );
}