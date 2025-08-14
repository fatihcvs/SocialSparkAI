import { openaiService } from "./openaiService";
import { bufferService } from "./bufferService";
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
    const post = await storage.getPostAssets(postId);
    if (!post || post.length === 0) {
      throw new Error("Gönderi bulunamadı");
    }

    const postAsset = post[0];
    
    try {
      const bufferUpdate = await bufferService.createUpdate(
        `${postAsset.caption}\n\n${postAsset.hashtags || ""}`,
        [], // Use default profile
        scheduledAt,
        postAsset.imageUrl || undefined
      );

      const updatedPost = await storage.updatePostAsset(postAsset.id, {
        status: "scheduled",
        scheduledAt,
        externalId: bufferUpdate.id,
      });

      return updatedPost;
    } catch (error) {
      console.error("Schedule post error:", error);
      
      // Update status to failed if Buffer scheduling fails
      await storage.updatePostAsset(postAsset.id, {
        status: "failed",
      });
      
      throw new Error("Gönderi planlanamadı");
    }
  }

  async publishPostNow(postId: string): Promise<PostAsset> {
    const post = await storage.getPostAssets(postId);
    if (!post || post.length === 0) {
      throw new Error("Gönderi bulunamadı");
    }

    const postAsset = post[0];
    
    try {
      const bufferUpdate = await bufferService.createUpdate(
        `${postAsset.caption}\n\n${postAsset.hashtags || ""}`,
        [], // Use default profile
        undefined, // Immediate posting
        postAsset.imageUrl || undefined
      );

      const updatedPost = await storage.updatePostAsset(postAsset.id, {
        status: "posted",
        externalId: bufferUpdate.id,
      });

      return updatedPost;
    } catch (error) {
      console.error("Publish post error:", error);
      
      await storage.updatePostAsset(postAsset.id, {
        status: "failed",
      });
      
      throw new Error("Gönderi yayınlanamadı");
    }
  }

  async checkPostStatus(postId: string): Promise<string> {
    const post = await storage.getPostAssets(postId);
    if (!post || post.length === 0) {
      throw new Error("Gönderi bulunamadı");
    }

    const postAsset = post[0];
    
    if (!postAsset.externalId) {
      return postAsset.status;
    }

    try {
      const bufferUpdate = await bufferService.getUpdate(postAsset.externalId);
      
      let status = postAsset.status;
      if (bufferUpdate.status === "sent") {
        status = "posted";
      } else if (bufferUpdate.status === "failed") {
        status = "failed";
      }

      if (status !== postAsset.status) {
        await storage.updatePostAsset(postAsset.id, { status });
      }

      return status;
    } catch (error) {
      console.error("Check post status error:", error);
      return postAsset.status;
    }
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
