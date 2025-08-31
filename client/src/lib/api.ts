import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  currentMood: string;
  streakDays: number;
}

export interface AgentRecommendation {
  id: number;
  agentName: string;
  type: string;
  content: any;
  createdAt: string;
}

export interface WellnessMetrics {
  id: number;
  energyLevel: number;
  stressLevel: number;
  focusTime: number;
  hydrationGlasses: number;
  date: string;
}

export const api = {
  // User operations
  getUser: async (userId: number): Promise<User> => {
    const response = await apiRequest("GET", `/api/user/${userId}`);
    return response.json();
  },

  // Mood operations
  updateMood: async (mood: string, userId: number = 1) => {
    const response = await apiRequest("POST", "/api/mood", { mood, userId });
    return response.json();
  },

  getMoodEntries: async (userId: number = 1) => {
    const response = await apiRequest("GET", `/api/mood/${userId}`);
    return response.json();
  },

  // Journal operations
  saveJournalEntry: async (content: string, prompt?: string, userId: number = 1) => {
    const response = await apiRequest("POST", "/api/journal", { 
      content, 
      prompt, 
      userId 
    });
    return response.json();
  },

  getJournalEntries: async (userId: number = 1) => {
    const response = await apiRequest("GET", `/api/journal/${userId}`);
    return response.json();
  },

  // Agent operations
  getAgentRecommendations: async (agentName: string, userId: number = 1): Promise<AgentRecommendation[]> => {
    const response = await apiRequest("GET", `/api/agents/${agentName}/recommendations/${userId}`);
    return response.json();
  },

  runAgent: async (agentName: string, input: any, userId: number = 1) => {
    const response = await apiRequest("POST", `/api/agents/${agentName}/run`, { 
      input, 
      userId 
    });
    return response.json();
  },

  getAgentStatus: async () => {
    const response = await apiRequest("GET", "/api/agents/status");
    return response.json();
  },

  // Insights operations
  getInsights: async (userId: number = 1) => {
    const response = await apiRequest("GET", `/api/insights/${userId}`);
    return response.json();
  },

  // Wellness metrics
  saveWellnessMetrics: async (metrics: Partial<WellnessMetrics>, userId: number = 1) => {
    const response = await apiRequest("POST", "/api/wellness-metrics", { 
      ...metrics, 
      userId 
    });
    return response.json();
  },

  getWellnessMetrics: async (userId: number = 1, days: number = 7) => {
    const response = await apiRequest("GET", `/api/wellness-metrics/${userId}?days=${days}`);
    return response.json();
  }
};
