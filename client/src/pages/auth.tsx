import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [signupForm, setSignupForm] = useState({ 
    username: "", 
    password: "", 
    confirmPassword: "",
    email: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      localStorage.setItem("wellnest_user", JSON.stringify({
        id: 1,
        username: loginForm.username || "User",
        email: "user@wellnest.ai"
      }));
      setLocation("/dashboard");
      setIsLoading(false);
    }, 1500);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate account creation
    setTimeout(() => {
      localStorage.setItem("wellnest_user", JSON.stringify({
        id: 1,
        username: signupForm.username,
        email: signupForm.email
      }));
      setLocation("/dashboard");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Header */}
      <div className="text-center pt-12 pb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-4 shadow-lg"
        >
          <Heart className="text-white text-3xl" fill="white" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2"
        >
          WellNest.AI
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-300 text-lg px-4"
        >
          Your Personal Wellness Companion
        </motion.p>
      </div>

      {/* Features Preview */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center space-x-8 mb-8 px-4"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-2 mx-auto">
            <Shield className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Secure</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-2 mx-auto">
            <Sparkles className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">AI Powered</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center mb-2 mx-auto">
            <Heart className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Personal</p>
        </div>
      </motion.div>

      {/* Auth Form */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex-1 px-6 pb-8"
      >
        <Card className="w-full max-w-md mx-auto bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl dark:shadow-gray-900/50">
          <Tabs defaultValue="login" className="w-full">
            <div className="p-6 pb-0">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
                <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-300">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-300">Sign Up</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="login" className="px-6 pb-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 dark:text-gray-200">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold mt-6"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="px-6 pb-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-gray-700 dark:text-gray-200">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    value={signupForm.username}
                    onChange={(e) => setSignupForm({...signupForm, username: e.target.value})}
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-700 dark:text-gray-200">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-200">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold mt-6"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}
