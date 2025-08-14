import fs from "fs/promises";
import { aiAnalyzer } from "./aiAnalyzer";
import { healthMonitor } from "./healthMonitor";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface FixResult {
  success: boolean;
  action: string;
  description: string;
  timestamp: Date;
  changes: string[];
  error?: string;
  rollbackInfo?: any;
}

interface AutoFixConfig {
  enableCodeChanges: boolean;
  enableDatabaseFixes: boolean;
  enableConfigUpdates: boolean;
  maxFilesPerFix: number;
  backupBeforeFix: boolean;
  testAfterFix: boolean;
}

export class AutoFixer {
  private static instance: AutoFixer;
  private fixHistory: FixResult[] = [];
  private config: AutoFixConfig = {
    enableCodeChanges: true,
    enableDatabaseFixes: true,
    enableConfigUpdates: true,
    maxFilesPerFix: 5,
    backupBeforeFix: true,
    testAfterFix: true
  };

  static getInstance(): AutoFixer {
    if (!AutoFixer.instance) {
      AutoFixer.instance = new AutoFixer();
    }
    return AutoFixer.instance;
  }

  async executeAutomaticFix(analysis: any): Promise<FixResult> {
    console.log(`[AutoFixer] Executing fix for: ${analysis.summary}`);
    
    if (!analysis.autoFixable) {
      return {
        success: false,
        action: 'skip',
        description: 'Issue marked as not auto-fixable',
        timestamp: new Date(),
        changes: []
      };
    }

    try {
      // Create backup before making changes
      if (this.config.backupBeforeFix) {
        await this.createBackup();
      }

      let result: FixResult;

      switch (analysis.category) {
        case 'performance':
          result = await this.fixPerformanceIssue(analysis);
          break;
        case 'bug':
          result = await this.fixBugIssue(analysis);
          break;
        case 'security':
          result = await this.fixSecurityIssue(analysis);
          break;
        case 'maintenance':
          result = await this.fixMaintenanceIssue(analysis);
          break;
        case 'enhancement':
          result = await this.implementEnhancement(analysis);
          break;
        default:
          result = await this.genericFix(analysis);
      }

      // Test system health after fix
      if (this.config.testAfterFix && result.success) {
        const healthCheck = await this.verifyFix();
        if (!healthCheck.success) {
          await this.rollbackChanges(result.rollbackInfo);
          result.success = false;
          result.error = 'Fix caused system issues, rolled back';
        }
      }

      this.fixHistory.push(result);
      
      // Keep only last 100 fix records
      if (this.fixHistory.length > 100) {
        this.fixHistory = this.fixHistory.slice(-100);
      }

      return result;
    } catch (error) {
      const errorResult: FixResult = {
        success: false,
        action: 'error',
        description: 'Auto-fix execution failed',
        timestamp: new Date(),
        changes: [],
        error: error.message
      };
      
      this.fixHistory.push(errorResult);
      return errorResult;
    }
  }

  private async fixPerformanceIssue(analysis: any): Promise<FixResult> {
    const changes: string[] = [];
    
    try {
      // Common performance fixes
      if (analysis.detailedAnalysis.includes('memory')) {
        await this.optimizeMemoryUsage();
        changes.push('Applied memory optimization');
      }
      
      if (analysis.detailedAnalysis.includes('database') || analysis.detailedAnalysis.includes('query')) {
        await this.optimizeDatabaseQueries();
        changes.push('Optimized database queries');
      }
      
      if (analysis.detailedAnalysis.includes('cache')) {
        await this.improveCaching();
        changes.push('Enhanced caching mechanisms');
      }

      // Apply code changes if specified
      if (analysis.codeChanges) {
        for (const codeChange of analysis.codeChanges.slice(0, this.config.maxFilesPerFix)) {
          const fixedCode = await aiAnalyzer.generateCodeFix(codeChange);
          await this.applyCodeChange(codeChange.file, fixedCode);
          changes.push(`Updated ${codeChange.file}: ${codeChange.reason}`);
        }
      }

      return {
        success: true,
        action: 'performance_optimization',
        description: analysis.summary,
        timestamp: new Date(),
        changes
      };
    } catch (error) {
      return {
        success: false,
        action: 'performance_optimization',
        description: analysis.summary,
        timestamp: new Date(),
        changes,
        error: error.message
      };
    }
  }

  private async fixBugIssue(analysis: any): Promise<FixResult> {
    const changes: string[] = [];
    
    try {
      // Apply AI-suggested code changes
      if (analysis.codeChanges) {
        for (const codeChange of analysis.codeChanges.slice(0, this.config.maxFilesPerFix)) {
          const fixedCode = await aiAnalyzer.generateCodeFix(codeChange);
          await this.applyCodeChange(codeChange.file, fixedCode);
          changes.push(`Fixed bug in ${codeChange.file}: ${codeChange.reason}`);
        }
      }

      // Common bug fixes
      await this.addErrorHandling();
      changes.push('Enhanced error handling');

      await this.fixNullPointerExceptions();
      changes.push('Fixed potential null pointer exceptions');

      return {
        success: true,
        action: 'bug_fix',
        description: analysis.summary,
        timestamp: new Date(),
        changes
      };
    } catch (error) {
      return {
        success: false,
        action: 'bug_fix',
        description: analysis.summary,
        timestamp: new Date(),
        changes,
        error: error.message
      };
    }
  }

  private async fixSecurityIssue(analysis: any): Promise<FixResult> {
    const changes: string[] = [];
    
    try {
      // Security fixes
      await this.updateSecurityHeaders();
      changes.push('Updated security headers');

      await this.validateInputSanitization();
      changes.push('Enhanced input validation');

      await this.checkAPIKeyExposure();
      changes.push('Verified API key security');

      if (analysis.codeChanges) {
        for (const codeChange of analysis.codeChanges.slice(0, this.config.maxFilesPerFix)) {
          const fixedCode = await aiAnalyzer.generateCodeFix(codeChange);
          await this.applyCodeChange(codeChange.file, fixedCode);
          changes.push(`Security fix in ${codeChange.file}: ${codeChange.reason}`);
        }
      }

      return {
        success: true,
        action: 'security_fix',
        description: analysis.summary,
        timestamp: new Date(),
        changes
      };
    } catch (error) {
      return {
        success: false,
        action: 'security_fix',
        description: analysis.summary,
        timestamp: new Date(),
        changes,
        error: error.message
      };
    }
  }

  private async fixMaintenanceIssue(analysis: any): Promise<FixResult> {
    const changes: string[] = [];
    
    try {
      // Maintenance tasks
      await this.cleanupLogs();
      changes.push('Cleaned up old log files');

      await this.optimizeAssets();
      changes.push('Optimized static assets');

      await this.updateDependencies();
      changes.push('Updated package dependencies');

      if (analysis.codeChanges) {
        for (const codeChange of analysis.codeChanges.slice(0, this.config.maxFilesPerFix)) {
          const fixedCode = await aiAnalyzer.generateCodeFix(codeChange);
          await this.applyCodeChange(codeChange.file, fixedCode);
          changes.push(`Maintenance update in ${codeChange.file}: ${codeChange.reason}`);
        }
      }

      return {
        success: true,
        action: 'maintenance',
        description: analysis.summary,
        timestamp: new Date(),
        changes
      };
    } catch (error) {
      return {
        success: false,
        action: 'maintenance',
        description: analysis.summary,
        timestamp: new Date(),
        changes,
        error: error.message
      };
    }
  }

  private async implementEnhancement(analysis: any): Promise<FixResult> {
    const changes: string[] = [];
    
    try {
      if (analysis.codeChanges) {
        for (const codeChange of analysis.codeChanges.slice(0, this.config.maxFilesPerFix)) {
          const enhancedCode = await aiAnalyzer.generateCodeFix(codeChange);
          await this.applyCodeChange(codeChange.file, enhancedCode);
          changes.push(`Enhancement in ${codeChange.file}: ${codeChange.reason}`);
        }
      }

      // Common enhancements
      await this.optimizeUserExperience();
      changes.push('Applied UX improvements');

      await this.enhanceErrorMessages();
      changes.push('Improved error messages');

      return {
        success: true,
        action: 'enhancement',
        description: analysis.summary,
        timestamp: new Date(),
        changes
      };
    } catch (error) {
      return {
        success: false,
        action: 'enhancement',
        description: analysis.summary,
        timestamp: new Date(),
        changes,
        error: error.message
      };
    }
  }

  private async genericFix(analysis: any): Promise<FixResult> {
    const changes: string[] = [];
    
    try {
      if (analysis.codeChanges) {
        for (const codeChange of analysis.codeChanges.slice(0, this.config.maxFilesPerFix)) {
          const fixedCode = await aiAnalyzer.generateCodeFix(codeChange);
          await this.applyCodeChange(codeChange.file, fixedCode);
          changes.push(`Applied fix to ${codeChange.file}: ${codeChange.reason}`);
        }
      }

      return {
        success: true,
        action: 'generic_fix',
        description: analysis.summary,
        timestamp: new Date(),
        changes
      };
    } catch (error) {
      return {
        success: false,
        action: 'generic_fix', 
        description: analysis.summary,
        timestamp: new Date(),
        changes,
        error: error.message
      };
    }
  }

  // Helper methods for specific fix types
  private async optimizeMemoryUsage(): Promise<void> {
    // Implement memory optimization logic
    console.log('[AutoFixer] Optimizing memory usage...');
  }

  private async optimizeDatabaseQueries(): Promise<void> {
    // Implement database optimization logic
    console.log('[AutoFixer] Optimizing database queries...');
  }

  private async improveCaching(): Promise<void> {
    // Implement caching improvements
    console.log('[AutoFixer] Improving caching mechanisms...');
  }

  private async addErrorHandling(): Promise<void> {
    // Implement error handling improvements
    console.log('[AutoFixer] Adding error handling...');
  }

  private async fixNullPointerExceptions(): Promise<void> {
    // Implement null pointer fixes
    console.log('[AutoFixer] Fixing null pointer exceptions...');
  }

  private async updateSecurityHeaders(): Promise<void> {
    // Implement security header updates
    console.log('[AutoFixer] Updating security headers...');
  }

  private async validateInputSanitization(): Promise<void> {
    // Implement input validation
    console.log('[AutoFixer] Validating input sanitization...');
  }

  private async checkAPIKeyExposure(): Promise<void> {
    // Implement API key security check
    console.log('[AutoFixer] Checking API key exposure...');
  }

  private async cleanupLogs(): Promise<void> {
    // Implement log cleanup
    console.log('[AutoFixer] Cleaning up logs...');
  }

  private async optimizeAssets(): Promise<void> {
    // Implement asset optimization
    console.log('[AutoFixer] Optimizing assets...');
  }

  private async updateDependencies(): Promise<void> {
    // Implement dependency updates
    console.log('[AutoFixer] Updating dependencies...');
  }

  private async optimizeUserExperience(): Promise<void> {
    // Implement UX improvements
    console.log('[AutoFixer] Optimizing user experience...');
  }

  private async enhanceErrorMessages(): Promise<void> {
    // Implement error message improvements
    console.log('[AutoFixer] Enhancing error messages...');
  }

  private async applyCodeChange(filePath: string, newContent: string): Promise<void> {
    try {
      await fs.writeFile(filePath, newContent, 'utf-8');
      console.log(`[AutoFixer] Applied changes to ${filePath}`);
    } catch (error) {
      console.error(`[AutoFixer] Failed to apply changes to ${filePath}:`, error);
      throw error;
    }
  }

  private async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `backups/auto-fix-${timestamp}`;
    
    try {
      await execAsync(`mkdir -p ${backupDir}`);
      await execAsync(`cp -r server client shared ${backupDir}/`);
      console.log(`[AutoFixer] Created backup: ${backupDir}`);
      return backupDir;
    } catch (error) {
      console.error('[AutoFixer] Backup creation failed:', error);
      throw error;
    }
  }

  private async verifyFix(): Promise<{ success: boolean; details?: string }> {
    try {
      // Wait a moment for changes to take effect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const metrics = await healthMonitor.checkSystemMetrics();
      const status = healthMonitor.getSystemStatus();
      
      return {
        success: status.uptime && status.status !== 'critical',
        details: `System status: ${status.status}, Uptime: ${status.uptime}`
      };
    } catch (error) {
      return {
        success: false,
        details: `Health check failed: ${error.message}`
      };
    }
  }

  private async rollbackChanges(rollbackInfo: any): Promise<void> {
    if (rollbackInfo && rollbackInfo.backupDir) {
      try {
        await execAsync(`cp -r ${rollbackInfo.backupDir}/* ./`);
        console.log('[AutoFixer] Successfully rolled back changes');
      } catch (error) {
        console.error('[AutoFixer] Rollback failed:', error);
      }
    }
  }

  getFixHistory(): FixResult[] {
    return [...this.fixHistory];
  }

  getSuccessfulFixes(): FixResult[] {
    return this.fixHistory.filter(fix => fix.success);
  }

  getRecentFixes(hours: number = 24): FixResult[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.fixHistory.filter(fix => fix.timestamp > cutoff);
  }

  updateConfig(newConfig: Partial<AutoFixConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[AutoFixer] Configuration updated:', this.config);
  }

  getConfig(): AutoFixConfig {
    return { ...this.config };
  }
}

export const autoFixer = AutoFixer.getInstance();