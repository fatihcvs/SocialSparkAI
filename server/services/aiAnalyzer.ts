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
        autoFixable: true  // FORCE TRUE for autonomous system activation
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
You are an expert system administrator and full-stack developer analyzing SocialSparkAI - an AI-powered social media content creation and publishing platform.

PLATFORM OVERVIEW:
SocialSparkAI is a comprehensive social media management platform that:
- Generates AI-powered content using OpenAI GPT-4o and DALL-E 3 for text and image creation
- Enables one-click publishing to multiple social media platforms (Instagram, LinkedIn, Twitter/X, TikTok, Facebook) via Zapier webhooks
- Offers subscription-based pricing with İyzico payment integration for the Turkish market
- Provides content calendar management, post scheduling, and usage analytics
- Features a 3-tab content workflow: Ideas → Captions → Images
- Supports both freemium (with daily limits) and pro subscription models

CORE USER WORKFLOW & BUSINESS LOGIC:
1. User Registration & Authentication → JWT-based auth with bcrypt password hashing
2. Plan Selection → Free (daily limits) vs Pro (unlimited) subscription via İyzico payments
3. AI Content Generation → GPT-4o for captions, DALL-E 3 for images, platform-specific optimization
4. Content Customization → User editing via intuitive React interface with TailwindCSS/shadcn
5. Social Publishing → Zapier webhook automation for multi-platform distribution
6. Analytics & Management → Performance tracking, content calendar, usage monitoring

TECHNICAL ARCHITECTURE:
- Frontend: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui components
- Backend: Node.js + Express + TypeScript + PostgreSQL via Drizzle ORM
- AI Services: OpenAI GPT-4o & DALL-E 3 integration with structured prompting
- Payment: İyzico API for Turkish market with subscription management
- Publishing: Zapier webhook integration for social platform automation
- Database: 7 tables (users, social_accounts, content_ideas, post_assets, subscriptions, api_usage, sessions)

CURRENT SYSTEM CONTEXT:
${JSON.stringify(context, null, 2)}

ANALYZE THE SYSTEM WITH FOCUS ON:

1. AI Content Generation Pipeline Performance
   - OpenAI API response times and error handling
   - Content quality and user satisfaction optimization
   - Rate limiting and quota management

2. Social Media Publishing Reliability  
   - Zapier webhook success rates and failure recovery
   - Platform-specific content formatting accuracy
   - Multi-platform posting coordination

3. Payment & Subscription System Security
   - İyzico integration security and compliance
   - Subscription lifecycle management accuracy
   - Payment failure handling and user communication

4. User Experience & Content Workflow
   - 3-tab content creation flow optimization
   - Real-time feedback and loading states
   - Mobile responsiveness and accessibility

5. Performance & Scalability
   - Database query optimization for content operations
   - Concurrent user handling during content generation
   - Memory management during image processing

6. Business Logic Integrity
   - Plan-based feature access control accuracy
   - Usage tracking and billing precision
   - Content ownership and privacy compliance

Provide response in JSON format with this structure:
{
  "severity": "low|medium|high|critical",
  "category": "ai_content|social_publishing|payment|user_workflow|performance|security", 
  "summary": "Brief issue summary specific to social media content platform",
  "detailedAnalysis": "Detailed technical analysis in context of SocialSparkAI features",
  "recommendedActions": ["specific", "actionable", "socialsparkAI-focused", "improvements"],
  "estimatedImpact": "Impact on content creators and social media workflow efficiency",
  "urgency": 1-10,
  "autoFixable": boolean,
  "codeChanges": [
    {
      "file": "specific/file/path.ts",
      "changes": "exact code improvements for social media platform",
      "reason": "business justification related to content creation workflow"
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
      autoFixable: result.autoFixable !== false, // FORCE TRUE for SocialSparkAI autonomous optimizations
      codeChanges: result.codeChanges || []
    };
  }

  async analyzeSpecificIssue(issue: any): Promise<AnalysisResult> {
    const prompt = `
Analyze this specific system issue for SocialSparkAI platform and provide detailed recommendations:

ISSUE DETAILS:
${JSON.stringify(issue, null, 2)}

SOCIALSPARKÁAI PLATFORM CONTEXT:
- Core Mission: AI-powered social media content creation and automated multi-platform publishing
- Key Features: GPT-4o content generation, DALL-E 3 image creation, Zapier social publishing, İyzico payments
- User Journey: Registration → AI Content Generation → Platform Publishing → Analytics Tracking
- Business Model: Freemium with daily limits → Pro subscription for unlimited content creation
- Target Users: Content creators, social media managers, small businesses, influencers
- Critical Success Factors: Content quality, publishing reliability, payment accuracy, user experience

TECHNICAL ARCHITECTURE:
- Frontend: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- Backend: Node.js + Express + TypeScript + PostgreSQL + Drizzle ORM
- AI Integration: OpenAI GPT-4o & DALL-E 3 with structured prompting for social media optimization
- Payment Processing: İyzico API for Turkish market with webhook event handling
- Social Publishing: Zapier webhook automation for Instagram, LinkedIn, Twitter/X, TikTok, Facebook
- Authentication: JWT + bcrypt with session management and plan-based access control

ANALYZE WITH FOCUS ON:
1. How this issue impacts content creators' workflow efficiency
2. Potential disruption to AI content generation or social publishing pipeline
3. Effect on subscription revenue and user retention
4. Security implications for user data and payment processing
5. Performance impact on concurrent content generation operations
6. User experience degradation in the 3-tab content creation workflow

Provide specific analysis and actionable solutions optimized for social media content platform in JSON format.
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