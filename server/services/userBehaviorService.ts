// import { storage } from '../storage'; // Commented out until needed
import cacheService from './cacheService';

interface UserInteraction {
  userId: string;
  contentType: 'idea' | 'caption' | 'image';
  action: 'generated' | 'edited' | 'used' | 'discarded';
  contentData: {
    prompt?: string;
    platform?: string;
    tone?: string;
    industry?: string;
    engagement?: number;
  };
  timestamp: Date;
}

interface UserPreferences {
  userId: string;
  preferredTones: string[];
  preferredPlatforms: string[];
  industryFocus: string;
  contentStyle: 'professional' | 'casual' | 'creative' | 'humorous';
  avgEngagement: number;
  totalInteractions: number;
  lastUpdated: Date;
}

interface BrandVoice {
  userId: string;
  vocabulary: string[];
  toneCharacteristics: string[];
  writingStyle: string;
  keyMessages: string[];
  avoidWords: string[];
  confidence: number; // 0-1 score of how well we know their brand voice
}

export class UserBehaviorService {
  private interactions: Map<string, UserInteraction[]> = new Map();
  private preferences: Map<string, UserPreferences> = new Map();
  private brandVoices: Map<string, BrandVoice> = new Map();

  /**
   * Track user interaction with generated content
   */
  async trackInteraction(interaction: UserInteraction): Promise<void> {
    const userInteractions = this.interactions.get(interaction.userId) || [];
    userInteractions.push(interaction);
    this.interactions.set(interaction.userId, userInteractions);

    // Cache recent interactions
    const cacheKey = `user_interactions:${interaction.userId}`;
    cacheService.setItem(cacheKey, userInteractions.slice(-50), 3600); // Keep last 50, 1 hour

    // Update user preferences asynchronously
    this.updateUserPreferences(interaction.userId);
    
    // Update brand voice learning
    this.updateBrandVoice(interaction.userId, interaction);
  }

  /**
   * Get personalized content suggestions for user
   */
  async getPersonalizedSuggestions(userId: string, contentType: string): Promise<any> {
    const preferences = await this.getUserPreferences(userId);
    const brandVoice = await this.getBrandVoice(userId);
    
    const suggestions = {
      recommendedTones: preferences.preferredTones,
      recommendedPlatforms: preferences.preferredPlatforms,
      industryContext: preferences.industryFocus,
      brandVoiceKeywords: brandVoice.vocabulary.slice(0, 10),
      contentStyle: preferences.contentStyle,
      historicalPerformance: {
        avgEngagement: preferences.avgEngagement,
        totalContent: preferences.totalInteractions
      }
    };

    // Cache suggestions
    const cacheKey = `personalized_suggestions:${userId}:${contentType}`;
    cacheService.setItem(cacheKey, suggestions, 1800); // 30 minutes

    return suggestions;
  }

  /**
   * Analyze user's content performance history
   */
  async analyzePerformanceHistory(userId: string): Promise<any> {
    const interactions = this.interactions.get(userId) || [];
    
    const usedContent = interactions.filter(i => i.action === 'used');
    const platformPerformance = this.analyzePlatformPerformance(usedContent);
    const tonePerformance = this.analyzeTonePerformance(usedContent);
    const timePatterns = this.analyzeTimePatterns(usedContent);

    const analysis = {
      totalContentGenerated: interactions.length,
      contentUsageRate: usedContent.length / interactions.length,
      bestPerformingPlatforms: platformPerformance,
      mostEffectiveTones: tonePerformance,
      optimalPostingTimes: timePatterns,
      improvementSuggestions: this.generateImprovementSuggestions(interactions)
    };

    return analysis;
  }

  /**
   * Get dynamic prompts based on user behavior
   */
  async getDynamicPrompt(userId: string, basePrompt: string, context: any): Promise<string> {
    const preferences = await this.getUserPreferences(userId);
    const brandVoice = await this.getBrandVoice(userId);

    let enhancedPrompt = basePrompt;

    // Add brand voice context
    if (brandVoice.confidence > 0.6) {
      enhancedPrompt += `\n\nBrand Voice Context: Use a ${brandVoice.writingStyle} writing style.`;
      if (brandVoice.vocabulary.length > 0) {
        enhancedPrompt += ` Incorporate these brand-specific terms naturally: ${brandVoice.vocabulary.slice(0, 5).join(', ')}.`;
      }
      if (brandVoice.keyMessages.length > 0) {
        enhancedPrompt += ` Keep these key messages in mind: ${brandVoice.keyMessages.join('; ')}.`;
      }
    }

    // Add industry context
    if (preferences.industryFocus) {
      enhancedPrompt += `\n\nIndustry Focus: Tailor content for the ${preferences.industryFocus} industry.`;
    }

    // Add performance insights
    if (preferences.avgEngagement > 0) {
      enhancedPrompt += `\n\nHistorical Performance: User's content typically achieves ${preferences.avgEngagement.toFixed(1)}% engagement rate.`;
    }

    return enhancedPrompt;
  }

  /**
   * Predict content engagement potential
   */
  async predictEngagement(userId: string, content: string, platform: string): Promise<number> {
    const preferences = await this.getUserPreferences(userId);
    const brandVoice = await this.getBrandVoice(userId);
    
    let score = 0.5; // Base score

    // Platform alignment
    if (preferences.preferredPlatforms.includes(platform)) {
      score += 0.1;
    }

    // Brand voice alignment
    const brandWords = brandVoice.vocabulary.length;
    const contentWords = content.split(' ');
    const brandWordMatches = contentWords.filter(word => 
      brandVoice.vocabulary.includes(word.toLowerCase())
    ).length;
    
    if (brandWords > 0) {
      score += (brandWordMatches / brandWords) * 0.2;
    }

    // Content length optimization (platform-specific)
    const optimalLength = this.getOptimalLength(platform);
    const lengthScore = 1 - Math.abs(content.length - optimalLength) / optimalLength;
    score += lengthScore * 0.1;

    // Historical performance boost
    if (preferences.avgEngagement > 0.05) { // 5% threshold
      score += Math.min(preferences.avgEngagement * 2, 0.2);
    }

    return Math.min(Math.max(score, 0), 1); // Clamp between 0-1
  }

  /**
   * Get user preferences with caching
   */
  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    const cacheKey = `user_preferences:${userId}`;
    let preferences = cacheService.getItem<UserPreferences>(cacheKey);
    
    if (!preferences) {
      preferences = this.preferences.get(userId) || this.createDefaultPreferences(userId);
      cacheService.setItem(cacheKey, preferences, 3600); // 1 hour cache
    }
    
    return preferences;
  }

  /**
   * Get brand voice with caching
   */
  private async getBrandVoice(userId: string): Promise<BrandVoice> {
    const cacheKey = `brand_voice:${userId}`;
    let brandVoice = cacheService.getItem<BrandVoice>(cacheKey);
    
    if (!brandVoice) {
      brandVoice = this.brandVoices.get(userId) || this.createDefaultBrandVoice(userId);
      cacheService.setItem(cacheKey, brandVoice, 7200); // 2 hour cache
    }
    
    return brandVoice;
  }

  /**
   * Update user preferences based on interactions
   */
  private async updateUserPreferences(userId: string): Promise<void> {
    const interactions = this.interactions.get(userId) || [];
    const recentInteractions = interactions.slice(-20); // Last 20 interactions

    const preferences: UserPreferences = {
      userId,
      preferredTones: this.extractPreferredTones(recentInteractions),
      preferredPlatforms: this.extractPreferredPlatforms(recentInteractions),
      industryFocus: this.extractIndustryFocus(recentInteractions),
      contentStyle: this.extractContentStyle(recentInteractions),
      avgEngagement: this.calculateAvgEngagement(recentInteractions),
      totalInteractions: interactions.length,
      lastUpdated: new Date()
    };

    this.preferences.set(userId, preferences);
    
    // Clear cache to force refresh
    cacheService.deleteItem(`user_preferences:${userId}`);
  }

  /**
   * Update brand voice learning
   */
  private async updateBrandVoice(userId: string, interaction: UserInteraction): Promise<void> {
    if (interaction.action !== 'used' || !interaction.contentData.prompt) return;

    const currentBrandVoice = this.brandVoices.get(userId) || this.createDefaultBrandVoice(userId);
    
    // Extract vocabulary from used content
    const words = interaction.contentData.prompt.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isCommonWord(word));

    // Update vocabulary
    words.forEach(word => {
      if (!currentBrandVoice.vocabulary.includes(word)) {
        currentBrandVoice.vocabulary.push(word);
      }
    });

    // Update confidence based on usage
    currentBrandVoice.confidence = Math.min(
      currentBrandVoice.confidence + 0.05,
      0.95
    );

    // Keep vocabulary size manageable
    if (currentBrandVoice.vocabulary.length > 100) {
      currentBrandVoice.vocabulary = currentBrandVoice.vocabulary.slice(-100);
    }

    this.brandVoices.set(userId, currentBrandVoice);
    
    // Clear cache
    cacheService.deleteItem(`brand_voice:${userId}`);
  }

  // Helper methods
  private createDefaultPreferences(userId: string): UserPreferences {
    return {
      userId,
      preferredTones: ['professional'],
      preferredPlatforms: ['linkedin'],
      industryFocus: 'general',
      contentStyle: 'professional',
      avgEngagement: 0.03,
      totalInteractions: 0,
      lastUpdated: new Date()
    };
  }

  private createDefaultBrandVoice(userId: string): BrandVoice {
    return {
      userId,
      vocabulary: [],
      toneCharacteristics: [],
      writingStyle: 'professional',
      keyMessages: [],
      avoidWords: [],
      confidence: 0
    };
  }

  private extractPreferredTones(interactions: UserInteraction[]): string[] {
    const toneCount = new Map<string, number>();
    
    interactions
      .filter(i => i.action === 'used' && i.contentData.tone)
      .forEach(i => {
        const tone = i.contentData.tone!;
        toneCount.set(tone, (toneCount.get(tone) || 0) + 1);
      });

    return Array.from(toneCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tone]) => tone);
  }

  private extractPreferredPlatforms(interactions: UserInteraction[]): string[] {
    const platformCount = new Map<string, number>();
    
    interactions
      .filter(i => i.action === 'used' && i.contentData.platform)
      .forEach(i => {
        const platform = i.contentData.platform!;
        platformCount.set(platform, (platformCount.get(platform) || 0) + 1);
      });

    return Array.from(platformCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([platform]) => platform);
  }

  private extractIndustryFocus(interactions: UserInteraction[]): string {
    // Simple implementation - can be enhanced with ML
    const industries = interactions
      .filter(i => i.contentData.industry)
      .map(i => i.contentData.industry!)
      .filter((value, index, self) => self.indexOf(value) === index);

    return industries[0] || 'general';
  }

  private extractContentStyle(interactions: UserInteraction[]): 'professional' | 'casual' | 'creative' | 'humorous' {
    // Simple heuristic - can be enhanced
    return 'professional';
  }

  private calculateAvgEngagement(interactions: UserInteraction[]): number {
    const engagements = interactions
      .filter(i => i.contentData.engagement !== undefined)
      .map(i => i.contentData.engagement!);

    if (engagements.length === 0) return 0.03; // Default 3%

    return engagements.reduce((sum, eng) => sum + eng, 0) / engagements.length;
  }

  private analyzePlatformPerformance(interactions: UserInteraction[]): any {
    // Platform performance analysis logic
    return {};
  }

  private analyzeTonePerformance(interactions: UserInteraction[]): any {
    // Tone performance analysis logic
    return {};
  }

  private analyzeTimePatterns(interactions: UserInteraction[]): any {
    // Time pattern analysis logic
    return {};
  }

  private generateImprovementSuggestions(interactions: UserInteraction[]): string[] {
    // Generate improvement suggestions based on patterns
    return [
      "Try varying your content tone for better engagement",
      "Consider posting at optimal times for your audience",
      "Experiment with different content formats"
    ];
  }

  private getOptimalLength(platform: string): number {
    const lengths: Record<string, number> = {
      'twitter': 140,
      'linkedin': 300,
      'facebook': 250,
      'instagram': 200
    };
    return lengths[platform] || 250;
  }

  private isCommonWord(word: string): boolean {
    const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'];
    return commonWords.includes(word);
  }
}

// Export singleton instance
export const userBehaviorService = new UserBehaviorService();