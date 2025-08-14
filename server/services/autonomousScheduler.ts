import cron from "node-cron";
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
    healthCheckInterval: "*/5 * * * *", // Every 5 minutes
    aiAnalysisInterval: "*/15 * * * *", // Every 15 minutes  
    maintenanceInterval: "0 2 * * *", // Daily at 2 AM
    emergencyResponseEnabled: true,
    maxConcurrentFixes: 3,
    quietHours: { start: "23:00", end: "07:00" }
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
      scheduled: false,
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
      if (this.isQuietHours()) {
        console.log("[AutonomousScheduler] Skipping AI analysis during quiet hours");
        return;
      }
      await this.executeAIAnalysis();
    }, {
      scheduled: false,
      timezone: "Europe/Istanbul"
    });

    this.registerTask(taskName, schedule, job);
    job.start();
    
    console.log(`[AutonomousScheduler] Scheduled AI analysis: ${schedule}`);
  }

  private async scheduleMaintenance(): Promise<void> {
    const taskName = "daily_maintenance";
    const schedule = this.config.maintenanceInterval;
    
    const job = cron.schedule(schedule, async () => {
      await this.executeDailyMaintenance();
    }, {
      scheduled: false,
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
      scheduled: false,
      timezone: "Europe/Istanbul"
    });

    this.registerTask(taskName, schedule, job);
    job.start();
    
    console.log(`[AutonomousScheduler] Scheduled emergency response: ${schedule}`);
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
      
      console.log("[AutonomousScheduler] 🤖 Executing AI system analysis...");
      const analysis = await aiAnalyzer.analyzeSystemHealth();
      
      console.log(`[AutonomousScheduler] Analysis: ${analysis.summary} (Urgency: ${analysis.urgency}/10)`);
      
      // Auto-fix high urgency issues immediately
      if (analysis.urgency >= 7 && analysis.autoFixable) {
        await this.executeAutoFix(analysis);
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
      this.logSystemEvent("AUTO_FIX_ERROR", `Fix execution failed: ${error.message}`);
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