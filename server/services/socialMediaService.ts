import { db } from "../db";
import { scheduledPosts, socialAnalytics, socialAccounts } from "../../shared/schema";
import { eq, and, desc, gte } from "drizzle-orm";

interface SchedulePostData {
  userId: string;
  content: string;
  platforms: string[];
  scheduledAt: Date;
  zapierHookUrl?: string;
  metadata?: any;
}

interface SocialPost {
  id: string;
  userId: string;
  content: string;
  platforms: string[];
  scheduledAt: Date;
  status: string;
  createdAt: Date;
}

interface AnalyticsData {
  platform: string;
  postId?: string;
  engagementRate?: number;
  reach?: number;
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  metadata?: any;
}

export class SocialMediaService {
  // Schedule a post for future publishing
  async schedulePost(data: SchedulePostData): Promise<SocialPost> {
    try {
      const [post] = await db.insert(scheduledPosts).values({
        userId: data.userId,
        content: data.content,
        platforms: data.platforms,
        scheduledAt: data.scheduledAt,
        zapierHookUrl: data.zapierHookUrl,
        metadata: data.metadata || {}
      }).returning();

      return {
        id: post.id,
        userId: post.userId,
        content: post.content,
        platforms: post.platforms as string[],
        scheduledAt: post.scheduledAt,
        status: post.status,
        createdAt: post.createdAt!
      };
    } catch (error) {
      console.error("Error scheduling post:", error);
      throw new Error("Failed to schedule post");
    }
  }

  // Get scheduled posts for a user
  async getScheduledPosts(userId: string, limit: number = 20): Promise<SocialPost[]> {
    try {
      const posts = await db
        .select()
        .from(scheduledPosts)
        .where(eq(scheduledPosts.userId, userId))
        .orderBy(desc(scheduledPosts.scheduledAt))
        .limit(limit);

      return posts.map(post => ({
        id: post.id,
        userId: post.userId,
        content: post.content,
        platforms: post.platforms as string[],
        scheduledAt: post.scheduledAt,
        status: post.status,
        createdAt: post.createdAt!
      }));
    } catch (error) {
      console.error("Error fetching scheduled posts:", error);
      throw new Error("Failed to fetch scheduled posts");
    }
  }

  // Get pending posts for publishing
  async getPendingPosts(): Promise<SocialPost[]> {
    try {
      const now = new Date();
      const posts = await db
        .select()
        .from(scheduledPosts)
        .where(
          and(
            eq(scheduledPosts.status, "pending"),
            gte(scheduledPosts.scheduledAt, now)
          )
        )
        .orderBy(scheduledPosts.scheduledAt);

      return posts.map(post => ({
        id: post.id,
        userId: post.userId,
        content: post.content,
        platforms: post.platforms as string[],
        scheduledAt: post.scheduledAt,
        status: post.status,
        createdAt: post.createdAt!
      }));
    } catch (error) {
      console.error("Error fetching pending posts:", error);
      throw new Error("Failed to fetch pending posts");
    }
  }

  // Update post status
  async updatePostStatus(postId: string, status: string): Promise<void> {
    try {
      await db
        .update(scheduledPosts)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(eq(scheduledPosts.id, postId));
    } catch (error) {
      console.error("Error updating post status:", error);
      throw new Error("Failed to update post status");
    }
  }

  // Record analytics data
  async recordAnalytics(userId: string, data: AnalyticsData): Promise<void> {
    try {
      await db.insert(socialAnalytics).values({
        userId,
        platform: data.platform,
        postId: data.postId,
        engagementRate: data.engagementRate?.toString(),
        reach: data.reach,
        impressions: data.impressions,
        likes: data.likes,
        comments: data.comments,
        shares: data.shares,
        metadata: data.metadata || {}
      });
    } catch (error) {
      console.error("Error recording analytics:", error);
      throw new Error("Failed to record analytics");
    }
  }

  // Get analytics for user
  async getAnalytics(userId: string, platform?: string, days: number = 30) {
    try {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      let whereConditions = and(
        eq(socialAnalytics.userId, userId),
        gte(socialAnalytics.createdAt, dateLimit)
      );

      if (platform) {
        whereConditions = and(
          eq(socialAnalytics.userId, userId),
          eq(socialAnalytics.platform, platform),
          gte(socialAnalytics.createdAt, dateLimit)
        );
      }

      const analytics = await db
        .select()
        .from(socialAnalytics)
        .where(whereConditions)
        .orderBy(desc(socialAnalytics.createdAt));



      // Calculate aggregated metrics
      const totalReach = analytics.reduce((sum, a) => sum + (a.reach || 0), 0);
      const totalImpressions = analytics.reduce((sum, a) => sum + (a.impressions || 0), 0);
      const totalLikes = analytics.reduce((sum, a) => sum + (a.likes || 0), 0);
      const totalComments = analytics.reduce((sum, a) => sum + (a.comments || 0), 0);
      const totalShares = analytics.reduce((sum, a) => sum + (a.shares || 0), 0);

      const avgEngagementRate = analytics.length > 0
        ? analytics.reduce((sum, a) => sum + (parseFloat(a.engagementRate || "0")), 0) / analytics.length
        : 0;

      return {
        summary: {
          totalPosts: analytics.length,
          totalReach,
          totalImpressions,
          totalLikes,
          totalComments,
          totalShares,
          avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2))
        },
        detailed: analytics
      };
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw new Error("Failed to fetch analytics");
    }
  }

  // Platform-specific content formatting
  formatContentForPlatform(content: string, platform: string): string {
    switch (platform.toLowerCase()) {
      case "twitter":
      case "x":
        return content.length > 280 ? content.substring(0, 277) + "..." : content;
      
      case "linkedin":
        return content + "\n\n#LinkedIn #Professional";
      
      case "instagram":
        return content + "\n\n#Instagram #SocialMedia";
      
      case "facebook":
        return content;
      
      case "tiktok":
        return content + "\n\n#TikTok #Trending";
      
      default:
        return content;
    }
  }

  // Get optimal posting times for platform
  getOptimalPostingTimes(platform: string): string[] {
    const times = {
      "linkedin": ["08:00", "12:00", "17:00"],
      "twitter": ["09:00", "15:00", "18:00"],
      "instagram": ["11:00", "14:00", "19:00"],
      "facebook": ["13:00", "15:00", "20:00"],
      "tiktok": ["06:00", "10:00", "19:00"]
    };

    return times[platform.toLowerCase() as keyof typeof times] || ["12:00", "15:00", "18:00"];
  }
}

export const socialMediaService = new SocialMediaService();