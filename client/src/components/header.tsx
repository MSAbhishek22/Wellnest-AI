import { Bell, Heart, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/use-agents";
import { useLocation } from "wouter";

export default function Header() {
  const { data: user } = useUser();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("wellnest_user");
    // Dispatch custom event to trigger app-wide logout handling
    window.dispatchEvent(new CustomEvent("wellnest-logout"));
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-purple-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
              <Heart className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-poppins font-semibold text-gray-900">
                WellNest.AI
              </h1>
              <p className="text-xs text-gray-600">Your Wellness Companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-gray-600 hover:text-purple-600"
                >
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Notifications</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Stay updated with your wellness journey
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start p-3 space-y-1">
                    <div className="flex items-center space-x-2 w-full">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <p className="text-sm font-medium">MoodMate Recommendation</p>
                      <span className="text-xs text-muted-foreground ml-auto">2m ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on your mood, try listening to some calming music
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start p-3 space-y-1">
                    <div className="flex items-center space-x-2 w-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm font-medium">NutriCoach Update</p>
                      <span className="text-xs text-muted-foreground ml-auto">1h ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your daily nutrition goal is 80% complete!
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start p-3 space-y-1">
                    <div className="flex items-center space-x-2 w-full">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm font-medium">FlexGenie Reminder</p>
                      <span className="text-xs text-muted-foreground ml-auto">3h ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Time for your afternoon stretch session
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start p-3 space-y-1">
                    <div className="flex items-center space-x-2 w-full">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <p className="text-sm font-medium">MindPal Check-in</p>
                      <span className="text-xs text-muted-foreground ml-auto">5h ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      How are you feeling today? Share your thoughts
                    </p>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-purple-600 hover:text-purple-700">
                  <span className="w-full">View all notifications</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 glassmorphism rounded-full px-3 py-2 border border-purple-200/50 hover:bg-purple-50/50">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.username || "Sarah M."}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.username || "Sarah M."}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Your Personal Wellness Companion
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
