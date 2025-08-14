import OpenAI from "openai";
import { healthMonitor } from "./healthMonitor";
import fs from "fs/promises";
import path from "path";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface AnalysisResult {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'bug' | 'performance' | 'security' | 'enhancement' | 'maintenance';
  summary: string;
  detailedAnalysis: string;
  recommendedActions: string[];
  estimatedImpact: string;
  urgency: number; // 1-10
  autoFixable: boolean;
  codeChanges?: {
    file: string;
    changes: string;
    reason: string;
  }[];
}

interface SystemContext {
  healthMetrics: any;
  recentIssues: any[];
  codebase: {
    structure: string[];
    recentChanges: string[];
  };
  performance: {
    responseTime: number;
    memoryUsage: number;
    errorRate: number;
  };
}

export class AIAnalyzer {
  private static instance: AIAnalyzer;
  private analysisHistory: AnalysisResult[] = [];

  static getInstance(): AIAnalyzer {
    if (!AIAnalyzer.instance) {
      AIAnalyzer.instance = new AIAnalyzer();
    }
    return AIAnalyzer.instance;
  }

  async analyzeSystemHealth(): Promise<AnalysisResult> {
    try {
      const context = await this.gatherSystemContext();
      const analysis = await this.performAIAnalysis(context);
      
      this.analysisHistory.push(analysis);
      
      // Keep only last 50 analyses
      if (this.analysisHistory.length > 50) {
        this.analysisHistory = this.analysisHistory.slice(-50);
      }
      
      return analysis;
    } catch (error) {
      console.error('[AIAnalyzer] Analysis failed:', error);
      return {
        severity: 'high',
        category: 'bug',
        summary: 'AI Analysis System Error',
        detailedAnalysis: `AI analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        recommendedActions: ['Check OpenAI API key', 'Review system logs', 'Restart AI analyzer'],
        estimatedImpact: 'Medium - Autonomous improvements disabled',
        urgency: 7,
        autoFixable: false
      };
    }
  }

  private async gatherSystemContext(): Promise<SystemContext> {
    const healthMetrics = healthMonitor.getLatestMetrics();
    const recentIssues = healthMonitor.getRecentIssues(6); // Last 6 hours
    const codebaseStructure = await this.getCodebaseStructure();
    
    return {
      healthMetrics,
      recentIssues,
      codebase: {
        structure: codebaseStructure,
        recentChanges: [] // TODO: implement git log parsing
      },
      performance: {
        responseTime: healthMetrics?.responseTime || 0,
        memoryUsage: healthMetrics?.memoryUsage || 0,
        errorRate: recentIssues.filter(i => i.type === 'error').length
      }
    };
  }

  private async getCodebaseStructure(): Promise<string[]> {
    try {
      const structure = [];
      const dirs = ['server', 'client/src', 'shared'];
      
      for (const dir of dirs) {
        try {
          const files = await this.readDirectoryRecursive(dir);
          structure.push(...files);
        } catch (error) {
          // Directory might not exist, skip
        }
      }
      
      return structure;
    } catch (error) {
      return [];
    }
  }

  private async readDirectoryRecursive(dirPath: string): Promise<string[]> {
    const files = [];
    
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        try {
          const stat = await fs.stat(fullPath);
          
          if (stat.isDirectory()) {
            const subFiles = await this.readDirectoryRecursive(fullPath);
            files.push(...subFiles);
          } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js')) {
            files.push(fullPath);
          }
        } catch (error) {
          // Skip inaccessible files
        }
      }
    } catch (error) {
      // Directory not accessible
    }
    
    return files;
  }

  private async performAIAnalysis(context: SystemContext): Promise<AnalysisResult> {
    const prompt = `
You are an expert system administrator and full-stack developer analyzing a SocialSparkAI application.

CURRENT SYSTEM CONTEXT:
${JSON.stringify(context, null, 2)}

ANALYZE THE SYSTEM AND PROVIDE:

1. Overall health assessment
2. Critical issues that need immediate attention
3. Performance optimization opportunities
4. Code quality improvements
5. Security considerations
6. Specific actionable recommendations

Focus on:
- Database performance and optimization
- API response times and error handling  
- Memory usage and resource optimization
- Code quality and maintainability
- Security vulnerabilities
- User experience improvements

Provide response in JSON format with this structure:
{
  "severity": "low|medium|high|critical",
  "category": "bug|performance|security|enhancement|maintenance", 
  "summary": "Brief issue summary",
  "detailedAnalysis": "Detailed technical analysis",
  "recommendedActions": ["action1", "action2", "action3"],
  "estimatedImpact": "Impact description",
  "urgency": 1-10,
  "autoFixable": boolean,
  "codeChanges": [
    {
      "file": "path/to/file.ts",
      "changes": "specific code changes needed",
      "reason": "why this change is needed"
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert system administrator and developer. Analyze the system and provide specific, actionable recommendations. Always respond with valid JSON."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and set defaults
    return {
      severity: result.severity || 'medium',
      category: result.category || 'maintenance',
      summary: result.summary || 'System analysis completed',
      detailedAnalysis: result.detailedAnalysis || 'No detailed analysis available',
      recommendedActions: result.recommendedActions || [],
      estimatedImpact: result.estimatedImpact || 'Unknown impact',
      urgency: result.urgency || 5,
      autoFixable: result.autoFixable || false,
      codeChanges: result.codeChanges || []
    };
  }

  async analyzeSpecificIssue(issue: any): Promise<AnalysisResult> {
    const prompt = `
Analyze this specific system issue and provide detailed recommendations:

ISSUE DETAILS:
${JSON.stringify(issue, null, 2)}

SYSTEM CONTEXT:
- Application: SocialSparkAI (AI-powered social media content platform)
- Tech Stack: Node.js, Express, React, TypeScript, PostgreSQL, OpenAI API
- Features: AI content generation, social media publishing, subscription management

Provide specific analysis and actionable solutions in JSON format.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a senior developer specializing in debugging and system optimization. Provide specific, actionable solutions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  async generateCodeFix(codeChange: any): Promise<string> {
    const fileContent = await this.readFileContent(codeChange.file);
    
    const prompt = `
CURRENT FILE CONTENT:
${fileContent}

REQUIRED CHANGE:
${codeChange.changes}

REASON:
${codeChange.reason}

Generate the complete updated file content with the necessary changes implemented.
Maintain existing code style and structure. Only make the minimal necessary changes.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert developer. Generate clean, production-ready code changes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1
    });

    return response.choices[0].message.content || '';
  }

  private async readFileContent(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      return `// File not found or not readable: ${filePath}`;
    }
  }

  getAnalysisHistory(): AnalysisResult[] {
    return [...this.analysisHistory];
  }

  getCriticalAnalyses(): AnalysisResult[] {
    return this.analysisHistory.filter(a => 
      a.severity === 'critical' || a.urgency >= 8
    );
  }
}

export const aiAnalyzer = AIAnalyzer.getInstance();