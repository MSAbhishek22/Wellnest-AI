import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle } from "lucide-react";
import { useAgentRecommendations } from "@/hooks/use-agents";

export default function NutriCoachAgent() {
  const [hydrationCount, setHydrationCount] = useState(6);
  const [, setLocation] = useLocation();
  const { data: recommendations } = useAgentRecommendations("NutriCoach");

  const nutritionPlan = recommendations?.[0]?.content;
  const meals = nutritionPlan?.meals || [
    {
      name: "Blueberry Greek Yogurt",
      description: "Rich in antioxidants for focus",
      emoji: "🫐"
    },
    {
      name: "Mixed Nuts & Dark Chocolate", 
      description: "Stress-reducing magnesium",
      emoji: "🥜"
    }
  ];

  const toggleHydration = (index: number) => {
    if (index < hydrationCount) {
      setHydrationCount(index);
    } else {
      setHydrationCount(index + 1);
    }
  };

  return (
    <Card className="agent-card border-green-200/30 shadow-green-100/30 hover:shadow-green-100/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center agent-bounce">
            <span className="text-2xl">🥗</span>
          </div>
          <div>
            <h3 className="text-lg font-poppins font-semibold text-gray-900">
              NutriCoach
            </h3>
            <p className="text-sm text-gray-600">Nutrition Intelligence</p>
          </div>
        </div>
        <div className="w-3 h-3 bg-green-400 rounded-full collaboration-pulse"></div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-green-50/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              Today's Focus Fuel
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Brain Boost Mode
            </span>
          </div>
          
          <div className="space-y-3">
            {meals.map((meal: any, index: number) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-lg">{meal.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{meal.name}</p>
                  <p className="text-xs text-gray-500">{meal.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-green-600 hover:text-green-700"
                >
                  <Plus size={12} className="mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glassmorphism rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Hydration Goal
            </span>
            <span className="text-xs text-gray-500">{hydrationCount}/8 glasses</span>
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: 8 }, (_, i) => (
              <button
                key={i}
                onClick={() => toggleHydration(i)}
                className={`w-4 h-6 rounded-sm transition-colors ${
                  i < hydrationCount ? "bg-blue-300" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <span>Adapted from mood: Focused</span>
            <div className="bg-green-100 px-2 py-1 rounded-full mt-1 inline-block">
              Synced with FlexGenie
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setLocation("/agents")}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs"
          >
            <MessageCircle size={12} className="mr-1" />
            Chat
          </Button>
        </div>
      </div>
    </Card>
  );
}
