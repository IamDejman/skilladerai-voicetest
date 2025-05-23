import { pgTable, text, serial, integer, boolean, timestamp, varchar, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define text length limits
const MAX_TEXT_LENGTH = 2000;

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  nativeLanguage: text("native_language"),
  phone: text("phone"),
  location: text("location"),
  profileImageUrl: text("profile_image_url"),
  customerServiceYears: text("customer_service_years"),
  previousCallCenter: boolean("previous_call_center"),
  englishProficiency: text("english_proficiency"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
);

// Stage 1 assessment results
export const stage1Results = pgTable("stage1_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  typingWpm: integer("typing_wpm"),
  typingAccuracy: integer("typing_accuracy"),
  typingConsistency: integer("typing_consistency"),
  typingPassed: boolean("typing_passed"),
  readingScore: integer("reading_score"),
  readingCorrectAnswers: integer("reading_correct_answers"),
  readingTotalQuestions: integer("reading_total_questions"),
  readingPassed: boolean("reading_passed"),
  grammarScore: integer("grammar_score"),
  writingScore: integer("writing_score"),
  grammarPassed: boolean("grammar_passed"),
  stage1Passed: boolean("stage1_passed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Stage 2 assessment results
export const stage2Results = pgTable("stage2_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  // Voice assessment
  pronunciation: integer("pronunciation"),
  fluency: integer("fluency"),
  vocabulary: integer("vocabulary"),
  grammar: integer("grammar"),
  overallVoiceScore: integer("overall_voice_score"),
  voicePassed: boolean("voice_passed"),
  cefrLevel: text("cefr_level"),
  
  // Writing assessment
  emailResponseScore: integer("email_response_score"),
  complaintResolutionScore: integer("complaint_resolution_score"),
  processDocumentationScore: integer("process_documentation_score"),
  overallWritingScore: integer("overall_writing_score"),
  writingPassed: boolean("writing_passed"),
  
  // Situational judgment
  sjtScore: integer("sjt_score"),
  sjtCorrectAnswers: integer("sjt_correct_answers"),
  sjtTotalScenarios: integer("sjt_total_scenarios"),
  sjtPassed: boolean("sjt_passed"),
  
  // Overall
  stage2Passed: boolean("stage2_passed"),
  overallScore: integer("overall_score"),
  feedback: text("feedback"),
  recommendations: text("recommendations").array(),
  audioUrl: text("audio_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User feedback about the platform
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  rating: integer("rating").notNull(),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas for form validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

export const registerUserSchema = insertUserSchema.pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
}).extend({
  confirmPassword: z.string().min(6).max(100),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertStage1ResultSchema = createInsertSchema(stage1Results).omit({
  id: true,
  createdAt: true,
});

export const insertStage2ResultSchema = createInsertSchema(stage2Results).omit({
  id: true,
  createdAt: true,
});

// Create feedback schema
export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

// Typing test texts table
export const typingTexts = pgTable("typing_texts", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  category: varchar("category", { length: 50 }).notNull().default("general"),
  difficulty: integer("difficulty").notNull().default(1), // 1-easy, 2-medium, 3-hard
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertTypingTextSchema = createInsertSchema(typingTexts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Types for frontend and backend use
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export type InsertStage1Result = z.infer<typeof insertStage1ResultSchema>;
export type Stage1Result = typeof stage1Results.$inferSelect;

export type InsertStage2Result = z.infer<typeof insertStage2ResultSchema>;
export type Stage2Result = typeof stage2Results.$inferSelect;

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

export type InsertTypingText = z.infer<typeof insertTypingTextSchema>;
export type TypingText = typeof typingTexts.$inferSelect;
