import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Brain, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  TrendingUp,
  Target,
  Timer
} from "lucide-react";

interface LiveStats {
  sessionStartTime: string;
  totalAnalyses: number;
  successfulFixes: number;
  systemHealth: string;
  activeOptimizations: string[];
  upcomingTasks: Array<{
    name: string;
    nextRun: string;
    type: string;
  }>;
  recentActivity: Array<{
    timestamp: string;
    action: string;
    description: string;
    success: boolean;
  }>;
}

export default function LiveMonitoring() {
  const [sessionProgress, setSessionProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Session start time (1 hour from now)
  const sessionStart = Date.now();
  const sessionEnd = sessionStart + (60 * 60 * 1000); // 1 hour

  // Live data fetching every 5 seconds
  const { data: autonomousStatus } = useQuery({
    queryKey: ["/api/autonomous/status"],
    refetchInterval: 5000,
  });

  const { data: healthData } = useQuery<{status?: any}>({
    queryKey: ["/api/autonomous/health"],
    refetchInterval: 5000,
  });

  const { data: analysisData } = useQuery<{recent?: any[], totalAnalyses?: number}>({
    queryKey: ["/api/autonomous/analysis"],
    refetchInterval: 10000,
  });

  const { data: fixData } = useQuery<{successful?: number, history?: any[]}>({
    queryKey: ["/api/autonomous/fixes"],
    refetchInterval: 10000,
  });

  // Update session progress and elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - sessionStart) / 1000);
      const progress = Math.min((elapsed / 3600) * 100, 100); // Max 100%
      
      setElapsedTime(elapsed);
      setSessionProgress(progress);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStart]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🤖 SocialSparkAI Autonomous Development
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            ChatGPT Intensive Development Session - Real-time Monitoring
          </p>
        </div>

        {/* Session Progress */}
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-500" />
              Session Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Elapsed: {formatTime(elapsedTime)}</span>
              <span className="text-sm font-medium">Remaining: {formatTime(3600 - elapsedTime)}</span>
            </div>
            <Progress value={sessionProgress} className="h-3" />
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {sessionProgress.toFixed(1)}% Complete
            </div>
          </CardContent>
        </Card>

        {/* Live Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* System Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${healthData?.status?.status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className={`font-semibold ${getHealthColor(healthData?.status?.status || 'unknown')}`}>
                  {healthData?.status?.status || 'Checking...'}
                </span>
              </div>
              {autonomousStatus?.isActive && (
                <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                  Intensive Mode Active
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* AI Analyses */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analysisData?.totalAnalyses || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Every 3 minutes
              </p>
            </CardContent>
          </Card>

          {/* Successful Fixes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Auto-Fixes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {fixData?.successful || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Applied automatically
              </p>
            </CardContent>
          </Card>

          {/* Active Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Active Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {autonomousStatus?.tasksCount || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Running processes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Focus Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Current Focus Areas
            </CardTitle>
            <CardDescription>
              SocialSparkAI components being optimized
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">AI Content Pipeline</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Social Publishing</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Payment Systems</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">User Workflow</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Performance</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Security</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Live Activity Feed
            </CardTitle>
            <CardDescription>
              Real-time autonomous development activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* Recent fixes */}
              {fixData?.history?.slice(0, 5).map((fix: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`h-2 w-2 rounded-full ${fix.success ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{fix.action}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{fix.description}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(fix.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}

              {/* Recent analyses */}
              {analysisData?.recent?.slice(0, 3).map((analysis: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">AI Analysis Completed</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{analysis.summary}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Urgency: {analysis.urgency}/10
                  </Badge>
                </div>
              ))}

              {/* Default message if no activity */}
              {(!fixData?.history?.length && !analysisData?.recent?.length) && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Waiting for autonomous activities...</p>
                  <p className="text-sm">System will start analyzing and optimizing shortly</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}