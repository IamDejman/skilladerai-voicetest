# Skilladder AI API Documentation

Version: 1.1.0  
Last Updated: May 22, 2025 14:00:12.435  
Status: Operational  
Base URL: `https://api.skilladderai.com`

## Getting Started

### Authentication

Skilladder AI supports two authentication methods:

1. **Session-based Authentication**: Used for website login through `/api/login` and `/api/register` endpoints.
2. **Token-based Authentication**: Used for API access by obtaining a token through the `/register-candidate` endpoint.

### Response Format

All responses are returned in JSON format. Successful requests will return a 2xx status code, while errors will return an appropriate 4xx or 5xx status code along with an error message.

## Registration Endpoints

Endpoints for candidate registration and account management.

### Register Candidate

```
POST /register-candidate
```

Register a new candidate and generate an assessment token.

**Request Body:**
```json
{
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
}
```

**Response:**
```json
{
  "candidateId": "string",
  "assessmentToken": "string"
}
```

## Stage 1 Assessment Endpoints

Endpoints for the initial screening assessment (typing test, reading comprehension, and grammar assessment).

### Submit Typing Test

```
POST /stage1/typing-test
```

Submit typing test results for evaluation.

**Request Body:**
```json
{
  "candidateId": "string",
  "typedText": "string",
  "timeElapsed": "number",
  "keystrokes": "number"
}
```

**Response:**
```json
{
  "wpm": "number",
  "accuracy": "number",
  "passed": "boolean"
}
```

### Submit Reading Comprehension

```
POST /stage1/reading-comprehension
```

Submit answers to reading comprehension questions.

**Request Body:**
```json
{
  "candidateId": "string",
  "answers": [
    {
      "questionId": "string",
      "selectedOption": "number"
    }
  ]
}
```

**Response:**
```json
{
  "score": "number",
  "correctAnswers": "number",
  "passed": "boolean"
}
```

### Submit Grammar Assessment

```
POST /stage1/grammar-assessment
```

Submit grammar answers and writing sample.

**Request Body:**
```json
{
  "candidateId": "string",
  "grammarAnswers": {
    "questionId1": "number",
    "questionId2": "number"
  },
  "writingResponse": "string"
}
```

**Response:**
```json
{
  "grammarScore": "number",
  "writingScore": "number",
  "overallPassed": "boolean"
}
```

### Get Stage 1 Results

```
GET /stage1/results/:candidateId
```

Retrieve complete results for Stage 1 assessment.

**Response:**
```json
{
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
}
```

## Stage 2 Assessment Endpoints

Endpoints for the detailed assessment stage (voice analysis and customer interaction simulation).

### Submit Voice Recording

```
POST /stage2/voice-recording
```

Upload a voice recording for analysis.

**Request Body:**
```json
{
  "candidateId": "string",
  "audioBase64": "string",
  "scenarioId": "string"
}
```

**Response:**
```json
{
  "recordingId": "string",
  "processingStatus": "string"
}
```

### Get Voice Analysis Results

```
GET /stage2/analysis/:recordingId
```

Retrieve analysis results for a voice recording.

**Response:**
```json
{
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
}
```

## User Authentication Endpoints

Endpoints for user registration, login, and account management.

### Register User

```
POST /api/register
```

Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "nativeLanguage": "string (optional)"
}
```

**Response:**
```json
{
  "id": "number",
  "username": "string",
  "email": "string"
}
```

### User Login

```
POST /api/login
```

Authenticate a user and create a session.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": "number",
  "username": "string",
  "email": "string"
}
```

### User Logout

```
GET /api/logout
```

End the current user session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User

```
GET /api/auth/user
```

Get the currently authenticated user information.

**Response:**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "nativeLanguage": "string"
}
```

## Assessment History Endpoints

Endpoints for retrieving past assessment results for authenticated users.

### Get Assessment History

```
GET /api/assessments/history
```

Retrieve all assessment history for the authenticated user.

**Response:**
```json
{
  "stage1Results": [
    {
      "id": "number",
      "userId": "number",
      "typingWPM": "number",
      "typingAccuracy": "number",
      "typingConsistency": "number",
      "typingPassed": "boolean",
      "readingScore": "number",
      "readingCorrectAnswers": "number",
      "readingTotalQuestions": "number",
      "readingPassed": "boolean",
      "grammarScore": "number",
      "writingScore": "number",
      "grammarPassed": "boolean",
      "stage1Passed": "boolean",
      "feedback": "string",
      "createdAt": "date"
    }
  ],
  "stage2Results": [
    {
      "id": "number",
      "userId": "number",
      "pronunciation": "number",
      "fluency": "number",
      "vocabulary": "number",
      "grammar": "number",
      "overallVoiceScore": "number",
      "voicePassed": "boolean",
      "cefrLevel": "string",
      "emailResponseScore": "number",
      "complaintResolutionScore": "number",
      "processDocumentationScore": "number",
      "overallWritingScore": "number",
      "writingPassed": "boolean",
      "sjtScore": "number",
      "sjtCorrectAnswers": "number",
      "sjtTotalScenarios": "number",
      "sjtPassed": "boolean",
      "stage2Passed": "boolean",
      "overallScore": "number",
      "feedback": "string",
      "recommendations": "string[]",
      "createdAt": "date"
    }
  ]
}
```

### Get Latest Assessment

```
GET /api/assessments/latest
```

Retrieve the most recent assessment results for the authenticated user.

**Response:**
```json
{
  "stage1": {
    "id": "number",
    "userId": "number",
    "typingWPM": "number",
    "typingAccuracy": "number",
    "typingConsistency": "number",
    "typingPassed": "boolean",
    "readingScore": "number",
    "readingCorrectAnswers": "number",
    "readingTotalQuestions": "number",
    "readingPassed": "boolean",
    "grammarScore": "number",
    "writingScore": "number",
    "grammarPassed": "boolean",
    "stage1Passed": "boolean",
    "feedback": "string",
    "createdAt": "date"
  },
  "stage2": {
    "id": "number",
    "userId": "number",
    "pronunciation": "number",
    "fluency": "number",
    "vocabulary": "number",
    "grammar": "number",
    "overallVoiceScore": "number",
    "voicePassed": "boolean",
    "cefrLevel": "string",
    "emailResponseScore": "number",
    "complaintResolutionScore": "number",
    "processDocumentationScore": "number",
    "overallWritingScore": "number",
    "writingPassed": "boolean",
    "sjtScore": "number",
    "sjtCorrectAnswers": "number",
    "sjtTotalScenarios": "number",
    "sjtPassed": "boolean",
    "stage2Passed": "boolean",
    "overallScore": "number",
    "feedback": "string",
    "recommendations": "string[]",
    "createdAt": "date"
  }
}
```

## Platform Statistics Endpoints

Endpoints for retrieving platform metrics and statistics.

### Get Platform Statistics

```
GET /api/statistics
```

Get platform-wide statistics for display purposes.

**Response:**
```json
{
  "userCount": "number",
  "rating": "number",
  "formattedUserCount": "string",
  "formattedRating": "string"
}
```

## Utility Endpoints

Helper endpoints for monitoring and system status.

### Health Check

```
GET /api/health
```

Check if the API is operational.

**Response:**
```json
{
  "status": "ok",
  "version": "string",
  "timestamp": "string"
}
```

## Error Handling

All errors follow a standard format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "string" // Optional
  }
}
```

Common error codes:
- `400`: Bad Request - The request was malformed or missing required fields
- `401`: Unauthorized - Authentication token is missing or invalid
- `403`: Forbidden - The authenticated user does not have permission to access the requested resource
- `404`: Not Found - The requested resource does not exist
- `422`: Unprocessable Entity - The request was well-formed but contains semantic errors
- `500`: Internal Server Error - An error occurred on the server

## Rate Limiting

API requests are limited to 100 requests per minute per client. If you exceed this limit, you will receive a 429 Too Many Requests response.

The response will include the following headers:
- `X-RateLimit-Limit`: Maximum number of requests allowed per minute
- `X-RateLimit-Remaining`: Number of requests remaining in the current window
- `X-RateLimit-Reset`: Time in seconds until the rate limit resets

## Versioning

The API uses versioning to ensure backward compatibility. The current version is v1. You can specify the version in the URL path:

```
https://api.skilladderai.com/v1/register-candidate
```

If no version is specified, the latest version will be used.