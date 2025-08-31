import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useUser(userId: number = 1) {
  return useQuery({
    queryKey: ["/api/user", userId],
    queryFn: () => api.getUser(userId),
  });
}

export function useMoodUpdate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ mood, userId = 1 }: { mood: string; userId?: number }) =>
      api.updateMood(mood, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mood"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Mood Updated",
        description: "Your agents are adapting to your current mood",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update mood",
        variant: "destructive",
      });
    },
  });
}

export function useAgentRecommendations(agentName: string, userId: number = 1) {
  return useQuery({
    queryKey: ["/api/agents", agentName, "recommendations", userId],
    queryFn: () => api.getAgentRecommendations(agentName, userId),
  });
}

export function useJournalSave() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ content, prompt, userId = 1 }: { 
      content: string; 
      prompt?: string; 
      userId?: number;
    }) => api.saveJournalEntry(content, prompt, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({
        title: "Journal Saved",
        description: "Your thoughts have been recorded",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive",
      });
    },
  });
}

export function useInsights(userId: number = 1) {
  return useQuery({
    queryKey: ["/api/insights", userId],
    queryFn: () => api.getInsights(userId),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAgentStatus() {
  return useQuery({
    queryKey: ["/api/agents/status"],
    queryFn: () => api.getAgentStatus(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

export function useWellnessMetrics(userId: number = 1, days: number = 7) {
  return useQuery({
    queryKey: ["/api/wellness-metrics", userId, days],
    queryFn: () => api.getWellnessMetrics(userId, days),
  });
}
