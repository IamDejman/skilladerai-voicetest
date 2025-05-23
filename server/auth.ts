import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { loginUserSchema, registerUserSchema } from "../shared/schema";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";

// Database connection for session store
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const PgSession = connectPgSimple(session);

export const sessionMiddleware = session({
  store: new PgSession({
    pool,
    tableName: "sessions",
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || "skilladder-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  },
});

// Check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Login handler
export const login = async (req: Request, res: Response) => {
  try {
    // Validate login input
    const result = loginUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: result.error.format() 
      });
    }
    
    const { username, password } = result.data;
    
    // Find user by username
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Verify password
    const isValidPassword = await storage.verifyPassword(user.password, password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Set user session
    req.session.userId = user.id as any;
    
    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Register handler
export const register = async (req: Request, res: Response) => {
  try {
    // Validate registration input
    const result = registerUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: result.error.format() 
      });
    }
    
    const { username, email, password, fullName, confirmPassword: _ } = result.data;
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    
    // Create new user
    const newUser = await storage.createUser({
      username,
      email,
      password,
      fullName,
    });
    
    // Set user session
    req.session.userId = newUser.id;
    
    // Return user info (excluding password)
    const { password: __, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      message: "Registration successful",
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Logout handler
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logout successful" });
  });
};

// Get current user handler
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
    
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};