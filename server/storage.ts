import {
  users,
  moodEntries,
  journalEntries,
  agentMemory,
  agentRecommendations,
  wellnessMetrics,
  type User,
  type InsertUser,
  type MoodEntry,
  type InsertMoodEntry,
  type JournalEntry,
  type InsertJournalEntry,
  type AgentMemory,
  type InsertAgentMemory,
  type AgentRecommendation,
  type InsertAgentRecommendation,
  type WellnessMetrics,
  type InsertWellnessMetrics,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Mood operations
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  getMoodEntries(userId: number, limit?: number): Promise<MoodEntry[]>;

  // Journal operations
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntries(userId: number, limit?: number): Promise<JournalEntry[]>;

  // Agent memory operations
  getAgentMemory(
    userId: number,
    agentName: string,
  ): Promise<AgentMemory | undefined>;
  updateAgentMemory(memory: InsertAgentMemory): Promise<AgentMemory>;

  // Agent recommendations
  createAgentRecommendation(
    rec: InsertAgentRecommendation,
  ): Promise<AgentRecommendation>;
  getActiveRecommendations(
    userId: number,
    agentName?: string,
  ): Promise<AgentRecommendation[]>;
  deactivateRecommendation(id: number): Promise<void>;

  // Wellness metrics
  createWellnessMetrics(
    metrics: InsertWellnessMetrics,
  ): Promise<WellnessMetrics>;
  getWellnessMetrics(userId: number, days?: number): Promise<WellnessMetrics[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private moodEntries: Map<number, MoodEntry>;
  private journalEntries: Map<number, JournalEntry>;
  private agentMemory: Map<string, AgentMemory>;
  private agentRecommendations: Map<number, AgentRecommendation>;
  private wellnessMetrics: Map<number, WellnessMetrics>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.moodEntries = new Map();
    this.journalEntries = new Map();
    this.agentMemory = new Map();
    this.agentRecommendations = new Map();
    this.wellnessMetrics = new Map();
    this.currentId = 1;

    // Create a default user for demo
    this.createUser({ username: "sarah", password: "password" }).then(
      (user) => {
        this.updateUser(user.id, {
          currentMood: "focused",
          streakDays: 7,
        });
      },
    );
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      currentMood: "neutral",
      streakDays: 0,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(
    id: number,
    updates: Partial<User>,
  ): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const id = this.currentId++;
    const moodEntry: MoodEntry = {
      ...entry,
      id,
      timestamp: new Date(),
    };
    this.moodEntries.set(id, moodEntry);

    // Update user's current mood
    await this.updateUser(entry.userId, { currentMood: entry.mood });

    return moodEntry;
  }

  async getMoodEntries(userId: number, limit = 10): Promise<MoodEntry[]> {
    return Array.from(this.moodEntries.values())
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, limit);
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentId++;
    const journalEntry: JournalEntry = {
      id,
      content: entry.content,
      userId: entry.userId,
      prompt: entry.prompt || null,
      timestamp: new Date(),
    };
    this.journalEntries.set(id, journalEntry);
    return journalEntry;
  }

  async getJournalEntries(userId: number, limit = 10): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, limit);
  }

  async getAgentMemory(
    userId: number,
    agentName: string,
  ): Promise<AgentMemory | undefined> {
    const key = `${userId}-${agentName}`;
    return this.agentMemory.get(key);
  }

  async updateAgentMemory(memory: InsertAgentMemory): Promise<AgentMemory> {
    const key = `${memory.userId}-${memory.agentName}`;
    const existing = this.agentMemory.get(key);

    const agentMemoryEntry: AgentMemory = {
      id: existing?.id || this.currentId++,
      ...memory,
      lastUpdated: new Date(),
    };

    this.agentMemory.set(key, agentMemoryEntry);
    return agentMemoryEntry;
  }

  async createAgentRecommendation(
    rec: InsertAgentRecommendation,
  ): Promise<AgentRecommendation> {
    const id = this.currentId++;
    const recommendation: AgentRecommendation = {
      ...rec,
      id,
      isActive: true,
      createdAt: new Date(),
    };
    this.agentRecommendations.set(id, recommendation);
    return recommendation;
  }

  async getActiveRecommendations(
    userId: number,
    agentName?: string,
  ): Promise<AgentRecommendation[]> {
    return Array.from(this.agentRecommendations.values())
      .filter(
        (rec) =>
          rec.userId === userId &&
          rec.isActive &&
          (!agentName || rec.agentName === agentName),
      )
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async deactivateRecommendation(id: number): Promise<void> {
    const rec = this.agentRecommendations.get(id);
    if (rec) {
      this.agentRecommendations.set(id, { ...rec, isActive: false });
    }
  }

  async createWellnessMetrics(
    metrics: InsertWellnessMetrics,
  ): Promise<WellnessMetrics> {
    const id = this.currentId++;
    const wellnessEntry: WellnessMetrics = {
      id,
      date: new Date(),
      userId: metrics.userId,
      energyLevel: metrics.energyLevel || null,
      stressLevel: metrics.stressLevel || null,
      focusTime: metrics.focusTime || null,
      hydrationGlasses: metrics.hydrationGlasses || null,
    };
    this.wellnessMetrics.set(id, wellnessEntry);
    return wellnessEntry;
  }

  async getWellnessMetrics(
    userId: number,
    days = 7,
  ): Promise<WellnessMetrics[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return Array.from(this.wellnessMetrics.values())
      .filter(
        (metric) => metric.userId === userId && metric.date! >= cutoffDate,
      )
      .sort((a, b) => b.date!.getTime() - a.date!.getTime());
  }
}

import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(
    id: number,
    updates: Partial<User>,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const [moodEntry] = await db.insert(moodEntries).values(entry).returning();
    return moodEntry;
  }

  async getMoodEntries(userId: number, limit = 10): Promise<MoodEntry[]> {
    return await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(desc(moodEntries.timestamp))
      .limit(limit);
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [journalEntry] = await db
      .insert(journalEntries)
      .values(entry)
      .returning();
    return journalEntry;
  }

  async getJournalEntries(userId: number, limit = 10): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.timestamp))
      .limit(limit);
  }

  async getAgentMemory(
    userId: number,
    agentName: string,
  ): Promise<AgentMemory | undefined> {
    const [memory] = await db
      .select()
      .from(agentMemory)
      .where(
        and(
          eq(agentMemory.userId, userId),
          eq(agentMemory.agentName, agentName),
        ),
      );
    return memory || undefined;
  }

  async updateAgentMemory(memory: InsertAgentMemory): Promise<AgentMemory> {
    const existing = await this.getAgentMemory(memory.userId, memory.agentName);

    if (existing) {
      const [updated] = await db
        .update(agentMemory)
        .set({ memoryData: memory.memoryData, lastUpdated: new Date() })
        .where(
          and(
            eq(agentMemory.userId, memory.userId),
            eq(agentMemory.agentName, memory.agentName),
          ),
        )
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(agentMemory).values(memory).returning();
      return created;
    }
  }

  async createAgentRecommendation(
    rec: InsertAgentRecommendation,
  ): Promise<AgentRecommendation> {
    const [recommendation] = await db
      .insert(agentRecommendations)
      .values(rec)
      .returning();
    return recommendation;
  }

  async getActiveRecommendations(
    userId: number,
    agentName?: string,
  ): Promise<AgentRecommendation[]> {
    if (agentName) {
      return await db
        .select()
        .from(agentRecommendations)
        .where(
          and(
            eq(agentRecommendations.userId, userId),
            eq(agentRecommendations.isActive, true),
            eq(agentRecommendations.agentName, agentName),
          ),
        )
        .orderBy(desc(agentRecommendations.createdAt));
    }

    return await db
      .select()
      .from(agentRecommendations)
      .where(
        and(
          eq(agentRecommendations.userId, userId),
          eq(agentRecommendations.isActive, true),
        ),
      )
      .orderBy(desc(agentRecommendations.createdAt));
  }

  async deactivateRecommendation(id: number): Promise<void> {
    await db
      .update(agentRecommendations)
      .set({ isActive: false })
      .where(eq(agentRecommendations.id, id));
  }

  async createWellnessMetrics(
    metrics: InsertWellnessMetrics,
  ): Promise<WellnessMetrics> {
    const [wellnessEntry] = await db
      .insert(wellnessMetrics)
      .values(metrics)
      .returning();
    return wellnessEntry;
  }

  async getWellnessMetrics(
    userId: number,
    days = 7,
  ): Promise<WellnessMetrics[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await db
      .select()
      .from(wellnessMetrics)
      .where(eq(wellnessMetrics.userId, userId))
      .orderBy(desc(wellnessMetrics.date))
      .limit(days);
  }
}

export const storage = new DatabaseStorage();
