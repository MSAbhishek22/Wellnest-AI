import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { orchestrator } from "./agents/orchestrator";
import { 
  insertMoodEntrySchema,
  insertJournalEntrySchema,
  insertWellnessMetricsSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint for Render
  app.get("/api/health", (req, res) => {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      service: "WellNest.AI"
    });
  });
  
  // Mood tracking endpoints
  app.post("/api/mood", async (req, res) => {
    try {
      const { mood, userId = 1 } = req.body;
      
      if (!mood) {
        return res.status(400).json({ error: "Mood is required" });
      }

      const result = await orchestrator.runMoodUpdate(mood, userId);
      res.json(result);
    } catch (error) {
      console.error("Mood update error:", error);
      res.status(500).json({ error: "Failed to update mood" });
    }
  });

  app.get("/api/mood/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const entries = await storage.getMoodEntries(userId, 30);
      res.json(entries);
    } catch (error) {
      console.error("Get mood entries error:", error);
      res.status(500).json({ error: "Failed to get mood entries" });
    }
  });

  // Journal endpoints
  app.post("/api/journal", async (req, res) => {
    try {
      const validatedData = insertJournalEntrySchema.parse(req.body);
      validatedData.userId = validatedData.userId || 1;
      
      await orchestrator.saveJournalEntry(validatedData.userId, validatedData.content);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Journal save error:", error);
      res.status(500).json({ error: "Failed to save journal entry" });
    }
  });

  app.get("/api/journal/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const entries = await storage.getJournalEntries(userId, 10);
      res.json(entries);
    } catch (error) {
      console.error("Get journal entries error:", error);
      res.status(500).json({ error: "Failed to get journal entries" });
    }
  });

  // Agent endpoints
  app.get("/api/agents/:agentName/recommendations/:userId", async (req, res) => {
    try {
      const { agentName, userId } = req.params;
      const recommendations = await storage.getActiveRecommendations(
        parseInt(userId), 
        agentName
      );
      res.json(recommendations);
    } catch (error) {
      console.error("Get recommendations error:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  app.post("/api/agents/:agentName/run", async (req, res) => {
    try {
      const { agentName } = req.params;
      const { input, userId = 1 } = req.body;
      
      const result = await orchestrator.runAgent(agentName, input, userId);
      res.json(result);
    } catch (error) {
      console.error("Agent run error:", error);
      res.status(500).json({ error: "Failed to run agent" });
    }
  });

  // New conversation endpoint for proper AI chat
  app.post("/api/agents/:agentName/chat", async (req, res) => {
    try {
      const { agentName } = req.params;
      const { message, conversationHistory = [], userId = 1 } = req.body;
      
      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      const result = await orchestrator.handleAgentConversation(
        agentName, 
        message, 
        conversationHistory, 
        userId
      );
      
      res.json(result);
    } catch (error) {
      console.error("Agent conversation error:", error);
      res.status(500).json({ error: "Failed to process conversation" });
    }
  });

  // Insights endpoint
  app.get("/api/insights/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const insights = await orchestrator.runInsightsAnalysis(userId);
      res.json(insights);
    } catch (error) {
      console.error("Insights error:", error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  // Wellness metrics endpoints
  app.post("/api/wellness-metrics", async (req, res) => {
    try {
      const validatedData = insertWellnessMetricsSchema.parse(req.body);
      validatedData.userId = validatedData.userId || 1;
      
      const metrics = await storage.createWellnessMetrics(validatedData);
      res.json(metrics);
    } catch (error) {
      console.error("Wellness metrics error:", error);
      res.status(500).json({ error: "Failed to save wellness metrics" });
    }
  });

  app.get("/api/wellness-metrics/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const days = parseInt(req.query.days as string) || 7;
      const metrics = await storage.getWellnessMetrics(userId, days);
      res.json(metrics);
    } catch (error) {
      console.error("Get wellness metrics error:", error);
      res.status(500).json({ error: "Failed to get wellness metrics" });
    }
  });

  // User endpoint
  app.get("/api/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Agent status endpoint
  app.get("/api/agents/status", async (req, res) => {
    try {
      const agents = orchestrator.getAllAgents();
      const status = Array.from(agents.entries()).map(([name, agent]) => ({
        name,
        role: agent.getRole(),
        tools: agent.getTools(),
        status: "active"
      }));
      
      res.json(status);
    } catch (error) {
      console.error("Agent status error:", error);
      res.status(500).json({ error: "Failed to get agent status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
