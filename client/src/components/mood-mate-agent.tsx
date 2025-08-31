import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, MessageCircle } from "lucide-react";
import { useMoodUpdate, useAgentRecommendations } from "@/hooks/use-agents";

const moodOptions = [
  { value: "happy", emoji: "😊", label: "Happy" },
  { value: "focused", emoji: "🎯", label: "Focused" },
  { value: "stressed", emoji: "😰", label: "Stressed" },
  { value: "tired", emoji: "😴", label: "Tired" },
];

export default function MoodMateAgent() {
  const [selectedMood, setSelectedMood] = useState("focused");
  const [isPlaying, setIsPlaying] = useState(false);
  const [, setLocation] = useLocation();
  
  const moodUpdate = useMoodUpdate();
  const { data: recommendations } = useAgentRecommendations("MoodMate");

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    moodUpdate.mutate({ mood });
  };

  const musicRec = recommendations?.[0]?.content;

  return (
    <Card className="agent-card border-blue-200/30 shadow-blue-100/30 hover:shadow-blue-100/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center agent-bounce">
            <span className="text-2xl">🎧</span>
          </div>
          <div>
            <h3 className="text-lg font-poppins font-semibold text-gray-900">
              MoodMate
            </h3>
            <p className="text-sm text-gray-600">Emotional Intelligence</p>
          </div>
        </div>
        <div className="w-3 h-3 bg-green-400 rounded-full collaboration-pulse"></div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-blue-50/80 rounded-2xl p-4">
          <p className="text-sm text-gray-700 mb-3">How are you feeling right now?</p>
          <div className="grid grid-cols-4 gap-2">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleMoodSelect(mood.value)}
                className={`mood-button ${
                  selectedMood === mood.value ? "active" : ""
                }`}
                disabled={moodUpdate.isPending}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <p className="text-xs text-gray-600 mt-1">{mood.label}</p>
              </button>
            ))}
          </div>
        </div>
        
        {musicRec && (
          <div className="glassmorphism rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Recommended Playlist
              </span>
              <div className="text-green-500">♪</div>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              {musicRec.playlist || "Focus Flow - Deep Work Vibes"}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 bg-green-500 hover:bg-green-600 p-0"
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              </Button>
              <div className="flex-1 bg-gray-200 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full w-1/3"></div>
              </div>
              <span className="text-xs text-gray-500">3:45</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <span>Mood tracked {moodUpdate.isPending ? "updating..." : "2 min ago"}</span>
            <div className="bg-blue-100 px-2 py-1 rounded-full mt-1 inline-block">
              Collaborating with NutriCoach
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setLocation("/agents")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs"
          >
            <MessageCircle size={12} className="mr-1" />
            Chat
          </Button>
        </div>
      </div>
    </Card>
  );
}
