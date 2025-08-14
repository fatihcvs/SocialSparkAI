import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";

interface HealthMetrics {
  timestamp: Date;
  apiHealth: boolean;
  dbHealth: boolean;
  responseTime: number;
  errorCount: number;
  activeUsers: number;
  memoryUsage: number;
  diskUsage: number;
}

interface SystemIssue {
  type: 'error' | 'warning' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  component: string;
  timestamp: Date;
  metrics?: any;
}

export class HealthMonitor {
  private static instance: HealthMonitor;
  private metrics: HealthMetrics[] = [];
  private issues: SystemIssue[] = [];
  private isRunning = false;

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  async checkAPIHealth(): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Test critical endpoints
      const endpoints = [
        '/api/auth/me',
        '/api/dashboard/stats',
        '/api/content-ideas'
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok && response.status !== 401) {
          this.addIssue({
            type: 'error',
            severity: 'high',
            description: `API endpoint ${endpoint} returned ${response.status}`,
            component: 'api',
            timestamp: new Date()
          });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      this.addIssue({
        type: 'error',
        severity: 'critical',
        description: `API health check failed: ${error instanceof Error ? error.message : String(error)}`,
        component: 'api',
        timestamp: new Date()
      });
      return false;
    }
  }

  async checkDatabaseHealth(): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Test database connection
      const testQuery = await db.select().from(users).limit(1);
      const responseTime = Date.now() - startTime;
      
      if (responseTime > 1000) {
        this.addIssue({
          type: 'performance',
          severity: 'medium',
          description: `Database query slow: ${responseTime}ms`,
          component: 'database',
          timestamp: new Date(),
          metrics: { responseTime }
        });
      }
      
      return true;
    } catch (error) {
      this.addIssue({
        type: 'error',
        severity: 'critical',
        description: `Database health check failed: ${error instanceof Error ? error.message : String(error)}`,
        component: 'database',
        timestamp: new Date()
      });
      return false;
    }
  }

  async checkSystemMetrics(): Promise<HealthMetrics> {
    const startTime = Date.now();
    
    const apiHealth = await this.checkAPIHealth();
    const dbHealth = await this.checkDatabaseHealth();
    const responseTime = Date.now() - startTime;
    
    // Get system metrics
    const memoryUsage = process.memoryUsage();
    const activeUsers = await this.getActiveUserCount();
    
    const metrics: HealthMetrics = {
      timestamp: new Date(),
      apiHealth,
      dbHealth,
      responseTime,
      errorCount: this.getRecentErrorCount(),
      activeUsers,
      memoryUsage: memoryUsage.heapUsed / 1024 / 1024, // MB
      diskUsage: 0 // TODO: implement disk usage check
    };

    // Check for performance issues
    if (metrics.memoryUsage > 500) {
      this.addIssue({
        type: 'performance',
        severity: 'medium',
        description: `High memory usage: ${metrics.memoryUsage.toFixed(2)}MB`,
        component: 'system',
        timestamp: new Date(),
        metrics: { memoryUsage: metrics.memoryUsage }
      });
    }

    this.metrics.push(metrics);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    return metrics;
  }

  private async getActiveUserCount(): Promise<number> {
    try {
      const result = await db.select().from(users);
      return result.length;
    } catch (error) {
      return 0;
    }
  }

  private getRecentErrorCount(): number {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.issues.filter(issue => 
      issue.type === 'error' && issue.timestamp > oneHourAgo
    ).length;
  }

  private addIssue(issue: SystemIssue) {
    this.issues.push(issue);
    console.error(`[HealthMonitor] ${issue.severity.toUpperCase()}: ${issue.description}`);
    
    // Keep only last 1000 issues
    if (this.issues.length > 1000) {
      this.issues = this.issues.slice(-1000);
    }
  }

  getRecentIssues(hours: number = 24): SystemIssue[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.issues.filter(issue => issue.timestamp > cutoff);
  }

  getCriticalIssues(): SystemIssue[] {
    return this.issues.filter(issue => 
      issue.severity === 'critical' && 
      issue.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );
  }

  getLatestMetrics(): HealthMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getAllMetrics(): HealthMetrics[] {
    return [...this.metrics];
  }

  start() {
    this.isRunning = true;
    console.log('[HealthMonitor] Started monitoring...');
  }

  stop() {
    this.isRunning = false;
    console.log('[HealthMonitor] Stopped monitoring.');
  }

  isActive(): boolean {
    return this.isRunning;
  }

  getSystemStatus() {
    const latest = this.getLatestMetrics();
    const critical = this.getCriticalIssues();
    const recent = this.getRecentIssues(1);
    
    return {
      status: critical.length > 0 ? 'critical' : 
              recent.filter(i => i.severity === 'high').length > 0 ? 'warning' : 'healthy',
      metrics: latest,
      criticalIssues: critical.length,
      recentIssues: recent.length,
      uptime: latest ? latest.apiHealth && latest.dbHealth : false
    };
  }
}

export const healthMonitor = HealthMonitor.getInstance();