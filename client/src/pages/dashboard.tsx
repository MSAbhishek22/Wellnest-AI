import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useUser, useWellnessMetrics } from "@/hooks/use-agents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Brain, 
  Utensils, 
  Dumbbell, 
  BookOpen, 
  TrendingUp,
  Zap,
  Target,
  Award,
  ChevronRight,
  Activity,
  Droplets
} from "lucide-react";
import InsightBotAgent from "@/components/insight-bot-agent";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: user } = useUser();
  const { data: metrics } = useWellnessMetrics();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let timeGreeting = "";
      
      if (hour >= 5 && hour < 12) timeGreeting = "Good morning";
      else if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
      else if (hour >= 17 && hour < 22) timeGreeting = "Good evening";
      else timeGreeting = "Good night";
      
      setGreeting(timeGreeting);
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const quickStats = [
    { label: "Streak", value: user?.streakDays ? `${user.streakDays} days` : "7 days", icon: Award, color: "text-yellow-600" },
    { label: "Energy", value: "85%", icon: Zap, color: "text-green-600" },
    { label: "Focus", value: "4.2h", icon: Target, color: "text-blue-600" },
    { label: "Mood", value: user?.currentMood || "Good", icon: Heart, color: "text-pink-600" }
  ];

  const agentCards = [
    {
      name: "MoodMate",
      description: "Track your emotional wellness",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      path: "/agents"
    },
    {
      name: "NutriCoach", 
      description: "Personalized nutrition guidance",
      icon: Utensils,
      color: "from-green-500 to-emerald-500",
      path: "/agents"
    },
    {
      name: "FlexGenie",
      description: "Adaptive fitness recommendations", 
      icon: Dumbbell,
      color: "from-purple-500 to-violet-500",
      path: "/agents"
    },
    {
      name: "MindPal",
      description: "Mental wellness support",
      icon: Brain,
      color: "from-pink-500 to-purple-500", 
      path: "/agents"
    }
  ];

  return (
    <div className="min-h-screen wellness-gradient">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl"
      >
        <h1 className="text-2xl font-bold mb-1">
          {greeting}, {user?.username || "User"}!
        </h1>
        <p className="text-blue-100 text-sm">
          Ready to continue your wellness journey today?
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center"
              >
                <Icon size={20} className="mx-auto mb-1" />
                <p className="text-xs font-semibold">{stat.value}</p>
                <p className="text-xs text-blue-100">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="p-4 space-y-6">
        {/* Today's Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 glassmorphism">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">Today's Progress</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/insights")}
                className="text-blue-600"
              >
                View All <ChevronRight size={16} />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Daily Goals</span>
                  <span className="font-medium text-foreground">3/5 completed</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Hydration</span>
                  <span className="font-medium text-foreground">6/8 glasses</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* AI Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Your AI Wellness Team</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/agents")}
              className="text-blue-600"
            >
              Chat Now <ChevronRight size={16} />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {agentCards.map((agent, index) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card 
                    className="p-4 glassmorphism cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setLocation(agent.path)}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${agent.color} rounded-2xl flex items-center justify-center mb-3`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{agent.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>
                    <div className="mt-3 flex items-center text-xs text-blue-600">
                      <span>Chat now</span>
                      <ChevronRight size={12} className="ml-1" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 border-0 glassmorphism"
              onClick={() => setLocation("/journal")}
            >
              <BookOpen size={24} className="text-blue-600" />
              <span className="text-xs">Journal</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 border-0 glassmorphism"
              onClick={() => setLocation("/insights")}
            >
              <TrendingUp size={24} className="text-green-600" />
              <span className="text-xs">Insights</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 border-0 glassmorphism"
              onClick={() => setLocation("/profile")}
            >
              <Target size={24} className="text-purple-600" />
              <span className="text-xs">Goals</span>
            </Button>
          </div>
        </motion.div>

        {/* Recent Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <InsightBotAgent />
        </motion.div>
      </div>
    </div>
  );
}
