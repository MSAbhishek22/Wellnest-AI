import { EnhancedBaseAgent, UserIntent, AgentAction, ExecutionStep, StepResult, AgentPlan } from "./enhanced-base";
import { generateNutritionPlan } from "../services/groq";
import { storage } from "../storage";
import { ExternalAPIService } from "../services/external-apis";

export class EnhancedNutriCoachAgent extends EnhancedBaseAgent {
  private externalAPI: ExternalAPIService;

  constructor() {
    super(
      "NutriCoach", 
      "Nutrition Intelligence & Meal Planning", 
      ["meal_planning", "hydration_tracking", "nutrition_analysis", "dietary_restrictions", "calorie_tracking"],
      ["mood_based_nutrition", "deficiency_detection", "meal_timing_optimization"],
      ["assess_nutritional_needs", "generate_meal_plan", "provide_hydration_guidance"]
    );
    this.externalAPI = new ExternalAPIService();
  }

  async analyzeUserIntent(userInput: any): Promise<UserIntent> {
    const { currentMood, preferences, triggeringAgent, healthGoals } = userInput;
    
    const categories = ["nutrition", "health"];
    if (currentMood) categories.push("mood_support");
    if (triggeringAgent) categories.push("collaboration");
    
    let urgency: 'low' | 'medium' | 'high' = 'medium';
    if (currentMood === 'stressed' || currentMood === 'tired') urgency = 'high';
    
    return {
      summary: `Provide nutrition guidance for ${currentMood || 'general'} state`,
      categories,
      urgency,
      confidence: 0.85,
      entities: [currentMood, triggeringAgent].filter(Boolean),
      category: "nutrition"
    };
  }

  getAvailableActions(): AgentAction[] {
    return [
      {
        name: "generate_meal_plan",
        description: "Create personalized meal recommendations",
        categories: ["nutrition", "meal_planning"],
        basePriority: 0.9,
        requiredTools: ["meal_planning"],
        benefits: ["personalized_nutrition", "mood_support", "health_optimization"],
        risks: ["dietary_restrictions_conflict"]
      },
      {
        name: "analyze_nutritional_needs",
        description: "Assess current nutritional status and deficiencies",
        categories: ["nutrition", "analysis"],
        basePriority: 0.8,
        requiredTools: ["nutrition_analysis"],
        benefits: ["targeted_recommendations", "health_insights"],
        risks: ["incomplete_data"]
      },
      {
        name: "create_hydration_plan",
        description: "Develop hydration strategy",
        categories: ["hydration", "health"],
        basePriority: 0.7,
        requiredTools: ["hydration_tracking"],
        benefits: ["improved_energy", "better_health"],
        risks: ["over_hydration"]
      }
    ];
  }

  async executeStep(step: ExecutionStep, userId: number): Promise<StepResult> {
    try {
      switch (step.name) {
        case 'prepare':
          return await this.prepareNutritionAnalysis(userId);
        case 'execute_main':
          return await this.generateNutritionRecommendations(userId, step);
        case 'finalize':
          return await this.finalizeNutritionPlan(userId, step);
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
        error: "Failed to generate nutrition recommendations",
        fallback: "Please try again or consult with a nutritionist"
      };
    }

    const nutritionData = finalResult?.data || mainResult?.data;
    
    return {
      nutritionPlan: nutritionData.nutritionPlan,
      hydrationPlan: nutritionData.hydrationPlan,
      mealSchedule: nutritionData.mealSchedule,
      shoppingList: nutritionData.shoppingList,
      nutritionalInsights: nutritionData.insights,
      confidence: plan.intent.confidence,
      recommendations: nutritionData.recommendations || []
    };
  }

  async generateErrorResponse(error: any, input: any): Promise<string> {
    const errorMessage = String(error);
    
    if (errorMessage.includes('nutrition_data')) {
      return "I'm having trouble accessing nutrition data right now. Please try again in a moment, or I can provide general nutrition guidance based on your mood.";
    }
    
    if (errorMessage.includes('user_profile')) {
      return "I need more information about your dietary preferences and health goals to provide personalized nutrition advice.";
    }
    
    return "I encountered an issue while creating your nutrition plan. Let me provide some general healthy eating tips instead.";
  }

  private async prepareNutritionAnalysis(userId: number): Promise<StepResult> {
    try {
      const memory = await this.getMemory(userId);
      const userContext = await this.getUserContext(userId);
      
      // Get recent nutrition data if available
      const recentRecommendations = await storage.getActiveRecommendations(userId, this.name);
      
      return {
        step: 'prepare',
        success: true,
        data: {
          memory,
          userContext,
          recentRecommendations,
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

  private async generateNutritionRecommendations(userId: number, step: ExecutionStep): Promise<StepResult> {
    try {
      const memory = await this.getMemory(userId);
      const userContext = await this.getUserContext(userId);
      
      // Generate meal plan using AI
      const mealPlan = await generateNutritionPlan(
        userContext.currentMood,
        memory.preferences || {}
      );
      
      // Enhance with external nutrition data if available
      let nutritionalAnalysis = null;
      try {
        if (mealPlan.meals?.[0]?.name) {
          nutritionalAnalysis = await ExternalAPIService.generateMealPlan(memory.preferences || {});
        }
      } catch (error) {
        console.log("External nutrition API unavailable, using internal data");
      }
      
      const nutritionPlan = {
        ...mealPlan,
        nutritionalAnalysis,
        adaptations: this.generateMoodAdaptations(userContext.currentMood),
        confidence: 0.85
      };
      
      return {
        step: 'execute_main',
        success: true,
        data: { nutritionPlan }
      };
    } catch (error) {
      return {
        step: 'execute_main',
        success: false,
        error: String(error)
      };
    }
  }

  private async finalizeNutritionPlan(userId: number, step: ExecutionStep): Promise<StepResult> {
    try {
      const memory = await this.getMemory(userId);
      const userContext = await this.getUserContext(userId);
      
      // Get the nutrition plan from previous step data (would be passed in real implementation)
      const nutritionPlan = memory.lastNutritionPlan || await this.generateBasicNutritionPlan(userContext);
      
      const finalizedPlan = {
        nutritionPlan,
        hydrationPlan: this.generateHydrationPlan(userContext.currentMood),
        mealSchedule: this.generateMealSchedule(),
        shoppingList: this.generateShoppingList(nutritionPlan.meals || []),
        insights: this.generateNutritionalInsights(userContext, nutritionPlan),
        recommendations: this.generateRecommendations(userContext.currentMood)
      };
      
      // Store the recommendations
      await storage.createAgentRecommendation({
        userId,
        agentName: this.name,
        type: "nutrition",
        content: finalizedPlan
      });
      
      // Update memory
      await this.updateMemory(userId, {
        ...memory,
        lastNutritionPlan: nutritionPlan,
        lastUpdate: new Date(),
        successfulExecutions: (memory.successfulExecutions || 0) + 1
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

  private async generateBasicNutritionPlan(userContext: any): Promise<any> {
    return await generateNutritionPlan(userContext.currentMood, {});
  }

  private generateMoodAdaptations(mood: string): string[] {
    const adaptations: { [key: string]: string[] } = {
      stressed: ["Include magnesium-rich foods", "Avoid excessive caffeine", "Focus on omega-3 sources"],
      tired: ["Emphasize iron-rich foods", "Include complex carbohydrates", "Add B-vitamin sources"],
      anxious: ["Include calming herbs", "Avoid stimulants", "Focus on stable blood sugar"],
      sad: ["Include serotonin-boosting foods", "Add vitamin D sources", "Include comfort foods (healthy versions)"]
    };
    
    return adaptations[mood] || ["Focus on balanced nutrition", "Include variety of nutrients"];
  }

  private generateHydrationPlan(mood: string): any {
    return {
      dailyTarget: "8-10 glasses",
      timing: ["upon_waking", "before_meals", "during_exercise", "before_bed"],
      enhancements: mood === "stressed" ? ["herbal_teas", "electrolytes"] : ["lemon_water", "plain_water"],
      tracking: "Use hydration app or water bottle markers"
    };
  }

  private generateMealSchedule(): any {
    return {
      breakfast: "7:00-9:00 AM",
      snack1: "10:30-11:00 AM", 
      lunch: "12:30-1:30 PM",
      snack2: "3:30-4:00 PM",
      dinner: "6:30-8:00 PM",
      principles: ["eat_every_3_hours", "larger_breakfast", "lighter_dinner"]
    };
  }

  private generateShoppingList(meals: any[]): string[] {
    const ingredients = new Set<string>();
    
    meals?.forEach(meal => {
      meal.ingredients?.forEach((ingredient: string) => {
        ingredients.add(ingredient);
      });
    });

    return Array.from(ingredients);
  }

  private generateNutritionalInsights(userContext: any, nutritionPlan: any): any {
    return {
      keyInsights: [
        `Nutrition plan optimized for ${userContext.currentMood} mood`,
        `Focus on ${nutritionPlan.primaryFocus || 'balanced nutrition'}`,
        `Confidence level: 85%`
      ],
      recommendations: [
        "Track your meals for better personalization",
        "Stay consistent with meal timing", 
        "Monitor how foods affect your mood and energy"
      ]
    };
  }

  private generateRecommendations(mood: string): string[] {
    const recommendations: { [key: string]: string[] } = {
      stressed: [
        "Try chamomile tea before bed",
        "Include dark leafy greens in your meals",
        "Limit caffeine after 2 PM"
      ],
      tired: [
        "Eat iron-rich foods with vitamin C",
        "Include protein in every meal",
        "Stay hydrated throughout the day"
      ],
      anxious: [
        "Avoid processed foods and excess sugar",
        "Include probiotic foods for gut health",
        "Try magnesium-rich foods like nuts and seeds"
      ]
    };
    
    return recommendations[mood] || [
      "Eat a variety of colorful fruits and vegetables",
      "Stay hydrated with water throughout the day",
      "Include lean proteins in your meals"
    ];
  }
}
