import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, RotateCcw, MessageCircle } from "lucide-react";
import { useJournalSave, useAgentRecommendations } from "@/hooks/use-agents";

export default function MindPalAgent() {
  const [journalEntry, setJournalEntry] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [, setLocation] = useLocation();
  
  const journalSave = useJournalSave();
  const { data: recommendations } = useAgentRecommendations("MindPal");

  const wellnessSupport = recommendations?.[0]?.content;
  const prompt = wellnessSupport?.journalPrompt || 
    "What small win from today am I most grateful for, and how can I build on it tomorrow?";
  const affirmation = wellnessSupport?.affirmation || 
    "I am capable of achieving my goals with focus and determination.";

  const handleSaveEntry = () => {
    if (journalEntry.trim()) {
      journalSave.mutate({ 
        content: journalEntry,
        prompt 
      });
      setJournalEntry("");
    }
  };

  const handleVoiceNote = () => {
    setIsRecording(!isRecording);
    // TODO: Implement Web Speech API
  };

  return (
    <Card className="agent-card border-pink-200/30 shadow-pink-100/30 hover:shadow-pink-100/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center agent-bounce">
            <span className="text-2xl">💬</span>
          </div>
          <div>
            <h3 className="text-lg font-poppins font-semibold text-gray-900">
              MindPal
            </h3>
            <p className="text-sm text-gray-600">Mental Wellness Support</p>
          </div>
        </div>
        <div className="w-3 h-3 bg-green-400 rounded-full collaboration-pulse"></div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-pink-50/80 rounded-2xl p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Today's Reflection Prompt
          </h4>
          <p className="text-sm text-gray-600 mb-4 italic">
            "{prompt}"
          </p>
          
          <div className="space-y-3">
            <Textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              className="w-full p-3 glassmorphism border border-pink-200/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
              rows={3}
              placeholder="Start writing your thoughts..."
              disabled={journalSave.isPending}
            />
            
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceNote}
                className={`flex items-center space-x-2 text-pink-600 hover:text-pink-700 ${
                  isRecording ? "bg-pink-100" : ""
                }`}
              >
                <Mic size={16} />
                <span>{isRecording ? "Stop recording" : "Voice note"}</span>
              </Button>
              <Button
                onClick={handleSaveEntry}
                disabled={!journalEntry.trim() || journalSave.isPending}
                className="bg-pink-500 hover:bg-pink-600 text-white text-sm"
              >
                {journalSave.isPending ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="glassmorphism rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              Daily Affirmation
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-pink-600 hover:text-pink-700 p-1"
            >
              <RotateCcw size={12} />
            </Button>
          </div>
          <p className="text-sm text-gray-700 text-center font-medium italic">
            "{affirmation}"
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <span>Journal streak: 7 days</span>
            <div className="bg-pink-100 px-2 py-1 rounded-full mt-1 inline-block">
              Responding to mood patterns
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setLocation("/agents")}
            className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 text-xs"
          >
            <MessageCircle size={12} className="mr-1" />
            Chat
          </Button>
        </div>
      </div>
    </Card>
  );
}
