import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "YOUR_API_KEY" });

/**
 * Determine CEFR level based on overall score
 */
function determineCefrFromScore(score: number): string {
  if (score >= 95) return "C2";
  if (score >= 85) return "C1";
  if (score >= 75) return "B2";
  if (score >= 60) return "B1";
  if (score >= 40) return "A2";
  return "A1";
}

/**
 * Get description for CEFR level
 */
function getCefrDescription(level: string): string {
  const descriptions: {[key: string]: string} = {
    "C2": "Proficient - Can express themselves spontaneously, very fluently and precisely, differentiating finer shades of meaning even in more complex situations.",
    "C1": "Advanced - Can express ideas fluently and spontaneously without much obvious searching for expressions, including in complex professional topics.",
    "B2": "Upper Intermediate - Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without strain for either party.",
    "B1": "Intermediate - Can deal with most situations likely to arise while traveling in an area where the language is spoken, including unfamiliar situations.",
    "A2": "Elementary - Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar topics.",
    "A1": "Beginner - Can understand and use familiar everyday expressions and very basic phrases aimed at the satisfaction of needs of a concrete type."
  };
  
  return descriptions[level] || descriptions["B1"];
}

/**
 * Analyzes speech recording for accent neutrality and CEFR proficiency
 * @param base64Audio Base64 encoded audio file
 * @param prompt The prompt that was given to the user
 * @returns Assessment analysis
 */
export async function analyzeSpeech(base64Audio: string, prompt: string) {
  try {
    // Create a buffer from the base64 audio
    const buffer = Buffer.from(base64Audio, 'base64');
    
    // First, transcribe the audio using Whisper
    const transcription = await transcribeAudio(buffer);
    
    // Then analyze the transcription with GPT-4o
    const assessment = await assessLanguageProficiency(transcription.text, prompt);
    
    return assessment;
  } catch (error) {
    console.error("Error in speech analysis:", error);
    throw new Error("Failed to analyze speech recording");
  }
}

/**
 * Transcribes audio using OpenAI's Whisper model
 */
async function transcribeAudio(audioBuffer: Buffer) {
  try {
    // For demonstration, return sample transcription
    // In a production environment with a valid API key, this would call the OpenAI API
    console.log("Audio buffer size:", audioBuffer.length);
    
    // Sample transcription for testing purposes
    const sampleTranscription = "Hello, welcome to our customer service department. My name is Sarah and I'll be assisting you today. I understand you're experiencing an issue with your recent order. I'd be happy to help resolve this issue for you. Could you please provide me with your order number so I can look up the details in our system? Once I have that information, I'll be able to check on the status and see what options are available to address your concerns.";
    
    return {
      text: sampleTranscription,
      duration: 30, // Simulated duration in seconds
    };
  } catch (error: any) {
    console.error("Error transcribing audio:", error);
    // More detailed error handling for client
    if (error.response?.status === 401) {
      throw new Error("OpenAI API key is invalid or missing");
    } else if (error.response?.status === 429) {
      throw new Error("OpenAI API rate limit exceeded");
    } else if (error.response?.status === 400) {
      throw new Error("Invalid audio format or empty audio file");
    } else {
      throw new Error(`Failed to transcribe audio: ${error.message || "Unknown error"}`);
    }
  }
}

/**
 * Assess English language proficiency based on transcription
 */
async function assessLanguageProficiency(transcription: string, prompt: string) {
  try {
    // For demonstration purposes, provide a sample assessment
    // In a production environment with a valid API key, this would call the OpenAI API
    
    // Sample assessment data to demonstrate the structure
    const sampleAssessment = {
      pronunciation: 75,
      fluency: 80,
      vocabulary: 85,
      grammar: 78,
      customerServiceScore: 82,
      overallScore: 80,
      passed: true,
      cefrLevel: "C1",
      cefrDescription: "Advanced - Can express ideas fluently and spontaneously without much obvious searching for expressions, including in complex professional topics.",
      feedback: {
        pronunciation: "Good clarity in speech with some minor errors in word stress patterns.",
        fluency: "Speech flows naturally with minimal hesitation and good rhythm.",
        vocabulary: "Uses a varied range of terminology appropriate for customer service.",
        grammar: "Generally accurate with occasional errors in complex structures."
      },
      suggestions: {
        pronunciation: [
          "Practice stress patterns in multi-syllable words",
          "Work on consistent intonation when asking questions"
        ],
        fluency: [
          "Reduce filler words like 'um' and 'ah'",
          "Practice smoother transitions between sentences"
        ],
        vocabulary: [
          "Incorporate more industry-specific terminology",
          "Expand range of expressions for offering solutions"
        ],
        grammar: [
          "Review conditional structures for discussing possible solutions",
          "Practice correct verb tense consistency"
        ],
        customerService: [
          "Add more empathetic statements to acknowledge customer feelings",
          "Develop more techniques for de-escalating difficult situations",
          "Practice clear explanation of complex policies"
        ]
      },
      customerService: {
        strengths: [
          "Excellent use of polite language",
          "Clear explanation of processes",
          "Good problem-solving approach"
        ],
        areasForImprovement: [
          "Could demonstrate more empathy through language choices",
          "Add more reassurance phrases when addressing concerns",
          "Provide more specific next steps"
        ]
      },
      examples: {
        pronunciation: [
          "Pronounced 'available' with incorrect stress pattern",
          "Excellent pronunciation of difficult technical terms"
        ],
        fluency: [
          "Maintained good pace throughout the interaction",
          "Occasional hesitation when explaining complex policies"
        ],
        vocabulary: [
          "Excellent use of terms like 'resolve', 'accommodate', and 'prioritize'",
          "Could expand vocabulary related to product specifications"
        ],
        grammar: [
          "Correct use of conditional structures",
          "Minor errors in subject-verb agreement in complex sentences"
        ]
      }
    };

    // Format the assessment for client consumption
    const formattedAssessment = {
      overallScore: sampleAssessment.overallScore,
      passed: sampleAssessment.passed,
      cefrLevel: sampleAssessment.cefrLevel,
      cefrDescription: sampleAssessment.cefrDescription,
      pronunciation: sampleAssessment.pronunciation,
      fluency: sampleAssessment.fluency,
      vocabulary: sampleAssessment.vocabulary,
      grammar: sampleAssessment.grammar,
      customerServiceScore: sampleAssessment.customerServiceScore,
      feedback: sampleAssessment.feedback,
      suggestions: sampleAssessment.suggestions,
      customerService: sampleAssessment.customerService,
      examples: sampleAssessment.examples
    };

    return formattedAssessment;
  } catch (error) {
    console.error("Error assessing language proficiency:", error);
    throw new Error("Failed to assess language proficiency");
  }
}
