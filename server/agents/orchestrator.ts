import { EnhancedMoodMateAgent } from "./enhanced-mood-mate";
import { EnhancedNutriCoachAgent } from "./enhanced-nutri-coach";
import { EnhancedFlexGenieAgent } from "./enhanced-flex-genie";
import { EnhancedMindPalAgent } from "./enhanced-mind-pal";
import { EnhancedInsightBotAgent } from "./enhanced-insight-bot";
import type { EnhancedBaseAgent } from "./enhanced-base";

// Type for enhanced agents
type AnyAgent = EnhancedBaseAgent | {
  run(input: any, userId: number): Promise<any>;
  observe(agentOutput: any, userId: number): Promise<void>;
  getName(): string;
  getRole(): string;
  getTools(): string[];
};

export class AgentOrchestrator {
  private agents: Map<string, AnyAgent>;
  private collaborationQueue: Array<{
    agentName: string;
    input: any;
    userId: number;
    triggeringAgent?: string;
  }>;

  constructor() {
    this.agents = new Map();
    this.collaborationQueue = [];
    
    // Initialize agents
    this.agents.set("MoodMate", new EnhancedMoodMateAgent());
    this.agents.set("NutriCoach", new EnhancedNutriCoachAgent());
    this.agents.set("FlexGenie", new EnhancedFlexGenieAgent());
    this.agents.set("MindPal", new EnhancedMindPalAgent());
    this.agents.set("InsightBot", new EnhancedInsightBotAgent());
  }

  async runAgent(agentName: string, input: any, userId: number): Promise<any> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }

    // Run the agent
    const output = await agent.run(input, userId);
    
    // Notify other agents for observation
    await this.notifyObservers(output, userId, agentName);
    
    // Queue collaboration triggers
    if (output.collaborationTriggers && output.collaborationTriggers.length > 0) {
      await this.queueCollaborations(output.collaborationTriggers, output, userId, agentName);
    }

    return output;
  }

  private async notifyObservers(output: any, userId: number, excludeAgent: string): Promise<void> {
    const observerPromises = Array.from(this.agents.entries())
      .filter(([name]) => name !== excludeAgent)
      .map(async ([_, agent]) => {
        try {
          await agent.observe(output, userId);
        } catch (error) {
          console.error(`Observer error in ${agent.getName()}:`, error);
        }
      });

    await Promise.all(observerPromises);
  }

  private async queueCollaborations(
    triggers: string[], 
    triggeringOutput: any, 
    userId: number, 
    triggeringAgent: string
  ): Promise<void> {
    for (const agentName of triggers) {
      if (this.agents.has(agentName)) {
        this.collaborationQueue.push({
          agentName,
          input: {
            ...triggeringOutput.memory,
            triggeringAgent,
            currentMood: triggeringOutput.memory?.lastMood || "neutral"
          },
          userId,
          triggeringAgent
        });
      }
    }
  }

  async processCollaborationQueue(): Promise<any[]> {
    const results = [];
    
    while (this.collaborationQueue.length > 0) {
      const collaboration = this.collaborationQueue.shift();
      if (!collaboration) continue;

      try {
        const result = await this.runAgent(
          collaboration.agentName, 
          collaboration.input, 
          collaboration.userId
        );
        results.push(result);
      } catch (error) {
        console.error(`Collaboration error with ${collaboration.agentName}:`, error);
      }
    }

    return results;
  }

  async runMoodUpdate(mood: string, userId: number): Promise<any> {
    // Start with MoodMate
    const moodResult = await this.runAgent("MoodMate", { mood }, userId);
    
    // Process any triggered collaborations
    const collaborationResults = await this.processCollaborationQueue();
    
    return {
      primary: moodResult,
      collaborations: collaborationResults
    };
  }

  async runInsightsAnalysis(userId: number): Promise<any> {
    return await this.runAgent("InsightBot", {}, userId);
  }

  async saveJournalEntry(userId: number, content: string): Promise<void> {
    const mindPal = this.agents.get("MindPal") as EnhancedMindPalAgent;
    if (mindPal && 'saveJournalEntry' in mindPal) {
      await mindPal.saveJournalEntry(userId, content);
    }
  }

  async handleAgentConversation(
    agentName: string, 
    userMessage: string, 
    conversationHistory: Array<{role: string, content: string}>, 
    userId: number
  ): Promise<{
    response: string;
    actions?: any[];
    collaborationTriggered?: boolean;
  }> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }

    // Get user context for personalized responses
    const userContext = await this.getUserContext(userId);
    
    // Import the conversation function
    const { generateAgentConversation, extractUserIntent } = await import("../services/groq");
    
    // Generate AI response based on conversation
    const response = await generateAgentConversation(
      agentName, 
      userMessage, 
      conversationHistory, 
      userContext
    );

    // Extract user intent to determine if actions are needed
    const intent = await extractUserIntent(userMessage, agentName);
    
    const result: any = { response };
    
    // Handle specific actions based on intent
    if (intent.needsAction) {
      const actions = await this.handleUserIntent(intent, userMessage, userId, agentName);
      if (actions.length > 0) {
        result.actions = actions;
        result.collaborationTriggered = true;
      }
    }

    return result;
  }

  private async getUserContext(userId: number): Promise<any> {
    try {
      // Get storage instance
      const storage = await this.getStorage();
      
      // Get recent user data for context
      const [moodEntries, journalEntries, user] = await Promise.all([
        storage.getMoodEntries(userId, 5),
        storage.getJournalEntries(userId, 3),
        storage.getUser(userId)
      ]);

      return {
        currentMood: user?.currentMood || "neutral",
        recentMoods: moodEntries?.map((entry: any) => entry.mood) || [],
        recentJournalThemes: journalEntries?.map((entry: any) => entry.content?.substring(0, 100)) || [],
        streakDays: user?.streakDays || 0
      };
    } catch (error) {
      console.error("Error getting user context:", error);
      return {};
    }
  }

  private async handleUserIntent(
    intent: any, 
    userMessage: string, 
    userId: number, 
    agentName: string
  ): Promise<any[]> {
    const actions = [];

    try {
      switch (intent.actionType) {
        case "mood_update":
          // Extract mood from entities or message
          const moodKeywords = ["happy", "sad", "stressed", "tired", "focused", "anxious", "excited", "calm"];
          const detectedMood = moodKeywords.find(mood => 
            userMessage.toLowerCase().includes(mood) || 
            intent.entities.some((entity: string) => entity.toLowerCase().includes(mood))
          );
          
          if (detectedMood) {
            const moodResult = await this.runMoodUpdate(detectedMood, userId);
            actions.push({ type: "mood_update", result: moodResult });
          }
          break;

        case "journal_save":
          if (agentName === "MindPal" && userMessage.length > 20) {
            await this.saveJournalEntry(userId, userMessage);
            actions.push({ type: "journal_save", success: true });
          }
          break;

        case "recommendation_request":
          // Run the specific agent to get recommendations
          const agentResult = await this.runAgent(agentName, { 
            userMessage, 
            intent: intent.intent 
          }, userId);
          actions.push({ type: "recommendation", result: agentResult });
          break;

        case "data_analysis":
          if (agentName === "InsightBot") {
            const insights = await this.runInsightsAnalysis(userId);
            actions.push({ type: "insights", result: insights });
          }
          break;
      }
    } catch (error) {
      console.error("Error handling user intent:", error);
    }

    return actions;
  }

  getAgent(name: string): AnyAgent | undefined {
    return this.agents.get(name);
  }

  getAllAgents(): Map<string, AnyAgent> {
    return this.agents;
  }

  private get storage() {
    // Dynamic import for storage to avoid circular dependencies
    return import("../storage").then(module => module.storage);
  }

  // Helper method to get storage synchronously (for backward compatibility)
  private async getStorage() {
    const { storage } = await import("../storage");
    return storage;
  }
}

export const orchestrator = new AgentOrchestrator();
