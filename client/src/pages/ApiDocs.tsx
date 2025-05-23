import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
} from "../components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";

const ApiDocs = () => {
  // Mock data for API version and last updated - in production these would come from the API
  const apiInfo = {
    version: "1.0.0",
    lastUpdated: new Date().toLocaleDateString(),
    status: "Operational",
    baseUrl: window.location.origin + "/api"
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 py-12 pt-24 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Comprehensive documentation for the Skilladder AI API endpoints.
            </p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">API Status</p>
                    <p className="font-semibold text-base">{apiInfo.status}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Version</p>
                    <p className="font-semibold text-base">{apiInfo.version}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-semibold text-base">{apiInfo.lastUpdated}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          <div className="mb-8">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Getting Started</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg">Authentication</h3>
                    <p className="text-gray-700">
                      All API requests require an authentication token. You can obtain a token by registering a candidate through the <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">/register-candidate</code> endpoint.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg">Base URL</h3>
                    <div className="flex items-center space-x-2">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm">{apiInfo.baseUrl}</code>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg">Response Format</h3>
                    <p className="text-gray-700">
                      All responses are returned in JSON format. Successful requests will return a 2xx status code, while errors will return an appropriate 4xx or 5xx status code along with an error message.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Tabs defaultValue="registration">
              <div className="mb-6">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="registration">Registration</TabsTrigger>
                  <TabsTrigger value="stage1">Stage 1 Assessment</TabsTrigger>
                  <TabsTrigger value="stage2">Stage 2 Assessment</TabsTrigger>
                  <TabsTrigger value="utilities">Utilities</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="registration">
                <div className="space-y-6">
                  <div className="border-b pb-4 mb-6">
                    <h2 className="text-2xl font-bold">Registration Endpoints</h2>
                    <p className="text-gray-600">Endpoints for candidate registration and account management.</p>
                  </div>
                  
                  <Card className="mb-8 overflow-hidden">
                    <CardHeader className="bg-green-50 border-b border-green-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-bold text-xl flex items-center">
                            Register Candidate
                            <Badge className="bg-green-500 ml-2">
                              POST
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1 font-semibold">
                            {apiInfo.baseUrl}/register-candidate
                          </CardDescription>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">Register a new candidate and generate an assessment token</p>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="border-b p-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Request Body</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string"
  },
  "experience": {
    "customerServiceYears": "number",
    "previousCallCenter": "boolean",
    "englishProficiency": "string" // Basic/Intermediate/Advanced
  }
}`}
                        </pre>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Response</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "candidateId": "string",
  "assessmentToken": "string"
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="stage1">
                <div className="space-y-6">
                  <div className="border-b pb-4 mb-6">
                    <h2 className="text-2xl font-bold">Stage 1 Assessment Endpoints</h2>
                    <p className="text-gray-600">Endpoints for the initial screening assessment (typing test, reading comprehension, and grammar assessment).</p>
                  </div>
                  
                  <Card className="mb-8 overflow-hidden">
                    <CardHeader className="bg-green-50 border-b border-green-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-bold text-xl flex items-center">
                            Submit Typing Test
                            <Badge className="bg-green-500 ml-2">
                              POST
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1 font-semibold">
                            {apiInfo.baseUrl}/stage1/typing-test
                          </CardDescription>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">Submit typing test results for evaluation</p>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="border-b p-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Request Body</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "candidateId": "string",
  "typedText": "string",
  "timeElapsed": "number",
  "keystrokes": "number"
}`}
                        </pre>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Response</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "wpm": "number",
  "accuracy": "number",
  "passed": "boolean"
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-8 overflow-hidden">
                    <CardHeader className="bg-green-50 border-b border-green-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-bold text-xl flex items-center">
                            Submit Reading Comprehension
                            <Badge className="bg-green-500 ml-2">
                              POST
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1 font-semibold">
                            {apiInfo.baseUrl}/stage1/reading-comprehension
                          </CardDescription>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">Submit answers to reading comprehension questions</p>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="border-b p-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Request Body</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "candidateId": "string",
  "answers": [
    {
      "questionId": "string",
      "selectedOption": "number"
    }
  ]
}`}
                        </pre>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Response</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "score": "number",
  "correctAnswers": "number",
  "passed": "boolean"
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-8 overflow-hidden">
                    <CardHeader className="bg-green-50 border-b border-green-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-bold text-xl flex items-center">
                            Submit Grammar Assessment
                            <Badge className="bg-green-500 ml-2">
                              POST
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1 font-semibold">
                            {apiInfo.baseUrl}/stage1/grammar-assessment
                          </CardDescription>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">Submit grammar answers and writing sample</p>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="border-b p-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Request Body</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "candidateId": "string",
  "grammarAnswers": {
    "questionId1": "number",
    "questionId2": "number"
  },
  "writingResponse": "string"
}`}
                        </pre>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Response</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "grammarScore": "number",
  "writingScore": "number",
  "overallPassed": "boolean"
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-8 overflow-hidden">
                    <CardHeader className="bg-blue-50 border-b border-blue-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-bold text-xl flex items-center">
                            Get Stage 1 Results
                            <Badge className="bg-blue-500 ml-2">
                              GET
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1 font-semibold">
                            {apiInfo.baseUrl}/stage1/results/:candidateId
                          </CardDescription>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">Retrieve complete results for Stage 1 assessment</p>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Response</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "stage1Results": {
    "typing": {
      "wpm": "number",
      "accuracy": "number",
      "consistency": "number",
      "passed": "boolean"
    },
    "reading": {
      "score": "number",
      "correctAnswers": "number",
      "totalQuestions": "number",
      "passed": "boolean"
    },
    "grammar": {
      "grammarScore": "number",
      "writingScore": "number",
      "overallPassed": "boolean"
    }
  },
  "qualifiesForStage2": "boolean",
  "feedback": "string"
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="stage2">
                <div className="space-y-6">
                  <div className="border-b pb-4 mb-6">
                    <h2 className="text-2xl font-bold">Stage 2 Assessment Endpoints</h2>
                    <p className="text-gray-600">Endpoints for the detailed assessment stage (voice analysis and customer interaction simulation).</p>
                  </div>
                  
                  <Card className="mb-8 overflow-hidden">
                    <CardHeader className="bg-green-50 border-b border-green-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-bold text-xl flex items-center">
                            Submit Voice Recording
                            <Badge className="bg-green-500 ml-2">
                              POST
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1 font-semibold">
                            {apiInfo.baseUrl}/stage2/voice-recording
                          </CardDescription>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">Upload a voice recording for analysis</p>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="border-b p-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Request Body</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "candidateId": "string",
  "audioBase64": "string",
  "scenarioId": "string"
}`}
                        </pre>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Response</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "recordingId": "string",
  "processingStatus": "string"
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-8 overflow-hidden">
                    <CardHeader className="bg-blue-50 border-b border-blue-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-bold text-xl flex items-center">
                            Get Voice Analysis Results
                            <Badge className="bg-blue-500 ml-2">
                              GET
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1 font-semibold">
                            {apiInfo.baseUrl}/stage2/analysis/:recordingId
                          </CardDescription>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">Retrieve analysis results for a voice recording</p>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Response</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "empathy": {
    "score": "number",
    "feedback": "string"
  },
  "professionalism": {
    "score": "number", 
    "feedback": "string"
  },
  "efficiency": {
    "score": "number",
    "feedback": "string"
  },
  "overallScore": "number",
  "passed": "boolean"
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="utilities">
                <div className="space-y-6">
                  <div className="border-b pb-4 mb-6">
                    <h2 className="text-2xl font-bold">Utility Endpoints</h2>
                    <p className="text-gray-600">Helper endpoints for monitoring and system status.</p>
                  </div>
                  
                  <Card className="mb-8 overflow-hidden">
                    <CardHeader className="bg-blue-50 border-b border-blue-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-bold text-xl flex items-center">
                            Health Check
                            <Badge className="bg-blue-500 ml-2">
                              GET
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1 font-semibold">
                            {apiInfo.baseUrl}/health
                          </CardDescription>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">Check if the API is operational</p>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Response</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "status": "ok",
  "version": "string",
  "timestamp": "string"
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ApiDocs;