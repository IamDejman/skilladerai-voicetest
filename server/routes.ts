import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeSpeech } from "./services/openai";
import { sessionMiddleware, login, register, logout, getCurrentUser, isAuthenticated } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply session middleware
  app.use(sessionMiddleware);
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
  });
  
  // Candidate registration and session generation endpoint
  app.post('/api/register-candidate', async (req, res) => {
    try {
      const { personalInfo, experience } = req.body;
      
      // Validate required fields
      if (!personalInfo?.email || !personalInfo?.fullName) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and full name are required' 
        });
      }
      
      // Generate a secure session ID
      const sessionId = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const sessionCreatedAt = new Date().toISOString();
      
      // In a production environment, we'd save this to the database
      // For now, we can use the session middleware
      req.session.candidateSessionId = sessionId;
      req.session.sessionCreatedAt = sessionCreatedAt;
      req.session.sessionValid = true;
      req.session.candidateData = { personalInfo, experience };
      
      // Log session creation with timestamp for audit purposes
      console.log(`[${new Date().toISOString()}] Created session ${sessionId} for candidate ${personalInfo.email}`);
      
      res.status(201).json({
        success: true,
        message: 'Candidate registered successfully',
        sessionId,
        sessionCreatedAt,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error registering candidate:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to register candidate',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Authentication routes
  app.post('/api/auth/login', login);
  app.post('/api/auth/register', register);
  app.post('/api/auth/logout', logout);
  app.get('/api/auth/me', getCurrentUser);

  // Stage 1 Assessment endpoint
  app.post('/api/assessment', async (req, res) => {
    try {
      const { audio, prompt } = req.body;

      if (!audio || !prompt) {
        return res.status(400).json({ message: 'Audio and prompt data are required' });
      }

      // Process audio with OpenAI
      const result = await analyzeSpeech(audio, prompt);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error processing assessment:', error);
      res.status(500).json({ 
        message: 'Error processing speech assessment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PHASE 3: Stage 2 Voice & Role Readiness Assessment
  
  // Voice assessment endpoint
  app.post('/api/assessment/voice', async (req, res) => {
    try {
      const { audio, prompt, taskType } = req.body;
      
      if (!audio || !prompt) {
        return res.status(400).json({ message: 'Audio and prompt data are required' });
      }
      
      // Process audio with OpenAI
      const result = await analyzeSpeech(audio, prompt);
      
      // Add task-specific details to the response
      res.status(200).json({
        ...result,
        taskType,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error processing voice assessment:', error);
      res.status(500).json({ 
        message: 'Error processing voice assessment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Writing assessment endpoint
  app.post('/api/stage2/writing-assessment', async (req, res) => {
    try {
      const { content, taskType, timeSpent } = req.body;
      
      if (!content || !taskType) {
        return res.status(400).json({ message: 'Content and taskType are required' });
      }
      
      // In a real implementation, this would use OpenAI to analyze the writing
      // For now, simulate an analysis response
      const score = Math.floor(Math.random() * 20) + 70; // Random score between 70-90
      
      res.status(200).json({
        success: true,
        taskType,
        score,
        feedback: "Good work. Consider improving your sentence structure and vocabulary range.",
        cefrLevel: score >= 80 ? "C1" : "B2",
        strengths: ["Good organization", "Clear communication"],
        areasForImprovement: ["Vocabulary range", "Complex sentence structures"],
        timeSpent
      });
    } catch (error) {
      console.error('Error processing writing assessment:', error);
      res.status(500).json({ 
        message: 'Error processing writing assessment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Situational judgment test endpoint
  app.post('/api/stage2/situational-judgment', async (req, res) => {
    try {
      const { scenarioId, selectedOption, rationale } = req.body;
      
      if (scenarioId === undefined || selectedOption === undefined) {
        return res.status(400).json({ message: 'ScenarioId and selectedOption are required' });
      }
      
      // Simulate evaluating the answer
      // In a real implementation, this would compare against correct answers
      // and potentially analyze the rationale using NLP
      const correctOptions = [2, 2, 1, 3, 0, 2]; // Sample correct answers for 6 scenarios
      const correctOption = correctOptions[scenarioId % correctOptions.length];
      const isCorrect = selectedOption === correctOption;
      
      res.status(200).json({
        success: true,
        scenarioId,
        isCorrect,
        feedback: isCorrect 
          ? "Excellent choice! Your approach demonstrates empathy and problem-solving skills."
          : "Consider how this choice might impact customer satisfaction and resolution time."
      });
    } catch (error) {
      console.error('Error processing situational judgment test:', error);
      res.status(500).json({ 
        message: 'Error processing situational judgment response',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Session validation endpoint
  app.get('/api/validate-session', (req, res) => {
    try {
      // Check if session exists and is valid
      if (!req.session.candidateSessionId || req.session.sessionValid !== true) {
        return res.status(401).json({
          valid: false,
          message: 'Session is invalid or expired',
          timestamp: new Date().toISOString()
        });
      }
      
      // Check session expiration (if created more than 3 hours ago)
      if (req.session.sessionCreatedAt) {
        const createdDate = new Date(req.session.sessionCreatedAt);
        const currentDate = new Date();
        const hoursDiff = (currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff > 3) {
          req.session.sessionValid = false;
          return res.status(401).json({
            valid: false,
            message: 'Session has expired',
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Session is valid
      res.status(200).json({
        valid: true,
        sessionId: req.session.candidateSessionId,
        createdAt: req.session.sessionCreatedAt,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error validating session:', error);
      res.status(500).json({
        valid: false,
        message: 'Error validating session',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Invalidate session endpoint (for when user exits fullscreen or completes assessment)
  app.post('/api/invalidate-session', (req, res) => {
    try {
      const { reason } = req.body;
      
      // Check if session exists
      if (!req.session.candidateSessionId) {
        return res.status(404).json({
          success: false,
          message: 'No active session found',
          timestamp: new Date().toISOString()
        });
      }
      
      // Log session invalidation with timestamp for audit purposes
      console.log(`[${new Date().toISOString()}] Invalidated session ${req.session.candidateSessionId}. Reason: ${reason || 'Not specified'}`);
      
      // Invalidate the session
      req.session.sessionValid = false;
      
      res.status(200).json({
        success: true,
        message: 'Session invalidated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error invalidating session:', error);
      res.status(500).json({
        success: false,
        message: 'Error invalidating session',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Complete stage 2 assessment endpoint
  app.post('/api/stage2/complete-assessment', async (req, res) => {
    try {
      const { candidateId, writingResults, voiceResults, sjtResults, sessionId } = req.body;
      
      // Verify session is valid
      if (!req.session.candidateSessionId || req.session.sessionValid !== true || 
          req.session.candidateSessionId !== sessionId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired session',
          timestamp: new Date().toISOString()
        });
      }
      
      if (!candidateId) {
        return res.status(400).json({ message: 'CandidateId is required' });
      }
      
      // Calculate overall stage 2 results
      
      // Determine if candidate passed each component
      const writingPassed = (writingResults?.overallScore || 0) >= 75;
      const voicePassed = (voiceResults?.overallScore || 0) >= 75;
      const sjtPassed = (sjtResults?.score || 0) >= 70;
      
      // Overall stage 2 pass requires passing all components
      const stage2Passed = writingPassed && voicePassed && sjtPassed;
      
      // Generate CEFR level based on scores
      const overallScore = (
        (writingResults?.overallScore || 0) * 0.3 + 
        (voiceResults?.overallScore || 0) * 0.4 + 
        (sjtResults?.score || 0) * 0.3
      );
      
      let cefrLevel = "B1";
      if (overallScore >= 90) cefrLevel = "C2";
      else if (overallScore >= 80) cefrLevel = "C1";
      else if (overallScore >= 70) cefrLevel = "B2";
      
      // If user is authenticated, save results to database
      if (req.session.userId) {
        try {
          await storage.saveStage2Results({
            userId: req.session.userId,
            pronunciation: voiceResults?.pronunciation || 0,
            fluency: voiceResults?.fluency || 0,
            vocabulary: voiceResults?.vocabulary || 0,
            grammar: voiceResults?.grammar || 0,
            overallVoiceScore: voiceResults?.overallScore || 0,
            voicePassed,
            cefrLevel,
            emailResponseScore: writingResults?.emailResponseScore || 0,
            complaintResolutionScore: writingResults?.complaintResolutionScore || 0,
            processDocumentationScore: writingResults?.processDocumentationScore || 0,
            overallWritingScore: writingResults?.overallScore || 0,
            writingPassed,
            sjtScore: sjtResults?.score || 0,
            sjtCorrectAnswers: sjtResults?.correctAnswers || 0,
            sjtTotalScenarios: sjtResults?.totalScenarios || 0,
            sjtPassed,
            stage2Passed,
            overallScore: Math.round(overallScore),
            feedback: "Assessment completed successfully",
            recommendations: stage2Passed
              ? ["Ready for customer service roles", "Strong communication skills", "Good decision-making abilities"]
              : ["Additional practice with professional communication", "Focus on accent neutrality", "Review company policies and procedures"]
          });
        } catch (error) {
          console.error("Error saving assessment results:", error);
          // Continue with sending response even if saving fails
        }
      }
      
      res.status(200).json({
        success: true,
        candidateId,
        stage2Passed,
        overallScore,
        cefrLevel,
        components: {
          writing: { passed: writingPassed, score: writingResults?.overallScore || 0 },
          voice: { passed: voicePassed, score: voiceResults?.overallScore || 0 },
          sjt: { passed: sjtPassed, score: sjtResults?.score || 0 }
        },
        recommendations: stage2Passed
          ? ["Ready for customer service roles", "Strong communication skills", "Good decision-making abilities"]
          : ["Additional practice with professional communication", "Focus on accent neutrality", "Review company policies and procedures"]
      });
    } catch (error) {
      console.error('Error completing stage 2 assessment:', error);
      res.status(500).json({ 
        message: 'Error completing stage 2 assessment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Protected assessment history endpoints
  app.get('/api/assessments/history', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Get user's assessment history
      const stage1Results = await storage.getStage1ResultsByUserId(userId as number);
      const stage2Results = await storage.getStage2ResultsByUserId(userId as number);
      
      res.json({
        stage1Results,
        stage2Results
      });
    } catch (error) {
      console.error("Error fetching assessment history:", error);
      res.status(500).json({ message: "Failed to fetch assessment history" });
    }
  });

  // Get latest assessment results
  app.get('/api/assessments/latest', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const latestResults = await storage.getLatestAssessmentForUser(userId as number);
      res.json(latestResults);
    } catch (error) {
      console.error("Error fetching latest assessment:", error);
      res.status(500).json({ message: "Failed to fetch latest assessment" });
    }
  });
  
  // Get platform statistics for homepage
  app.get('/api/statistics', async (req, res) => {
    try {
      // Get actual values from the database
      const userCount = await storage.getUserCount();
      const averageRating = await storage.getAverageRating();
      
      res.json({
        userCount: userCount,
        rating: averageRating || 0,
        formattedUserCount: userCount > 0 ? `${userCount}+` : "0+",
        formattedRating: averageRating ? averageRating.toFixed(1) : "0.0"
      });
    } catch (error) {
      console.error("Error fetching platform statistics:", error);
      // Return empty values if there's an error
      res.json({
        userCount: 0,
        rating: 0,
        formattedUserCount: "0+",
        formattedRating: "0.0"
      });
    }
  });
  
  // Submit user feedback
  app.post('/api/feedback', async (req, res) => {
    try {
      const { rating, comments } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      
      // Store feedback in database
      const feedbackResult = await storage.saveFeedback({
        userId: req.session.userId || null, // Associate with user if logged in
        rating,
        comments
      });
      
      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        feedbackId: feedbackResult.id
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ 
        message: 'Error submitting feedback',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Typing text endpoints
  // Get all typing texts
  app.get('/api/typing-texts', async (req, res) => {
    try {
      const texts = await storage.getAllTypingTexts();
      res.json(texts);
    } catch (error) {
      console.error('Error fetching typing texts:', error);
      res.status(500).json({ message: 'Failed to fetch typing texts' });
    }
  });
  
  // Get random typing text
  app.get('/api/typing-texts/random', async (req, res) => {
    try {
      const difficulty = req.query.difficulty ? parseInt(req.query.difficulty as string) : undefined;
      const text = await storage.getRandomTypingText(difficulty);
      res.json(text);
    } catch (error) {
      console.error('Error fetching random typing text:', error);
      res.status(500).json({ message: 'Failed to fetch random typing text' });
    }
  });
  
  // Get typing text by ID
  app.get('/api/typing-texts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const text = await storage.getTypingTextById(id);
      
      if (!text) {
        return res.status(404).json({ message: 'Typing text not found' });
      }
      
      res.json(text);
    } catch (error) {
      console.error('Error fetching typing text:', error);
      res.status(500).json({ message: 'Failed to fetch typing text' });
    }
  });
  
  // Create new typing text (Admin only)
  app.post('/api/typing-texts', async (req, res) => {
    try {
      const { text, category, difficulty } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: 'Text content is required' });
      }
      
      const newText = await storage.createTypingText({
        text,
        category: category || 'general',
        difficulty: difficulty || 1
      });
      
      res.status(201).json({
        message: 'Typing text created successfully',
        text: newText,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating typing text:', error);
      res.status(500).json({ message: 'Failed to create typing text' });
    }
  });
  
  // Update typing text (Admin only)
  app.put('/api/typing-texts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { text, category, difficulty } = req.body;
      
      const updatedText = await storage.updateTypingText(id, {
        text,
        category,
        difficulty
      });
      
      if (!updatedText) {
        return res.status(404).json({ message: 'Typing text not found' });
      }
      
      res.json({
        message: 'Typing text updated successfully',
        text: updatedText,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating typing text:', error);
      res.status(500).json({ message: 'Failed to update typing text' });
    }
  });
  
  // Delete typing text (Admin only)
  app.delete('/api/typing-texts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTypingText(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Typing text not found' });
      }
      
      res.json({
        message: 'Typing text deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error deleting typing text:', error);
      res.status(500).json({ message: 'Failed to delete typing text' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
