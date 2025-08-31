import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  currentMood: text("current_mood").default("neutral"),
  streakDays: integer("streak_days").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mood: text("mood").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  prompt: text("prompt"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const agentMemory = pgTable("agent_memory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  agentName: text("agent_name").notNull(),
  memoryData: jsonb("memory_data").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const agentRecommendations = pgTable("agent_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  agentName: text("agent_name").notNull(),
  type: text("type").notNull(),
  content: jsonb("content").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wellnessMetrics = pgTable("wellness_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow(),
  energyLevel: integer("energy_level"),
  stressLevel: integer("stress_level"),
  focusTime: integer("focus_time"),
  hydrationGlasses: integer("hydration_glasses").default(0),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).pick({
  userId: true,
  mood: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  content: true,
  prompt: true,
});

export const insertAgentMemorySchema = createInsertSchema(agentMemory).pick({
  userId: true,
  agentName: true,
  memoryData: true,
});

export const insertAgentRecommendationSchema = createInsertSchema(agentRecommendations).pick({
  userId: true,
  agentName: true,
  type: true,
  content: true,
});

export const insertWellnessMetricsSchema = createInsertSchema(wellnessMetrics).pick({
  userId: true,
  energyLevel: true,
  stressLevel: true,
  focusTime: true,
  hydrationGlasses: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type AgentMemory = typeof agentMemory.$inferSelect;
export type InsertAgentMemory = z.infer<typeof insertAgentMemorySchema>;
export type AgentRecommendation = typeof agentRecommendations.$inferSelect;
export type InsertAgentRecommendation = z.infer<typeof insertAgentRecommendationSchema>;
export type WellnessMetrics = typeof wellnessMetrics.$inferSelect;
export type InsertWellnessMetrics = z.infer<typeof insertWellnessMetricsSchema>;

// Agent-specific types
export interface AgentResponse {
  agentName: string;
  recommendations: any[];
  memory: any;
  collaborationTriggers: string[];
}

export interface MoodAnalysis {
  mood: string;
  confidence: number;
  triggers: string[];
  recommendations: string[];
}

export interface NutritionPlan {
  meals: Array<{
    name: string;
    description: string;
    benefits: string;
    emoji: string;
  }>;
  hydrationGoal: number;
  adaptations: string[];
}

export interface WorkoutPlan {
  exercises: Array<{
    name: string;
    type: string;
    duration: number;
    intensity: string;
    description: string;
    videoUrl?: string;
  }>;
  energyAdaptation: string;
}

export interface MentalWellnessSupport {
  journalPrompt: string;
  affirmation: string;
  techniques: string[];
}

export interface WellnessInsights {
  trends: Array<{
    metric: string;
    change: number;
    direction: 'up' | 'down';
  }>;
  correlations: string[];
  suggestions: string[];
}
