import OpenAI from "openai";
import cacheService from "./cacheService";
import { userBehaviorService } from "./userBehaviorService";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000,
  maxRetries: 2
});

interface ContentScoring {
  engagementScore: number;
  qualityScore: number;
  platformOptimization: number;
  brandAlignment: number;
  overallScore: number;
  suggestions: string[];
}

interface TrendingTopic {
  topic: string;
  relevanceScore: number;
  platform: string;
  category: string;
}

interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  template: string;
  variables: string[];
  bestPlatforms: string[];
}

export class AdvancedAIService {
  private industryTemplates: Map<string, IndustryTemplate[]> = new Map();
  private trendingTopics: TrendingTopic[] = [];

  constructor() {
    this.initializeIndustryTemplates();
    this.updateTrendingTopics();
  }

  /**
   * Generate personalized content with advanced AI
   */
  async generatePersonalizedContent(
    userId: string,
    prompt: string,
    platform: string,
    contentType: 'post' | 'story' | 'article' | 'video_script'
  ): Promise<any> {
    try {
      // Get user personalization data
      const personalizedSuggestions = await userBehaviorService.getPersonalizedSuggestions(userId, contentType);
      
      // Enhance prompt with personalization
      let enhancedPrompt = await userBehaviorService.getDynamicPrompt(userId, prompt, {
        platform,
        contentType,
        suggestions: personalizedSuggestions
      });

      // Add trending topics context
      const relevantTrends = this.getRelevantTrends(platform, personalizedSuggestions.industryContext);
      if (relevantTrends.length > 0) {
        const trendContext = `\n\nCurrent trending topics to consider: ${relevantTrends.map(t => t.topic).join(', ')}`;
        enhancedPrompt += trendContext;
      }

      // Generate content with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(contentType, platform, personalizedSuggestions)
          },
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: this.getMaxTokens(contentType),
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const generatedContent = response.choices[0]?.message?.content || "";

      // Score the generated content
      const contentScore = await this.scoreContent(userId, generatedContent, platform);

      // Track user interaction
      await userBehaviorService.trackInteraction({
        userId,
        contentType: contentType === 'post' ? 'caption' : 'idea',
        action: 'generated',
        contentData: {
          prompt: enhancedPrompt,
          platform,
          tone: personalizedSuggestions.contentStyle,
          industry: personalizedSuggestions.industryContext
        },
        timestamp: new Date()
      });

      return {
        content: generatedContent,
        scoring: contentScore,
        personalizationUsed: {
          brandVoice: personalizedSuggestions.brandVoiceKeywords,
          preferredStyle: personalizedSuggestions.contentStyle,
          historicalPerformance: personalizedSuggestions.historicalPerformance
        },
        trendingTopicsUsed: relevantTrends.map(t => t.topic),
        usage: {
          model: "gpt-4o",
          tokens: response.usage?.total_tokens || 0,
          cost: this.calculateCost(response.usage?.total_tokens || 0)
        }
      };

    } catch (error) {
      console.error('Advanced AI content generation error:', error);
      throw new Error('Failed to generate personalized content');
    }
  }

  /**
   * Generate multi-modal content (video scripts, audio content)
   */
  async generateMultiModalContent(
    userId: string,
    contentType: 'video_script' | 'audio_script' | 'carousel_content' | 'poll_content',
    topic: string,
    platform: string,
    duration?: number
  ): Promise<any> {
    try {
      const personalizedSuggestions = await userBehaviorService.getPersonalizedSuggestions(userId, contentType);
      
      let systemPrompt = "";
      let userPrompt = topic;

      switch (contentType) {
        case 'video_script':
          systemPrompt = this.getVideoScriptPrompt(platform, duration);
          break;
        case 'audio_script':
          systemPrompt = this.getAudioScriptPrompt(duration);
          break;
        case 'carousel_content':
          systemPrompt = this.getCarouselPrompt(platform);
          break;
        case 'poll_content':
          systemPrompt = this.getPollPrompt(platform);
          break;
      }

      // Add personalization context
      if (personalizedSuggestions.brandVoiceKeywords.length > 0) {
        systemPrompt += `\n\nBrand context: Incorporate these brand elements naturally: ${personalizedSuggestions.brandVoiceKeywords.join(', ')}`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: this.getMaxTokens(contentType)
      });

      const content = response.choices[0]?.message?.content || "";

      // Parse structured content based on type
      const structuredContent = this.parseMultiModalContent(content, contentType);

      return {
        content: structuredContent,
        metadata: {
          contentType,
          platform,
          duration,
          generatedAt: new Date(),
          tokens: response.usage?.total_tokens || 0
        }
      };

    } catch (error) {
      console.error('Multi-modal content generation error:', error);
      throw new Error('Failed to generate multi-modal content');
    }
  }

  /**
   * Score content quality and engagement potential
   */
  async scoreContent(userId: string, content: string, platform: string): Promise<ContentScoring> {
    try {
      // AI-based quality assessment
      const qualityResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a content quality assessor. Rate content on a scale of 0-1 for quality, engagement potential, and platform optimization. Respond only with three numbers separated by commas: quality_score,engagement_score,platform_score"
          },
          {
            role: "user",
            content: `Platform: ${platform}\nContent: ${content}`
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      });

      const scores = qualityResponse.choices[0]?.message?.content?.split(',') || ['0.5', '0.5', '0.5'];
      const [qualityScore, engagementScore, platformScore] = scores.map(s => parseFloat(s.trim()) || 0.5);

      // Behavioral prediction
      const behaviorPrediction = await userBehaviorService.predictEngagement(userId, content, platform);

      // Brand alignment check
      const personalizedSuggestions = await userBehaviorService.getPersonalizedSuggestions(userId, 'post');
      const brandAlignment = this.calculateBrandAlignment(content, personalizedSuggestions.brandVoiceKeywords);

      // Overall score calculation
      const overallScore = (
        qualityScore * 0.25 +
        engagementScore * 0.30 +
        platformScore * 0.20 +
        behaviorPrediction * 0.15 +
        brandAlignment * 0.10
      );

      // Generate suggestions
      const suggestions = this.generateContentSuggestions(
        qualityScore,
        engagementScore,
        platformScore,
        brandAlignment,
        platform
      );

      return {
        engagementScore: engagementScore,
        qualityScore: qualityScore,
        platformOptimization: platformScore,
        brandAlignment: brandAlignment,
        overallScore: overallScore,
        suggestions: suggestions
      };

    } catch (error) {
      console.error('Content scoring error:', error);
      // Return default scores on error
      return {
        engagementScore: 0.5,
        qualityScore: 0.5,
        platformOptimization: 0.5,
        brandAlignment: 0.5,
        overallScore: 0.5,
        suggestions: ['Content generated successfully']
      };
    }
  }

  /**
   * Get industry-specific content templates
   */
  getIndustryTemplate(industry: string, contentType: string): IndustryTemplate | null {
    const templates = this.industryTemplates.get(industry) || [];
    return templates.find(t => t.name.includes(contentType)) || null;
  }

  /**
   * Generate A/B testing recommendations
   */
  async generateABTestRecommendations(
    userId: string,
    content: string,
    platform: string
  ): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Generate 3 variations of the given content for A/B testing. Each variation should test a different element: tone, structure, or call-to-action. Return as JSON with variations array."
          },
          {
            role: "user",
            content: `Platform: ${platform}\nOriginal content: ${content}`
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      });

      const variations = JSON.parse(response.choices[0]?.message?.content || '{"variations": []}');

      // Score each variation
      const scoredVariations = await Promise.all(
        variations.variations.map(async (variation: any) => {
          const score = await this.scoreContent(userId, variation.content, platform);
          return {
            ...variation,
            scoring: score
          };
        })
      );

      return {
        original: {
          content,
          scoring: await this.scoreContent(userId, content, platform)
        },
        variations: scoredVariations,
        recommendation: this.getBestVariation(scoredVariations)
      };

    } catch (error) {
      console.error('A/B test generation error:', error);
      return {
        original: { content, scoring: null },
        variations: [],
        recommendation: null
      };
    }
  }

  // Private helper methods
  private initializeIndustryTemplates(): void {
    // Technology industry templates
    this.industryTemplates.set('technology', [
      {
        id: 'tech_product_launch',
        name: 'Product Launch Post',
        industry: 'technology',
        template: 'Excited to announce {product_name}! 🚀\n\n{key_features}\n\n{value_proposition}\n\n{call_to_action}',
        variables: ['product_name', 'key_features', 'value_proposition', 'call_to_action'],
        bestPlatforms: ['linkedin', 'twitter', 'facebook']
      },
      {
        id: 'tech_thought_leadership',
        name: 'Thought Leadership',
        industry: 'technology',
        template: 'The future of {technology_area} is changing rapidly.\n\n{insight}\n\n{prediction}\n\nWhat are your thoughts?',
        variables: ['technology_area', 'insight', 'prediction'],
        bestPlatforms: ['linkedin', 'twitter']
      }
    ]);

    // Healthcare industry templates
    this.industryTemplates.set('healthcare', [
      {
        id: 'health_awareness',
        name: 'Health Awareness Post',
        industry: 'healthcare',
        template: 'Did you know? {health_fact}\n\n{explanation}\n\n{actionable_tip}\n\n#HealthAwareness',
        variables: ['health_fact', 'explanation', 'actionable_tip'],
        bestPlatforms: ['facebook', 'instagram', 'linkedin']
      }
    ]);

    // Add more industries as needed
  }

  private updateTrendingTopics(): void {
    // In a real implementation, this would fetch from APIs like Google Trends, Twitter API, etc.
    this.trendingTopics = [
      { topic: 'AI and Machine Learning', relevanceScore: 0.9, platform: 'linkedin', category: 'technology' },
      { topic: 'Sustainable Business', relevanceScore: 0.8, platform: 'linkedin', category: 'business' },
      { topic: 'Remote Work Culture', relevanceScore: 0.7, platform: 'twitter', category: 'workplace' },
      { topic: 'Digital Transformation', relevanceScore: 0.85, platform: 'linkedin', category: 'technology' }
    ];
  }

  private getRelevantTrends(platform: string, industry: string): TrendingTopic[] {
    return this.trendingTopics
      .filter(trend => 
        trend.platform === platform || 
        trend.category === industry ||
        trend.relevanceScore > 0.8
      )
      .slice(0, 3);
  }

  private getSystemPrompt(contentType: string, platform: string, personalizedSuggestions: any): string {
    let basePrompt = `You are an expert social media content creator specializing in ${platform} content.`;
    
    basePrompt += `\n\nContent Style: ${personalizedSuggestions.contentStyle}`;
    basePrompt += `\nIndustry Focus: ${personalizedSuggestions.industryContext}`;
    basePrompt += `\nPreferred Tone: ${personalizedSuggestions.recommendedTones.join(', ')}`;
    
    if (personalizedSuggestions.historicalPerformance.avgEngagement > 0) {
      basePrompt += `\nThis user's content typically achieves ${(personalizedSuggestions.historicalPerformance.avgEngagement * 100).toFixed(1)}% engagement rate.`;
    }

    switch (contentType) {
      case 'post':
        basePrompt += `\n\nCreate engaging social media post content optimized for ${platform}.`;
        break;
      case 'story':
        basePrompt += `\n\nCreate compelling story content with strong visual elements for ${platform}.`;
        break;
      case 'article':
        basePrompt += `\n\nCreate professional article content with clear structure and valuable insights.`;
        break;
      case 'video_script':
        basePrompt += `\n\nCreate engaging video script with clear narrative structure.`;
        break;
    }

    return basePrompt;
  }

  private getVideoScriptPrompt(platform: string, duration?: number): string {
    const durationText = duration ? `${duration} seconds` : '30-60 seconds';
    return `Create a ${durationText} video script for ${platform}. Include:
    - Hook (first 3 seconds)
    - Main content with visual cues
    - Clear call-to-action
    - Format as: [VISUAL] narrative text`;
  }

  private getAudioScriptPrompt(duration?: number): string {
    const durationText = duration ? `${duration} seconds` : '1-2 minutes';
    return `Create a ${durationText} audio script/podcast segment. Include:
    - Engaging introduction
    - Key talking points
    - Natural transitions
    - Strong conclusion with takeaway`;
  }

  private getCarouselPrompt(platform: string): string {
    return `Create carousel content for ${platform} with 5-8 slides. Format as:
    Slide 1: [Hook/Title]
    Slide 2-7: [Key points]
    Slide 8: [Call-to-action]`;
  }

  private getPollPrompt(platform: string): string {
    return `Create an engaging poll for ${platform}. Include:
    - Compelling question
    - 2-4 clear answer options
    - Context/explanation
    - Follow-up engagement strategy`;
  }

  private getMaxTokens(contentType: string): number {
    const tokenLimits: Record<string, number> = {
      'post': 300,
      'story': 200,
      'article': 1000,
      'video_script': 600,
      'audio_script': 800,
      'carousel_content': 500,
      'poll_content': 200
    };
    return tokenLimits[contentType] || 300;
  }

  private parseMultiModalContent(content: string, contentType: string): any {
    switch (contentType) {
      case 'video_script':
        return this.parseVideoScript(content);
      case 'carousel_content':
        return this.parseCarouselContent(content);
      case 'poll_content':
        return this.parsePollContent(content);
      default:
        return { text: content };
    }
  }

  private parseVideoScript(content: string): any {
    const lines = content.split('\n').filter(line => line.trim());
    const scenes: any[] = [];
    let currentScene: any = {};

    lines.forEach(line => {
      if (line.includes('[') && line.includes(']')) {
        if (currentScene.visual || currentScene.audio) {
          scenes.push(currentScene);
        }
        currentScene = {
          visual: line.match(/\[(.*?)\]/)?.[1] || '',
          audio: line.replace(/\[.*?\]/, '').trim()
        };
      } else if (currentScene.visual) {
        currentScene.audio += ' ' + line;
      }
    });

    if (currentScene.visual || currentScene.audio) {
      scenes.push(currentScene);
    }

    return { scenes, fullScript: content };
  }

  private parseCarouselContent(content: string): any {
    const slides = content.split(/Slide \d+:/).filter(slide => slide.trim());
    return {
      slides: slides.map((slide, index) => ({
        number: index + 1,
        content: slide.trim()
      })),
      totalSlides: slides.length
    };
  }

  private parsePollContent(content: string): any {
    const lines = content.split('\n').filter(line => line.trim());
    const question = lines[0];
    const options = lines.slice(1).filter(line => 
      line.includes('A)') || line.includes('B)') || line.includes('C)') || line.includes('D)')
    );

    return {
      question,
      options: options.map(option => option.replace(/[A-D]\)/, '').trim()),
      context: content
    };
  }

  private calculateBrandAlignment(content: string, brandKeywords: string[]): number {
    if (brandKeywords.length === 0) return 0.5;

    const contentWords = content.toLowerCase().split(/\W+/);
    const matches = brandKeywords.filter(keyword => 
      contentWords.includes(keyword.toLowerCase())
    );

    return Math.min(matches.length / brandKeywords.length, 1);
  }

  private generateContentSuggestions(
    qualityScore: number,
    engagementScore: number,
    platformScore: number,
    brandAlignment: number,
    platform: string
  ): string[] {
    const suggestions: string[] = [];

    if (qualityScore < 0.6) {
      suggestions.push('Consider improving content structure and clarity');
    }

    if (engagementScore < 0.6) {
      suggestions.push('Add more engaging elements like questions or call-to-actions');
    }

    if (platformScore < 0.6) {
      suggestions.push(`Optimize content format and length for ${platform}`);
    }

    if (brandAlignment < 0.5) {
      suggestions.push('Incorporate more brand-specific language and messaging');
    }

    if (suggestions.length === 0) {
      suggestions.push('Content quality looks good! Consider A/B testing different variations.');
    }

    return suggestions;
  }

  private getBestVariation(variations: any[]): any {
    return variations.reduce((best, current) => 
      current.scoring.overallScore > (best?.scoring?.overallScore || 0) ? current : best
    , null);
  }

  private calculateCost(tokens: number): number {
    // GPT-4o pricing (approximate)
    const inputCostPer1K = 0.005;
    const outputCostPer1K = 0.015;
    
    // Estimate 70% input, 30% output
    const inputTokens = tokens * 0.7;
    const outputTokens = tokens * 0.3;
    
    return (inputTokens / 1000 * inputCostPer1K) + (outputTokens / 1000 * outputCostPer1K);
  }
}

// Export singleton instance
export const advancedAIService = new AdvancedAIService();