// Data models for the Campus Digital Noticeboard
// Using TypeScript interfaces and Zod schemas for JSON Server compatibility

import { z } from "zod";

export type AnnouncementCategory = "Academic" | "Events" | "General";

// Zod validation schemas
export const announcementCategorySchema = z.enum(["Academic", "Events", "General"]);

export const insertAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  content: z.string().min(1, "Content is required"),
  summary: z.string().optional(),
  category: announcementCategorySchema,
  imageUrl: z.string().optional(),
  authorId: z.string(),
  authorName: z.string(),
});

export const announcementSchema = insertAnnouncementSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const upsertUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

export const userSchema = upsertUserSchema.extend({
  createdAt: z.string(),
  updatedAt: z.string(),
});

// TypeScript interfaces (inferred from Zod schemas)
export interface Announcement extends z.infer<typeof announcementSchema> {}
export interface InsertAnnouncement extends z.infer<typeof insertAnnouncementSchema> {}
export interface User extends z.infer<typeof userSchema> {}
export interface UpsertUser extends z.infer<typeof upsertUserSchema> {}

// Category color mapping for glassmorphic design
export const categoryColors = {
  Academic: {
    bg: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-400/30",
    badge: "bg-blue-500/20 text-blue-300 border-blue-400/40",
    glow: "shadow-blue-500/20",
  },
  Events: {
    bg: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-400/30",
    badge: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    glow: "shadow-purple-500/20",
  },
  General: {
    bg: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-400/30",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    glow: "shadow-emerald-500/20",
  },
} as const;
