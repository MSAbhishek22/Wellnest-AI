import { useLocation } from "wouter";
import { Home, Bot, BarChart3, BookOpen, User } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileNavigation() {
  const [location, setLocation] = useLocation();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Bot, label: "Agents", path: "/agents" },
    { icon: BarChart3, label: "Insights", path: "/insights" },
    { icon: BookOpen, label: "Journal", path: "/journal" },
    { icon: User, label: "Profile", path: "/profile" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className="flex flex-col items-center justify-center p-2 min-w-0 flex-1 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              
              <div className={`p-2 rounded-xl transition-colors ${
                isActive 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" 
                  : "text-muted-foreground"
              }`}>
                <Icon size={20} />
              </div>
              
              <span className={`text-xs mt-1 font-medium transition-colors ${
                isActive ? "text-blue-600" : "text-muted-foreground"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
