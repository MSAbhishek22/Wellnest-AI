import { EnhancedBaseAgent, UserIntent, AgentAction, ExecutionStep, StepResult, AgentPlan } from "./enhanced-base";
import { generateWorkoutPlan } from "../services/groq";
import { storage } from "../storage";
import { ExternalAPIService } from "../services/external-apis";

export class EnhancedFlexGenieAgent extends EnhancedBaseAgent {
  constructor() {
    super(
      "FlexGenie", 
      "Fitness Intelligence & Adaptive Workouts", 
      ["workout_planning", "energy_adaptation", "video_recommendations", "fitness_tracking", "recovery_planning"],
      ["mood_based_fitness", "energy_optimization", "adaptive_intensity", "injury_prevention"],
      ["assess_fitness_level", "generate_workout_plan", "provide_recovery_guidance", "track_progress"]
    );
  }

  async analyzeUserIntent(userInput: any): Promise<UserIntent> {
    const { currentMood, energyLevel, timeAvailable, triggeringAgent, fitnessGoals } = userInput;
    
    const categories = ["fitness", "health"];
    if (currentMood) categories.push("mood_support");
    if (energyLevel !== undefined) categories.push("energy_optimization");
    if (triggeringAgent) categories.push("collaboration");
    
    let urgency: 'low' | 'medium' | 'high' = 'medium';
    if (currentMood === 'stressed' || currentMood === 'anxious') urgency = 'high';
    if (energyLevel && energyLevel < 3) urgency = 'low';
    
    return {
      summary: `Create fitness plan for ${currentMood || 'general'} state with ${energyLevel || 'moderate'} energy`,
      categories,
      urgency,
      confidence: 0.88,
      entities: [currentMood, triggeringAgent, `${energyLevel}_energy`].filter(Boolean),
      category: "fitness"
    };
  }

  getAvailableActions(): AgentAction[] {
    return [
      {
        name: "generate_workout_plan",
        description: "Create personalized workout recommendations",
        categories: ["fitness", "workout_planning"],
        basePriority: 0.9,
        requiredTools: ["workout_planning"],
        benefits: ["improved_fitness", "mood_enhancement", "energy_boost", "stress_relief"],
        risks: ["overexertion", "injury_risk"]
      },
      {
        name: "adapt_intensity",
        description: "Adjust workout intensity based on current state",
        categories: ["fitness", "energy_adaptation"],
        basePriority: 0.85,
        requiredTools: ["energy_adaptation"],
        benefits: ["optimal_performance", "injury_prevention", "sustainable_progress"],
        risks: ["under_training"]
      },
      {
        name: "recommend_videos",
        description: "Provide workout video recommendations",
        categories: ["fitness", "video_recommendations"],
        basePriority: 0.8,
        requiredTools: ["video_recommendations"],
        benefits: ["guided_workouts", "proper_form", "motivation"],
        risks: ["screen_dependency"]
      },
      {
        name: "plan_recovery",
        description: "Create recovery and rest day plans",
        categories: ["fitness", "recovery"],
        basePriority: 0.7,
        requiredTools: ["recovery_planning"],
        benefits: ["injury_prevention", "improved_performance", "better_sleep"],
        risks: ["reduced_activity"]
      }
    ];
  }

  async executeStep(step: ExecutionStep, userId: number): Promise<StepResult> {
    try {
      switch (step.name) {
        case 'prepare':
          return await this.prepareFitnessAnalysis(userId);
        case 'execute_main':
          return await this.generateFitnessRecommendations(userId, step);
        case 'finalize':
          return await this.finalizeFitnessPlan(userId, step);
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
        error: "Failed to generate fitness recommendations",
        fallback: "Try some light stretching or a short walk to get started"
      };
    }

    const fitnessData = finalResult?.data || mainResult?.data;
    
    return {
      workoutPlan: fitnessData.workoutPlan,
      recoveryPlan: fitnessData.recoveryPlan,
      videoRecommendations: fitnessData.videoRecommendations,
      progressTracking: fitnessData.progressTracking,
      energyAdaptation: fitnessData.energyAdaptation,
      confidence: plan.intent.confidence,
      recommendations: fitnessData.recommendations || []
    };
  }

  async generateErrorResponse(error: any, input: any): Promise<string> {
    const errorMessage = String(error);
    
    if (errorMessage.includes('fitness_data')) {
      return "I'm having trouble accessing fitness data right now. Let me suggest some basic exercises you can do anywhere!";
    }
    
    if (errorMessage.includes('energy_level')) {
      return "I need to know your current energy level to create the best workout plan for you. How are you feeling today?";
    }
    
    return "I encountered an issue while creating your workout plan. Let me provide some general fitness tips instead.";
  }

  private async prepareFitnessAnalysis(userId: number): Promise<StepResult> {
    try {
      const memory = await this.getMemory(userId);
      const userContext = await this.getUserContext(userId);
      
      // Get recent fitness data if available
      const recentRecommendations = await storage.getActiveRecommendations(userId, this.name);
      const recentMetrics = await storage.getWellnessMetrics(userId, 7);
      
      return {
        step: 'prepare',
        success: true,
        data: {
          memory,
          userContext,
          recentRecommendations,
          recentMetrics,
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

  private async generateFitnessRecommendations(userId: number, step: ExecutionStep): Promise<StepResult> {
    try {
      const memory = await this.getMemory(userId);
      const userContext = await this.getUserContext(userId);
      
      // Determine energy level and adapt accordingly
      const energyLevel = this.assessEnergyLevel(userContext, memory);
      const adaptedIntensity = this.adaptIntensityForMood(userContext.currentMood, energyLevel);
      
      // Generate workout plan using AI
      const workoutPlan = await generateWorkoutPlan(
        userContext.currentMood,
        adaptedIntensity,
        memory.preferredDuration || 20
      );
      
      // Enhance with video recommendations
      let videoRecommendations = [];
      try {
        const workoutType = this.determineWorkoutType(userContext.currentMood, adaptedIntensity);
        const videos = await ExternalAPIService.getWorkoutVideos(workoutType, memory.preferredDuration);
        videoRecommendations = videos.videos || [];
      } catch (error) {
        console.log("External video API unavailable, using fallback recommendations");
        videoRecommendations = this.getFallbackVideoRecommendations(userContext.currentMood);
      }
      
      const fitnessRecommendations = {
        workoutPlan: {
          ...workoutPlan,
          adaptedIntensity,
          energyLevel,
          confidence: 0.88
        },
        videoRecommendations,
        energyAdaptation: this.generateEnergyAdaptationInsights(energyLevel, adaptedIntensity),
        recoveryGuidance: this.generateRecoveryGuidance(userContext.currentMood, adaptedIntensity)
      };
      
      return {
        step: 'execute_main',
        success: true,
        data: fitnessRecommendations
      };
    } catch (error) {
      return {
        step: 'execute_main',
        success: false,
        error: String(error)
      };
    }
  }

  private async finalizeFitnessPlan(userId: number, step: ExecutionStep): Promise<StepResult> {
    try {
      const memory = await this.getMemory(userId);
      const userContext = await this.getUserContext(userId);
      
      // Get the fitness plan from previous step data (would be passed in real implementation)
      const workoutPlan = memory.lastWorkoutPlan || await this.generateBasicWorkoutPlan(userContext);
      
      const finalizedPlan = {
        workoutPlan,
        recoveryPlan: this.generateRecoveryPlan(userContext.currentMood),
        videoRecommendations: this.getFallbackVideoRecommendations(userContext.currentMood),
        progressTracking: this.generateProgressTracking(),
        energyAdaptation: this.generateEnergyAdaptationInsights(7, 7), // Default values
        recommendations: this.generateFitnessRecommendationsList(userContext.currentMood)
      };
      
      // Store the recommendations
      await storage.createAgentRecommendation({
        userId,
        agentName: this.name,
        type: "fitness",
        content: finalizedPlan
      });
      
      // Update memory
      await this.updateMemory(userId, {
        ...memory,
        lastWorkoutPlan: workoutPlan,
        lastUpdate: new Date(),
        successfulExecutions: (memory.successfulExecutions || 0) + 1,
        fitnessStreak: (memory.fitnessStreak || 0) + 1
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

  private async generateBasicWorkoutPlan(userContext: any): Promise<any> {
    return await generateWorkoutPlan(userContext.currentMood, 7, 20);
  }

  private assessEnergyLevel(userContext: any, memory: any): number {
    // Assess energy based on mood and historical data
    const moodEnergyMap: { [key: string]: number } = {
      excited: 9,
      happy: 8,
      focused: 7,
      neutral: 6,
      tired: 3,
      stressed: 4,
      anxious: 5,
      sad: 4
    };
    
    const baseEnergy = moodEnergyMap[userContext.currentMood] || 6;
    const historicalAverage = memory.averageEnergyLevel || 6;
    
    // Blend current mood with historical patterns
    return Math.round((baseEnergy + historicalAverage) / 2);
  }

  private adaptIntensityForMood(mood: string, energyLevel: number): number {
    const moodIntensityModifiers: { [key: string]: number } = {
      stressed: -2, // Lower intensity for stress relief
      anxious: -1,
      tired: -3,
      excited: +1,
      happy: 0,
      focused: 0,
      sad: -1
    };
    
    const modifier = moodIntensityModifiers[mood] || 0;
    const adaptedIntensity = Math.max(1, Math.min(10, energyLevel + modifier));
    
    return adaptedIntensity;
  }

  private determineWorkoutType(mood: string, intensity: number): string {
    if (intensity <= 3) return "yoga";
    if (mood === "stressed" || mood === "anxious") return "yoga";
    if (intensity >= 8) return "hiit";
    if (mood === "excited") return "hiit";
    return "strength";
  }

  private generateEnergyAdaptationInsights(energyLevel: number, adaptedIntensity: number): any {
    return {
      originalEnergy: energyLevel,
      adaptedIntensity,
      reasoning: this.getAdaptationReasoning(energyLevel, adaptedIntensity),
      recommendations: this.getEnergyRecommendations(energyLevel),
      expectedOutcome: this.predictWorkoutOutcome(adaptedIntensity)
    };
  }

  private getAdaptationReasoning(energyLevel: number, intensity: number): string {
    if (intensity < energyLevel) {
      return "Reduced intensity to prevent overexertion and support recovery";
    } else if (intensity > energyLevel) {
      return "Slightly increased intensity to boost energy and mood";
    }
    return "Intensity matched to current energy level for optimal performance";
  }

  private getEnergyRecommendations(energyLevel: number): string[] {
    if (energyLevel <= 3) {
      return [
        "Focus on gentle movement and stretching",
        "Stay hydrated and consider a light snack",
        "Listen to your body and rest if needed"
      ];
    } else if (energyLevel >= 8) {
      return [
        "Great energy for challenging workouts",
        "Don't forget to warm up properly",
        "Consider adding some high-intensity intervals"
      ];
    }
    return [
      "Good energy for moderate exercise",
      "Mix cardio and strength training",
      "Stay consistent with your routine"
    ];
  }

  private predictWorkoutOutcome(intensity: number): string {
    if (intensity <= 3) return "Improved flexibility and reduced stress";
    if (intensity <= 6) return "Enhanced mood and steady energy boost";
    return "Significant energy boost and endorphin release";
  }

  private generateRecoveryGuidance(mood: string, intensity: number): any {
    return {
      coolDown: this.getCoolDownRecommendations(intensity),
      stretching: this.getStretchingRecommendations(mood),
      hydration: this.getHydrationGuidance(intensity),
      restDay: this.getRestDayGuidance(mood, intensity)
    };
  }

  private getCoolDownRecommendations(intensity: number): string[] {
    if (intensity >= 7) {
      return ["5-10 minutes walking", "Deep breathing exercises", "Light stretching"];
    }
    return ["3-5 minutes walking", "Gentle stretching", "Relaxation breathing"];
  }

  private getStretchingRecommendations(mood: string): string[] {
    const stretchingMap: { [key: string]: string[] } = {
      stressed: ["Neck and shoulder stretches", "Hip flexor stretches", "Spinal twists"],
      tired: ["Gentle backbends", "Leg elevation", "Restorative poses"],
      anxious: ["Chest opening stretches", "Grounding poses", "Breathing-focused stretches"]
    };
    
    return stretchingMap[mood] || ["Full body stretching routine", "Hold each stretch 30 seconds"];
  }

  private getHydrationGuidance(intensity: number): any {
    return {
      during: intensity >= 6 ? "Sip water every 10-15 minutes" : "Drink when thirsty",
      after: `Drink ${Math.ceil(intensity / 2)} glasses of water within 2 hours`,
      electrolytes: intensity >= 8 ? "Consider electrolyte replacement" : "Water is sufficient"
    };
  }

  private getRestDayGuidance(mood: string, intensity: number): any {
    return {
      frequency: intensity >= 8 ? "Every 2-3 days" : "Every 3-4 days",
      activities: mood === "stressed" ? ["Meditation", "Gentle yoga", "Nature walks"] : ["Light walking", "Stretching", "Leisure activities"],
      signs: ["Persistent fatigue", "Decreased motivation", "Muscle soreness lasting >48 hours"]
    };
  }

  private generateRecoveryPlan(mood: string): any {
    return {
      immediate: {
        coolDown: "5-10 minutes light movement",
        stretching: "10-15 minutes full body stretching",
        hydration: "16-24 oz water within 30 minutes"
      },
      daily: {
        sleep: "7-9 hours quality sleep",
        nutrition: "Protein within 2 hours post-workout",
        movement: "Light activity on rest days"
      },
      weekly: {
        restDays: mood === "stressed" ? "2-3 complete rest days" : "1-2 active recovery days",
        assessment: "Weekly progress and energy level check-in",
        adjustment: "Modify intensity based on recovery"
      }
    };
  }

  private generateProgressTracking(): any {
    return {
      metrics: [
        "Workout completion rate",
        "Energy levels before/after exercise",
        "Mood improvements",
        "Strength/endurance gains",
        "Recovery time"
      ],
      frequency: "Weekly check-ins",
      tools: [
        "Fitness app integration",
        "Mood tracking",
        "Energy level logging",
        "Photo progress tracking"
      ],
      goals: [
        "Consistency over intensity",
        "Gradual progression",
        "Mood and energy improvement",
        "Injury prevention"
      ]
    };
  }

  private getFallbackVideoRecommendations(mood: string): any[] {
    const videoMap: { [key: string]: any[] } = {
      stressed: [
        { title: "10 Min Stress Relief Yoga", url: "https://youtube.com/watch?v=stress1", channel: "Yoga with Adriene", duration: 10 },
        { title: "Gentle Stretching for Stress", url: "https://youtube.com/watch?v=stress2", channel: "DoYogaWithMe", duration: 15 }
      ],
      tired: [
        { title: "Energizing Morning Yoga", url: "https://youtube.com/watch?v=energy1", channel: "Yoga with Adriene", duration: 12 },
        { title: "Gentle Wake-Up Stretches", url: "https://youtube.com/watch?v=energy2", channel: "PsycheTruth", duration: 8 }
      ],
      excited: [
        { title: "High Energy HIIT Workout", url: "https://youtube.com/watch?v=hiit1", channel: "Fitness Blender", duration: 20 },
        { title: "Dance Cardio Workout", url: "https://youtube.com/watch?v=dance1", channel: "POPSUGAR Fitness", duration: 25 }
      ]
    };
    
    return videoMap[mood] || [
      { title: "Full Body Beginner Workout", url: "https://youtube.com/watch?v=beginner1", channel: "Fitness Blender", duration: 15 },
      { title: "Bodyweight Strength Training", url: "https://youtube.com/watch?v=strength1", channel: "Calisthenic Movement", duration: 20 }
    ];
  }

  private generateFitnessRecommendationsList(mood: string): string[] {
    const recommendations: { [key: string]: string[] } = {
      stressed: [
        "Focus on stress-relieving exercises like yoga or walking",
        "Keep workouts shorter and less intense",
        "Include breathing exercises in your routine"
      ],
      tired: [
        "Start with gentle movement to boost energy",
        "Try energizing exercises like light cardio",
        "Don't push too hard - listen to your body"
      ],
      excited: [
        "Channel your energy into high-intensity workouts",
        "Try new and challenging exercises",
        "Remember to warm up properly before intense activity"
      ],
      anxious: [
        "Choose calming exercises like yoga or tai chi",
        "Focus on controlled movements and breathing",
        "Avoid overly stimulating or competitive activities"
      ]
    };
    
    return recommendations[mood] || [
      "Aim for 150 minutes of moderate exercise per week",
      "Include both cardio and strength training",
      "Stay consistent with your fitness routine"
    ];
  }
}
