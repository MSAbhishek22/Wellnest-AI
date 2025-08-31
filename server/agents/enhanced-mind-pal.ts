import { EnhancedBaseAgent, UserIntent, AgentAction, ExecutionStep, StepResult, AgentPlan } from "./enhanced-base";
import { generateMentalWellnessSupport } from "../services/groq";
import { storage } from "../storage";

export class EnhancedMindPalAgent extends EnhancedBaseAgent {
  constructor() {
    super(
      "MindPal", 
      "Mental Wellness & Emotional Intelligence", 
      ["journal_prompts", "affirmations", "emotional_regulation", "mindfulness", "cbt_techniques"],
      ["therapeutic_journaling", "emotional_processing", "mindfulness_practice", "cognitive_restructuring"],
      ["generate_journal_prompts", "provide_emotional_support", "guide_mindfulness", "track_mental_wellness"]
    );
  }

  async analyzeUserIntent(userInput: any): Promise<UserIntent> {
    const { currentMood, journalContext, triggeringAgent, emotionalState, stressLevel } = userInput;
    
    const categories = ["mental_health", "emotional_wellness"];
    if (currentMood) categories.push("mood_support");
    if (journalContext) categories.push("journaling");
    if (triggeringAgent) categories.push("collaboration");
    if (stressLevel && stressLevel > 7) categories.push("crisis_support");
    
    let urgency: 'low' | 'medium' | 'high' = 'medium';
    if (currentMood === 'depressed' || currentMood === 'suicidal') urgency = 'high';
    if (stressLevel && stressLevel >= 8) urgency = 'high';
    if (currentMood === 'anxious' || currentMood === 'panicked') urgency = 'high';
    
    return {
      summary: `Provide mental wellness support for ${currentMood || 'general'} emotional state`,
      categories,
      urgency,
      confidence: 0.92,
      entities: [currentMood, triggeringAgent, `stress_${stressLevel}`].filter(Boolean),
      category: "mental_health"
    };
  }

  getAvailableActions(): AgentAction[] {
    return [
      {
        name: "generate_therapeutic_support",
        description: "Provide personalized therapeutic interventions",
        categories: ["mental_health", "therapeutic_support"],
        basePriority: 0.95,
        requiredTools: ["therapeutic_techniques"],
        benefits: ["emotional_regulation", "stress_reduction", "mental_clarity", "self_awareness"],
        risks: ["emotional_overwhelm", "inappropriate_intervention"]
      },
      {
        name: "create_journal_prompts",
        description: "Generate personalized journaling prompts",
        categories: ["journaling", "self_reflection"],
        basePriority: 0.85,
        requiredTools: ["journal_prompts"],
        benefits: ["self_discovery", "emotional_processing", "pattern_recognition"],
        risks: ["emotional_triggering"]
      },
      {
        name: "guide_mindfulness_practice",
        description: "Provide mindfulness and meditation guidance",
        categories: ["mindfulness", "stress_reduction"],
        basePriority: 0.8,
        requiredTools: ["mindfulness"],
        benefits: ["stress_reduction", "present_moment_awareness", "emotional_balance"],
        risks: ["spiritual_bypassing"]
      },
      {
        name: "cognitive_restructuring",
        description: "Help identify and reframe negative thought patterns",
        categories: ["cbt", "cognitive_therapy"],
        basePriority: 0.9,
        requiredTools: ["cbt_techniques"],
        benefits: ["improved_thinking_patterns", "reduced_anxiety", "better_mood"],
        risks: ["oversimplification", "resistance_to_change"]
      }
    ];
  }

  async executeStep(step: ExecutionStep, userId: number): Promise<StepResult> {
    try {
      switch (step.name) {
        case 'prepare':
          return await this.prepareMentalWellnessAnalysis(userId);
        case 'execute_main':
          return await this.generateMentalWellnessSupport(userId, step);
        case 'finalize':
          return await this.finalizeMentalWellnessPlan(userId, step);
        default:
          throw new Error(`Unknown step: ${step.name}`);
      }
    } catch (error) {
      return {
        step: step.name,
        success: false,
        error: String(error)
      };
    }
  }

  async generateOutput(results: StepResult[], plan: AgentPlan): Promise<any> {
    const finalResult = results.find(r => r.step === 'finalize');
    const mainResult = results.find(r => r.step === 'execute_main');
    
    if (!finalResult?.data && !mainResult?.data) {
      return {
        error: "Failed to generate mental wellness support",
        fallback: "Take a moment to breathe deeply and remember that you're not alone in this journey."
      };
    }

    const wellnessData = finalResult?.data || mainResult?.data;
    
    return {
      wellnessSupport: wellnessData.wellnessSupport,
      journalPrompts: wellnessData.journalPrompts,
      mindfulnessExercises: wellnessData.mindfulnessExercises,
      cognitiveTools: wellnessData.cognitiveTools,
      emotionalInsights: wellnessData.emotionalInsights,
      confidence: plan.intent.confidence,
      safetyAssessment: wellnessData.safetyAssessment
    };
  }

  async generateErrorResponse(error: any, input: any): Promise<string> {
    const errorMessage = String(error);
    
    if (errorMessage.includes('journal_data')) {
      return "I'm having trouble accessing your journal history right now. Let me offer some general reflection prompts to get you started.";
    }
    
    if (errorMessage.includes('emotional_state')) {
      return "I need to better understand how you're feeling right now. Can you share what's on your mind?";
    }
    
    return "I encountered an issue while preparing your mental wellness support. Let me provide some immediate grounding techniques instead.";
  }

  private async prepareMentalWellnessAnalysis(userId: number): Promise<StepResult> {
    try {
      const memory = await this.getMemory(userId);
      const userContext = await this.getUserContext(userId);
      
      // Get recent mental health data
      const recentJournals = await storage.getJournalEntries(userId, 10);
      const recentMoods = await storage.getMoodEntries(userId, 14);
      const recentRecommendations = await storage.getActiveRecommendations(userId, this.name);
      
      // Analyze emotional patterns
      const emotionalPatterns = this.analyzeEmotionalPatterns(recentMoods, recentJournals);
      const riskAssessment = this.assessMentalHealthRisk(userContext, emotionalPatterns);
      
      return {
        step: 'prepare',
        success: true,
        data: {
          memory,
          userContext,
          recentJournals,
          recentMoods,
          recentRecommendations,
          emotionalPatterns,
          riskAssessment,
          preparationComplete: true
        }
      };
    } catch (error) {
      return {
        step: 'prepare',
        success: false,
        error: String(error)
      };
    }
  }

  private async generateMentalWellnessSupport(userId: number, step: ExecutionStep): Promise<StepResult> {
    try {
      const memory = await this.getMemory(userId);
      const userContext = await this.getUserContext(userId);
      
      // Get recent journal entries for context
      const recentJournals = await storage.getJournalEntries(userId, 5);
      const recentThemes = recentJournals.map(entry => entry.content.substring(0, 100));
      
      // Assess current emotional state and needs
      const emotionalAssessment = this.assessEmotionalState(userContext, memory);
      const interventionLevel = this.determineInterventionLevel(emotionalAssessment);
      
      // Generate AI-powered wellness support
      const wellnessSupport = await generateMentalWellnessSupport(
        userContext.currentMood, 
        recentThemes
      );
      
      // Enhance with personalized interventions
      const enhancedSupport = {
        ...wellnessSupport,
        personalizedTechniques: this.generatePersonalizedTechniques(emotionalAssessment, memory),
        journalPrompts: this.generateContextualJournalPrompts(userContext, memory),
        mindfulnessExercises: this.selectMindfulnessExercises(emotionalAssessment),
        cognitiveTools: this.provideCognitiveTools(userContext.currentMood, interventionLevel),
        safetyAssessment: this.conductSafetyAssessment(userContext, emotionalAssessment)
      };
      
      return {
        step: 'execute_main',
        success: true,
        data: {
          wellnessSupport: enhancedSupport,
          emotionalAssessment,
          interventionLevel,
          confidence: 0.92
        }
      };
    } catch (error) {
      return {
        step: 'execute_main',
        success: false,
        error: String(error)
      };
    }
  }

  private async finalizeMentalWellnessPlan(userId: number, step: ExecutionStep): Promise<StepResult> {
    try {
      const memory = await this.getMemory(userId);
      const userContext = await this.getUserContext(userId);
      
      // Get the wellness support from previous step (would be passed in real implementation)
      const wellnessSupport = memory.lastWellnessSupport || await this.generateBasicWellnessSupport(userContext);
      
      const finalizedPlan = {
        wellnessSupport,
        journalPrompts: this.generateContextualJournalPrompts(userContext, memory),
        mindfulnessExercises: this.selectMindfulnessExercises({ mood: userContext.currentMood, intensity: 5 }),
        cognitiveTools: this.provideCognitiveTools(userContext.currentMood, 'moderate'),
        emotionalInsights: this.generateEmotionalInsights(userContext, memory),
        safetyAssessment: this.conductSafetyAssessment(userContext, { mood: userContext.currentMood })
      };
      
      // Store the recommendations
      await storage.createAgentRecommendation({
        userId,
        agentName: this.name,
        type: "mental_wellness",
        content: finalizedPlan
      });
      
      // Update memory
      await this.updateMemory(userId, {
        ...memory,
        lastWellnessSupport: wellnessSupport,
        lastUpdate: new Date(),
        successfulSessions: (memory.successfulSessions || 0) + 1,
        journalStreak: this.calculateJournalStreak(memory),
        emotionalGrowthMetrics: this.updateEmotionalGrowthMetrics(memory, userContext)
      });
      
      return {
        step: 'finalize',
        success: true,
        data: finalizedPlan
      };
    } catch (error) {
      return {
        step: 'finalize',
        success: false,
        error: String(error)
      };
    }
  }

  async saveJournalEntry(userId: number, content: string): Promise<void> {
    const memory = await this.getMemory(userId);
    const currentPrompt = memory.lastWellnessSupport?.journalPrompt || "Daily reflection";
    
    await storage.createJournalEntry({
      userId,
      content,
      prompt: currentPrompt
    });

    // Update memory with journaling streak and insights
    const streak = this.calculateJournalStreak(memory);
    const insights = this.extractJournalInsights(content, memory);
    
    await this.updateMemory(userId, {
      ...memory,
      journalStreak: streak + 1,
      lastJournalDate: new Date(),
      journalInsights: [...(memory.journalInsights || []), insights].slice(-50)
    });
  }

  private async generateBasicWellnessSupport(userContext: any): Promise<any> {
    return await generateMentalWellnessSupport(userContext.currentMood, []);
  }

  private analyzeEmotionalPatterns(moods: any[], journals: any[]): any {
    const moodFrequency: { [key: string]: number } = {};
    const moodTrends = [];
    
    // Analyze mood frequency
    moods.forEach(entry => {
      moodFrequency[entry.mood] = (moodFrequency[entry.mood] || 0) + 1;
    });
    
    // Analyze mood trends over time
    const sortedMoods = moods.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    for (let i = 1; i < sortedMoods.length; i++) {
      moodTrends.push({
        from: sortedMoods[i-1].mood,
        to: sortedMoods[i].mood,
        timeGap: new Date(sortedMoods[i].timestamp).getTime() - new Date(sortedMoods[i-1].timestamp).getTime()
      });
    }
    
    return {
      dominantMoods: Object.entries(moodFrequency).sort(([,a], [,b]) => b - a).slice(0, 3),
      moodTrends,
      journalThemes: this.extractJournalThemes(journals),
      emotionalVolatility: this.calculateEmotionalVolatility(moods)
    };
  }

  private assessMentalHealthRisk(userContext: any, patterns: any): any {
    let riskLevel = 'low';
    const riskFactors = [];
    
    // Check for concerning mood patterns
    if (patterns.dominantMoods.some(([mood]: [string, number]) => 
        ['depressed', 'suicidal', 'hopeless'].includes(mood))) {
      riskLevel = 'high';
      riskFactors.push('concerning_mood_patterns');
    }
    
    // Check for high emotional volatility
    if (patterns.emotionalVolatility > 0.7) {
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      riskFactors.push('emotional_instability');
    }
    
    // Check current mood
    if (['depressed', 'suicidal', 'panicked'].includes(userContext.currentMood)) {
      riskLevel = 'high';
      riskFactors.push('current_crisis_mood');
    }
    
    return { riskLevel, riskFactors, needsProfessionalSupport: riskLevel === 'high' };
  }

  private assessEmotionalState(userContext: any, memory: any): any {
    return {
      mood: userContext.currentMood,
      intensity: this.calculateMoodIntensity(userContext.currentMood),
      stability: memory.emotionalStability || 5,
      copingCapacity: memory.copingCapacity || 7,
      supportNeeds: this.identifySupportNeeds(userContext.currentMood, memory)
    };
  }

  private determineInterventionLevel(assessment: any): 'light' | 'moderate' | 'intensive' {
    if (assessment.intensity >= 8 || assessment.copingCapacity <= 3) return 'intensive';
    if (assessment.intensity >= 6 || assessment.stability <= 4) return 'moderate';
    return 'light';
  }

  private generatePersonalizedTechniques(assessment: any, memory: any): string[] {
    const techniques = [];
    const preferredTechniques = memory.preferredTechniques || [];
    
    // Mood-specific techniques
    const moodTechniques: { [key: string]: string[] } = {
      anxious: ["Box breathing", "Progressive muscle relaxation", "Grounding exercises"],
      stressed: ["Deep breathing", "Body scan meditation", "Stress ball exercises"],
      sad: ["Gratitude journaling", "Self-compassion exercises", "Gentle movement"],
      angry: ["Anger release techniques", "Counting exercises", "Physical activity"],
      overwhelmed: ["Priority setting", "Break tasks down", "Mindful breathing"]
    };
    
    const moodSpecific = moodTechniques[assessment.mood] || ["Mindful breathing", "Present moment awareness"];
    techniques.push(...moodSpecific);
    
    // Add preferred techniques if they exist
    if (preferredTechniques.length > 0) {
      techniques.push(...preferredTechniques.slice(0, 2));
    }
    
    return Array.from(new Set(techniques)).slice(0, 5);
  }

  private generateContextualJournalPrompts(userContext: any, memory: any): string[] {
    const prompts = [];
    const recentPrompts = memory.promptHistory || [];
    
    // Mood-specific prompts
    const moodPrompts: { [key: string]: string[] } = {
      anxious: [
        "What specific thoughts are creating anxiety right now?",
        "What would you tell a friend experiencing this same worry?",
        "What's one small step you can take to feel more grounded?"
      ],
      stressed: [
        "What's the most important thing on your mind right now?",
        "How can you show yourself compassion in this stressful time?",
        "What boundaries do you need to set to protect your peace?"
      ],
      sad: [
        "What emotions are you experiencing beneath the sadness?",
        "What has brought you comfort during difficult times before?",
        "How can you honor your feelings while also caring for yourself?"
      ],
      happy: [
        "What contributed to this positive feeling?",
        "How can you carry this energy forward?",
        "What are you most grateful for right now?"
      ]
    };
    
    const moodSpecific = moodPrompts[userContext.currentMood] || [
      "How are you feeling right now, and what do you need?",
      "What's one thing you learned about yourself today?",
      "What would self-care look like for you right now?"
    ];
    
    // Avoid recently used prompts
    const availablePrompts = moodSpecific.filter(prompt => 
      !recentPrompts.some((recent: any) => recent.prompt === prompt)
    );
    
    prompts.push(...availablePrompts.slice(0, 3));
    
    return prompts;
  }

  private selectMindfulnessExercises(assessment: any): any[] {
    const exercises = [];
    
    const exerciseDatabase = {
      breathing: {
        name: "4-7-8 Breathing",
        duration: 5,
        instructions: "Inhale for 4, hold for 7, exhale for 8",
        benefits: ["anxiety_reduction", "sleep_improvement"]
      },
      body_scan: {
        name: "Progressive Body Scan",
        duration: 10,
        instructions: "Systematically relax each part of your body",
        benefits: ["tension_release", "body_awareness"]
      },
      loving_kindness: {
        name: "Loving-Kindness Meditation",
        duration: 8,
        instructions: "Send compassionate thoughts to yourself and others",
        benefits: ["self_compassion", "emotional_healing"]
      },
      grounding: {
        name: "5-4-3-2-1 Grounding",
        duration: 3,
        instructions: "Notice 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste",
        benefits: ["anxiety_relief", "present_moment_awareness"]
      }
    };
    
    // Select based on mood and intensity
    if (assessment.mood === 'anxious' || assessment.intensity >= 7) {
      exercises.push(exerciseDatabase.breathing, exerciseDatabase.grounding);
    } else if (assessment.mood === 'stressed') {
      exercises.push(exerciseDatabase.body_scan, exerciseDatabase.breathing);
    } else if (assessment.mood === 'sad') {
      exercises.push(exerciseDatabase.loving_kindness, exerciseDatabase.body_scan);
    } else {
      exercises.push(exerciseDatabase.breathing, exerciseDatabase.body_scan);
    }
    
    return exercises;
  }

  private provideCognitiveTools(mood: string, interventionLevel: string): any {
    const tools = {
      thoughtRecord: {
        name: "Thought Record",
        description: "Identify and examine negative thought patterns",
        steps: [
          "Identify the triggering situation",
          "Notice your automatic thoughts",
          "Examine the evidence for and against",
          "Develop a balanced perspective"
        ]
      },
      cognitiveReframing: {
        name: "Cognitive Reframing",
        description: "Transform negative thoughts into more balanced ones",
        techniques: ["Question the thought", "Find alternative perspectives", "Consider the bigger picture"]
      },
      behavioralActivation: {
        name: "Behavioral Activation",
        description: "Engage in meaningful activities to improve mood",
        suggestions: this.getBehavioralActivationSuggestions(mood)
      }
    };
    
    if (interventionLevel === 'intensive') {
      return Object.values(tools);
    } else if (interventionLevel === 'moderate') {
      return [tools.thoughtRecord, tools.cognitiveReframing];
    } else {
      return [tools.cognitiveReframing];
    }
  }

  private conductSafetyAssessment(userContext: any, assessment: any): any {
    const concerningMoods = ['suicidal', 'hopeless', 'depressed'];
    const isConcerning = concerningMoods.includes(userContext.currentMood);
    
    return {
      riskLevel: isConcerning ? 'high' : 'low',
      needsImmediateSupport: isConcerning,
      crisisResources: isConcerning ? this.getCrisisResources() : null,
      recommendProfessionalHelp: isConcerning || assessment.intensity >= 9,
      safetyPlan: isConcerning ? this.generateSafetyPlan() : null
    };
  }

  private generateEmotionalInsights(userContext: any, memory: any): any {
    return {
      patterns: memory.emotionalPatterns || {},
      growth: memory.emotionalGrowthMetrics || {},
      strengths: this.identifyEmotionalStrengths(memory),
      areasForGrowth: this.identifyGrowthAreas(userContext, memory),
      progress: this.calculateEmotionalProgress(memory)
    };
  }

  private calculateJournalStreak(memory: any): number {
    const lastJournalDate = memory.lastJournalDate;
    if (!lastJournalDate) return 0;
    
    const daysSinceLastJournal = Math.floor(
      (Date.now() - new Date(lastJournalDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceLastJournal <= 1 ? (memory.journalStreak || 0) : 0;
  }

  private updateEmotionalGrowthMetrics(memory: any, userContext: any): any {
    const current = memory.emotionalGrowthMetrics || {};
    
    return {
      ...current,
      sessionsCompleted: (current.sessionsCompleted || 0) + 1,
      lastMoodImprovement: this.calculateMoodImprovement(memory, userContext),
      copingSkillsUsed: current.copingSkillsUsed || [],
      consistencyScore: this.calculateConsistencyScore(memory)
    };
  }

  // Helper methods
  private extractJournalThemes(journals: any[]): string[] {
    // Simple keyword extraction - in production, use NLP
    const commonThemes = ['work', 'family', 'relationships', 'health', 'goals', 'stress', 'gratitude'];
    const themes: { [key: string]: number } = {};
    
    journals.forEach(journal => {
      const content = journal.content.toLowerCase();
      commonThemes.forEach(theme => {
        if (content.includes(theme)) {
          themes[theme] = (themes[theme] || 0) + 1;
        }
      });
    });
    
    return Object.entries(themes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);
  }

  private calculateEmotionalVolatility(moods: any[]): number {
    if (moods.length < 2) return 0;
    
    const moodValues: { [key: string]: number } = {
      happy: 8, excited: 9, calm: 6, focused: 7, neutral: 5,
      tired: 3, stressed: 2, anxious: 2, sad: 1, depressed: 0
    };
    
    let totalVariation = 0;
    for (let i = 1; i < moods.length; i++) {
      const prev = moodValues[moods[i-1].mood] || 5;
      const curr = moodValues[moods[i].mood] || 5;
      totalVariation += Math.abs(curr - prev);
    }
    
    return totalVariation / (moods.length - 1) / 9; // Normalize to 0-1
  }

  private calculateMoodIntensity(mood: string): number {
    const intensityMap: { [key: string]: number } = {
      suicidal: 10, depressed: 9, hopeless: 9, panicked: 9,
      anxious: 7, stressed: 6, sad: 5, angry: 6, overwhelmed: 7,
      tired: 4, neutral: 3, calm: 2, focused: 3, content: 2,
      happy: 4, excited: 6, joyful: 5
    };
    
    return intensityMap[mood] || 5;
  }

  private identifySupportNeeds(mood: string, memory: any): string[] {
    const needs = [];
    
    if (['anxious', 'panicked', 'stressed'].includes(mood)) {
      needs.push('anxiety_management', 'stress_reduction');
    }
    
    if (['sad', 'depressed', 'hopeless'].includes(mood)) {
      needs.push('emotional_support', 'mood_lifting');
    }
    
    if (['angry', 'frustrated'].includes(mood)) {
      needs.push('anger_management', 'conflict_resolution');
    }
    
    return needs;
  }

  private getBehavioralActivationSuggestions(mood: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      sad: ["Take a short walk", "Call a friend", "Listen to uplifting music", "Do a small creative activity"],
      anxious: ["Practice deep breathing", "Do gentle stretching", "Organize a small space", "Take a warm bath"],
      stressed: ["Take breaks every hour", "Do one thing at a time", "Practice saying no", "Delegate tasks"],
      angry: ["Physical exercise", "Write in a journal", "Practice progressive muscle relaxation", "Take time alone"]
    };
    
    return suggestions[mood] || ["Engage in a hobby", "Connect with nature", "Practice gratitude", "Help someone else"];
  }

  private getCrisisResources(): any {
    return {
      hotlines: [
        { name: "National Suicide Prevention Lifeline", number: "988", available: "24/7" },
        { name: "Crisis Text Line", number: "Text HOME to 741741", available: "24/7" }
      ],
      emergencyContacts: ["Call 911 for immediate emergency"],
      onlineResources: [
        "https://suicidepreventionlifeline.org",
        "https://www.crisistextline.org"
      ]
    };
  }

  private generateSafetyPlan(): any {
    return {
      warningSignsToWatch: [
        "Thoughts of self-harm",
        "Feeling hopeless",
        "Isolating from others",
        "Substance use increase"
      ],
      copingStrategies: [
        "Call a trusted friend or family member",
        "Use grounding techniques",
        "Remove means of self-harm",
        "Go to a safe, public place"
      ],
      supportContacts: [
        "Emergency services: 911",
        "Crisis hotline: 988",
        "Trusted friend or family member"
      ],
      professionalContacts: [
        "Primary care doctor",
        "Mental health professional",
        "Local emergency room"
      ]
    };
  }

  private identifyEmotionalStrengths(memory: any): string[] {
    const strengths = [];
    
    if (memory.journalStreak >= 7) strengths.push("Consistent self-reflection");
    if (memory.successfulSessions >= 10) strengths.push("Commitment to growth");
    if (memory.copingCapacity >= 7) strengths.push("Strong coping skills");
    
    return strengths;
  }

  private identifyGrowthAreas(userContext: any, memory: any): string[] {
    const areas = [];
    
    if (memory.emotionalVolatility > 0.6) areas.push("Emotional regulation");
    if (memory.copingCapacity < 5) areas.push("Coping strategies");
    if (!memory.journalStreak || memory.journalStreak < 3) areas.push("Consistent self-reflection");
    
    return areas;
  }

  private calculateEmotionalProgress(memory: any): any {
    return {
      overallScore: this.calculateOverallProgress(memory),
      improvements: memory.improvements || [],
      milestones: memory.milestones || [],
      nextGoals: this.suggestNextGoals(memory)
    };
  }

  private calculateOverallProgress(memory: any): number {
    let score = 0;
    
    if (memory.journalStreak >= 7) score += 20;
    if (memory.successfulSessions >= 5) score += 30;
    if (memory.copingCapacity >= 7) score += 25;
    if (memory.emotionalStability >= 7) score += 25;
    
    return Math.min(score, 100);
  }

  private suggestNextGoals(memory: any): string[] {
    const goals = [];
    
    if (!memory.journalStreak || memory.journalStreak < 7) {
      goals.push("Maintain 7-day journaling streak");
    }
    
    if (memory.copingCapacity < 8) {
      goals.push("Develop additional coping strategies");
    }
    
    if (memory.emotionalStability < 7) {
      goals.push("Practice emotional regulation techniques");
    }
    
    return goals;
  }

  private extractJournalInsights(content: string, memory: any): any {
    // Simple sentiment and theme extraction
    return {
      sentiment: this.analyzeSentiment(content),
      themes: this.extractThemes(content),
      wordCount: content.split(' ').length,
      timestamp: new Date()
    };
  }

  private analyzeSentiment(content: string): string {
    // Simple sentiment analysis - in production, use proper NLP
    const positiveWords = ['happy', 'good', 'great', 'wonderful', 'amazing', 'grateful', 'blessed', 'joy'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'depressed', 'anxious', 'worried', 'stressed'];
    
    const words = content.toLowerCase().split(' ');
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private extractThemes(content: string): string[] {
    const themes = ['work', 'family', 'relationships', 'health', 'goals', 'stress', 'gratitude'];
    const foundThemes: string[] = [];
    
    themes.forEach(theme => {
      if (content.toLowerCase().includes(theme)) {
        foundThemes.push(theme);
      }
    });
    
    return foundThemes;
  }

  private calculateMoodImprovement(memory: any, userContext: any): number {
    // Simple mood improvement calculation
    const previousMood = memory.lastMood;
    const currentMood = userContext.currentMood;
    
    const moodValues: { [key: string]: number } = {
      depressed: 1, sad: 2, anxious: 3, stressed: 4, neutral: 5,
      calm: 6, focused: 7, happy: 8, excited: 9
    };
    
    const prevValue = moodValues[previousMood] || 5;
    const currValue = moodValues[currentMood] || 5;
    
    return currValue - prevValue;
  }

  private calculateConsistencyScore(memory: any): number {
    const sessions = memory.successfulSessions || 0;
    const streak = memory.journalStreak || 0;
    
    return Math.min(100, (sessions * 5) + (streak * 10));
  }
}
