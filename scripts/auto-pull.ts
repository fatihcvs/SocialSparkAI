#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';

/**
 * Auto-pull script to get autonomous updates from GitHub
 * Runs safely with conflict detection
 */

class AutoPullManager {
  private logFile = 'logs/auto-pull.log';

  log(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    // Ensure logs directory exists
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs', { recursive: true });
    }
    
    fs.appendFileSync(this.logFile, logMessage);
    console.log(message);
  }

  async checkForUpdates(): Promise<boolean> {
    try {
      // Fetch latest from remote
      execSync('git fetch origin', { stdio: 'pipe' });
      
      // Check if there are updates
      const localCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      const remoteCommit = execSync('git rev-parse origin/main', { encoding: 'utf8' }).trim();
      
      return localCommit !== remoteCommit;
    } catch (error) {
      this.log(`❌ Error checking for updates: ${error}`);
      return false;
    }
  }

  async pullUpdates(): Promise<boolean> {
    try {
      // Check for uncommitted changes and handle them automatically
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        this.log('⚠️ Uncommitted changes detected, auto-committing...');
        
        try {
          // Stage all changes
          execSync('git add .', { stdio: 'pipe' });
          
          // Commit with auto-generated message
          const timestamp = new Date().toISOString();
          execSync(`git commit -m "🤖 Auto-commit before pull - ${timestamp}"`, { stdio: 'pipe' });
          
          this.log('✅ Local changes committed automatically');
        } catch (commitError) {
          this.log('⚠️ Could not auto-commit, using stash strategy...');
          
          // Fallback to stash strategy
          execSync('git stash push -m "Auto-stash before pull"', { stdio: 'pipe' });
          this.log('📦 Changes stashed temporarily');
        }
      }

      // Pull updates
      execSync('git pull origin main', { stdio: 'pipe' });
      this.log('✅ Successfully pulled autonomous updates from GitHub');
      
      // Get latest commit info
      const latestCommit = execSync('git log -1 --pretty=format:"%h - %s (%an)"', { encoding: 'utf8' });
      this.log(`📝 Latest commit: ${latestCommit}`);
      
      return true;
    } catch (error: any) {
      if (error.message.includes('CONFLICT')) {
        this.log('⚠️ Merge conflict detected - manual intervention required');
        return false;
      }
      
      this.log(`❌ Error pulling updates: ${error.message}`);
      return false;
    }
  }

  async run() {
    this.log('🔍 Checking for autonomous updates from GitHub...');
    
    const hasUpdates = await this.checkForUpdates();
    if (!hasUpdates) {
      this.log('✅ Already up to date');
      return;
    }
    
    this.log('📥 New autonomous updates detected');
    const success = await this.pullUpdates();
    
    if (success) {
      this.log('🎉 Autonomous updates applied successfully');
      
      // Restart development server if needed
      this.log('🔄 Consider restarting the development server');
    } else {
      this.log('❌ Failed to apply updates - check manually');
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new AutoPullManager();
  manager.run().catch(console.error);
}

export { AutoPullManager };