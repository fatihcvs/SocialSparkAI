import cron from "node-cron";
import { execSync } from "child_process";
import { healthMonitor } from "./healthMonitor";
import { aiAnalyzer } from "./aiAnalyzer";
import { autoFixer } from "./autoFixer";

interface SchedulerConfig {
  healthCheckInterval: string; // cron format
  aiAnalysisInterval: string;
  maintenanceInterval: string;
  emergencyResponseEnabled: boolean;
  maxConcurrentFixes: number;
  quietHours: { start: string; end: string }; // Format: "HH:MM"
}

interface ScheduledTask {
  name: string;
  schedule: string;
  lastRun?: Date;
  nextRun?: Date;
  isRunning: boolean;
  runCount: number;
  errorCount: number;
}

export class AutonomousScheduler {
  private static instance: AutonomousScheduler;
  private tasks: Map<string, ScheduledTask> = new Map();
  private cronJobs: Map<string, any> = new Map();
  private isActive = false;
  private activeFixes = new Set<string>();
  
  private config: SchedulerConfig = {
    healthCheckInterval: "*/2 * * * *", // Every 2 minutes - Enhanced for 1-hour intensive development
    aiAnalysisInterval: "*/3 * * * *", // Every 3 minutes - Increased frequency for continuous improvement
    maintenanceInterval: "0 2 * * *", // Daily at 2 AM
    emergencyResponseEnabled: true,
    maxConcurrentFixes: 5, // Increased from 3 to 5 for parallel processing
    quietHours: { start: "23:00", end: "05:00" } // Reduced quiet hours for more active development
  };

  static getInstance(): AutonomousScheduler {
    if (!AutonomousScheduler.instance) {
      AutonomousScheduler.instance = new AutonomousScheduler();
    }
    return AutonomousScheduler.instance;
  }

  async start(): Promise<void> {
    if (this.isActive) {
      console.log("[AutonomousScheduler] Already running");
      return;
    }

    console.log("[AutonomousScheduler] Starting autonomous system monitoring...");
    
    // Initialize monitoring systems
    healthMonitor.start();
    
    // Schedule core tasks
    await this.scheduleHealthChecks();
    await this.scheduleAIAnalysis();
    await this.scheduleMaintenance();
    await this.scheduleEmergencyResponse();
    await this.scheduleAutoPull();
    await this.scheduleContinuousDevelopment();
    
    this.isActive = true;
    console.log("[AutonomousScheduler] ✅ Autonomous system is now ACTIVE");
    
    // Log system startup
    this.logSystemEvent("SYSTEM_START", "Autonomous maintenance system activated");
  }

  async stop(): Promise<void> {
    console.log("[AutonomousScheduler] Stopping autonomous system...");
    
    // Stop all cron jobs
    this.cronJobs.forEach((job, name) => {
      job.stop();
      console.log(`[AutonomousScheduler] Stopped task: ${name}`);
    });
    
    this.cronJobs.clear();
    this.tasks.clear();
    this.activeFixes.clear();
    
    healthMonitor.stop();
    this.isActive = false;
    
    console.log("[AutonomousScheduler] ❌ Autonomous system STOPPED");
  }

  private async scheduleHealthChecks(): Promise<void> {
    const taskName = "health_check";
    const schedule = this.config.healthCheckInterval;
    
    const job = cron.schedule(schedule, async () => {
      await this.executeHealthCheck();
    }, {
      timezone: "Europe/Istanbul"
    });

    this.registerTask(taskName, schedule, job);
    job.start();
    
    console.log(`[AutonomousScheduler] Scheduled health checks: ${schedule}`);
  }

  private async scheduleAIAnalysis(): Promise<void> {
    const taskName = "ai_analysis";
    const schedule = this.config.aiAnalysisInterval;
    
    const job = cron.schedule(schedule, async () => {
      // Skip quiet hours check for intensive development mode
      console.log("[AutonomousScheduler] 🤖 INTENSIVE MODE: Executing SocialSparkAI-focused AI analysis...");
      await this.executeAIAnalysis();
    }, {
      timezone: "Europe/Istanbul"
    });

    this.registerTask(taskName, schedule, job);
    job.start();
    
    console.log(`[AutonomousScheduler] 🚀 INTENSIVE MODE: Scheduled AI analysis: ${schedule}`);
  }

  private async scheduleMaintenance(): Promise<void> {
    const taskName = "daily_maintenance";
    const schedule = this.config.maintenanceInterval;
    
    const job = cron.schedule(schedule, async () => {
      await this.executeDailyMaintenance();
    }, {
      timezone: "Europe/Istanbul"
    });

    this.registerTask(taskName, schedule, job);
    job.start();
    
    console.log(`[AutonomousScheduler] Scheduled daily maintenance: ${schedule}`);
  }

  private async scheduleEmergencyResponse(): Promise<void> {
    if (!this.config.emergencyResponseEnabled) return;
    
    const taskName = "emergency_response";
    const schedule = "*/2 * * * *"; // Every 2 minutes
    
    const job = cron.schedule(schedule, async () => {
      await this.checkForEmergencies();
    }, {
      timezone: "Europe/Istanbul"
    });

    this.registerTask(taskName, schedule, job);
    job.start();
    
    console.log(`[AutonomousScheduler] Scheduled emergency response: ${schedule}`);
  }

  private async scheduleAutoPull(): Promise<void> {
    const taskName = "auto_pull";
    const schedule = "*/5 * * * *"; // Every 5 minutes
    
    const job = cron.schedule(schedule, async () => {
      await this.executeAutoPull();
    }, {
      timezone: "Europe/Istanbul"
    });

    this.registerTask(taskName, schedule, job);
    job.start();
    
    console.log(`[AutonomousScheduler] 🔄 Scheduled auto-pull from GitHub: ${schedule}`);
  }

  private async scheduleContinuousDevelopment(): Promise<void> {
    const taskName = "continuous_development";
    const schedule = "*/5 * * * *"; // Every 5 minutes - FULL UNLIMITED DEVELOPMENT
    
    const job = cron.schedule(schedule, async () => {
      await this.executeContinuousDevelopment();
    }, {
      timezone: "Europe/Istanbul"
    });

    this.registerTask(taskName, schedule, job);
    job.start();
    
    console.log(`[AutonomousScheduler] 🎨 CONTINUOUS DEVELOPMENT: Scheduled unlimited visual & technical improvements: ${schedule}`);
  }

  private async executeHealthCheck(): Promise<void> {
    const taskName = "health_check";
    
    try {
      this.updateTaskStatus(taskName, true);
      
      console.log("[AutonomousScheduler] Executing health check...");
      const metrics = await healthMonitor.checkSystemMetrics();
      const status = healthMonitor.getSystemStatus();
      
      console.log(`[AutonomousScheduler] System status: ${status.status}, Uptime: ${status.uptime}`);
      
      if (status.status === 'critical') {
        console.error("[AutonomousScheduler] 🚨 CRITICAL SYSTEM ISSUES DETECTED!");
        await this.handleCriticalIssues();
      }
      
      this.updateTaskStatus(taskName, false, false);
      
    } catch (error) {
      console.error(`[AutonomousScheduler] Health check failed:`, error);
      this.updateTaskStatus(taskName, false, true);
    }
  }

  private async executeAIAnalysis(): Promise<void> {
    const taskName = "ai_analysis";
    
    try {
      this.updateTaskStatus(taskName, true);
      
      console.log("[AutonomousScheduler] 🤖 INTENSIVE MODE: Executing SocialSparkAI-focused AI analysis...");
      const analysis = await aiAnalyzer.analyzeSystemHealth();
      
      console.log(`[AutonomousScheduler] 🎯 SocialSparkAI Analysis: ${analysis.summary} (Urgency: ${analysis.urgency}/10)`);
      
      // FULL AUTHORITY MODE: Auto-fix ALL issues with urgency ≥3 (maximum aggressive mode)
      if (analysis.urgency >= 3 && analysis.autoFixable) {
        console.log("[AutonomousScheduler] 🔧 FULL AUTHORITY: Auto-fixing detected issue...");
        await this.executeAutoFix(analysis);
      } else if (analysis.urgency >= 1) {
        console.log("[AutonomousScheduler] 📋 FULL AUTHORITY: Analyzing minor optimization opportunity...");
        // Even minor issues get attention in full authority mode
      }
      
      this.updateTaskStatus(taskName, false, false);
      
    } catch (error) {
      console.error(`[AutonomousScheduler] AI analysis failed:`, error);
      this.updateTaskStatus(taskName, false, true);
    }
  }

  private async executeDailyMaintenance(): Promise<void> {
    const taskName = "daily_maintenance";
    
    try {
      this.updateTaskStatus(taskName, true);
      
      console.log("[AutonomousScheduler] 🔧 Executing daily maintenance...");
      
      // Generate comprehensive system analysis
      const analysis = await aiAnalyzer.analyzeSystemHealth();
      
      // Log daily summary
      this.logDailyReport(analysis);
      
      // Execute maintenance fixes
      if (analysis.category === 'maintenance' && analysis.autoFixable) {
        await this.executeAutoFix(analysis);
      }
      
      // Cleanup tasks
      await this.cleanupOldLogs();
      await this.optimizeSystem();
      
      this.updateTaskStatus(taskName, false, false);
      
    } catch (error) {
      console.error(`[AutonomousScheduler] Daily maintenance failed:`, error);
      this.updateTaskStatus(taskName, false, true);
    }
  }

  private async checkForEmergencies(): Promise<void> {
    const taskName = "emergency_response";
    
    try {
      const criticalIssues = healthMonitor.getCriticalIssues();
      
      if (criticalIssues.length > 0) {
        console.log(`[AutonomousScheduler] 🚨 ${criticalIssues.length} critical issues detected!`);
        
        for (const issue of criticalIssues) {
          console.log(`[AutonomousScheduler] Critical: ${issue.description}`);
          
          // Analyze and try to fix immediately
          const analysis = await aiAnalyzer.analyzeSpecificIssue(issue);
          if (analysis.autoFixable && analysis.urgency >= 8) {
            await this.executeAutoFix(analysis);
          }
        }
      }
      
    } catch (error) {
      console.error(`[AutonomousScheduler] Emergency check failed:`, error);
    }
  }

  private async handleCriticalIssues(): Promise<void> {
    console.log("[AutonomousScheduler] 🚨 Handling critical system issues...");
    
    const issues = healthMonitor.getCriticalIssues();
    
    for (const issue of issues) {
      if (this.activeFixes.size >= this.config.maxConcurrentFixes) {
        console.log("[AutonomousScheduler] Max concurrent fixes reached, queuing...");
        break;
      }
      
      const analysis = await aiAnalyzer.analyzeSpecificIssue(issue);
      if (analysis.autoFixable) {
        await this.executeAutoFix(analysis);
      }
    }
  }

  private async executeAutoFix(analysis: any): Promise<void> {
    const fixId = `fix_${Date.now()}`;
    
    if (this.activeFixes.size >= this.config.maxConcurrentFixes) {
      console.log("[AutonomousScheduler] Max concurrent fixes reached, skipping");
      return;
    }
    
    this.activeFixes.add(fixId);
    
    try {
      console.log(`[AutonomousScheduler] 🔧 Executing auto-fix: ${analysis.summary}`);
      
      const result = await autoFixer.executeAutomaticFix(analysis);
      
      if (result.success) {
        console.log(`[AutonomousScheduler] ✅ Auto-fix successful: ${result.description}`);
        this.logSystemEvent("AUTO_FIX_SUCCESS", `${result.action}: ${result.description}`, result.changes);
      } else {
        console.error(`[AutonomousScheduler] ❌ Auto-fix failed: ${result.error}`);
        this.logSystemEvent("AUTO_FIX_FAILED", `${result.action}: ${result.description}`, [result.error || ""]);
      }
      
    } catch (error) {
      console.error("[AutonomousScheduler] Auto-fix execution error:", error);
      this.logSystemEvent("AUTO_FIX_ERROR", `Fix execution failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.activeFixes.delete(fixId);
    }
  }

  private async cleanupOldLogs(): Promise<void> {
    console.log("[AutonomousScheduler] Cleaning up old logs...");
    // Implementation for log cleanup
  }

  private async optimizeSystem(): Promise<void> {
    console.log("[AutonomousScheduler] Running system optimization...");
    // Implementation for system optimization
  }

  private isQuietHours(): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { start, end } = this.config.quietHours;
    
    // Handle overnight quiet hours (e.g., 23:00 to 07:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }
    
    return currentTime >= start && currentTime <= end;
  }

  private registerTask(name: string, schedule: string, job: any): void {
    const task: ScheduledTask = {
      name,
      schedule,
      isRunning: false,
      runCount: 0,
      errorCount: 0,
      nextRun: new Date()
    };
    
    this.tasks.set(name, task);
    this.cronJobs.set(name, job);
  }

  private updateTaskStatus(name: string, isRunning: boolean, hasError = false): void {
    const task = this.tasks.get(name);
    if (task) {
      task.isRunning = isRunning;
      task.lastRun = new Date();
      
      if (!isRunning) {
        task.runCount++;
        if (hasError) {
          task.errorCount++;
        }
      }
    }
  }

  private logSystemEvent(event: string, description: string, details?: string[]): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      description,
      details: details || []
    };
    
    console.log(`[AutonomousScheduler] EVENT: ${event} - ${description}`);
    
    if (details && details.length > 0) {
      details.forEach((detail, index) => {
        console.log(`[AutonomousScheduler]   ${index + 1}. ${detail}`);
      });
    }
  }

  private logDailyReport(analysis: any): void {
    const report = {
      date: new Date().toISOString().split('T')[0],
      systemHealth: healthMonitor.getSystemStatus(),
      aiAnalysis: analysis,
      tasksStatus: this.getTasksStatus(),
      fixesApplied: autoFixer.getRecentFixes(24).length,
      successRate: this.calculateSuccessRate()
    };
    
    console.log("\n" + "=".repeat(80));
    console.log(`📊 DAILY SYSTEM REPORT - ${report.date}`);
    console.log("=".repeat(80));
    console.log(`System Status: ${report.systemHealth.status}`);
    console.log(`AI Analysis: ${analysis.summary}`);
    console.log(`Tasks Executed: ${Object.keys(report.tasksStatus).length}`);
    console.log(`Fixes Applied: ${report.fixesApplied}`);
    console.log(`Success Rate: ${(report.successRate * 100).toFixed(1)}%`);
    console.log("=".repeat(80) + "\n");
  }

  private calculateSuccessRate(): number {
    const recentFixes = autoFixer.getRecentFixes(24);
    if (recentFixes.length === 0) return 1.0;
    
    const successful = recentFixes.filter(fix => fix.success).length;
    return successful / recentFixes.length;
  }

  private async executeAutoPull(): Promise<void> {
    const taskName = "auto_pull";
    
    try {
      this.updateTaskStatus(taskName, true);
      
      console.log("[AutonomousScheduler] 🔄 Checking for GitHub updates...");
      
      // Run auto-pull script
      execSync('tsx scripts/auto-pull.ts', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log("[AutonomousScheduler] ✅ Auto-pull completed successfully");
      this.updateTaskStatus(taskName, false, false);
      
    } catch (error: any) {
      console.error(`[AutonomousScheduler] ❌ Auto-pull failed:`, error.message);
      this.updateTaskStatus(taskName, false, true);
      
      // Log the error but don't crash the system
      this.logSystemEvent("AUTO_PULL_FAILED", `GitHub pull failed: ${error.message}`);
    }
  }

  private async executeContinuousDevelopment(): Promise<any[]> {
    const taskName = "continuous_development";
    
    try {
      this.updateTaskStatus(taskName, true);
      
      console.log("[AutonomousScheduler] 🎨 CONTINUOUS DEVELOPMENT: Starting unlimited visual & technical improvements...");
      
      const improvements = await this.generateDevelopmentTasks();
      const results = [];
      
      for (const improvement of improvements.slice(0, 10)) { // Process up to 10 improvements per cycle
        try {
          console.log(`[AutonomousScheduler] 🚀 Implementing: ${improvement.title}`);
          const result = await this.implementImprovement(improvement);
          if (result.success) {
            results.push(result);
            console.log(`[AutonomousScheduler] ✅ Completed: ${improvement.title}`);
          }
        } catch (error) {
          console.error(`[AutonomousScheduler] ❌ Failed improvement: ${improvement.title}`, error);
        }
      }
      
      console.log(`[AutonomousScheduler] 🎯 Development cycle complete: ${results.length} improvements applied`);
      this.updateTaskStatus(taskName, false, false);
      
      return results;
      
    } catch (error: any) {
      console.error(`[AutonomousScheduler] ❌ Continuous development failed:`, error.message);
      this.updateTaskStatus(taskName, false, true);
      return [];
    }
  }

  private async generateDevelopmentTasks(): Promise<any[]> {
    // Generate comprehensive development tasks for SocialSparkAI
    return [
      {
        title: "Enhanced UI Components - Visual Improvements",
        category: "ui_enhancement",
        priority: "high",
        description: "Improve visual appeal of dashboard, buttons, cards, and navigation",
        files: ["client/src/components/ui/", "client/src/pages/"]
      },
      {
        title: "AI Content Generation Pipeline Optimization",
        category: "ai_optimization",
        priority: "critical",
        description: "Optimize OpenAI API calls, add caching, improve response times",
        files: ["server/services/openai", "server/services/aiContent"]
      },
      {
        title: "Social Media Publishing Enhancements",
        category: "social_features",
        priority: "high",
        description: "Improve Zapier integration, add platform-specific formatting",
        files: ["server/services/zapier", "server/services/social"]
      },
      {
        title: "Payment System Improvements",
        category: "payment_optimization",
        priority: "high",
        description: "Enhance İyzico integration, subscription management",
        files: ["server/services/iyzico", "client/src/pages/Billing"]
      },
      {
        title: "Database Performance Optimization",
        category: "performance",
        priority: "medium",
        description: "Optimize queries, add indexes, improve response times",
        files: ["server/db.ts", "shared/schema.ts"]
      },
      {
        title: "Mobile Responsiveness Improvements",
        category: "responsive_design",
        priority: "medium",
        description: "Enhance mobile experience across all pages",
        files: ["client/src/pages/", "client/src/components/"]
      },
      {
        title: "Advanced Analytics Dashboard",
        category: "analytics",
        priority: "medium",
        description: "Add comprehensive analytics for content performance",
        files: ["client/src/pages/Analytics", "server/services/analytics"]
      },
      {
        title: "Content Calendar Integration",
        category: "content_management",
        priority: "medium",
        description: "Add visual content calendar for planning posts",
        files: ["client/src/pages/Calendar", "client/src/components/calendar"]
      }
    ];
  }

  private async implementImprovement(improvement: any): Promise<any> {
    // Implementation logic for each improvement
    switch (improvement.category) {
      case "ui_enhancement":
        return await this.implementUIEnhancements(improvement);
      case "ai_optimization":
        return await this.implementAIOptimizations(improvement);
      case "social_features":
        return await this.implementSocialFeatures(improvement);
      case "payment_optimization":
        return await this.implementPaymentOptimizations(improvement);
      case "performance":
        return await this.implementPerformanceOptimizations(improvement);
      default:
        return { success: false, message: "Unknown improvement category" };
    }
  }

  private async implementUIEnhancements(improvement: any): Promise<any> {
    // Generate and apply UI improvements using AI
    try {
      const uiChanges = await aiAnalyzer.generateCodeChanges(
        `Enhance UI components for SocialSparkAI social media platform:
        - Improve visual design with modern gradients and animations
        - Add hover effects and smooth transitions
        - Enhance button styles and card components
        - Improve typography and spacing
        - Add loading states and micro-interactions
        
        Focus on: ${improvement.description}
        Files to update: ${improvement.files.join(', ')}`
      );

      return await autoFixer.applyCodeChanges(uiChanges, "UI Enhancement");
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async implementAIOptimizations(improvement: any): Promise<any> {
    // Optimize AI content generation pipeline
    try {
      const aiChanges = await aiAnalyzer.generateCodeChanges(
        `Optimize AI content generation for SocialSparkAI:
        - Improve OpenAI API call efficiency
        - Add intelligent caching mechanisms
        - Enhance prompt engineering for better content
        - Add retry logic and error handling
        - Optimize response parsing and formatting
        
        Focus on: ${improvement.description}
        Files to update: ${improvement.files.join(', ')}`
      );

      return await autoFixer.applyCodeChanges(aiChanges, "AI Pipeline Optimization");
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async implementSocialFeatures(improvement: any): Promise<any> {
    // Enhance social media publishing features
    try {
      const socialChanges = await aiAnalyzer.generateCodeChanges(
        `Enhance social media publishing for SocialSparkAI:
        - Improve Zapier webhook integration reliability
        - Add platform-specific content formatting
        - Enhance multi-platform coordination
        - Add scheduling and queue management
        - Improve error handling and retry logic
        
        Focus on: ${improvement.description}
        Files to update: ${improvement.files.join(', ')}`
      );

      return await autoFixer.applyCodeChanges(socialChanges, "Social Publishing Enhancement");
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async implementPaymentOptimizations(improvement: any): Promise<any> {
    // Optimize payment and subscription system
    try {
      const paymentChanges = await aiAnalyzer.generateCodeChanges(
        `Optimize payment system for SocialSparkAI:
        - Enhance İyzico integration security
        - Improve subscription lifecycle management
        - Add payment failure recovery
        - Enhance billing UI/UX
        - Add payment analytics and reporting
        
        Focus on: ${improvement.description}
        Files to update: ${improvement.files.join(', ')}`
      );

      return await autoFixer.applyCodeChanges(paymentChanges, "Payment System Optimization");
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async implementPerformanceOptimizations(improvement: any): Promise<any> {
    // Optimize system performance
    try {
      const perfChanges = await aiAnalyzer.generateCodeChanges(
        `Optimize performance for SocialSparkAI:
        - Add database indexes for frequently queried columns
        - Optimize slow queries and reduce response times
        - Implement efficient caching strategies
        - Reduce memory usage and optimize algorithms
        - Add connection pooling and query optimization
        
        Focus on: ${improvement.description}
        Files to update: ${improvement.files.join(', ')}`
      );

      return await autoFixer.applyCodeChanges(perfChanges, "Performance Optimization");
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Public methods for monitoring and control
  getStatus(): any {
    return {
      isActive: this.isActive,
      tasksCount: this.tasks.size,
      activeFixes: this.activeFixes.size,
      config: this.config,
      tasks: this.getTasksStatus(),
      systemHealth: healthMonitor.getSystemStatus(),
      recentAnalyses: aiAnalyzer.getAnalysisHistory().slice(-5),
      recentFixes: autoFixer.getRecentFixes(6)
    };
  }

  getTasksStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    
    this.tasks.forEach((task, name) => {
      status[name] = {
        schedule: task.schedule,
        lastRun: task.lastRun,
        isRunning: task.isRunning,
        runCount: task.runCount,
        errorCount: task.errorCount,
        successRate: task.runCount > 0 ? ((task.runCount - task.errorCount) / task.runCount) : 1
      };
    });
    
    return status;
  }

  updateConfig(newConfig: Partial<SchedulerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("[AutonomousScheduler] Configuration updated:", this.config);
    
    // Restart if running to apply new config
    if (this.isActive) {
      console.log("[AutonomousScheduler] Restarting to apply new configuration...");
      this.stop().then(() => this.start());
    }
  }
}

export const autonomousScheduler = AutonomousScheduler.getInstance();