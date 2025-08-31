import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Calendar, MessageCircle } from "lucide-react";
import { useAgentRecommendations } from "@/hooks/use-agents";

export default function FlexGenieAgent() {
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [, setLocation] = useLocation();
  const { data: recommendations } = useAgentRecommendations("FlexGenie");

  const workoutPlan = recommendations?.[0]?.content;
  const exercises = workoutPlan?.exercises || [
    {
      name: "15-Min Focus Flow Yoga",
      description: "Perfect for afternoon productivity",
      emoji: "🧘‍♀️",
      videoUrl: "https://www.youtube.com/watch?v=v7AYKMP6rOE"
    },
    {
      name: "20-Min Nature Walk",
      description: "Boost creativity & reduce stress", 
      emoji: "🚶‍♀️"
    }
  ];

  return (
    <Card className="agent-card border-purple-200/30 shadow-purple-100/30 hover:shadow-purple-100/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center agent-bounce">
            <span className="text-2xl">🧘</span>
          </div>
          <div>
            <h3 className="text-lg font-poppins font-semibold text-gray-900">
              FlexGenie
            </h3>
            <p className="text-sm text-gray-600">Fitness Intelligence</p>
          </div>
        </div>
        <div className="w-3 h-3 bg-green-400 rounded-full collaboration-pulse"></div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-purple-50/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              Energy-Matched Workout
            </span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Moderate Intensity
            </span>
          </div>
          
          <div className="space-y-3">
            {exercises.map((exercise: any, index: number) => (
              <div key={index} className="glassmorphism rounded-xl p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg">{exercise.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {exercise.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {exercise.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {exercise.videoUrl && (
                      <>
                        <div className="text-red-500">▶</div>
                        <span className="text-xs text-gray-600">
                          {exercise.name.includes("Yoga") ? "Yoga with Adriene" : "Guided Exercise"}
                        </span>
                      </>
                    )}
                    {!exercise.videoUrl && (
                      <span className="text-xs text-gray-600">Outdoor activity</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className={`text-xs ${
                      exercise.videoUrl
                        ? "bg-purple-500 hover:bg-purple-600 text-white"
                        : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                    }`}
                  >
                    {exercise.videoUrl ? (
                      <>
                        <Play size={12} className="mr-1" />
                        Start Now
                      </>
                    ) : (
                      <>
                        <Calendar size={12} className="mr-1" />
                        Schedule
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <span>Adapted for focused mood</span>
            <div className="bg-purple-100 px-2 py-1 rounded-full mt-1 inline-block">
              Synced with MoodMate
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setLocation("/agents")}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 text-xs"
          >
            <MessageCircle size={12} className="mr-1" />
            Chat
          </Button>
        </div>
      </div>
    </Card>
  );
}
