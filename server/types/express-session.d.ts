import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: number;
    
    // Candidate assessment session properties
    candidateSessionId?: string;
    sessionCreatedAt?: string;
    sessionValid?: boolean;
    candidateData?: {
      personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
      };
      experience: {
        customerServiceYears: string;
        previousCallCenter: boolean | null;
        englishProficiency: string;
      };
    };
    exitReason?: string;
    assessmentExited?: boolean;
    completedStages?: string[];
  }
}