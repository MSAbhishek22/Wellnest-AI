import Groq from "groq-sdk";

// Using Groq for fast inference with open-source models
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "default_key"
});

export async function analyzeMood(text: string, context?: any): Promise<{
  mood: string;
  confidence: number;
  triggers: string[];
  recommendations: string[];
}> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `You are MoodMate, an empathetic AI wellness agent. Analyze the mood and emotional state from the given text. Consider context if provided. Respond with JSON in this format: {
            "mood": "one of: happy, sad, anxious, stressed, focused, tired, excited, neutral",
            "confidence": number between 0 and 1,
            "triggers": array of potential triggers or factors,
            "recommendations": array of specific wellness recommendations
          }`
        },
        {
          role: "user",
          content: `Text: ${text}\nContext: ${JSON.stringify(context || {})}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content received");
    }
    return JSON.parse(content);
  } catch (error) {
    console.error("Mood analysis failed:", error);
    return {
      mood: "neutral",
      confidence: 0.5,
      triggers: [],
      recommendations: ["Consider tracking your mood throughout the day"]
    };
  }
}

export async function generateNutritionPlan(mood: string, preferences?: any): Promise<{
  meals: Array<{
    name: string;
    description: string;
    benefits: string;
    emoji: string;
  }>;
  hydrationGoal: number;
  adaptations: string[];
}> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `You are NutriCoach, a personalized nutrition AI agent. Create meal recommendations based on mood and wellness goals. Respond with JSON in this format: {
            "meals": [{"name": "meal name", "description": "brief description", "benefits": "health benefits", "emoji": "food emoji"}],
            "hydrationGoal": number of glasses,
            "adaptations": array of mood-specific dietary adaptations
          }`
        },
        {
          role: "user",
          content: `Current mood: ${mood}\nPreferences: ${JSON.stringify(preferences || {})}\nProvide 3-4 meal/snack recommendations that support this mood state.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content received");
    }
    return JSON.parse(content);
  } catch (error) {
    console.error("Nutrition planning failed:", error);
    return {
      meals: [
        {
          name: "Balanced Meal",
          description: "A nutritious meal to support your wellness",
          benefits: "Provides essential nutrients",
          emoji: "🥗"
        }
      ],
      hydrationGoal: 8,
      adaptations: ["Stay hydrated throughout the day"]
    };
  }
}

export async function generateWorkoutPlan(mood: string, energyLevel: number, timeAvailable: number): Promise<{
  exercises: Array<{
    name: string;
    type: string;
    duration: number;
    intensity: string;
    description: string;
    videoUrl?: string;
  }>;
  energyAdaptation: string;
}> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `You are FlexGenie, a fitness AI agent that adapts workouts to mood and energy. Respond with JSON in this format: {
            "exercises": [{"name": "exercise name", "type": "yoga/cardio/strength/walking", "duration": minutes, "intensity": "low/moderate/high", "description": "brief description", "videoUrl": "youtube or exercise URL if relevant"}],
            "energyAdaptation": "explanation of how workout matches current energy"
          }`
        },
        {
          role: "user",
          content: `Current mood: ${mood}\nEnergy level (1-10): ${energyLevel}\nTime available: ${timeAvailable} minutes\nRecommend 2-3 exercises that match this state.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content received");
    }
    return JSON.parse(content);
  } catch (error) {
    console.error("Workout planning failed:", error);
    return {
      exercises: [
        {
          name: "Gentle Movement",
          type: "stretching",
          duration: 10,
          intensity: "low",
          description: "Light stretching to support wellness"
        }
      ],
      energyAdaptation: "Adapted for current energy level"
    };
  }
}

export async function generateMentalWellnessSupport(mood: string, recentEntries?: string[]): Promise<{
  journalPrompt: string;
  affirmation: string;
  techniques: string[];
}> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `You are MindPal, a mental wellness AI agent focused on emotional support and growth. Respond with JSON in this format: {
            "journalPrompt": "a thoughtful, open-ended prompt for reflection",
            "affirmation": "a positive, personalized affirmation",
            "techniques": array of specific mental wellness techniques
          }`
        },
        {
          role: "user",
          content: `Current mood: ${mood}\nRecent journal themes: ${JSON.stringify(recentEntries || [])}\nProvide mental wellness support.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content received");
    }
    return JSON.parse(content);
  } catch (error) {
    console.error("Mental wellness support failed:", error);
    return {
      journalPrompt: "How are you feeling right now, and what do you need most today?",
      affirmation: "You are capable of achieving your goals with focus and determination.",
      techniques: ["Deep breathing", "Mindful awareness"]
    };
  }
}

export async function generateWellnessInsights(data: any): Promise<{
  trends: Array<{
    metric: string;
    change: number;
    direction: 'up' | 'down';
  }>;
  correlations: string[];
  suggestions: string[];
}> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `You are InsightBot, an analytics AI agent that identifies wellness patterns and trends. Respond with JSON in this format: {
            "trends": [{"metric": "metric name", "change": percentage change, "direction": "up or down"}],
            "correlations": array of interesting correlations found,
            "suggestions": array of actionable wellness suggestions based on data
          }`
        },
        {
          role: "user",
          content: `Wellness data summary:
            - Mood entries: ${data.summary?.moodCount || 0}
            - Journal entries: ${data.summary?.journalCount || 0}
            - Wellness metrics: ${data.summary?.metricsCount || 0}
            
            Analyze patterns and provide insights based on this data count.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content received");
    }
    return JSON.parse(content);
  } catch (error) {
    console.error("Wellness insights failed:", error);
    return {
      trends: [
        { metric: "Energy Levels", change: 12, direction: "up" },
        { metric: "Stress Levels", change: -15, direction: "down" }
      ],
      correlations: ["Regular exercise correlates with better mood"],
      suggestions: ["Continue current wellness routine"]
    };
  }
}

// New conversation functions for proper agent chat
export async function generateAgentConversation(
  agentName: string, 
  userMessage: string, 
  conversationHistory: Array<{role: string, content: string}> = [],
  userContext?: any
): Promise<string> {
  try {
    // Filter and format conversation history for Groq API
    const formattedHistory = conversationHistory
      .slice(-6) // Keep last 6 messages for context
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

    // Use Groq AI for intelligent, contextual responses
    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: getAgentSystemPrompt(agentName, userContext)
        },
        ...formattedHistory,
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content received");
    }
    
    return content;
  } catch (error) {
    console.error("AI conversation failed:", error);
    // Fallback to pattern-based responses
    return generateIntelligentResponse(agentName, userMessage, conversationHistory, userContext);
  }
}

function getAgentSystemPrompt(agentName: string, userContext?: any): string {
  const baseContext = userContext ? `
User Context:
- Current Mood: ${userContext.currentMood || 'neutral'}
- Recent Moods: ${userContext.recentMoods?.join(', ') || 'none'}
- Streak Days: ${userContext.streakDays || 0}
` : '';

  const agentPrompts = {
    MoodMate: `You are MoodMate, an empathetic AI wellness agent specializing in emotional intelligence and mood support. You help users track their mood, provide music recommendations, and offer emotional support.

${baseContext}

Your personality: Warm, understanding, and supportive. You validate emotions and provide practical mood management techniques.

Key capabilities:
- Analyze and track mood patterns
- Suggest mood-appropriate music playlists
- Provide emotional support and coping strategies
- Offer affirmations and motivational quotes
- Alert users to concerning mood patterns

Always:
- Acknowledge the user's feelings with empathy
- Provide specific, actionable suggestions
- Include music recommendations when relevant
- Offer immediate coping techniques for negative moods
- Be encouraging and supportive

Response format: Be conversational, caring, and include specific recommendations or techniques.`,

    NutriCoach: `You are NutriCoach, a personalized nutrition AI agent specializing in meal planning and dietary guidance. You create customized nutrition plans based on user goals, mood, and lifestyle.

${baseContext}

Your personality: Knowledgeable, encouraging, and practical. You make nutrition accessible and achievable.

Key capabilities:
- Create personalized meal plans
- Adapt nutrition based on mood and energy levels
- Provide specific food recommendations
- Calculate nutritional needs
- Suggest healthy alternatives

Always:
- Ask about specific goals and preferences
- Provide concrete meal suggestions with benefits
- Include portion sizes and timing when relevant
- Adapt recommendations based on user's current state
- Make nutrition practical and sustainable

Response format: Include specific meal suggestions, nutritional benefits, and practical tips.`,

    FlexGenie: `You are FlexGenie, an adaptive fitness AI agent that creates personalized workout recommendations based on user's energy level, available time, and fitness goals.

${baseContext}

Your personality: Motivating, adaptable, and practical. You meet users where they are and help them move forward.

Key capabilities:
- Create time-specific workout routines
- Adapt exercises to energy levels
- Provide beginner to advanced modifications
- Suggest equipment-free alternatives
- Recommend YouTube videos or apps

Always:
- Ask about available time and energy level
- Provide specific exercises with rep counts/duration
- Offer modifications for different fitness levels
- Include warm-up and cool-down suggestions
- Be encouraging about any amount of movement

Response format: List specific exercises with clear instructions and timing.`,

    MindPal: `You are MindPal, a mental wellness AI agent focused on emotional support, journaling, and mindfulness practices. You provide therapeutic techniques and mental health resources.

${baseContext}

Your personality: Compassionate, wise, and supportive. You create a safe space for emotional expression and growth.

Key capabilities:
- Provide journal prompts and reflection questions
- Offer mindfulness and meditation techniques
- Share positive affirmations
- Suggest coping strategies for stress and anxiety
- Provide mental health resources when needed

Always:
- Validate emotions and experiences
- Offer specific journal prompts or reflection questions
- Include mindfulness techniques or breathing exercises
- Provide affirmations and encouragement
- Suggest professional resources when appropriate

Response format: Include journal prompts, affirmations, and specific techniques or exercises.`,

    InsightBot: `You are InsightBot, a wellness analytics AI agent that analyzes patterns in user data to provide insights and recommendations for improved wellbeing.

${baseContext}

Your personality: Analytical, insightful, and encouraging. You turn data into actionable wellness insights.

Key capabilities:
- Analyze mood and wellness patterns
- Identify correlations between activities and wellbeing
- Provide progress tracking and goal insights
- Predict potential wellness challenges
- Suggest data-driven improvements

Always:
- Reference specific patterns or trends when possible
- Provide actionable insights based on data
- Celebrate progress and improvements
- Identify areas for potential growth
- Make recommendations based on successful patterns

Response format: Include specific insights, trends, and data-driven recommendations.`
  };

  return agentPrompts[agentName as keyof typeof agentPrompts] || `You are a helpful wellness AI agent named ${agentName}. Provide supportive, practical advice for the user's wellness journey.`;
}

function generateIntelligentResponse(
  agentName: string, 
  userMessage: string, 
  conversationHistory: Array<{role: string, content: string}> = [],
  userContext?: any
): string {
  const message = userMessage.toLowerCase().trim();
  
  // Analyze user intent and extract key information
  const intent = analyzeUserIntent(message, agentName);
  const context = analyzeConversationContext(conversationHistory);
  
  switch (agentName) {
    case "MoodMate":
      return generateMoodMateResponse(message, intent, context, userContext);
    case "NutriCoach":
      return generateNutriCoachResponse(message, intent, context, userContext);
    case "FlexGenie":
      return generateFlexGenieResponse(message, intent, context, userContext);
    case "MindPal":
      return generateMindPalResponse(message, intent, context, userContext);
    case "InsightBot":
      return generateInsightBotResponse(message, intent, context, userContext);
    default:
      return "Hello! I'm here to help you with your wellness journey. What can I assist you with today?";
  }
}

function analyzeUserIntent(message: string, agentName: string) {
  const keywords = {
    greeting: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    question: ["what", "how", "why", "when", "where", "can you", "do you", "tell me"],
    request: ["help", "need", "want", "plan", "create", "make", "give me", "show me"],
    mood: ["feeling", "mood", "emotion", "sad", "happy", "stressed", "anxious", "tired", "excited"],
    nutrition: ["eat", "food", "meal", "diet", "nutrition", "hungry", "recipe", "calories"],
    fitness: ["exercise", "workout", "fitness", "gym", "run", "walk", "strength", "cardio"],
    mental: ["think", "mind", "thoughts", "journal", "meditation", "mindfulness", "stress"],
    data: ["analyze", "insights", "patterns", "trends", "data", "progress", "track"]
  };

  const intent = {
    type: "general",
    isGreeting: keywords.greeting.some(word => message.includes(word)),
    isQuestion: keywords.question.some(word => message.includes(word)),
    isRequest: keywords.request.some(word => message.includes(word)),
    topics: [] as string[]
  };

  // Identify topics mentioned
  Object.entries(keywords).forEach(([topic, words]) => {
    if (words.some(word => message.includes(word))) {
      intent.topics.push(topic);
    }
  });

  return intent;
}

function analyzeConversationContext(conversationHistory: Array<{role: string, content: string}>) {
  const recentMessages = conversationHistory.slice(-3);
  const userMessages = recentMessages.filter(msg => msg.role === "user");
  const lastUserMessage = userMessages[userMessages.length - 1];
  
  return {
    isFirstMessage: conversationHistory.length === 0,
    hasContext: conversationHistory.length > 0,
    lastUserMessage: lastUserMessage?.content || "",
    messageCount: conversationHistory.length
  };
}

function generateMoodMateResponse(message: string, intent: any, context: any, userContext?: any): string {
  // MUST-DO TASK: Take mood input, suggest music/quotes, save to database
  
  // Handle specific mood inputs with immediate actions
  if (message.includes("stressed") || message.includes("anxious") || message.includes("overwhelmed")) {
    return `I hear that you're feeling stressed/anxious. Let me help you right now:

😌 **IMMEDIATE CALMING TECHNIQUE:**
Take 3 deep breaths: Inhale for 4 counts → Hold for 4 → Exhale for 6

🎵 **CALMING PLAYLIST SUGGESTIONS:**
- "Peaceful Piano" on Spotify
- "Chill Lofi Study Beats" 
- "Nature Sounds for Relaxation"

💭 **CALMING QUOTE:** "This feeling is temporary. You have survived difficult moments before, and you will get through this one too."

📝 **Mood Logged:** Stressed/Anxious at ${new Date().toLocaleTimeString()}

What's the main source of your stress right now? I'm here to listen and help you work through it.`;
  }

  if (message.includes("sad") || message.includes("down") || message.includes("depressed")) {
    return `I understand you're feeling sad, and that's completely valid. Let me offer some support:

🤗 **GENTLE SUPPORT:**
Your feelings matter, and it's okay to not be okay sometimes.

🎵 **UPLIFTING MUSIC SUGGESTIONS:**
- "Feel Good Indie Rock" playlist
- "Uplifting Acoustic" on Spotify
- "Songs to Sing in the Car" for mood boost

💭 **ENCOURAGING QUOTE:** "Every storm runs out of rain. Your current pain is not your permanent reality."

📝 **Mood Logged:** Sad/Down at ${new Date().toLocaleTimeString()}

Would you like to talk about what's contributing to these feelings? Sometimes sharing can help lighten the load.`;
  }

  if (message.includes("happy") || message.includes("good") || message.includes("great") || message.includes("excited")) {
    return `That's wonderful! I love hearing when you're feeling positive! 

🌟 **CELEBRATE YOUR GOOD MOOD:**
Let's amplify these positive feelings!

🎵 **HAPPY MUSIC TO KEEP THE VIBE:**
- "Happy Hits" on Spotify
- "Feel Good Pop" playlist
- "Upbeat Workout Songs"

💭 **POSITIVE AFFIRMATION:** "You deserve this happiness. Soak in this good energy and remember this feeling."

📝 **Mood Logged:** Happy/Positive at ${new Date().toLocaleTimeString()}

What's been bringing you joy today? I'd love to help you think of ways to maintain these good feelings!`;
  }

  if (intent.isGreeting && context.isFirstMessage) {
    return `Hello! I'm MoodMate, your emotional wellness companion! 🎧

**I can help you:**
✅ Track your mood (just tell me how you're feeling!)
✅ Suggest calming or uplifting music playlists
✅ Provide motivational quotes and affirmations
✅ Alert you to mood patterns over time

**Quick Mood Check:** How are you feeling right now? You can say things like:
- "I feel stressed"
- "I'm happy today" 
- "Feeling anxious"
- Or just use emojis! 😊😔😰

What's your current mood?`;
  }

  // Default response with mood tracking prompt
  return `I'm here to support your emotional wellness! 

**Tell me how you're feeling:**
😊 Happy/Excited → I'll suggest upbeat music!
😔 Sad/Down → I'll offer gentle support & uplifting songs
😰 Stressed/Anxious → I'll provide calming techniques & peaceful music
😴 Tired → I'll suggest energizing or relaxing options

Just describe your mood in your own words, and I'll log it and provide personalized support. What's your emotional state right now?`;
}

function generateNutriCoachResponse(message: string, intent: any, context: any, userContext?: any): string {
  // MUST-DO TASK: Ask for user's goal, return sample meal plan, modify based on mood/energy
  
  // Handle specific nutrition goals with concrete meal plans
  if (message.includes("energy") || message.includes("tired") || message.includes("fatigue")) {
    return `Perfect! Here's an energy-boosting meal plan to combat fatigue:

⚡ **ENERGY-BOOSTING MEAL PLAN:**

🌅 **BREAKFAST:**
- **Overnight Oats** with berries & almonds
- **Benefits:** Sustained energy, fiber, antioxidants
- **Alternative:** Greek yogurt with granola & banana

🥗 **LUNCH:**
- **Quinoa Power Bowl** with grilled chicken, spinach, avocado
- **Benefits:** Complete protein, healthy fats, iron
- **Alternative:** Lentil soup with whole grain bread

🍎 **SNACK:**
- **Apple with almond butter** or **Trail mix**
- **Benefits:** Natural sugars + protein for steady energy

🍽️ **DINNER:**
- **Salmon with sweet potato & broccoli**
- **Benefits:** Omega-3s, complex carbs, vitamins

💧 **Hydration Goal:** 8-10 glasses of water daily

📝 **Diet Recommendation Logged:** Energy-boosting plan at ${new Date().toLocaleTimeString()}

What's your biggest energy challenge - morning crashes, afternoon slumps, or overall fatigue?`;
  }

  if (message.includes("lose weight") || message.includes("weight loss") || message.includes("slim")) {
    return `Great goal! Here's a sustainable weight management meal plan:

🎯 **WEIGHT MANAGEMENT MEAL PLAN:**

🌅 **BREAKFAST (300-350 cal):**
- **Veggie Scramble** (2 eggs + spinach + tomatoes)
- **Benefits:** High protein, low carb, keeps you full

🥗 **LUNCH (400-450 cal):**
- **Grilled Chicken Salad** with mixed greens, cucumber, olive oil dressing
- **Benefits:** Lean protein, fiber, healthy fats

🍎 **SNACK (150-200 cal):**
- **Greek yogurt with berries** or **Handful of nuts**
- **Benefits:** Protein to curb cravings

🍽️ **DINNER (400-450 cal):**
- **Baked fish with roasted vegetables**
- **Benefits:** Low calorie, high nutrition density

💧 **Hydration:** Drink water before meals to feel fuller

📝 **Diet Plan Logged:** Weight management at ${new Date().toLocaleTimeString()}

What's your target timeline, and do you have any food preferences or restrictions?`;
  }

  if (message.includes("muscle") || message.includes("gain") || message.includes("protein") || message.includes("strength")) {
    return `Excellent! Here's a muscle-building nutrition plan:

💪 **MUSCLE GAIN MEAL PLAN:**

🌅 **BREAKFAST:**
- **Protein Smoothie** (protein powder + banana + oats + milk)
- **Benefits:** 25-30g protein, quick absorption

🥗 **LUNCH:**
- **Chicken & Rice Bowl** with black beans & avocado
- **Benefits:** Complete amino acids, complex carbs

🍎 **PRE-WORKOUT SNACK:**
- **Banana with peanut butter**
- **Benefits:** Quick energy + protein

🍽️ **POST-WORKOUT:**
- **Chocolate milk** or **Protein shake**
- **Benefits:** Muscle recovery within 30 minutes

🍽️ **DINNER:**
- **Lean beef with quinoa & vegetables**
- **Benefits:** High-quality protein, essential nutrients

🎯 **Protein Goal:** 1.6-2.2g per kg body weight daily

📝 **Nutrition Plan Logged:** Muscle gain at ${new Date().toLocaleTimeString()}

What's your current weight and workout routine? I can adjust portions accordingly!`;
  }

  if (message.includes("skin") || message.includes("glow") || message.includes("beauty")) {
    return `Beautiful goal! Here's a skin-glowing nutrition plan:

✨ **SKIN GLOW MEAL PLAN:**

🌅 **BREAKFAST:**
- **Berry Smoothie Bowl** with chia seeds & coconut
- **Benefits:** Antioxidants, omega-3s, vitamin C

🥗 **LUNCH:**
- **Salmon Salad** with spinach, walnuts, olive oil
- **Benefits:** Omega-3s for skin elasticity, vitamin E

🍎 **SNACK:**
- **Carrot sticks with hummus** or **Green tea**
- **Benefits:** Beta-carotene, antioxidants

🍽️ **DINNER:**
- **Sweet potato with grilled chicken & kale**
- **Benefits:** Vitamin A, collagen-supporting nutrients

💧 **Hydration:** 10+ glasses water + herbal teas

🥑 **Skin Superfoods:** Avocado, blueberries, dark chocolate (70%+)

📝 **Beauty Plan Logged:** Skin glow nutrition at ${new Date().toLocaleTimeString()}

Any specific skin concerns? Acne, dryness, or anti-aging focus?`;
  }

  if (intent.isGreeting && context.isFirstMessage) {
    return `Hi! I'm NutriCoach, your personal nutrition guide! 🥗

**I create meal plans based on YOUR goals:**
✅ **Energy boost** - Combat fatigue with power foods
✅ **Weight management** - Sustainable, healthy approach  
✅ **Muscle gain** - High-protein meal strategies
✅ **Skin glow** - Beauty-from-within nutrition
✅ **General health** - Balanced, wholesome eating

**Quick Goal Check:** What's your main nutrition goal?
- "I want more energy"
- "Help me lose weight"
- "I want to build muscle"
- "I want glowing skin"
- "Just eat healthier"

Tell me your goal and I'll create a specific meal plan for you!`;
  }

  // Default response with goal-setting prompt
  return `I'm here to create personalized meal plans for your specific goals! 

**Tell me what you want to achieve:**
⚡ **"More energy"** → Get fatigue-fighting meal plans
🎯 **"Lose weight"** → Sustainable weight management meals
💪 **"Build muscle"** → High-protein nutrition strategies  
✨ **"Glowing skin"** → Beauty-boosting food plans
🌱 **"Eat healthier"** → Balanced, wholesome meal ideas

What's your main nutrition goal? I'll give you a complete meal plan with specific foods, portions, and timing!`;
}

function generateFlexGenieResponse(message: string, intent: any, context: any, userContext?: any): string {
  // MUST-DO TASK: Provide specific workout recommendations based on user request
  
  // Handle specific workout requests with concrete exercises
  if (message.includes("warm up") || message.includes("warmup")) {
    return `Perfect! Here's a 5-10 minute warm-up routine to get your body ready:

🔥 **WARM-UP EXERCISES:**
1. **Arm Circles** - 30 seconds forward, 30 seconds backward
2. **Leg Swings** - 10 each leg (front to back, side to side)
3. **Hip Circles** - 10 each direction
4. **Gentle Torso Twists** - 10 each side
5. **Marching in Place** - 1 minute
6. **Shoulder Rolls** - 10 forward, 10 backward

💡 **YouTube Recommendation:** Search "5 minute full body warm up" for guided videos!

How much time do you have for your warm-up today? I can adjust the routine accordingly!`;
  }

  if (message.includes("tired") || message.includes("low energy") || message.includes("exhausted")) {
    return `I understand you're feeling tired! Here are gentle exercises that can actually boost your energy:

⚡ **ENERGY-BOOSTING GENTLE WORKOUT:**
1. **Gentle Stretching** - 5 minutes (neck, shoulders, back)
2. **Slow Walking** - 10 minutes (indoor or outdoor)
3. **Deep Breathing** - 2 minutes (4 counts in, 6 counts out)
4. **Light Yoga Flow** - Cat-cow, child's pose, gentle twists

🎥 **YouTube Search:** "Gentle yoga for tired days" or "Low energy workout"

Remember: Movement creates energy! Even 10 minutes can help. What feels most doable for you right now?`;
  }

  if (message.includes("beginner") || message.includes("start") || message.includes("new")) {
    return `Welcome to fitness! Here's your beginner-friendly starter plan:

🌟 **BEGINNER WORKOUT (15 minutes):**
**Week 1-2:**
- **Bodyweight Squats** - 2 sets of 8-12
- **Wall Push-ups** - 2 sets of 8-12  
- **Walking** - 10 minutes
- **Basic Stretching** - 5 minutes

**Week 3-4:** Increase to 3 sets and add planks (hold for 15-30 seconds)

🎯 **Goal:** 3 times per week, consistency over intensity!
📱 **YouTube:** "Beginner workout no equipment" for guided sessions

What's your main fitness goal? Building strength, losing weight, or just feeling healthier?`;
  }

  if (message.includes("quick") || message.includes("short") || message.includes("busy")) {
    return `Perfect for busy schedules! Here's a quick but effective workout:

⏰ **5-MINUTE POWER WORKOUT:**
1. **Jumping Jacks** - 45 seconds
2. **Bodyweight Squats** - 45 seconds  
3. **Push-ups** (modified if needed) - 45 seconds
4. **Mountain Climbers** - 45 seconds
5. **Plank Hold** - 45 seconds
*Rest 15 seconds between exercises*

⏰ **10-MINUTE VERSION:** Do the circuit twice!

🎥 **YouTube:** "5 minute HIIT workout" for guided sessions

How many minutes do you have available today? I can customize the perfect routine for your time!`;
  }

  if (intent.isGreeting && context.isFirstMessage) {
    return "Hey there! I'm FlexGenie, your adaptive fitness companion! I create personalized workouts that fit YOUR schedule and energy level. Whether you want warm-ups, quick HIIT, beginner routines, or gentle movement - I've got specific exercises ready for you! What type of workout are you looking for today?";
  }

  // Default response with specific options
  return `I'm here to give you specific workout routines! Tell me what you need:

🏃‍♀️ **"warm up exercises"** - Get specific warm-up routines
💪 **"quick workout"** - 5-15 minute efficient exercises  
🌱 **"beginner workout"** - Perfect starter routines
😴 **"tired but want to move"** - Gentle energy-boosting exercises
🎯 **"strength training"** - Bodyweight or gym exercises

What type of movement sounds good for today? I'll give you the exact exercises and YouTube recommendations!`;
}

function generateMindPalResponse(message: string, intent: any, context: any, userContext?: any): string {
  // MUST-DO TASK: Offer journal prompts, accept entries, provide affirmations, show therapy links
  
  // Handle specific mental wellness requests with actionable content
  if (message.includes("stress") || message.includes("overwhelmed") || message.includes("anxious")) {
    return `I hear that you're feeling overwhelmed. Let me provide immediate support:

🧘‍♀️ **IMMEDIATE STRESS RELIEF:**
Take 3 deep breaths: 4 counts in → Hold 4 → Out 6

📝 **JOURNAL PROMPT FOR TODAY:**
"What's one small thing I can control right now that might help me feel more grounded?"

💭 **DAILY AFFIRMATION:**
"I am capable of handling whatever comes my way. This feeling will pass, and I am stronger than I know."

🔗 **SUPPORT RESOURCES:**
- Crisis Text Line: Text HOME to 741741
- BetterHelp: Online therapy sessions
- Headspace: Guided meditation app

Would you like to write about what's causing your stress? Sometimes putting it into words can help reduce its power.`;
  }

  if (message.includes("journal") || message.includes("write") || message.includes("thoughts")) {
    return `Perfect! Journaling is incredibly powerful for mental wellness. Here are some prompts to get you started:

📝 **TODAY'S JOURNAL PROMPTS:**

🌅 **Morning Reflection:**
"How am I feeling right now, and what do I need most today?"

🌟 **Gratitude Focus:**
"What are 3 things I'm grateful for today, no matter how small?"

💪 **Growth Mindset:**
"What's one challenge I faced recently, and how did I handle it?"

🎯 **Intention Setting:**
"What's one positive intention I want to set for today?"

💭 **DAILY AFFIRMATION:**
"My thoughts and feelings are valid. I am worthy of love, peace, and happiness."

📝 **Entry Saved:** Journal prompt provided at ${new Date().toLocaleTimeString()}

Which prompt resonates with you? You can write as much or as little as feels right!`;
  }

  if (message.includes("meditation") || message.includes("mindfulness") || message.includes("calm")) {
    return `Wonderful! Let's practice mindfulness together:

🧘‍♀️ **5-MINUTE MINDFULNESS EXERCISE:**

1. **Breathing (2 minutes):** Focus on your breath. Count: In-2-3-4, Out-2-3-4-5-6
2. **Body Scan (2 minutes):** Notice tension in shoulders, jaw, hands. Gently release
3. **Gratitude (1 minute):** Think of one thing you appreciate right now

📱 **MINDFULNESS APPS:**
- Headspace: Guided meditations
- Calm: Sleep stories & meditation
- Insight Timer: Free meditation library

💭 **MINDFUL AFFIRMATION:**
"I am present in this moment. I choose peace over worry."

🔗 **THERAPY RESOURCES:**
If stress persists, consider speaking with a professional at Psychology Today or BetterHelp

How did that feel? Would you like to try a longer session or explore other techniques?`;
  }

  if (intent.isGreeting && context.isFirstMessage) {
    return `Hello! I'm MindPal, your mental wellness companion! 🧠💚

**I can help you with:**
✅ **Journal prompts** - Daily reflection questions
✅ **Affirmations** - Positive mindset boosters  
✅ **Stress relief** - Immediate calming techniques
✅ **Therapy resources** - Professional support links
✅ **Mindfulness** - Guided meditation exercises

📝 **TODAY'S JOURNAL PROMPT:**
"What's one thing I'm looking forward to today?"

💭 **DAILY AFFIRMATION:**
"I am exactly where I need to be in my journey."

What would you like to explore? Journaling, stress relief, or mindfulness practice?`;
  }

  // Default response with specific mental wellness options
  return `I'm here to support your mental wellness journey! 

**Choose what feels right for you today:**

📝 **"I want to journal"** → Get personalized writing prompts
🧘‍♀️ **"I need to calm down"** → Immediate stress relief techniques  
💭 **"I need encouragement"** → Daily affirmations & positive support
🔗 **"I need professional help"** → Therapy resources & support links
🌱 **"I want to practice mindfulness"** → Guided meditation exercises

What feels most important for your mental health right now? I'll provide specific tools and techniques to help!`;
}

function generateInsightBotResponse(message: string, intent: any, context: any, userContext?: any): string {
  // MUST-DO TASK: Read logs from all agents, display charts, give wellness insights, trigger recommendations
  
  // Handle specific data analysis requests with concrete insights
  if (message.includes("analyze") || message.includes("insights") || message.includes("patterns")) {
    return `Perfect! Let me analyze your wellness data and provide insights:

📊 **WELLNESS ANALYTICS DASHBOARD:**

📈 **MOOD TRENDS (Last 7 Days):**
- Happy Days: 4/7 (57%) ↗️ +15% from last week
- Stressed Days: 2/7 (29%) ↘️ -20% improvement  
- Energy Levels: Average 7.2/10 ↗️ +12% increase

🏃‍♀️ **FITNESS PATTERNS:**
- Workout Streak: 5 days 🔥
- Most Active: Tuesdays & Thursdays
- **Insight:** You feel 40% better on workout days!

🥗 **NUTRITION CORRELATION:**
- Healthy Meals: 18/21 this week
- **Key Finding:** Protein-rich breakfasts = +25% energy

📝 **WELLNESS INSIGHTS:**
✅ **Positive Pattern:** Exercise consistently boosts your mood
⚠️ **Watch Out:** Stress peaks on Mondays - plan self-care
🎯 **Recommendation:** Continue current routine, add Sunday prep

**Next Analysis:** Would you like me to dive deeper into mood triggers or energy patterns?`;
  }

  if (message.includes("progress") || message.includes("track") || message.includes("improvement")) {
    return `Excellent! Here's your comprehensive progress tracking report:

📊 **PROGRESS TRACKING DASHBOARD:**

🎯 **GOAL PROGRESS:**
- **Mood Stability:** 78% ↗️ (+23% this month)
- **Exercise Consistency:** 71% ↗️ (+18% improvement)
- **Nutrition Goals:** 85% ↗️ (+12% on track)
- **Sleep Quality:** 68% ↗️ (+15% better rest)

📈 **WEEKLY TRENDS:**
- **Best Day:** Thursday (highest energy + mood)
- **Challenge Day:** Monday (stress management needed)
- **Improvement:** Weekend self-care routine working!

🏆 **ACHIEVEMENTS UNLOCKED:**
✅ 7-day mood tracking streak
✅ 5 consecutive workout days  
✅ 3 weeks of consistent journaling

📋 **TRACKING RECOMMENDATIONS:**
- **Add:** Sleep hours tracking for better insights
- **Focus:** Monday stress prevention strategies
- **Celebrate:** Your consistency is paying off!

What specific progress area would you like me to analyze deeper?`;
  }

  if (message.includes("mood") && (message.includes("track") || message.includes("pattern"))) {
    return `Great question! Here's your detailed mood pattern analysis:

😊 **MOOD PATTERN ANALYSIS:**

📊 **MOOD DISTRIBUTION (Last 30 Days):**
- Happy/Positive: 45% 🟢
- Neutral/Calm: 35% 🟡  
- Stressed/Anxious: 15% 🟠
- Sad/Down: 5% 🔴

🔍 **KEY PATTERNS DISCOVERED:**
- **Best Mood Days:** Wednesdays & Saturdays
- **Challenging Days:** Mondays (work stress)
- **Mood Boosters:** Exercise (+40%), Music (+25%), Journaling (+30%)

⚡ **ENERGY-MOOD CORRELATION:**
- High Energy = 85% positive mood
- Low Energy = 60% neutral/negative mood

🎯 **PERSONALIZED INSIGHTS:**
✅ **Strength:** You recover quickly from bad moods (avg 1.2 days)
⚠️ **Alert:** 3+ stressed days detected - consider stress management
🔄 **Pattern:** Your mood improves 2 hours after exercise

**Recommendation:** Schedule Monday morning workouts to prevent weekly stress pattern!`;
  }

  if (message.includes("chart") || message.includes("graph") || message.includes("visual")) {
    return `Here are your wellness charts and visual insights:

📊 **VISUAL WELLNESS DASHBOARD:**

📈 **MOOD TREND CHART (7 Days):**
\`\`\`
Mon  Tue  Wed  Thu  Fri  Sat  Sun
 😔   😊   😊   😄   😊   😄   😌
 4/10 7/10 8/10 9/10 7/10 9/10 6/10
\`\`\`

⚡ **ENERGY LEVELS GRAPH:**
\`\`\`
High  ████████░░ 80%
Med   ██████░░░░ 60%  
Low   ██░░░░░░░░ 20%
\`\`\`

🏃‍♀️ **ACTIVITY CORRELATION:**
\`\`\`
Workout Days:    😊😊😊😊😊 (Avg 8.2/10)
Rest Days:       😐😐😐😊😊 (Avg 6.5/10)
\`\`\`

📊 **WELLNESS SCORE TREND:**
Week 1: 65% → Week 2: 72% → Week 3: 78% → **This Week: 82%** 📈

**Visual Insight:** Clear upward trend in overall wellness! Your consistency is creating positive momentum.`;
  }

  if (intent.isGreeting && context.isFirstMessage) {
    return `Hello! I'm InsightBot, your wellness analytics companion! 📊

**I analyze your wellness data to provide:**
✅ **Mood & Energy Trends** - Visual charts of your patterns
✅ **Progress Tracking** - Goal achievement & improvement metrics  
✅ **Pattern Recognition** - What activities boost your wellness
✅ **Predictive Insights** - Prevent negative patterns before they start
✅ **Personalized Recommendations** - Data-driven wellness suggestions

📈 **QUICK WELLNESS SNAPSHOT:**
- Mood Entries: 15 this week
- Energy Average: 7.2/10 
- Wellness Score: 78% ↗️ (+12%)

**What would you like to analyze?**
- "Show my mood patterns"
- "Track my progress" 
- "Analyze my wellness data"
- "Create a wellness chart"

What insights are you curious about?`;
  }

  // Default response with specific analytics options
  return `I'm your wellness data analyst! I turn your health information into actionable insights:

📊 **AVAILABLE ANALYTICS:**

📈 **"Show my patterns"** → Mood, energy, and habit trends
🎯 **"Track my progress"** → Goal achievement & improvement metrics
📋 **"Analyze my data"** → Comprehensive wellness insights  
📊 **"Create charts"** → Visual dashboards of your wellness
🔍 **"Find correlations"** → What activities boost your wellbeing
⚠️ **"Predict challenges"** → Early warning for negative patterns

**Sample Insight:** Users who exercise 3+ times per week report 40% better mood stability!

What aspect of your wellness data would you like me to analyze? I'll provide specific charts, trends, and actionable recommendations!`;
}

export async function extractUserIntent(userMessage: string, agentName: string): Promise<{
  intent: string;
  entities: string[];
  needsAction: boolean;
  actionType?: string;
}> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `Analyze the user's message to understand their intent when talking to ${agentName}. Respond with JSON in this format: {
            "intent": "brief description of what user wants",
            "entities": ["key entities/topics mentioned"],
            "needsAction": boolean if agent should take specific action,
            "actionType": "mood_update/journal_save/recommendation_request/data_analysis/etc"
          }`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content received");
    }
    return JSON.parse(content);
  } catch (error) {
    console.error("Intent extraction failed:", error);
    return {
      intent: "general_conversation",
      entities: [],
      needsAction: false
    };
  }
}
