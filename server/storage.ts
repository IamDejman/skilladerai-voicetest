import { 
  users, 
  stage1Results,
  stage2Results,
  feedback,
  typingTexts,
  type User, 
  type InsertUser,
  type Stage1Result,
  type InsertStage1Result,
  type Stage2Result,
  type InsertStage2Result,
  type InsertFeedback,
  type Feedback,
  type InsertTypingText,
  type TypingText
} from "@shared/schema";
import { db } from "./db";
import { eq, count, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(hashedPassword: string, plainPassword: string): Promise<boolean>;
  getUserCount(): Promise<number>;
  
  // Assessment results
  saveStage1Results(results: InsertStage1Result): Promise<Stage1Result>;
  getStage1ResultsByUserId(userId: number): Promise<Stage1Result[]>;
  
  saveStage2Results(results: InsertStage2Result): Promise<Stage2Result>;
  getStage2ResultsByUserId(userId: number): Promise<Stage2Result[]>;
  
  getLatestAssessmentForUser(userId: number): Promise<{ stage1?: Stage1Result, stage2?: Stage2Result }>;
  
  // User feedback
  saveFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getAverageRating(): Promise<number | null>;
  
  // Typing text management
  getAllTypingTexts(): Promise<TypingText[]>;
  getTypingTextById(id: number): Promise<TypingText | undefined>;
  getRandomTypingText(difficulty?: number): Promise<TypingText | undefined>;
  createTypingText(typingText: InsertTypingText): Promise<TypingText>;
  updateTypingText(id: number, typingText: Partial<InsertTypingText>): Promise<TypingText | undefined>;
  deleteTypingText(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    // Create user with hashed password
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
      updatedAt: new Date()
    }).returning();
    
    return user;
  }
  
  async verifyPassword(hashedPassword: string, plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  // Assessment results
  async saveStage1Results(results: InsertStage1Result): Promise<Stage1Result> {
    const [savedResults] = await db.insert(stage1Results)
      .values(results)
      .returning();
      
    return savedResults;
  }
  
  async getStage1ResultsByUserId(userId: number): Promise<Stage1Result[]> {
    return db.select()
      .from(stage1Results)
      .where(eq(stage1Results.userId, userId))
      .orderBy(stage1Results.createdAt);
  }
  
  async saveStage2Results(results: InsertStage2Result): Promise<Stage2Result> {
    const [savedResults] = await db.insert(stage2Results)
      .values(results)
      .returning();
      
    return savedResults;
  }
  
  async getStage2ResultsByUserId(userId: number): Promise<Stage2Result[]> {
    return db.select()
      .from(stage2Results)
      .where(eq(stage2Results.userId, userId))
      .orderBy(stage2Results.createdAt);
  }
  
  async getLatestAssessmentForUser(userId: number): Promise<{ stage1?: Stage1Result, stage2?: Stage2Result }> {
    const [latestStage1] = await db.select()
      .from(stage1Results)
      .where(eq(stage1Results.userId, userId))
      .orderBy(stage1Results.createdAt, 'desc')
      .limit(1);
      
    const [latestStage2] = await db.select()
      .from(stage2Results)
      .where(eq(stage2Results.userId, userId))
      .orderBy(stage2Results.createdAt, 'desc')
      .limit(1);
      
    return {
      stage1: latestStage1,
      stage2: latestStage2
    };
  }
  
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0].count || 0;
  }
  
  // User feedback methods
  async saveFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    try {
      const [result] = await db.insert(feedback)
        .values(feedbackData)
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error saving feedback:", error);
      throw error;
    }
  }
  
  async getAverageRating(): Promise<number | null> {
    try {
      const result = await db.select({
        averageRating: sql`AVG(${feedback.rating})::float`
      }).from(feedback);
      
      return result[0].averageRating || null;
    } catch (error) {
      console.error("Error getting average rating:", error);
      return null;
    }
  }
  
  // Typing text management methods
  async getAllTypingTexts(): Promise<TypingText[]> {
    try {
      return await db.select().from(typingTexts).orderBy(typingTexts.createdAt);
    } catch (error) {
      console.error("Error getting typing texts:", error);
      return [];
    }
  }

  async getTypingTextById(id: number): Promise<TypingText | undefined> {
    try {
      const [result] = await db.select().from(typingTexts).where(eq(typingTexts.id, id));
      return result;
    } catch (error) {
      console.error(`Error getting typing text with id ${id}:`, error);
      return undefined;
    }
  }

  async getRandomTypingText(difficulty?: number): Promise<TypingText | undefined> {
    try {
      let query = db.select().from(typingTexts);
      
      if (difficulty !== undefined && !isNaN(difficulty)) {
        query = query.where(eq(typingTexts.difficulty, difficulty));
      }
      
      const texts = await query;
      
      if (texts.length === 0) {
        // If no texts are found, return default text
        return {
          id: 0,
          text: "Customer service is about helping people and solving problems with empathy and professionalism. When assisting customers, it's important to listen carefully, acknowledge their concerns, and provide clear solutions. Every interaction should aim to exceed expectations and leave a positive impression.",
          category: "general",
          difficulty: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      // Select random text
      const randomIndex = Math.floor(Math.random() * texts.length);
      return texts[randomIndex];
    } catch (error) {
      console.error("Error getting random typing text:", error);
      // Return default text in case of error
      return {
        id: 0,
        text: "Customer service is about helping people and solving problems with empathy and professionalism. When assisting customers, it's important to listen carefully, acknowledge their concerns, and provide clear solutions. Every interaction should aim to exceed expectations and leave a positive impression.",
        category: "general",
        difficulty: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  async createTypingText(typingText: InsertTypingText): Promise<TypingText> {
    try {
      const [result] = await db.insert(typingTexts).values({
        ...typingText,
        updatedAt: new Date()
      }).returning();
      
      return result;
    } catch (error) {
      console.error("Error creating typing text:", error);
      throw error;
    }
  }

  async updateTypingText(id: number, typingText: Partial<InsertTypingText>): Promise<TypingText | undefined> {
    try {
      const [result] = await db.update(typingTexts)
        .set({
          ...typingText,
          updatedAt: new Date()
        })
        .where(eq(typingTexts.id, id))
        .returning();
      
      return result;
    } catch (error) {
      console.error(`Error updating typing text with id ${id}:`, error);
      return undefined;
    }
  }

  async deleteTypingText(id: number): Promise<boolean> {
    try {
      const result = await db.delete(typingTexts).where(eq(typingTexts.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error deleting typing text with id ${id}:`, error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
