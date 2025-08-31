import { Users, Wifi } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAgentStatus } from "@/hooks/use-agents";

export default function CollaborationIndicator() {
  const { data: agents, isLoading } = useAgentStatus();

  if (isLoading) return null;

  const activeAgents = agents?.filter((agent: any) => agent.status === "active") || [];

  return (
    <Card className="bg-gradient-to-r from-purple-100/80 to-pink-100/80 backdrop-blur-sm border border-purple-200/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-poppins font-semibold text-gray-900 flex items-center gap-2">
          <Users size={20} />
          Agent Collaboration Active
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full collaboration-pulse"></div>
          <span className="text-sm text-gray-600">Live sync</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-2">
            {activeAgents.slice(0, 3).map((agent: any, index: number) => {
              const colors = [
                "bg-blue-500",
                "bg-green-500", 
                "bg-purple-500",
                "bg-pink-500",
                "bg-indigo-500"
              ];
              const emojis = ["🎧", "🥗", "🧘", "💬", "📊"];
              
              return (
                <div
                  key={agent.name}
                  className={`w-8 h-8 ${colors[index]} rounded-full flex items-center justify-center border-2 border-white text-xs`}
                >
                  {emojis[index]}
                </div>
              );
            })}
          </div>
          <span className="text-sm text-gray-700">
            {activeAgents.map((agent: any) => agent.name).join(" → ")}
          </span>
        </div>
        
        <span className="text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-full flex items-center gap-1">
          <Wifi size={12} />
          Optimizing your wellness routine
        </span>
      </div>
    </Card>
  );
}
