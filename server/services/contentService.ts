import { openaiService } from "./openaiService";
import { sendToZapier } from "./zapierService";
import { storage } from "../storage";
import type { ContentIdea, PostAsset } from "@shared/schema";

export class ContentService {
  async generateContentIdeas(
    userId: string,
    topic: string,
    targetAudience: string,
    platform: string,
    tone: string,
    quantity: number = 5
  ): Promise<ContentIdea> {
    const ideas = await openaiService.generateIdeas(
      topic,
      platform,
      targetAudience,
      tone,
      quantity
    );

    const contentIdea = await storage.createContentIdea({
      userId,
      topic,
      targetAudience,
      tone,
      platform,
      ideas: ideas,
    });

    return contentIdea;
  }

  async generatePostCaptions(
    ideaId: string,
    platform: string,
    tone: string,
    keywords?: string[]
  ): Promise<any[]> {
    const idea = await storage.getContentIdea(ideaId);
    if (!idea) {
      throw new Error("İçerik fikri bulunamadı");
    }

    const ideaText = Array.isArray(idea.ideas) 
      ? (idea.ideas as any[]).map(i => i.title).join(", ")
      : idea.topic;

    const captions = await openaiService.generateCaptions(
      ideaText,
      platform,
      tone,
      keywords
    );

    return captions;
  }

  async schedulePost(
    postId: string,
    scheduledAt: Date
  ): Promise<PostAsset> {
    const postAsset = await storage.getPostAsset(postId);
    if (!postAsset) {
      throw new Error("Gönderi bulunamadı");
    }

    // Just update scheduled date; actual sending handled via publishPostNow
    return storage.updatePostAsset(postAsset.id, {
      status: "scheduled",
      scheduledAt,
    });
  }

  async publishPostNow(postId: string): Promise<PostAsset> {
    const postAsset = await storage.getPostAsset(postId);
    if (!postAsset) {
      throw new Error("Gönderi bulunamadı");
    }
    
    try {
      // Get user info for enhanced payload
      const user = await storage.getUser(postAsset.userId);
      
      const zapierResult = await sendToZapier({
        text: `${postAsset.caption}\n\n${postAsset.hashtags || ""}`,
        mediaUrl: postAsset.imageUrl || undefined,
        postId: postAsset.id,
        userId: postAsset.userId,
        userEmail: user?.email,
        platform: postAsset.platform,
        platformSpecific: this.getPlatformSpecificData(postAsset.platform, postAsset)
      });

      const updatedPost = await storage.updatePostAsset(postAsset.id, {
        status: "posted",
        publishedAt: new Date(),
      });

      console.log(`[ContentService] Post yayınlandı - ID: ${postId}, Platform: ${postAsset.platform}`);
      return updatedPost;
    } catch (error) {
      console.error("Publish post error:", error);

      await storage.updatePostAsset(postAsset.id, {
        status: "failed",
        errorMessage: error.message,
      });

      throw new Error(`Gönderi yayınlanamadı: ${error.message}`);
    }
  }

  private getPlatformSpecificData(platform: string, postAsset: any) {
    switch (platform) {
      case 'instagram':
        return {
          instagram: {
            aspectRatio: "1:1",
            storyMode: false
          }
        };
      case 'linkedin':
        return {
          linkedin: {
            isArticle: false,
            mentionTags: []
          }
        };
      case 'tiktok':
        return {
          tiktok: {
            soundTrack: "trending",
            effects: ["transition", "filter"]
          }
        };
      case 'x':
        return {
          x: {
            isThread: false,
            threadParts: []
          }
        };
      default:
        return {};
    }
  }

  async getContentAnalytics(userId: string, timeframe: 'week' | 'month' | 'all' = 'month') {
    const posts = await storage.getPostAssets(userId);
    
    // Calculate timeframe filter
    const now = new Date();
    const startDate = timeframe === 'week' 
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : timeframe === 'month'
      ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      : new Date(0);

    const filteredPosts = posts.filter(post => 
      post.createdAt && post.createdAt >= startDate
    );

    return {
      totalPosts: filteredPosts.length,
      published: filteredPosts.filter(p => p.status === 'posted').length,
      scheduled: filteredPosts.filter(p => p.status === 'scheduled').length,
      failed: filteredPosts.filter(p => p.status === 'failed').length,
      platforms: this.getPostsByPlatform(filteredPosts),
      recentActivity: filteredPosts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
    };
  }

  private getPostsByPlatform(posts: any[]) {
    const platformStats = {};
    posts.forEach(post => {
      if (!platformStats[post.platform]) {
        platformStats[post.platform] = 0;
      }
      platformStats[post.platform]++;
    });
    return platformStats;
  }

  async generatePostsCSV(userId: string): Promise<string> {
    const posts = await storage.getPostAssets(userId);
    
    const headers = [
      "ID",
      "Caption",
      "Hashtags", 
      "Platform",
      "Status",
      "Scheduled At",
      "Created At"
    ];

    const rows = posts.map(post => [
      post.id,
      `"${post.caption.replace(/"/g, '""')}"`, // Escape quotes
      `"${post.hashtags || ""}"`,
      post.platform,
      post.status,
      post.scheduledAt ? post.scheduledAt.toISOString() : "",
      post.createdAt ? post.createdAt.toISOString() : ""
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");

    return csvContent;
  }
}

export const contentService = new ContentService();
