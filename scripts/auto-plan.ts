#!/usr/bin/env tsx

/**
 * SocialSparkAI Autonomous Development Planner
 * 
 * ChatGPT-powered system that analyzes the codebase, telemetry data,
 * and user feedback to generate comprehensive development plans.
 */

import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

// Initialize OpenAI with error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY
});

interface TelemetryData {
  metrics: any;
  feedback: string[];
  roadmap: any[];
  lastCycleResults: any;
}

interface DevelopmentPlan {
  cycleId: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'ai_content' | 'social_publishing' | 'payment' | 'ui' | 'performance' | 'security' | 'feature';
  summary: string;
  detailedAnalysis: string;
  plannedChanges: {
    files: string[];
    newFeatures: string[];
    bugFixes: string[];
    optimizations: string[];
    documentation: string[];
  };
  estimatedImpact: string;
  riskAssessment: string;
  testingStrategy: string;
  rollbackPlan: string;
}

class AutonomousPlanner {
  private cycleId: string;
  private timestamp: string;

  constructor() {
    this.cycleId = this.generateCycleId();
    this.timestamp = new Date().toISOString();
  }

  private generateCycleId(): string {
    return `auto-dev-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
  }

  async generateDevelopmentPlan(): Promise<DevelopmentPlan> {
    console.log(`🧠 [AutoPlanner] Starting autonomous development planning - Cycle: ${this.cycleId}`);

    try {
      // Collect comprehensive system data
      const codebaseAnalysis = await this.analyzeCodebase();
      const telemetryData = await this.loadTelemetryData();
      const projectContext = await this.loadProjectContext();

      // Generate AI-powered development plan
      const plan = await this.generateAIPlan(codebaseAnalysis, telemetryData, projectContext);

      // Save plan for implementation
      await this.savePlan(plan);

      console.log(`✅ [AutoPlanner] Development plan generated successfully`);
      console.log(`📋 Priority: ${plan.priority} | Category: ${plan.category}`);
      console.log(`📝 Summary: ${plan.summary}`);

      return plan;

    } catch (error) {
      console.error(`❌ [AutoPlanner] Planning failed:`, error);
      return this.generateFallbackPlan();
    }
  }

  private async analyzeCodebase(): Promise<any> {
    console.log(`🔍 [AutoPlanner] Analyzing codebase structure and health...`);

    const analysis = {
      structure: await this.getCodebaseStructure(),
      recentChanges: await this.getRecentChanges(),
      codeQuality: await this.assessCodeQuality(),
      dependencies: await this.analyzeDependencies(),
      performance: await this.getPerformanceMetrics()
    };

    return analysis;
  }

  private async getCodebaseStructure(): Promise<string[]> {
    const files: string[] = [];
    const scanDirectories = ['server', 'client/src', 'shared', 'scripts'];

    for (const dir of scanDirectories) {
      try {
        const dirFiles = await this.scanDirectory(dir);
        files.push(...dirFiles);
      } catch (error) {
        console.log(`⚠️ Directory ${dir} not accessible`);
      }
    }

    return files;
  }

  private async scanDirectory(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        try {
          const stat = await fs.stat(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            const subFiles = await this.scanDirectory(fullPath);
            files.push(...subFiles);
          } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
            files.push(fullPath);
          }
        } catch (error) {
          // Skip inaccessible files
        }
      }
    } catch (error) {
      console.log(`⚠️ Cannot scan directory: ${dirPath}`);
    }

    return files;
  }

  private async getRecentChanges(): Promise<any> {
    // Simulate git log analysis (in real implementation, would use git commands)
    return {
      lastCommits: [],
      modifiedFiles: [],
      addedFeatures: []
    };
  }

  private async assessCodeQuality(): Promise<any> {
    return {
      complexity: 'medium',
      maintainability: 'good',
      testCoverage: 'moderate',
      securityScore: 'high'
    };
  }

  private async analyzeDependencies(): Promise<any> {
    try {
      const packageJson = await fs.readFile('package.json', 'utf-8');
      const pkg = JSON.parse(packageJson);
      
      return {
        dependencies: Object.keys(pkg.dependencies || {}),
        devDependencies: Object.keys(pkg.devDependencies || {}),
        outdated: [], // Would be populated by npm outdated
        vulnerabilities: [] // Would be populated by npm audit
      };
    } catch (error) {
      return { dependencies: [], devDependencies: [], outdated: [], vulnerabilities: [] };
    }
  }

  private async getPerformanceMetrics(): Promise<any> {
    return {
      buildTime: 'fast',
      bundleSize: 'optimized',
      loadTime: 'good',
      memoryUsage: 'normal'
    };
  }

  private async loadTelemetryData(): Promise<TelemetryData> {
    try {
      const metrics = await this.loadJSON('telemetry/metrics.json');
      const feedback = await this.loadTextFile('telemetry/feedback.md');
      const roadmap = await this.loadJSON('telemetry/roadmap.json');
      const lastCycleResults = await this.loadJSON('telemetry/last-cycle-results.json');

      return {
        metrics: metrics || {},
        feedback: feedback ? feedback.split('\n').filter(line => line.trim()) : [],
        roadmap: roadmap || [],
        lastCycleResults: lastCycleResults || {}
      };
    } catch (error) {
      console.log(`⚠️ [AutoPlanner] Telemetry data not available, using defaults`);
      return {
        metrics: {},
        feedback: [],
        roadmap: [],
        lastCycleResults: {}
      };
    }
  }

  private async loadProjectContext(): Promise<any> {
    try {
      const replit = await this.loadTextFile('replit.md');
      const readme = await this.loadTextFile('README.md');
      const packageJson = await this.loadJSON('package.json');

      return {
        projectInfo: packageJson || {},
        documentation: { replit, readme },
        context: 'SocialSparkAI - AI-powered social media content creation and publishing platform'
      };
    } catch (error) {
      return {
        projectInfo: {},
        documentation: {},
        context: 'SocialSparkAI platform'
      };
    }
  }

  private async generateAIPlan(codebaseAnalysis: any, telemetryData: TelemetryData, projectContext: any): Promise<DevelopmentPlan> {
    const prompt = `You are an expert autonomous software developer managing SocialSparkAI, an AI-powered social media content creation platform.

PLATFORM OVERVIEW:
SocialSparkAI enables users to:
- Generate AI content using OpenAI GPT-4o and DALL-E 3
- Publish automatically to social media via Zapier webhooks  
- Manage subscriptions with İyzico payment integration
- Create content through a 3-tab workflow (Ideas → Captions → Images)

CURRENT CODEBASE ANALYSIS:
${JSON.stringify(codebaseAnalysis, null, 2)}

TELEMETRY DATA:
${JSON.stringify(telemetryData, null, 2)}

PROJECT CONTEXT:
${JSON.stringify(projectContext, null, 2)}

Generate a comprehensive development plan for the next autonomous cycle. Focus on:

1. HIGH IMPACT IMPROVEMENTS:
   - AI content generation optimization
   - Social media publishing reliability
   - User experience enhancements
   - Performance optimizations

2. AUTONOMOUS DEVELOPMENT PRIORITIES:
   - Code quality improvements
   - Bug fixes and stability
   - New feature development
   - Security enhancements

3. CONTINUOUS IMPROVEMENT:
   - Documentation updates
   - Test coverage expansion
   - Dependency management
   - Performance monitoring

Respond with a JSON object matching this exact structure:
{
  "cycleId": "string",
  "timestamp": "ISO_string",
  "priority": "low|medium|high|critical",
  "category": "ai_content|social_publishing|payment|ui|performance|security|feature",
  "summary": "Brief description of planned work",
  "detailedAnalysis": "Comprehensive analysis of what needs to be done and why",
  "plannedChanges": {
    "files": ["list of files to modify"],
    "newFeatures": ["list of new features to implement"],
    "bugFixes": ["list of bugs to fix"],
    "optimizations": ["list of optimizations to apply"],
    "documentation": ["list of documentation updates"]
  },
  "estimatedImpact": "Description of expected impact on users and system",
  "riskAssessment": "Potential risks and mitigation strategies",
  "testingStrategy": "How to test the changes",
  "rollbackPlan": "How to rollback if issues arise"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert autonomous software developer. Generate detailed, actionable development plans. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const plan = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        cycleId: this.cycleId,
        timestamp: this.timestamp,
        priority: plan.priority || 'medium',
        category: plan.category || 'performance',
        summary: plan.summary || 'Autonomous system maintenance and optimization',
        detailedAnalysis: plan.detailedAnalysis || 'Performing routine system analysis and improvements',
        plannedChanges: plan.plannedChanges || {
          files: [],
          newFeatures: [],
          bugFixes: [],
          optimizations: [],
          documentation: []
        },
        estimatedImpact: plan.estimatedImpact || 'Improved system stability and performance',
        riskAssessment: plan.riskAssessment || 'Low risk - routine maintenance operations',
        testingStrategy: plan.testingStrategy || 'Automated testing and gradual rollout',
        rollbackPlan: plan.rollbackPlan || 'Git-based rollback available'
      };

    } catch (error) {
      console.error(`❌ [AutoPlanner] AI planning failed:`, error);
      return this.generateFallbackPlan();
    }
  }

  private generateFallbackPlan(): DevelopmentPlan {
    return {
      cycleId: this.cycleId,
      timestamp: this.timestamp,
      priority: 'low',
      category: 'performance',
      summary: 'Fallback maintenance cycle - basic system optimization',
      detailedAnalysis: 'AI planning temporarily unavailable, executing basic maintenance tasks',
      plannedChanges: {
        files: [],
        newFeatures: [],
        bugFixes: ['Fix any TypeScript compilation errors'],
        optimizations: ['Basic performance optimizations'],
        documentation: ['Update CHANGELOG.md']
      },
      estimatedImpact: 'Minimal - basic system maintenance',
      riskAssessment: 'Very low risk - minimal changes',
      testingStrategy: 'Basic compilation and lint checks',
      rollbackPlan: 'No rollback needed for maintenance tasks'
    };
  }

  private async savePlan(plan: DevelopmentPlan): Promise<void> {
    try {
      await fs.mkdir('telemetry', { recursive: true });
      await fs.writeFile('telemetry/current-plan.json', JSON.stringify(plan, null, 2));
      console.log(`💾 [AutoPlanner] Plan saved to telemetry/current-plan.json`);
    } catch (error) {
      console.error(`❌ [AutoPlanner] Failed to save plan:`, error);
    }
  }

  private async loadJSON(filePath: string): Promise<any> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  private async loadTextFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      return '';
    }
  }
}

// Main execution
async function main() {
  const planner = new AutonomousPlanner();
  
  try {
    const plan = await planner.generateDevelopmentPlan();
    
    console.log(`\n🎯 [AutoPlanner] DEVELOPMENT PLAN SUMMARY:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🆔 Cycle ID: ${plan.cycleId}`);
    console.log(`⏰ Timestamp: ${plan.timestamp}`);
    console.log(`🎯 Priority: ${plan.priority.toUpperCase()}`);
    console.log(`📂 Category: ${plan.category}`);
    console.log(`📝 Summary: ${plan.summary}`);
    console.log(`📊 Impact: ${plan.estimatedImpact}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ [AutoPlanner] Fatal error:`, error);
    process.exit(1);
  }
}

// ESM entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AutonomousPlanner };