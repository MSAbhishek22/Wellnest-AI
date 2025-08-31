import axios from 'axios';
import { HfInference } from '@huggingface/inference';

// ===== WELLNEST.AI API CONFIGURATION CENTER =====
// Essential APIs for WellNest.AI Agents

interface APIConfig {
  // Core AI Service (Required)
  groq: {
    apiKey: string;
    baseUrl: string;
  };
  
  // MoodMate Agent APIs
  spotify: {
    clientId: string;
    clientSecret: string;
    baseUrl: string;
  };
  huggingface: {
    apiKey: string;
    models: {
      sentiment: string;
    };
  };
  
  // NutriCoach Agent APIs
  edamam: {
    appId: string;
    appKey: string;
    baseUrl: string;
  };
  
  // FlexGenie Agent APIs
  youtube: {
    apiKey: string;
    baseUrl: string;
  };
  
  // MindPal Agent APIs (uses Groq)
  // InsightBot Agent (uses internal DB)
}

// Initialize API Configuration
const API_CONFIG: APIConfig = {
  // Core AI Service (Required for all agents)
  groq: {
    apiKey: process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '',
    baseUrl: 'https://api.groq.com/openai/v1'
  },
  
  // MoodMate Agent - Music & Sentiment Analysis
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
    baseUrl: 'https://api.spotify.com/v1'
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY || process.env.VITE_HUGGINGFACE_API_KEY || '',
    models: {
      sentiment: 'distilbert-base-uncased-finetuned-sst-2-english'
    }
  },
  
  // NutriCoach Agent - Nutrition & Meal Planning
  edamam: {
    appId: process.env.EDAMAM_APP_ID || '',
    appKey: process.env.EDAMAM_APP_KEY || '',
    baseUrl: 'https://api.edamam.com'
  },
  
  // FlexGenie Agent - Workout Videos
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
    baseUrl: 'https://www.googleapis.com/youtube/v3'
  }
};

// Initialize Hugging Face client
const hf = new HfInference(API_CONFIG.huggingface.apiKey);

// API Status Checker
export class APIStatusChecker {
  static async checkAllAPIs(): Promise<{ [key: string]: boolean }> {
    const status: { [key: string]: boolean } = {};
    
    // Check Core APIs
    status.groq = !!API_CONFIG.groq.apiKey;
    
    // Check MoodMate APIs
    status.spotify = !!(API_CONFIG.spotify.clientId && API_CONFIG.spotify.clientSecret);
    status.huggingface = !!API_CONFIG.huggingface.apiKey;
    
    // Check NutriCoach APIs
    status.edamam = !!(API_CONFIG.edamam.appId && API_CONFIG.edamam.appKey);
    
    // Check FlexGenie APIs
    status.youtube = !!API_CONFIG.youtube.apiKey;
    
    return status;
  }
  
  static logAPIStatus(): void {
    this.checkAllAPIs().then(status => {
      console.log('\n🔌 WellNest.AI API Configuration Status:');
      console.log('  ===== CORE SERVICES =====');
      console.log(`  ${status.groq ? '✅' : '❌'} GROQ: ${status.groq ? 'Configured' : 'Missing API Key'} ${!status.groq ? '(REQUIRED)' : ''}`);
      
      console.log('  ===== AGENT SERVICES =====');
      console.log(`  ${status.spotify ? '✅' : '❌'} SPOTIFY: ${status.spotify ? 'Configured' : 'Missing API Key'} (MoodMate)`);
      console.log(`  ${status.huggingface ? '✅' : '❌'} HUGGINGFACE: ${status.huggingface ? 'Configured' : 'Missing API Key'} (MoodMate)`);
      console.log(`  ${status.edamam ? '✅' : '❌'} EDAMAM: ${status.edamam ? 'Configured' : 'Missing API Key'} (NutriCoach)`);
      console.log(`  ${status.youtube ? '✅' : '❌'} YOUTUBE: ${status.youtube ? 'Configured' : 'Missing API Key'} (FlexGenie)`);
      console.log('');
    });
  }
}

// External API Service for Multi-Agent System
export class ExternalAPIService {
  
  // ===== SPOTIFY API SERVICE =====
  static async getSpotifyAccessToken(): Promise<string | null> {
    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        console.warn('Spotify credentials not configured');
        return null;
      }

      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Spotify token error:', error);
      return null;
    }
  }

  static async getMoodBasedPlaylists(mood: string): Promise<any> {
    try {
      const token = await this.getSpotifyAccessToken();
      if (!token) {
        return this.getFallbackMusicRecommendations(mood);
      }

      const moodQueries = {
        happy: 'happy upbeat energetic',
        sad: 'sad melancholy emotional',
        stressed: 'calm relaxing peaceful',
        anxious: 'chill ambient soothing',
        focused: 'focus concentration instrumental',
        tired: 'energizing motivational uplifting',
        excited: 'party celebration dance'
      };

      const query = moodQueries[mood as keyof typeof moodQueries] || 'chill';
      
      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          q: query,
          type: 'playlist',
          limit: 5
        }
      });

      return {
        playlists: response.data.playlists.items.map((playlist: any) => ({
          name: playlist.name,
          description: playlist.description,
          url: playlist.external_urls.spotify,
          image: playlist.images[0]?.url,
          tracks: playlist.tracks.total
        }))
      };
    } catch (error) {
      console.error('Spotify API error:', error);
      return this.getFallbackMusicRecommendations(mood);
    }
  }

  static getFallbackMusicRecommendations(mood: string) {
    const recommendations = {
      happy: {
        playlists: [
          { name: "Happy Hits", description: "Feel-good tracks to amplify your positive mood", url: "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd", tracks: 50 },
          { name: "Good Vibes", description: "Upbeat songs for good times", url: "https://open.spotify.com/playlist/37i9dQZF1DX9XIFQuFvzM4", tracks: 75 }
        ]
      },
      stressed: {
        playlists: [
          { name: "Peaceful Piano", description: "Calming piano melodies for stress relief", url: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO", tracks: 100 },
          { name: "Deep Focus", description: "Ambient sounds for relaxation", url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ", tracks: 60 }
        ]
      },
      focused: {
        playlists: [
          { name: "Deep Focus", description: "Instrumental music for concentration", url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ", tracks: 180 },
          { name: "Lo-Fi Beats", description: "Chill beats for productivity", url: "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn", tracks: 120 }
        ]
      }
    };

    return recommendations[mood as keyof typeof recommendations] || recommendations.focused;
  }

  // ===== SENTIMENT ANALYSIS SERVICE =====
  static async analyzeSentiment(text: string): Promise<any> {
    try {
      const result = await hf.textClassification({
        model: 'distilbert-base-uncased-finetuned-sst-2-english',
        inputs: text
      });

      return {
        sentiment: result[0]?.label?.toLowerCase() || 'neutral',
        confidence: result[0]?.score || 0.5,
        analysis: result
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        analysis: []
      };
    }
  }

  // ===== EDAMAM NUTRITION API =====
  static async generateMealPlan(preferences: any): Promise<any> {
    try {
      const appId = API_CONFIG.edamam.appId;
      const appKey = API_CONFIG.edamam.appKey;
      
      if (!appId || !appKey) {
        return this.getFallbackMealPlan(preferences);
      }

      // Edamam Recipe Search API with required headers
      const response = await axios.get(`${API_CONFIG.edamam.baseUrl}/api/recipes/v2`, {
        headers: {
          'Edamam-Account-User': 'wellnest-ai-user',
          'Accept': 'application/json'
        },
        params: {
          type: 'public',
          app_id: appId,
          app_key: appKey,
          q: preferences.mealType || 'healthy',
          mealType: preferences.mealType || 'Dinner',
          random: true
        }
      });

      return {
        meals: response.data.hits?.slice(0, 3).map((hit: any) => ({
          id: hit.recipe.uri,
          title: hit.recipe.label,
          readyInMinutes: hit.recipe.totalTime || 30,
          servings: hit.recipe.yield,
          sourceUrl: hit.recipe.url,
          image: hit.recipe.image,
          calories: Math.round(hit.recipe.calories / hit.recipe.yield),
          ingredients: hit.recipe.ingredientLines?.slice(0, 5)
        })) || [],
        nutrients: {
          calories: preferences.targetCalories || 2000,
          protein: 150,
          carbs: 200,
          fat: 65
        }
      };
    } catch (error) {
      console.error('Edamam API error:', error);
      return this.getFallbackMealPlan(preferences);
    }
  }

  static async getRecipeNutrition(ingredients: string[]): Promise<any> {
    try {
      const appId = API_CONFIG.edamam.appId;
      const appKey = API_CONFIG.edamam.appKey;
      
      if (!appId || !appKey) {
        return null;
      }

      // Edamam Nutrition Analysis API
      const response = await axios.post(`${API_CONFIG.edamam.baseUrl}/api/nutrition-details`, {
        ingr: ingredients
      }, {
        params: {
          app_id: appId,
          app_key: appKey
        }
      });

      return {
        calories: response.data.calories,
        totalWeight: response.data.totalWeight,
        nutrients: response.data.totalNutrients,
        healthLabels: response.data.healthLabels,
        dietLabels: response.data.dietLabels
      };
    } catch (error) {
      console.error('Edamam nutrition analysis error:', error);
      return null;
    }
  }

  static getFallbackMealPlan(preferences: any) {
    const moodBasedMeals = {
      energy: [
        { title: "Overnight Oats with Berries", readyInMinutes: 10, servings: 1, benefits: "Sustained energy, fiber, antioxidants" },
        { title: "Quinoa Power Bowl", readyInMinutes: 25, servings: 1, benefits: "Complete protein, healthy fats" },
        { title: "Salmon with Sweet Potato", readyInMinutes: 30, servings: 1, benefits: "Omega-3s, complex carbs" }
      ],
      weight_loss: [
        { title: "Veggie Scramble", readyInMinutes: 15, servings: 1, benefits: "High protein, low carb" },
        { title: "Grilled Chicken Salad", readyInMinutes: 20, servings: 1, benefits: "Lean protein, fiber" },
        { title: "Baked Fish with Vegetables", readyInMinutes: 25, servings: 1, benefits: "Low calorie, high nutrition" }
      ]
    };

    const mealType = preferences.goal || 'energy';
    return {
      meals: moodBasedMeals[mealType as keyof typeof moodBasedMeals] || moodBasedMeals.energy,
      nutrients: { calories: preferences.targetCalories || 2000, protein: 150, carbs: 200, fat: 65 }
    };
  }

  // ===== YOUTUBE DATA API =====
  static async getWorkoutVideos(workoutType: string, duration?: number): Promise<any> {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        return this.getFallbackWorkoutVideos(workoutType);
      }

      const searchQuery = `${workoutType} workout ${duration ? duration + ' minutes' : ''}`;
      
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          key: apiKey,
          q: searchQuery,
          part: 'snippet',
          type: 'video',
          maxResults: 5,
          videoDuration: duration ? (duration <= 4 ? 'short' : duration <= 20 ? 'medium' : 'long') : 'medium'
        }
      });

      return {
        videos: response.data.items.map((video: any) => ({
          id: video.id.videoId,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: video.snippet.thumbnails.medium.url,
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          channel: video.snippet.channelTitle
        }))
      };
    } catch (error) {
      console.error('YouTube API error:', error);
      return this.getFallbackWorkoutVideos(workoutType);
    }
  }

  static getFallbackWorkoutVideos(workoutType: string) {
    const workoutVideos = {
      beginner: [
        { title: "10 Min Beginner Workout", url: "https://youtube.com/watch?v=beginner1", channel: "Fitness Blender" },
        { title: "Full Body Beginner Routine", url: "https://youtube.com/watch?v=beginner2", channel: "HIIT Workouts" }
      ],
      hiit: [
        { title: "15 Min HIIT Workout", url: "https://youtube.com/watch?v=hiit1", channel: "Calisthenic Movement" },
        { title: "Quick HIIT Session", url: "https://youtube.com/watch?v=hiit2", channel: "Fitness Blender" }
      ],
      yoga: [
        { title: "Morning Yoga Flow", url: "https://youtube.com/watch?v=yoga1", channel: "Yoga with Adriene" },
        { title: "Relaxing Evening Yoga", url: "https://youtube.com/watch?v=yoga2", channel: "DoYogaWithMe" }
      ],
      strength: [
        { title: "Bodyweight Strength Training", url: "https://youtube.com/watch?v=strength1", channel: "Athlean-X" },
        { title: "Full Body Strength Workout", url: "https://youtube.com/watch?v=strength2", channel: "Calisthenic Movement" }
      ]
    };

    return {
      videos: workoutVideos[workoutType as keyof typeof workoutVideos] || workoutVideos.beginner
    };
  }

  // ===== HUGGING FACE TEXT GENERATION =====
  static async generateJournalPrompts(mood: string, recentEntries?: string[]): Promise<any> {
    try {
      const context = recentEntries ? `Recent journal themes: ${recentEntries.join(', ')}` : '';
      const prompt = `Generate 3 thoughtful journal prompts for someone feeling ${mood}. ${context} Make them introspective and supportive.`;

      const result = await hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7
        }
      });

      // Parse the generated text into prompts
      const generatedText = result.generated_text || '';
      const prompts = generatedText.split('\n').filter(line => line.trim().length > 10).slice(0, 3);

      return {
        prompts: prompts.length > 0 ? prompts : this.getFallbackJournalPrompts(mood),
        affirmation: this.generateAffirmation(mood)
      };
    } catch (error) {
      console.error('Journal prompt generation error:', error);
      return {
        prompts: this.getFallbackJournalPrompts(mood),
        affirmation: this.generateAffirmation(mood)
      };
    }
  }

  static getFallbackJournalPrompts(mood: string) {
    const prompts = {
      stressed: [
        "What's one small thing I can control right now that might help me feel more grounded?",
        "How can I show myself compassion during this challenging time?",
        "What would I tell a friend who was feeling the way I feel right now?"
      ],
      happy: [
        "What brought me joy today, and how can I create more moments like this?",
        "How has my positive mood affected the people around me?",
        "What am I most grateful for in this moment?"
      ],
      sad: [
        "What do I need most right now to feel supported?",
        "How have I overcome difficult feelings in the past?",
        "What small act of self-care would feel good today?"
      ]
    };

    return prompts[mood as keyof typeof prompts] || prompts.stressed;
  }

  static generateAffirmation(mood: string): string {
    const affirmations = {
      stressed: "I am capable of handling whatever comes my way. This feeling will pass, and I am stronger than I know.",
      happy: "I deserve this happiness. I choose to embrace joy and share my positive energy with others.",
      sad: "My feelings are valid and temporary. I am worthy of love, comfort, and healing.",
      anxious: "I am safe in this moment. I breathe deeply and trust in my ability to navigate uncertainty.",
      focused: "I am present and capable. My mind is clear, and I can accomplish what I set out to do.",
      tired: "I honor my body's need for rest. I am allowed to take breaks and recharge."
    };

    return affirmations[mood as keyof typeof affirmations] || "I am exactly where I need to be in my journey.";
  }

  // ===== THERAPY RESOURCES =====
  static getTherapyResources(): any {
    return {
      crisis: [
        { name: "Crisis Text Line", contact: "Text HOME to 741741", description: "24/7 crisis support" },
        { name: "National Suicide Prevention Lifeline", contact: "988", description: "24/7 suicide prevention" }
      ],
      therapy: [
        { name: "BetterHelp", url: "https://www.betterhelp.com", description: "Online therapy sessions" },
        { name: "Psychology Today", url: "https://www.psychologytoday.com", description: "Find local therapists" },
        { name: "Talkspace", url: "https://www.talkspace.com", description: "Text-based therapy" }
      ],
      apps: [
        { name: "Headspace", description: "Guided meditation and mindfulness" },
        { name: "Calm", description: "Sleep stories and meditation" },
        { name: "Insight Timer", description: "Free meditation library" }
      ]
    };
  }
}
