#!/usr/bin/env tsx

/**
 * SocialSparkAI Cycle Report Generator
 * 
 * Generates comprehensive reports for each autonomous development cycle,
 * documenting what was accomplished, performance metrics, and next steps.
 */

import fs from 'fs/promises';
import path from 'path';

interface CycleReport {
  cycleId: string;
  timestamp: string;
  duration: number;
  plan: any;
  implementation: any;
  metrics: any;
  summary: {
    success: boolean;
    tasksCompleted: number;
    tasksFailed: number;
    filesChanged: number;
    linesModified: number;
    performanceImpact: string;
  };
  detailedResults: any;
  nextCycleRecommendations: string[];
}

class CycleReportGenerator {
  private timestamp: string;

  constructor() {
    this.timestamp = new Date().toISOString();
  }

  async generateReport(): Promise<CycleReport | null> {
    console.log(`📝 [CycleReportGenerator] Generating autonomous development cycle report...`);

    try {
      const plan = await this.loadPlan();
      const implementation = await this.loadImplementationResults();
      const metrics = await this.loadMetrics();

      if (!plan && !implementation) {
        console.log(`⚠️ [CycleReportGenerator] No cycle data found, skipping report generation`);
        return null;
      }

      const report = await this.createReport(plan, implementation, metrics);
      await this.saveReport(report);
      await this.updateReportHistory(report);

      console.log(`✅ [CycleReportGenerator] Cycle report generated successfully`);
      return report;

    } catch (error) {
      console.error(`❌ [CycleReportGenerator] Failed to generate report:`, error);
      return null;
    }
  }

  private async loadPlan(): Promise<any> {
    try {
      const content = await fs.readFile('telemetry/current-plan.json', 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  private async loadImplementationResults(): Promise<any> {
    try {
      const content = await fs.readFile('telemetry/last-implementation-results.json', 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  private async loadMetrics(): Promise<any> {
    try {
      const content = await fs.readFile('telemetry/metrics.json', 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return {};
    }
  }

  private async createReport(plan: any, implementation: any, metrics: any): Promise<CycleReport> {
    const cycleId = plan?.cycleId || implementation?.cycleId || `cycle-${Date.now()}`;
    
    return {
      cycleId,
      timestamp: this.timestamp,
      duration: this.calculateCycleDuration(plan, implementation),
      plan: plan || {},
      implementation: implementation || {},
      metrics: metrics || {},
      summary: {
        success: implementation?.status === 'success',
        tasksCompleted: implementation?.completedTasks?.length || 0,
        tasksFailed: implementation?.failedTasks?.length || 0,
        filesChanged: implementation?.changes?.filesModified?.length || 0,
        linesModified: implementation?.changes?.linesChanged || 0,
        performanceImpact: this.assessPerformanceImpact(implementation, metrics)
      },
      detailedResults: {
        planCategory: plan?.category || 'unknown',
        planPriority: plan?.priority || 'unknown',
        implementationStatus: implementation?.status || 'unknown',
        completedTasks: implementation?.completedTasks || [],
        failedTasks: implementation?.failedTasks || [],
        testResults: implementation?.testResults || {},
        changesBreakdown: implementation?.changes || {}
      },
      nextCycleRecommendations: this.generateRecommendations(plan, implementation, metrics)
    };
  }

  private calculateCycleDuration(plan: any, implementation: any): number {
    // Simple duration calculation (would be more precise in production)
    if (plan?.timestamp && implementation?.timestamp) {
      const start = new Date(plan.timestamp).getTime();
      const end = new Date(implementation.timestamp).getTime();
      return Math.round((end - start) / 1000 / 60); // Duration in minutes
    }
    return 0;
  }

  private assessPerformanceImpact(implementation: any, metrics: any): string {
    if (!implementation || implementation.status !== 'success') {
      return 'No impact - cycle failed';
    }

    const tasksCompleted = implementation.completedTasks?.length || 0;
    const filesChanged = implementation.changes?.filesModified?.length || 0;

    if (tasksCompleted >= 5 || filesChanged >= 10) {
      return 'High impact - significant improvements applied';
    } else if (tasksCompleted >= 2 || filesChanged >= 5) {
      return 'Medium impact - moderate improvements applied';
    } else if (tasksCompleted >= 1 || filesChanged >= 1) {
      return 'Low impact - minor improvements applied';
    } else {
      return 'Minimal impact - maintenance tasks only';
    }
  }

  private generateRecommendations(plan: any, implementation: any, metrics: any): string[] {
    const recommendations: string[] = [];

    // Analyze success/failure patterns
    if (implementation?.status === 'failed') {
      recommendations.push('Review system logs and fix underlying issues causing cycle failures');
      recommendations.push('Consider reducing scope of next cycle to ensure success');
    }

    if (implementation?.failedTasks?.length > 0) {
      recommendations.push('Retry failed tasks in next cycle with improved error handling');
    }

    // Analyze performance and metrics
    if (metrics?.errors?.total > 20) {
      recommendations.push('Focus next cycle on error reduction and system stability');
    }

    if (metrics?.performance?.averageResponseTime > 500) {
      recommendations.push('Prioritize performance optimizations in next cycle');
    }

    // Analyze plan effectiveness
    if (plan?.category === 'ai_content' && implementation?.completedTasks?.length < 3) {
      recommendations.push('AI content optimizations may need more focused approach');
    }

    if (plan?.priority === 'high' && implementation?.status !== 'success') {
      recommendations.push('High priority items should be broken down into smaller, manageable tasks');
    }

    // Default recommendations if none generated
    if (recommendations.length === 0) {
      recommendations.push('Continue with regular maintenance and optimization cycles');
      recommendations.push('Monitor user feedback for new feature requests');
      recommendations.push('Focus on code quality and test coverage improvements');
    }

    return recommendations;
  }

  private async saveReport(report: CycleReport): Promise<void> {
    await fs.mkdir('telemetry/reports', { recursive: true });
    
    const filename = `cycle-report-${report.cycleId}.json`;
    const filepath = path.join('telemetry/reports', filename);
    
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    
    // Also save as latest report
    await fs.writeFile('telemetry/latest-cycle-report.json', JSON.stringify(report, null, 2));
  }

  private async updateReportHistory(report: CycleReport): Promise<void> {
    try {
      let history: any[] = [];
      
      try {
        const historyContent = await fs.readFile('telemetry/cycle-history.json', 'utf-8');
        history = JSON.parse(historyContent);
      } catch (error) {
        // File doesn't exist, start with empty history
      }

      // Add current report summary to history
      history.push({
        cycleId: report.cycleId,
        timestamp: report.timestamp,
        success: report.summary.success,
        tasksCompleted: report.summary.tasksCompleted,
        tasksFailed: report.summary.tasksFailed,
        filesChanged: report.summary.filesChanged,
        performanceImpact: report.summary.performanceImpact,
        category: report.plan?.category || 'unknown',
        priority: report.plan?.priority || 'unknown'
      });

      // Keep only last 100 cycle summaries
      if (history.length > 100) {
        history = history.slice(-100);
      }

      await fs.writeFile('telemetry/cycle-history.json', JSON.stringify(history, null, 2));
    } catch (error) {
      console.error(`⚠️ [CycleReportGenerator] Failed to update history:`, error);
    }
  }

  async generateMarkdownReport(report: CycleReport): Promise<string> {
    const successIcon = report.summary.success ? '✅' : '❌';
    const date = new Date(report.timestamp).toLocaleString();

    return `# 🤖 Autonomous Development Cycle Report

## ${successIcon} Cycle Summary
- **Cycle ID**: ${report.cycleId}
- **Timestamp**: ${date}
- **Duration**: ${report.duration} minutes
- **Status**: ${report.summary.success ? 'SUCCESS' : 'FAILED'}

## 📋 Plan Details
- **Category**: ${report.plan?.category || 'N/A'}
- **Priority**: ${report.plan?.priority || 'N/A'}
- **Summary**: ${report.plan?.summary || 'N/A'}

## 📊 Implementation Results
- **Tasks Completed**: ${report.summary.tasksCompleted}
- **Tasks Failed**: ${report.summary.tasksFailed}
- **Files Modified**: ${report.summary.filesChanged}
- **Lines Changed**: ${report.summary.linesModified}
- **Performance Impact**: ${report.summary.performanceImpact}

## ✅ Completed Tasks
${report.detailedResults.completedTasks.map((task: string) => `- ${task}`).join('\n') || '- None'}

## ❌ Failed Tasks
${report.detailedResults.failedTasks.map((task: string) => `- ${task}`).join('\n') || '- None'}

## 🔧 Test Results
- **TypeScript**: ${report.detailedResults.testResults?.typescript || 'Not run'}
- **Lint**: ${report.detailedResults.testResults?.lint || 'Not run'}

## 🎯 Next Cycle Recommendations
${report.nextCycleRecommendations.map((rec: string) => `- ${rec}`).join('\n')}

---
*Generated by SocialSparkAI Autonomous Development System*
`;
  }
}

// Main execution
async function main() {
  const generator = new CycleReportGenerator();
  
  try {
    const report = await generator.generateReport();
    
    if (report) {
      console.log(`\n📊 [CycleReportGenerator] CYCLE REPORT SUMMARY:`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🆔 Cycle ID: ${report.cycleId}`);
      console.log(`${report.summary.success ? '✅' : '❌'} Status: ${report.summary.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`📝 Tasks Completed: ${report.summary.tasksCompleted}`);
      console.log(`❌ Tasks Failed: ${report.summary.tasksFailed}`);
      console.log(`📁 Files Changed: ${report.summary.filesChanged}`);
      console.log(`📊 Performance Impact: ${report.summary.performanceImpact}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error(`❌ [CycleReportGenerator] Fatal error:`, error);
    process.exit(1);
  }
}

// ESM entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CycleReportGenerator };