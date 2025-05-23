# SpeakSmart AI: English Speech Assessment Platform

## Overview

SpeakSmart AI is a web-based platform that provides AI-powered assessment of spoken English, evaluating accent neutrality and CEFR proficiency levels. The application allows users to record their speech, receive instant feedback, and track their progress over time.

The application follows a modern web architecture with a React frontend and Express backend. It uses Drizzle ORM with PostgreSQL for data persistence and integrates with OpenAI for speech analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: React Query for server state
- **UI Components**: Custom components built with shadcn/ui (based on Radix UI primitives)
- **Styling**: Tailwind CSS with custom theming

### Backend
- **Framework**: Express.js with TypeScript
- **API**: RESTful endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API using GPT-4o and Whisper models

### Data Flow
1. User records audio on the frontend
2. Audio is sent to the backend as base64-encoded data
3. Backend sends audio to OpenAI Whisper API for transcription
4. Transcription is analyzed by OpenAI GPT-4o for language assessment
5. Results are returned to the frontend and displayed to the user
6. Results can optionally be saved to the database for historical tracking

## Key Components

### Frontend Components
- **Pages**:
  - Home: Landing page with product information
  - Quiz: User registration/information collection
  - Assessment: Audio recording and submission
  - Results: Detailed feedback display
- **UI Components**: 
  - Navbar: Site navigation
  - Footer: Site information
  - AudioRecorder: Speech recording functionality
  - Various shadcn/ui components (cards, buttons, toast notifications, etc.)

### Backend Components
- **API Routes**:
  - `/api/health`: Server health check
  - `/api/assessment`: Process and analyze speech recordings
- **Services**:
  - OpenAI integration for speech transcription and analysis
- **Data Storage**:
  - User information
  - Assessment results

### Database Schema
The application uses Drizzle ORM with a PostgreSQL database defined by the following schema:
- Users: Stores user information (username, email, password, native language)
- AssessmentResults: Stores assessment data (scores, feedback, audio references)

## External Dependencies

### Frontend Dependencies
- React and React DOM for UI rendering
- Wouter for client-side routing
- React Query for data fetching
- Radix UI primitives for accessible components
- Tailwind CSS for styling
- date-fns for date formatting
- clsx and class-variance-authority for conditional styling

### Backend Dependencies
- Express for the web server
- OpenAI SDK for AI model interactions
- Drizzle ORM for database operations
- zod for schema validation

### External Services
- OpenAI API:
  - Whisper model for speech-to-text transcription
  - GPT-4o for language proficiency assessment

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:
- Development environment: `npm run dev` runs both frontend and backend
- Production build: `npm run build` compiles both frontend and backend
- Production start: `npm run start` runs the compiled application

The frontend assets are built with Vite and served statically by the Express server. The application uses environment variables for configuration, including database connection and API keys.

## Getting Started

1. Ensure PostgreSQL is provisioned and running
2. Set the required environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
3. Install dependencies: `npm install`
4. Run database migrations: `npm run db:push`
5. Start the development server: `npm run dev`
6. Access the application at http://localhost:5000

## Future Improvements

- Implement user authentication and session management
- Add user dashboard for tracking progress over time
- Expand assessment capabilities with more detailed feedback
- Add support for multiple languages
- Implement speech playback and review features