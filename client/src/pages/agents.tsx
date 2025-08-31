import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, Sparkles, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useAgentRecommendations, useMoodUpdate, useJournalSave } from "@/hooks/use-agents";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const agents = [
  {
    id: "MoodMate",
    name: "MoodMate",
    role: "Emotional Intelligence",
    emoji: "🎧",
    color: "from-blue-400 to-blue-600",
    description: "I help track your emotions and recommend music to match your mood"
  },
  {
    id: "NutriCoach", 
    name: "NutriCoach",
    role: "Nutrition Intelligence",
    emoji: "🥗",
    color: "from-green-400 to-green-600",
    description: "I create personalized meal plans and nutrition guidance based on your goals"
  },
  {
    id: "FlexGenie",
    name: "FlexGenie", 
    role: "Fitness Intelligence",
    emoji: "💪",
    color: "from-purple-400 to-purple-600",
    description: "I design adaptive workouts that match your energy and mood levels"
  },
  {
    id: "MindPal",
    name: "MindPal",
    role: "Mental Wellness",
    emoji: "🧠",
    color: "from-pink-400 to-pink-600", 
    description: "I provide emotional support, journal prompts, and mindfulness techniques"
  },
  {
    id: "InsightBot",
    name: "InsightBot",
    role: "Analytics & Insights",
    emoji: "📊",
    color: "from-indigo-400 to-indigo-600",
    description: "I analyze your wellness patterns and provide data-driven insights"
  }
];

export default function Agents() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'agent', content: string, timestamp: Date}>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [location, setLocation] = useLocation();
  
  // Refs for auto-scroll functionality
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: recommendations } = useAgentRecommendations(selectedAgent.id);
  const moodUpdate = useMoodUpdate();
  const journalSave = useJournalSave();

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = {
      role: 'user' as const,
      content: inputMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsTyping(true);
    
    try {
      // Call the new conversation API
      const response = await fetch(`/api/agents/${selectedAgent.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          conversationHistory: chatMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          userId: 1 // Default user ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get agent response');
      }

      const data = await response.json();
      
      setChatMessages(prev => [...prev, {
        role: 'agent',
        content: data.response,
        timestamp: new Date()
      }]);

      // Handle any actions triggered by the conversation
      if (data.actions && data.actions.length > 0) {
        console.log('Agent actions triggered:', data.actions);
        
        // Show collaboration indicator if other agents were triggered
        if (data.collaborationTriggered) {
          // You could show a toast or indicator here
          console.log('Collaboration triggered with other agents');
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setChatMessages(prev => [...prev, {
        role: 'agent',
        content: "I'm having trouble processing that right now. Could you try again?",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen wellness-gradient">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Agents Header */}
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
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">AI Agents</h1>
            <p className="text-muted-foreground">Chat with your personal wellness AI assistants</p>
          </div>
        </motion.div>
        {/* Mobile Agent Selection - Horizontal Scroll */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden mb-6"
        >
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Bot size={20} />
            Select Agent
          </h3>
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgent(agent);
                  setChatMessages([]);
                }}
                className={`flex-shrink-0 p-3 rounded-2xl transition-all min-w-[140px] ${
                  selectedAgent.id === agent.id 
                    ? 'bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-300 dark:border-purple-400 glassmorphism' 
                    : 'bg-white/70 hover:bg-white/90 dark:bg-white/10 dark:hover:bg-white/20 border border-gray-200 dark:border-gray-600 glassmorphism'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-12 h-12 bg-gradient-to-br ${agent.color} rounded-xl flex items-center justify-center agent-bounce`}>
                    <span className="text-xl">{agent.emoji}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground text-sm">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.role}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Desktop Agent Selection Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block lg:col-span-1"
          >
            <Card className="glassmorphism p-4 h-fit">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bot size={20} />
                Select Agent
              </h3>
              
              <div className="space-y-3">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setChatMessages([]);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition-all ${
                      selectedAgent.id === agent.id 
                        ? 'bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-300 dark:border-purple-400' 
                        : 'bg-white/50 hover:bg-white/70 dark:bg-white/10 dark:hover:bg-white/20 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${agent.color} rounded-xl flex items-center justify-center agent-bounce`}>
                        <span className="text-lg">{agent.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.role}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Chat Interface */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="glassmorphism h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${selectedAgent.color} rounded-2xl flex items-center justify-center agent-bounce`}>
                    <span className="text-2xl">{selectedAgent.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{selectedAgent.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedAgent.description}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Online
                  </Badge>
                </div>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8">
                      <Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Start a conversation with {selectedAgent.name}!
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedAgent.description}
                      </p>
                    </div>
                  )}
                  
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-purple-500 text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        {message.role === 'agent' ? (
                          <div className="text-sm">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({children}) => <p className="mb-2 text-gray-800">{children}</p>,
                                strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                                em: ({children}) => <em className="italic">{children}</em>,
                                ul: ({children}) => <ul className="list-disc list-inside space-y-1 mb-2 ml-2">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal list-inside space-y-1 mb-2 ml-2">{children}</ol>,
                                li: ({children}) => <li className="text-gray-800">{children}</li>,
                                h1: ({children}) => <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>,
                                h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-gray-900">{children}</h2>,
                                h3: ({children}) => <h3 className="text-sm font-medium mb-1 text-gray-900">{children}</h3>,
                                code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                                blockquote: ({children}) => <blockquote className="border-l-2 border-gray-300 pl-3 italic text-gray-600 my-2">{children}</blockquote>,
                                a: ({href, children}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                        <p className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Invisible div to scroll to */}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200/50">
                <div className="flex space-x-2 items-end">
                  <Textarea
                    value={inputMessage}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputMessage(e.target.value)}
                    placeholder={`Chat with ${selectedAgent.name}...`}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                    rows={2}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-purple-500 hover:bg-purple-600 h-[60px] px-4"
                  >
                    <Send size={16} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
