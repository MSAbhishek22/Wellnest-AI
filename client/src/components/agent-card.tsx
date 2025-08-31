import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  name: string;
  role: string;
  emoji: string;
  isActive?: boolean;
  children: React.ReactNode;
  colorScheme?: "blue" | "green" | "purple" | "pink" | "indigo";
  className?: string;
}

const colorSchemes = {
  blue: {
    gradient: "from-blue-400 to-blue-600",
    border: "border-blue-200/30",
    shadow: "shadow-blue-100/30 hover:shadow-blue-100/50",
    bg: "bg-blue-50/80"
  },
  green: {
    gradient: "from-green-400 to-green-600", 
    border: "border-green-200/30",
    shadow: "shadow-green-100/30 hover:shadow-green-100/50",
    bg: "bg-green-50/80"
  },
  purple: {
    gradient: "from-purple-400 to-purple-600",
    border: "border-purple-200/30", 
    shadow: "shadow-purple-100/30 hover:shadow-purple-100/50",
    bg: "bg-purple-50/80"
  },
  pink: {
    gradient: "from-pink-400 to-pink-600",
    border: "border-pink-200/30",
    shadow: "shadow-pink-100/30 hover:shadow-pink-100/50", 
    bg: "bg-pink-50/80"
  },
  indigo: {
    gradient: "from-indigo-400 to-indigo-600",
    border: "border-indigo-200/30",
    shadow: "shadow-indigo-100/30 hover:shadow-indigo-100/50",
    bg: "bg-indigo-50/80"
  }
};

export default function AgentCard({
  name,
  role,
  emoji,
  isActive = true,
  children,
  colorScheme = "blue",
  className
}: AgentCardProps) {
  const colors = colorSchemes[colorScheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
    >
      <Card className={cn(
        "agent-card transition-all duration-300",
        colors.border,
        colors.shadow,
        className
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div 
              className={cn(
                "w-12 h-12 bg-gradient-to-br rounded-2xl flex items-center justify-center",
                colors.gradient
              )}
              animate={{ rotateY: [0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-2xl">{emoji}</span>
            </motion.div>
            <div>
              <h3 className="text-lg font-poppins font-semibold text-gray-900">
                {name}
              </h3>
              <p className="text-sm text-gray-600">{role}</p>
            </div>
          </div>
          
          <motion.div 
            className={cn(
              "w-3 h-3 rounded-full",
              isActive ? "bg-green-400 collaboration-pulse" : "bg-gray-300"
            )}
            animate={isActive ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        
        <div className="space-y-4">
          {children}
        </div>
        
        {/* Agent Status Badge */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <Badge 
            variant="secondary" 
            className={cn("text-xs", colors.bg)}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
          <span className="text-xs text-gray-500">
            Last update: {new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute:'2-digit' 
            })}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}

// Specific agent card variants for easy use
export function MoodMateCard({ children }: { children: React.ReactNode }) {
  return (
    <AgentCard
      name="MoodMate"
      role="Emotional Intelligence"
      emoji="🎧"
      colorScheme="blue"
    >
      {children}
    </AgentCard>
  );
}

export function NutriCoachCard({ children }: { children: React.ReactNode }) {
  return (
    <AgentCard
      name="NutriCoach"
      role="Nutrition Intelligence"
      emoji="🥗"
      colorScheme="green"
    >
      {children}
    </AgentCard>
  );
}

export function FlexGenieCard({ children }: { children: React.ReactNode }) {
  return (
    <AgentCard
      name="FlexGenie"
      role="Fitness Intelligence"
      emoji="🧘"
      colorScheme="purple"
    >
      {children}
    </AgentCard>
  );
}

export function MindPalCard({ children }: { children: React.ReactNode }) {
  return (
    <AgentCard
      name="MindPal"
      role="Mental Wellness Support"
      emoji="💬"
      colorScheme="pink"
    >
      {children}
    </AgentCard>
  );
}

export function InsightBotCard({ children }: { children: React.ReactNode }) {
  return (
    <AgentCard
      name="InsightBot"
      role="Analytics & Insights"
      emoji="📊"
      colorScheme="indigo"
    >
      {children}
    </AgentCard>
  );
}
