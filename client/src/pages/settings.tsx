import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/theme-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bot, 
  Bell, 
  Palette, 
  Volume2, 
  Shield, 
  Zap,
  RefreshCw,
  Save,
  ArrowLeft
} from "lucide-react";

const agents = [
  { id: "MoodMate", name: "MoodMate", emoji: "🎧", enabled: true },
  { id: "NutriCoach", name: "NutriCoach", emoji: "🥗", enabled: true },
  { id: "FlexGenie", name: "FlexGenie", emoji: "💪", enabled: true },
  { id: "MindPal", name: "MindPal", emoji: "🧠", enabled: true },
  { id: "InsightBot", name: "InsightBot", emoji: "📊", enabled: true }
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const [agentSettings, setAgentSettings] = useState(agents);
  const [preferences, setPreferences] = useState({
    notifications: {
      dailyReminders: true,
      agentUpdates: true,
      moodPrompts: true,
      workoutReminders: false,
      journalReminders: true
    },
    display: {
      darkMode: theme === 'dark',
      animations: true,
      compactView: false,
      showInsights: true
    },
    privacy: {
      dataCollection: true,
      anonymousAnalytics: false,
      shareProgress: false
    },
    audio: {
      soundEffects: true,
      volume: [75],
      voiceAlerts: false
    },
    collaboration: {
      agentCommunication: true,
      autoTriggers: true,
      insightSharing: true,
      collaborationLevel: [8]
    }
  });

  const toggleAgent = (agentId: string) => {
    setAgentSettings(prev => 
      prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, enabled: !agent.enabled }
          : agent
      )
    );
  };

  const updatePreference = (category: string, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));

    // Handle dark mode toggle
    if (category === 'display' && key === 'darkMode') {
      setTheme(value ? 'dark' : 'light');
    }
  };

  // Sync theme changes with preferences
  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      display: {
        ...prev.display,
        darkMode: theme === 'dark'
      }
    }));
  }, [theme]);

  const handleSaveSettings = () => {
    // Save settings to backend
    console.log("Saving settings:", { agentSettings, preferences });
    // Show success message or toast
  };

  const handleResetSettings = () => {
    // Reset to default settings
    setAgentSettings(agents);
    setPreferences({
      notifications: {
        dailyReminders: true,
        agentUpdates: true,
        moodPrompts: true,
        workoutReminders: false,
        journalReminders: true
      },
      display: {
        darkMode: theme === 'dark',
        animations: true,
        compactView: false,
        showInsights: true
      },
      privacy: {
        dataCollection: true,
        anonymousAnalytics: false,
        shareProgress: false
      },
      audio: {
        soundEffects: true,
        volume: [75],
        voiceAlerts: false
      },
      collaboration: {
        agentCommunication: true,
        autoTriggers: true,
        insightSharing: true,
        collaborationLevel: [8]
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Settings Header */}
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
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleResetSettings}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Reset
              </Button>
              <Button 
                onClick={handleSaveSettings}
                size="sm"
                className="bg-purple-500 hover:bg-purple-600 flex items-center gap-2"
              >
                <Save size={16} />
                Save
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Customize your WellNest.AI experience</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Configuration */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bot size={20} />
                AI Agents
              </h2>
              
              <div className="space-y-4">
                {agentSettings.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{agent.emoji}</span>
                      <div>
                        <p className="font-medium text-foreground">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.enabled ? 'Active' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={agent.enabled}
                      onCheckedChange={() => toggleAgent(agent.id)}
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap size={20} />
                Agent Collaboration
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Agent Communication</Label>
                    <p className="text-xs text-muted-foreground">Allow agents to share insights with each other</p>
                  </div>
                  <Switch
                    checked={preferences.collaboration.agentCommunication}
                    onCheckedChange={(checked) => updatePreference('collaboration', 'agentCommunication', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Auto Triggers</Label>
                    <p className="text-xs text-muted-foreground">Automatically activate related agents</p>
                  </div>
                  <Switch
                    checked={preferences.collaboration.autoTriggers}
                    onCheckedChange={(checked) => updatePreference('collaboration', 'autoTriggers', checked)}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Collaboration Level: {preferences.collaboration.collaborationLevel[0]}/10
                  </Label>
                  <Slider
                    value={preferences.collaboration.collaborationLevel}
                    onValueChange={(value) => updatePreference('collaboration', 'collaborationLevel', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* General Settings */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bell size={20} />
                Notifications
              </h2>
              
              <div className="space-y-4">
                {Object.entries(preferences.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => updatePreference('notifications', key, checked)}
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Palette size={20} />
                Display
              </h2>
              
              <div className="space-y-4">
                {Object.entries(preferences.display).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => updatePreference('display', key, checked)}
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Volume2 size={20} />
                Audio
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">Sound Effects</Label>
                  <Switch
                    checked={preferences.audio.soundEffects}
                    onCheckedChange={(checked) => updatePreference('audio', 'soundEffects', checked)}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Volume: {preferences.audio.volume[0]}%
                  </Label>
                  <Slider
                    value={preferences.audio.volume}
                    onValueChange={(value) => updatePreference('audio', 'volume', value)}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">Voice Alerts</Label>
                  <Switch
                    checked={preferences.audio.voiceAlerts}
                    onCheckedChange={(checked) => updatePreference('audio', 'voiceAlerts', checked)}
                  />
                </div>
              </div>
            </Card>

            <Card className="border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield size={20} />
                Privacy
              </h2>
              
              <div className="space-y-4">
                {Object.entries(preferences.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      {key === 'dataCollection' && (
                        <p className="text-xs text-muted-foreground">Help improve our AI agents</p>
                      )}
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => updatePreference('privacy', key, checked)}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Active Agents Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Card className="border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Current Agent Status
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {agentSettings.map((agent) => (
                <Badge 
                  key={agent.id}
                  variant={agent.enabled ? "default" : "secondary"}
                  className={`px-3 py-1 ${
                    agent.enabled 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {agent.emoji} {agent.name}
                  {agent.enabled && (
                    <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </Badge>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                <strong>{agentSettings.filter(a => a.enabled).length}</strong> of{' '}
                <strong>{agentSettings.length}</strong> agents are currently active
              </p>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
