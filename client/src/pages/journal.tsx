import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Save, Search, Calendar, Heart, Brain, Star, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useJournalSave } from "@/hooks/use-agents";

const journalPrompts = [
  "What three things am I grateful for today?",
  "How did I take care of my mental health today?", 
  "What challenge did I overcome recently?",
  "What made me smile or laugh today?",
  "How did I show kindness to myself or others?",
  "What am I looking forward to tomorrow?",
  "What lesson did I learn today?",
  "How did I honor my body's needs today?"
];

const moodEmojis = [
  { emoji: "😊", label: "Happy", color: "bg-yellow-100 text-yellow-800" },
  { emoji: "😌", label: "Peaceful", color: "bg-green-100 text-green-800" },
  { emoji: "🎯", label: "Focused", color: "bg-blue-100 text-blue-800" },
  { emoji: "😰", label: "Stressed", color: "bg-red-100 text-red-800" },
  { emoji: "😴", label: "Tired", color: "bg-gray-100 text-gray-800" },
  { emoji: "🤔", label: "Reflective", color: "bg-purple-100 text-purple-800" }
];

export default function Journal() {
  const [journalEntry, setJournalEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [location, setLocation] = useLocation();
  
  const journalSave = useJournalSave();

  const handleSaveEntry = () => {
    if (!journalEntry.trim()) return;
    
    const entryWithMood = selectedMood 
      ? `Mood: ${selectedMood}\n\n${journalEntry}`
      : journalEntry;
      
    journalSave.mutate({ content: entryWithMood });
    setJournalEntry("");
    setSelectedMood("");
    setSelectedPrompt("");
  };

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
    setJournalEntry(prev => prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`);
  };

  // Mock journal entries for display
  const mockEntries = [
    {
      id: 1,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      mood: "Happy",
      content: "Had a wonderful day at the park. The weather was perfect and I felt so grateful for the simple moments of peace.",
      tags: ["gratitude", "nature", "peace"]
    },
    {
      id: 2,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      mood: "Focused",
      content: "Completed my morning meditation and felt really centered. The breathing exercises are helping me stay calm during stressful meetings.",
      tags: ["meditation", "work", "mindfulness"]
    },
    {
      id: 3,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      mood: "Reflective",
      content: "Thinking about my goals and how far I've come. Sometimes progress feels slow, but looking back I can see real growth.",
      tags: ["goals", "growth", "reflection"]
    }
  ];

  return (
    <div className="min-h-screen wellness-gradient">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Journal Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Button 
              onClick={() => setLocation('/dashboard')}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Journal</h1>
            <p className="text-muted-foreground">Capture your thoughts and track your wellness journey</p>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Writing Area */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="border border-border bg-card p-6 mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                New Journal Entry
              </h2>
              
              {/* Mood Selector */}
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  How are you feeling?
                </label>
                <div className="flex flex-wrap gap-2">
                  {moodEmojis.map((mood, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMood(mood.label)}
                      className={`px-3 py-2 rounded-full text-sm border transition-all ${
                        selectedMood === mood.label
                          ? `${mood.color} dark:bg-purple-900/50 dark:text-purple-200 border-current dark:border-purple-400`
                          : 'bg-white dark:bg-white/10 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-white/90 dark:hover:bg-white/20 text-foreground'
                      }`}
                    >
                      {mood.emoji} {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Prompt Display */}
              {selectedPrompt && (
                <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    <strong>Prompt:</strong> {selectedPrompt}
                  </p>
                </div>
              )}
              
              {/* Text Area */}
              <Textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="Start writing your thoughts..."
                className="min-h-[300px] mb-4 resize-none"
              />
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {journalEntry.length} characters
                </div>
                <Button 
                  onClick={handleSaveEntry}
                  disabled={!journalEntry.trim() || journalSave.isPending}
                  className="bg-purple-500 hover:bg-purple-600 flex items-center gap-2"
                >
                  <Save size={16} />
                  {journalSave.isPending ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Journal Prompts */}
            <Card className="border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Brain size={18} />
                Writing Prompts
              </h3>
              <div className="space-y-2">
                {journalPrompts.slice(0, 4).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptSelect(prompt)}
                    className="w-full text-left p-2 text-sm bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 rounded-lg border border-gray-200 dark:border-gray-600 transition-all text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </Card>

            {/* Search */}
            <Card className="border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Search size={18} />
                Search Entries
              </h3>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your journal..."
                className="w-full"
              />
            </Card>

            {/* Stats */}
            <Card className="border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Star size={18} />
                Your Progress
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Entries this week</span>
                  <Badge variant="secondary">5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Writing streak</span>
                  <Badge variant="secondary">12 days</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Most common mood</span>
                  <Badge className="bg-blue-100 text-blue-800">🎯 Focused</Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent Entries */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Card className="border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Recent Entries
            </h2>
            
            <div className="space-y-4">
              {mockEntries.map((entry) => (
                <div key={entry.id} className="bg-white/50 dark:bg-white/10 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {entry.date.toDateString()}
                      </span>
                      <Badge className={moodEmojis.find(m => m.label === entry.mood)?.color || "bg-gray-100"}>
                        {moodEmojis.find(m => m.label === entry.mood)?.emoji} {entry.mood}
                      </Badge>
                    </div>
                    <Heart size={16} className="text-muted-foreground hover:text-red-500 cursor-pointer" />
                  </div>
                  
                  <p className="text-sm text-foreground mb-3 line-clamp-3">
                    {entry.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
