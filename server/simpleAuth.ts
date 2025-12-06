import express, { type Express, type RequestHandler } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import type { User } from "@shared/schema";
import { storage } from "./storage";
import memoryStore from "memorystore";

const MemoryStore = memoryStore(session);

// Default admin credentials (these will be configurable)
const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password123";
const DEFAULT_ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);

// Initialize admin user in storage if not exists
async function initializeAdminUser() {
  try {
    // Check if admin user already exists
    const existingUsers = await storage.getUsersByField("email", "admin@example.com");
    if (existingUsers.length === 0) {
      // Create default admin user
      await storage.upsertUser({
        id: "admin",
        email: "admin@example.com",
        firstName: "Admin",
        lastName: "",
        profileImageUrl: "",
      });
    }
  } catch (error) {
    console.error("Error initializing admin user:", error);
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const sessionStore = new MemoryStore({
    checkPeriod: sessionTtl,
  });

  return session({
    secret: process.env.SESSION_SECRET || "default-session-secret-change-me",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to false in development to avoid HTTPS requirement
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  
  // Initialize admin user
  await initializeAdminUser();

  // Initialize session with empty user if not authenticated
  app.use((req, res, next) => {
    if (!req.session.user && !req.session.loginAttempted) {
      req.session.user = null;
    }
    next();
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Check against default admin credentials
    const passwordMatch = bcrypt.compareSync(password, DEFAULT_ADMIN_PASSWORD_HASH);
    const isValid = username === DEFAULT_ADMIN_USERNAME && passwordMatch;

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Get admin user from storage
    const user = await storage.getUser("admin");
    if (!user) {
      return res.status(500).json({ message: "Admin user not found" });
    }

    // Set session user
    req.session.user = user;
    req.session.loginAttempted = true;

    res.json({ 
      message: "Login successful", 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      }
    });
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user endpoint
  app.get("/api/auth/user", (req, res) => {
    if (req.session.user) {
      res.json(req.session.user);
    } else {
      res.json(null);
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
};