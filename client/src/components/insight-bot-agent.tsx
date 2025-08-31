import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, MessageCircle } from "lucide-react";
import { useInsights } from "@/hooks/use-agents";

export default function InsightBotAgent() {
  const [, setLocation] = useLocation();
  const { data: insightData } = useInsights();
  
  const insights = insightData?.insights;
  const trends = insights?.trends || [
    { metric: "Energy Levels", change: 12, direction: "up" },
    { metric: "Focus Time", change: 8, direction: "up" },
    { metric: "Stress Levels", change: -15, direction: "down" }
  ];
  
  const suggestions = insights?.suggestions || [
    "Your afternoon workouts boost evening mood by 23%",
    "Journaling correlates with better sleep quality"
  ];

  return (
    <Card className="agent-card border-indigo-200/30 shadow-indigo-100/30 hover:shadow-indigo-100/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center agent-bounce">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="text-lg font-poppins font-semibold text-foreground">
              InsightBot
            </h3>
            <p className="text-sm text-muted-foreground">Analytics & Insights</p>
          </div>
        </div>
        <div className="w-3 h-3 bg-green-400 rounded-full collaboration-pulse"></div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-indigo-50/80 rounded-2xl p-4">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Weekly Wellness Trends
          </h4>
          
          <div className="space-y-3">
            {(trends || []).map((trend: any, index: number) => {
              const colors = {
                "Energy Levels": "bg-green-400",
                "Focus Time": "bg-blue-400", 
                "Stress Levels": "bg-purple-400"
              };
              
              const progressValue = Math.abs(trend.change) * 2; // Scale for visibility
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${colors[trend.metric as keyof typeof colors] || "bg-gray-400"} rounded-full`}></div>
                    <span className="text-sm text-muted-foreground">{trend.metric}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={progressValue} 
                      className="w-16 h-2" 
                    />
                    <div className="flex items-center">
                      {trend.direction === "up" ? (
                        <TrendingUp size={12} className="text-green-600" />
                      ) : (
                        <TrendingDown size={12} className="text-red-600" />
                      )}
                      <span className={`text-xs ml-1 ${
                        trend.direction === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        {trend.change > 0 ? "+" : ""}{trend.change}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="glassmorphism rounded-2xl p-4">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Smart Suggestions
          </h4>
          <div className="space-y-2">
            {suggestions.map((suggestion: string, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                <p className="text-sm text-muted-foreground">
                  {typeof suggestion === 'string' ? suggestion : JSON.stringify(suggestion)}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <span>Last analysis: 5 min ago</span>
            <div className="bg-indigo-100 px-2 py-1 rounded-full mt-1 inline-block">
              Cross-agent insights
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setLocation("/agents")}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 text-xs"
          >
            <MessageCircle size={12} className="mr-1" />
            Chat
          </Button>
        </div>
      </div>
    </Card>
  );
}
