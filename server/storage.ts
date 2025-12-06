import {
  type User,
  type UpsertUser,
  type Announcement,
  type InsertAnnouncement,
} from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "db.json");

interface Database {
  announcements: Announcement[];
  users: User[];
}

// Helper to read database
async function readDatabase(): Promise<Database> {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return { announcements: [], users: [] };
  }
}

// Helper to write database
async function writeDatabase(db: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  getUsersByField(field: string, value: string): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Announcement operations
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<boolean>;
}

export class JsonStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const db = await readDatabase();
    return db.users.find((user) => user.id === id);
  }

  async getUsersByField(field: string, value: string): Promise<User[]> {
    const db = await readDatabase();
    return db.users.filter((user) => (user as any)[field] === value);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const db = await readDatabase();
    const existingIndex = db.users.findIndex((user) => user.id === userData.id);

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing user - preserve createdAt, only update other fields
      const user: User = {
        ...db.users[existingIndex],
        ...userData,
        updatedAt: now,
      };
      db.users[existingIndex] = user;
      await writeDatabase(db);
      return user;
    } else {
      // Create new user
      const user: User = {
        ...userData,
        createdAt: now,
        updatedAt: now,
      };
      db.users.push(user);
      await writeDatabase(db);
      return user;
    }
  }

  // Announcement operations
  async getAnnouncements(): Promise<Announcement[]> {
    const db = await readDatabase();
    return db.announcements.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const db = await readDatabase();
    return db.announcements.find((a) => a.id === id);
  }

  async createAnnouncement(
    announcementData: InsertAnnouncement
  ): Promise<Announcement> {
    const db = await readDatabase();
    const announcement: Announcement = {
      ...announcementData,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.announcements.push(announcement);
    await writeDatabase(db);
    return announcement;
  }

  async updateAnnouncement(
    id: string,
    announcementData: Partial<InsertAnnouncement>
  ): Promise<Announcement | undefined> {
    const db = await readDatabase();
    const index = db.announcements.findIndex((a) => a.id === id);

    if (index < 0) {
      return undefined;
    }

    // Preserve existing fields and only update provided ones
    const updated: Announcement = {
      ...db.announcements[index],
      ...announcementData,
      id: db.announcements[index].id, // Ensure ID is not overwritten
      createdAt: db.announcements[index].createdAt, // Preserve createdAt
      updatedAt: new Date().toISOString(),
    };

    db.announcements[index] = updated;
    await writeDatabase(db);
    return updated;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    const db = await readDatabase();
    const initialLength = db.announcements.length;
    db.announcements = db.announcements.filter((a) => a.id !== id);

    if (db.announcements.length < initialLength) {
      await writeDatabase(db);
      return true;
    }

    return false;
  }
}

export const storage = new JsonStorage();
