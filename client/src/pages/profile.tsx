import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, Bell, Shield, Download, Trash2, Edit, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-agents";

export default function Profile() {
  const { data: user } = useUser();
  const [location, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: "sarah@example.com", // Mock data
    notifications: true,
    dataSharing: false,
    autoBackup: true
  });

  const handleSave = () => {
    // Here you would typically make an API call to update user data
    console.log("Saving user data:", formData);
    setIsEditing(false);
  };

  const handleExportData = () => {
    // Export user data
    const userData = {
      profile: formData,
      wellnessData: "User wellness data would be exported here",
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wellness-data-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: "Days Active", value: user?.streakDays || 0, icon: "🔥" },
    { label: "Journal Entries", value: 47, icon: "📝" },
    { label: "Mood Tracks", value: 134, icon: "😊" },
    { label: "Workouts", value: 23, icon: "💪" }
  ];

  const achievements = [
    { title: "First Entry", description: "Completed your first journal entry", date: "2 weeks ago", icon: "🌟" },
    { title: "Mood Master", description: "Tracked mood for 7 consecutive days", date: "1 week ago", icon: "🎯" },
    { title: "Wellness Warrior", description: "Used all 5 AI agents", date: "3 days ago", icon: "🏆" },
    { title: "Consistency King", description: "10-day wellness streak", date: "Today", icon: "👑" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
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
            
            <Button 
              onClick={() => setLocation('/settings')}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Settings size={16} />
              Settings
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
            <p className="text-muted-foreground">Manage your account and wellness preferences</p>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Basic Info */}
            <Card className="border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit size={16} />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/api/placeholder/80/80" />
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-xl">
                    {formData.username.charAt(0).toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{formData.username}</h3>
                  <p className="text-muted-foreground">{formData.email}</p>
                  <Badge className="mt-1 bg-green-100 text-green-800">
                    Premium Member
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username" className="text-sm font-medium text-foreground">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSave} className="bg-purple-500 hover:bg-purple-600">
                    Save Changes
                  </Button>
                </div>
              )}
            </Card>

            {/* Settings */}
            <Card className="border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Settings size={20} />
                Preferences
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive wellness reminders and insights</p>
                  </div>
                  <Switch
                    checked={formData.notifications}
                    onCheckedChange={(checked) => setFormData({...formData, notifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Data Sharing</Label>
                    <p className="text-xs text-muted-foreground">Share anonymized data for research</p>
                  </div>
                  <Switch
                    checked={formData.dataSharing}
                    onCheckedChange={(checked) => setFormData({...formData, dataSharing: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Auto Backup</Label>
                    <p className="text-xs text-muted-foreground">Automatically backup your wellness data</p>
                  </div>
                  <Switch
                    checked={formData.autoBackup}
                    onCheckedChange={(checked) => setFormData({...formData, autoBackup: checked})}
                  />
                </div>
              </div>
            </Card>

            {/* Data Management */}
            <Card className="border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield size={20} />
                Data Management
              </h2>
              
              <div className="space-y-3">
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download size={16} className="mr-2" />
                  Export My Data
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Account
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
            {/* Stats */}
            <Card className="border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-4">Your Stats</h3>
              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{stat.icon}</span>
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                    <Badge variant="secondary">{stat.value}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Achievements */}
            <Card className="border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                🏆 Achievements
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="bg-white/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{achievement.icon}</span>
                      <span className="text-sm font-medium text-foreground">{achievement.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground">{achievement.date}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Bell size={16} className="mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Shield size={16} className="mr-2" />
                  Privacy Settings
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
