import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, Download, Share2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useInsights, useWellnessMetrics } from "@/hooks/use-agents";

export default function Insights() {
  const { data: insights } = useInsights();
  const { data: metrics } = useWellnessMetrics();
  const [location, setLocation] = useLocation();

  const handleExportReport = () => {
    // Generate and download wellness report
    const reportData = {
      date: new Date().toISOString(),
      insights: insights,
      metrics: metrics,
      summary: "Monthly Wellness Report"
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wellness-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShareProgress = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Wellness Progress',
        text: 'Check out my wellness journey with WellNest.AI!',
        url: window.location.origin
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Check out my wellness progress: ${window.location.origin}`);
      alert('Link copied to clipboard!');
    }
  };

  const trends = insights?.insights?.trends || [];
  const correlations = insights?.insights?.correlations || [];
  const suggestions = insights?.insights?.suggestions || [];

  return (
    <div className="min-h-screen wellness-gradient">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Insights Header */}
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
                onClick={handleExportReport}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export Report
              </Button>
              <Button 
                onClick={handleShareProgress}
                size="sm"
                className="bg-purple-500 hover:bg-purple-600 flex items-center gap-2"
              >
                <Share2 size={16} />
                Share Progress
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Insights</h1>
            <p className="text-muted-foreground">Discover patterns and trends in your wellness journey</p>
          </div>
        </motion.div>

        {/* Trends Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="glassmorphism p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Wellness Trends
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(trends && trends.length > 0) ? trends.map((trend: any, index: number) => (
                <div key={index} className="bg-white/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{trend.metric}</span>
                    <div className={`flex items-center gap-1 ${
                      trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trend.direction === 'up' ? 
                        <TrendingUp size={16} /> : 
                        <TrendingDown size={16} />
                      }
                      <span className="text-sm font-semibold">
                        {Math.abs(trend.change || 0)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        trend.direction === 'up' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(Math.abs(trend.change || 0), 100)}%` }}
                    ></div>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-muted-foreground">Collecting data to generate trends...</p>
                  <p className="text-sm text-muted-foreground mt-1">Check back after a few days of usage</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Correlations & Patterns */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glassmorphism p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Patterns & Correlations
            </h2>
            
            <div className="space-y-3">
              {correlations.length > 0 ? correlations.map((correlation: any, index: number) => (
                <div key={index} className="bg-blue-50/80 rounded-2xl p-4">
                  <Badge variant="secondary" className="mb-2">Pattern Detected</Badge>
                  <p className="text-sm text-foreground">{correlation}</p>
                </div>
              )) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Continue tracking your wellness to discover patterns</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="glassmorphism p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              AI Recommendations
            </h2>
            
            <div className="space-y-3">
              {suggestions.length > 0 ? suggestions.map((suggestion: any, index: number) => (
                <div key={index} className="bg-purple-50/80 rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-sm">💡</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{suggestion}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">AI is analyzing your data to provide personalized suggestions</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Wellness Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glassmorphism p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Recent Metrics
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-sm font-medium text-muted-foreground py-2">Date</th>
                    <th className="text-left text-sm font-medium text-muted-foreground py-2">Energy</th>
                    <th className="text-left text-sm font-medium text-muted-foreground py-2">Stress</th>
                    <th className="text-left text-sm font-medium text-muted-foreground py-2">Focus</th>
                    <th className="text-left text-sm font-medium text-muted-foreground py-2">Hydration</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics && metrics.length > 0 ? 
                    metrics.slice(0, 7).map((metric: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 text-sm text-foreground">
                          {new Date(metric.date).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(metric.energyLevel / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">{metric.energyLevel}/10</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${(metric.stressLevel / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">{metric.stressLevel}/10</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="text-sm text-muted-foreground">{metric.focusTime}h</span>
                        </td>
                        <td className="py-3">
                          <span className="text-sm text-muted-foreground">{metric.hydrationGlasses} glasses</span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-muted-foreground">
                          No metrics data available yet
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
