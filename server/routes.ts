import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import OpenAI from "openai";

// OpenAI setup for AI summarization (optional - only if API key is provided)
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Configure multer for image uploads
const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Serve uploaded images
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  }, express.static(uploadDir));

  // Auth routes - public endpoint that returns user if authenticated, null otherwise
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json(null);
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all announcements (public route)
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Get single announcement (public route)
  app.get("/api/announcements/:id", async (req, res) => {
    try {
      const announcement = await storage.getAnnouncement(req.params.id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      res.json(announcement);
    } catch (error) {
      console.error("Error fetching announcement:", error);
      res.status(500).json({ message: "Failed to fetch announcement" });
    }
  });

  // Create announcement (protected route)
  app.post(
    "/api/announcements",
    isAuthenticated,
    upload.single("image"),
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const { title, content, category } = req.body;

        // Validate required fields
        if (!title || !title.trim()) {
          return res.status(400).json({ message: "Title is required" });
        }
        if (!content || !content.trim()) {
          return res.status(400).json({ message: "Content is required" });
        }
        if (!category || !["Academic", "Events", "General"].includes(category)) {
          return res.status(400).json({ message: "Valid category is required" });
        }

        const authorName = user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.email || "Admin";

        let imageUrl: string | undefined;
        if (req.file) {
          imageUrl = `/uploads/${req.file.filename}`;
        }

        // Generate AI summary if content is long enough and OpenAI is available
        let summary: string | undefined;
        if (openai && content.length > 200) {
          try {
            const response = await openai.chat.completions.create({
              model: "gpt-5",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant that summarizes announcements into concise key points. Keep summaries under 150 characters and focus on the most important information.",
                },
                {
                  role: "user",
                  content: `Summarize this announcement: ${content}`,
                },
              ],
            });

            summary = response.choices[0].message.content || undefined;
          } catch (error) {
            console.error("Error generating summary:", error);
            // Continue without summary if AI fails
          }
        }

        const announcement = await storage.createAnnouncement({
          title,
          content,
          summary,
          category,
          imageUrl,
          authorId: userId,
          authorName,
        });

        res.status(201).json(announcement);
      } catch (error: any) {
        console.error("Error creating announcement:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to create announcement" });
      }
    }
  );

  // Update announcement (protected route)
  app.put(
    "/api/announcements/:id",
    isAuthenticated,
    upload.single("image"),
    async (req: any, res) => {
      try {
        const { title, content, category } = req.body;

        const updateData: any = {};

        if (title) updateData.title = title;
        if (content) updateData.content = content;
        if (category) updateData.category = category;

        if (req.file) {
          updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Regenerate AI summary if content is updated and long enough and OpenAI is available
        if (openai && content && content.length > 200) {
          try {
            const response = await openai.chat.completions.create({
              model: "gpt-5",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant that summarizes announcements into concise key points. Keep summaries under 150 characters and focus on the most important information.",
                },
                {
                  role: "user",
                  content: `Summarize this announcement: ${content}`,
                },
              ],
            });

            updateData.summary = response.choices[0].message.content || undefined;
          } catch (error) {
            console.error("Error generating summary:", error);
          }
        }

        const announcement = await storage.updateAnnouncement(
          req.params.id,
          updateData
        );

        if (!announcement) {
          return res.status(404).json({ message: "Announcement not found" });
        }

        res.json(announcement);
      } catch (error: any) {
        console.error("Error updating announcement:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to update announcement" });
      }
    }
  );

  // Delete announcement (protected route)
  app.delete("/api/announcements/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteAnnouncement(req.params.id);

      if (!deleted) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // AI Summarization endpoint (protected route)
  app.post("/api/summarize", isAuthenticated, async (req, res) => {
    try {
      if (!openai) {
        return res.json({
          summary: null,
          message: "AI summarization is not available. Please add your announcement content manually.",
        });
      }

      const { text } = req.body;

      if (!text || text.length < 50) {
        return res.status(400).json({
          message: "Text must be at least 50 characters long",
        });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes announcements into concise key points. Keep summaries under 150 characters and focus on the most important information.",
          },
          {
            role: "user",
            content: `Summarize this announcement: ${text}`,
          },
        ],
      });

      const summary = response.choices[0].message.content;

      res.json({ summary });
    } catch (error: any) {
      console.error("Error generating summary:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to generate summary" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
