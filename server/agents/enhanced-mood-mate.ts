import { EnhancedBaseAgent, UserIntent, AgentAction, ExecutionStep, StepResult, AgentPlan } from "./enhanced-base";
import { ExternalAPIService } from "../services/external-apis";
import { storage } from "../storage";

export class EnhancedMoodMateAgent extends EnhancedBaseAgent {
  constructor() {
    super(
      "MoodMate", 
      "Emotional Intelligence & Mood Detection Specialist",
      ["mood_analysis", "music_recommendations", "sentiment_analysis", "emotional_memory"],
      ["spotify_integration", "sentiment_ai", "mood_tracking", "music_therapy"],
      ["track_mood", "suggest_music", "analyze_sentiment", "save_mood_data"]
    );
  }

  // ===== PLAN PHASE: Analyze user intent =====
  async analyzeUserIntent(userInput: any): Promise<UserIntent> {
    const { mood, message, context } = userInput;
    
    // Use AI sentiment analysis for text input
    let detectedMood = mood;
    let confidence = 0.8;
    
    if (message && !mood) {
      const sentimentResult = await ExternalAPIService.analyzeSentiment(message);
      detectedMood = this.mapSentimentToMood(sentimentResult.sentiment);
      confidence = sentimentResult.confidence;
    }

    const categories = ['mood', 'emotional_wellness'];
    const urgency = this.determineUrgency(detectedMood);
    
    // Extract entities from message
    const entities = message ? this.extractMoodEntities(message) : [detectedMood];

    return {
      summary: `User wants to ${mood ? 'track' : 'analyze'} mood: ${detectedMood}`,
      categories,
      urgency,
      confidence,
      entities,
      category: 'mood'
    };
  }

  // ===== PLAN PHASE: Define available actions =====
  getAvailableActions(): AgentAction[] {
    return [
      {
        name: "track_mood_with_music",
        description: "Track user mood and provide personalized music recommendations",
        categories: ["mood", "music"],
        basePriority: 0.9,
        requiredTools: ["mood_analysis", "music_recommendations"],
        benefits: ["Mood tracking", "Personalized music therapy", "Emotional support"],
        risks: ["Misinterpretation of mood"]
      },
      {
        name: "analyze_sentiment_deep",
        description: "Perform deep sentiment analysis on user text",
        categories: ["mood", "analysis"],
        basePriority: 0.8,
        requiredTools: ["sentiment_analysis"],
        benefits: ["Accurate mood detection", "Context understanding"],
        risks: ["Privacy concerns with text analysis"]
      },
      {
        name: "provide_emotional_support",
        description: "Offer emotional support and coping strategies",
        categories: ["emotional_wellness", "support"],
        basePriority: 0.7,
        requiredTools: ["emotional_memory"],
        benefits: ["Emotional validation", "Coping strategies", "Mental health support"],
        risks: ["Not a replacement for professional help"]
      },
      {
        name: "mood_pattern_analysis",
        description: "Analyze mood patterns and trends",
        categories: ["mood", "analysis"],
        basePriority: 0.6,
        requiredTools: ["emotional_memory"],
        benefits: ["Pattern recognition", "Trend analysis", "Predictive insights"],
        risks: ["Requires sufficient historical data"]
      }
    ];
  }

  // Override run method to store current input
  async run(input: any, userId: number): Promise<any> {
    try {
      // Store current input in memory for step access
      const currentMemory = await this.getMemory(userId);
      await this.updateMemory(userId, { ...currentMemory, currentInput: input });
      
      // Call parent run method
      return await super.run(input, userId);
    } catch (error) {
      console.error(`[${this.name}] Critical error:`, error);
      return {
        agentName: this.name,
        success: false,
        output: await this.generateErrorResponse(error, input),
        collaborationTriggers: [],
        error: String(error)
      };
    }
  }

  // ===== EXECUTE PHASE: Execute individual steps =====
  async executeStep(step: ExecutionStep, userId: number): Promise<StepResult> {
    try {
      switch (step.name) {
        case 'analyze_mood':
          return await this.executeMoodAnalysis(step, userId);
        
        case 'get_music_recommendations':
          return await this.executeGetMusicRecommendations(step, userId);
        
        case 'save_mood_data':
          return await this.executeSaveMoodData(step, userId);
        
        case 'provide_emotional_support':
          return await this.executeEmotionalSupport(step, userId);
        
        case 'analyze_patterns':
          return await this.executePatternAnalysis(step, userId);
        
        default:
          return { step: step.name, success: false, error: `Unknown step: ${step.name}` };
      }
    } catch (error) {
      return { step: step.name, success: false, error: String(error) };
    }
  }

  // ===== STEP IMPLEMENTATIONS =====

  private async executeMoodAnalysis(step: ExecutionStep, userId: number): Promise<StepResult> {
    try {
      const memory = await this.getMemory(userId);
      const userInput = memory.currentInput || { mood: 'neutral', message: '' };
      
      let moodData;
      
      if (userInput.message) {
        // Use AI sentiment analysis
        const sentimentResult = await ExternalAPIService.analyzeSentiment(userInput.message);
        moodData = {
          mood: this.mapSentimentToMood(sentimentResult.sentiment),
          confidence: sentimentResult.confidence,
          source: 'ai_analysis',
          rawSentiment: sentimentResult,
          triggers: this.extractMoodTriggers(userInput.message)
        };
      } else {
        // Direct mood input
        moodData = {
          mood: userInput.mood || 'neutral',
          confidence: 0.9,
          source: 'user_input',
          triggers: userInput.context?.triggers || []
        };
      }

      return {
        step: step.name,
        success: true,
        data: moodData
      };
    } catch (error) {
      return {
        step: step.name,
        success: false,
        error: String(error)
      };
    }
  }

  private async executeGetMusicRecommendations(step: ExecutionStep, userId: number): Promise<StepResult> {
    const memory = await this.getMemory(userId);
    const userInput = memory.currentInput || { mood: 'neutral' };
    
    // Use the mood from input or default to neutral
    const mood = userInput.mood || 'neutral';

    // Get Spotify playlists based on mood
    const musicRecommendations = await ExternalAPIService.getMoodBasedPlaylists(mood);
    
    // Add personalized recommendations based on user history
    const personalizedRecs = await this.getPersonalizedMusicRecommendations(userId, mood);
    
    return {
      step: step.name,
      success: true,
      data: {
        spotify: musicRecommendations,
        personalized: personalizedRecs,
        moodContext: mood
      }
    };
  }

  private async executeSaveMoodData(step: ExecutionStep, userId: number): Promise<StepResult> {
    const memory = await this.getMemory(userId);
    const userInput = memory.currentInput || { mood: 'neutral' };
    
    const mood = userInput.mood || 'neutral';

    // Save to database
    await storage.createMoodEntry({
      userId,
      mood: mood
    });

    // Update agent memory
    const agentMemory = await this.getMemory(userId);
    const moodHistory = agentMemory.moodHistory || [];
    
    moodHistory.push({
      timestamp: new Date(),
      mood: mood,
      confidence: 0.9,
      source: 'user_input',
      triggers: userInput.context?.triggers || []
    });

    // Keep last 50 entries
    if (moodHistory.length > 50) {
      moodHistory.splice(0, moodHistory.length - 50);
    }

    await this.updateMemory(userId, {
      ...agentMemory,
      moodHistory,
      lastMood: mood,
      lastUpdate: new Date()
    });

    return {
      step: step.name,
      success: true,
      data: { saved: true, moodCount: moodHistory.length }
    };
  }

  private async executeEmotionalSupport(step: ExecutionStep, userId: number): Promise<StepResult> {
    const memory = await this.getMemory(userId);
    const userInput = memory.currentInput || { mood: 'neutral' };
    
    const mood = userInput.mood || 'neutral';

    const supportContent = this.generateEmotionalSupport(mood);
    
    // Get therapy resources if needed
    const therapyResources = mood === 'depressed' || mood === 'anxious' ? 
      ExternalAPIService.getTherapyResources() : null;

    return {
      step: step.name,
      success: true,
      data: {
        support: supportContent,
        therapyResources,
        affirmation: ExternalAPIService.generateAffirmation(mood)
      }
    };
  }

  private async executePatternAnalysis(step: ExecutionStep, userId: number): Promise<StepResult> {
    const memory = await this.getMemory(userId);
    const moodHistory = memory.moodHistory || [];
    
    if (moodHistory.length < 5) {
      return {
        step: step.name,
        success: true,
        data: { message: 'Insufficient data for pattern analysis. Keep tracking!' }
      };
    }

    const patterns = this.analyzeMoodPatterns(moodHistory);
    
    return {
      step: step.name,
      success: true,
      data: patterns
    };
  }

  // ===== OUTPUT GENERATION =====
  async generateOutput(results: StepResult[], plan: AgentPlan): Promise<any> {
    const moodData = results.find(r => r.step === 'analyze_mood')?.data;
    const musicData = results.find(r => r.step === 'get_music_recommendations')?.data;
    const supportData = results.find(r => r.step === 'provide_emotional_support')?.data;
    const patternData = results.find(r => r.step === 'analyze_patterns')?.data;
    const saveData = results.find(r => r.step === 'save_mood_data')?.data;

    return {
      mood: moodData?.mood,
      confidence: moodData?.confidence,
      analysis: {
        detected_mood: moodData?.mood,
        confidence_level: `${Math.round((moodData?.confidence || 0) * 100)}%`,
        source: moodData?.source,
        triggers: moodData?.triggers || []
      },
      music_recommendations: musicData ? {
        spotify_playlists: musicData.spotify?.playlists || [],
        personalized: musicData.personalized || [],
        mood_context: musicData.moodContext
      } : null,
      emotional_support: supportData ? {
        message: supportData.support?.message,
        techniques: supportData.support?.techniques || [],
        affirmation: supportData.affirmation,
        therapy_resources: supportData.therapyResources
      } : null,
      patterns: patternData || null,
      tracking: saveData ? {
        saved: saveData.saved,
        total_entries: saveData.moodCount
      } : null,
      timestamp: new Date().toISOString()
    };
  }

  async generateErrorResponse(error: any, input: any): Promise<string> {
    return `I encountered an issue while analyzing your mood. ${String(error)}. Please try again or describe how you're feeling in different words.`;
  }

  // ===== HELPER METHODS =====

  protected generateExecutionSteps(alternative: any): ExecutionStep[] {
    // Always start with mood analysis
    const steps: ExecutionStep[] = [
      {
        name: 'analyze_mood',
        description: 'Analyze user mood using AI sentiment analysis',
        requiredData: ['userInput'],
        expectedOutput: 'mood_data'
      }
    ];

    // Add steps based on the selected alternative
    switch (alternative.name) {
      case 'track_mood_with_music':
        steps.push(
          {
            name: 'get_music_recommendations',
            description: 'Get personalized music recommendations',
            requiredData: ['mood_data'],
            expectedOutput: 'music_recommendations'
          },
          {
            name: 'save_mood_data',
            description: 'Save mood data to database and memory',
            requiredData: ['mood_data'],
            expectedOutput: 'save_confirmation'
          }
        );
        break;
        
      case 'provide_emotional_support':
        steps.push({
          name: 'provide_emotional_support',
          description: 'Generate emotional support content',
          requiredData: ['mood_data'],
          expectedOutput: 'support_content'
        });
        break;
        
      case 'mood_pattern_analysis':
        steps.push({
          name: 'analyze_patterns',
          description: 'Analyze mood patterns and trends',
          requiredData: ['mood_data'],
          expectedOutput: 'pattern_analysis'
        });
        break;
        
      case 'analyze_sentiment_deep':
        // Just mood analysis is sufficient for this case
        break;
        
      default:
        // For any unknown alternative, just do mood analysis and save
        steps.push({
          name: 'save_mood_data',
          description: 'Save mood data to database and memory',
          requiredData: ['mood_data'],
          expectedOutput: 'save_confirmation'
        });
        break;
    }

    return steps;
  }

  private mapSentimentToMood(sentiment: string): string {
    const mapping: { [key: string]: string } = {
      'positive': 'happy',
      'negative': 'sad',
      'neutral': 'neutral',
      'joy': 'happy',
      'anger': 'angry',
      'fear': 'anxious',
      'sadness': 'sad',
      'surprise': 'excited',
      'disgust': 'frustrated'
    };
    
    return mapping[sentiment.toLowerCase()] || 'neutral';
  }

  private determineUrgency(mood: string): 'low' | 'medium' | 'high' {
    const highUrgencyMoods = ['depressed', 'suicidal', 'panic', 'crisis'];
    const mediumUrgencyMoods = ['anxious', 'stressed', 'angry', 'overwhelmed'];
    
    if (highUrgencyMoods.includes(mood)) return 'high';
    if (mediumUrgencyMoods.includes(mood)) return 'medium';
    return 'low';
  }

  private extractMoodEntities(message: string): string[] {
    const moodKeywords = [
      'happy', 'sad', 'angry', 'anxious', 'stressed', 'excited', 'calm', 
      'frustrated', 'overwhelmed', 'peaceful', 'energetic', 'tired', 'focused'
    ];
    
    const entities = [];
    const lowerMessage = message.toLowerCase();
    
    for (const keyword of moodKeywords) {
      if (lowerMessage.includes(keyword)) {
        entities.push(keyword);
      }
    }
    
    return entities;
  }

  private extractMoodTriggers(message: string): string[] {
    const triggerKeywords = [
      'work', 'family', 'relationship', 'health', 'money', 'school', 
      'friends', 'weather', 'sleep', 'exercise', 'food'
    ];
    
    const triggers = [];
    const lowerMessage = message.toLowerCase();
    
    for (const trigger of triggerKeywords) {
      if (lowerMessage.includes(trigger)) {
        triggers.push(trigger);
      }
    }
    
    return triggers;
  }

  private async getPersonalizedMusicRecommendations(userId: number, mood: string): Promise<any> {
    const memory = await this.getMemory(userId);
    const moodHistory = memory.moodHistory || [];
    
    // Find what music worked well for this mood in the past
    const similarMoodEntries = moodHistory.filter((entry: any) => entry.mood === mood);
    
    return {
      message: `Based on your mood history, here are some personalized suggestions for ${mood} mood`,
      suggestions: [
        "Try the same music that helped you last time you felt this way",
        "Consider instrumental music if you need to focus",
        "Upbeat music can help shift your mood gradually"
      ]
    };
  }

  private generateEmotionalSupport(mood: string): any {
    const supportMessages = {
      sad: {
        message: "It's okay to feel sad. Your emotions are valid, and this feeling will pass.",
        techniques: ["Deep breathing", "Gentle self-talk", "Reach out to a friend", "Practice self-compassion"]
      },
      anxious: {
        message: "Anxiety can feel overwhelming, but you have the strength to get through this.",
        techniques: ["4-7-8 breathing", "Grounding exercises", "Progressive muscle relaxation", "Mindful observation"]
      },
      stressed: {
        message: "Stress is your body's way of responding to challenges. Let's find ways to manage it.",
        techniques: ["Take breaks", "Prioritize tasks", "Physical exercise", "Meditation"]
      },
      happy: {
        message: "I'm so glad you're feeling happy! Let's celebrate and maintain this positive energy.",
        techniques: ["Share your joy", "Practice gratitude", "Engage in activities you love", "Connect with others"]
      }
    };

    return supportMessages[mood as keyof typeof supportMessages] || {
      message: "Thank you for sharing how you're feeling. I'm here to support you.",
      techniques: ["Mindful breathing", "Self-reflection", "Gentle movement", "Positive affirmations"]
    };
  }

  private analyzeMoodPatterns(moodHistory: any[]): any {
    const recentMoods = moodHistory.slice(-14); // Last 14 entries
    const moodCounts: { [key: string]: number } = {};
    
    recentMoods.forEach((entry: any) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    );

    return {
      dominant_mood: dominantMood,
      mood_distribution: moodCounts,
      trend: this.calculateMoodTrend(recentMoods),
      insights: this.generateMoodInsights(moodCounts, dominantMood)
    };
  }

  private calculateMoodTrend(recentMoods: any[]): string {
    if (recentMoods.length < 3) return 'insufficient_data';
    
    const moodScores = recentMoods.map((entry: any) => this.getMoodScore(entry.mood));
    const recent = moodScores.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const earlier = moodScores.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    
    if (recent > earlier + 0.5) return 'improving';
    if (recent < earlier - 0.5) return 'declining';
    return 'stable';
  }

  private getMoodScore(mood: string): number {
    const scores: { [key: string]: number } = {
      'happy': 5, 'excited': 4, 'calm': 3, 'neutral': 2.5,
      'tired': 2, 'stressed': 1.5, 'sad': 1, 'anxious': 0.5
    };
    return scores[mood] || 2.5;
  }

  private generateMoodInsights(moodCounts: { [key: string]: number }, dominantMood: string): string[] {
    const insights = [];
    
    if (dominantMood === 'happy') {
      insights.push("You've been experiencing mostly positive moods lately! Keep up the great work.");
    } else if (dominantMood === 'stressed') {
      insights.push("I notice you've been feeling stressed frequently. Consider stress management techniques.");
    }
    
    const totalEntries = Object.values(moodCounts).reduce((a, b) => a + b, 0);
    if (totalEntries >= 7) {
      insights.push("Great job tracking your mood consistently! This data helps me provide better support.");
    }
    
    return insights;
  }
}
