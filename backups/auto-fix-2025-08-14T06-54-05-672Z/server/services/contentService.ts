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
      await sendToZapier({
        text: `${postAsset.caption}\n\n${postAsset.hashtags || ""}`,
        mediaUrl: postAsset.imageUrl || undefined,
        postId: postAsset.id,
        userId: postAsset.userId,
        platform: postAsset.platform,
      });

      const updatedPost = await storage.updatePostAsset(postAsset.id, {
        status: "posted",
      });

      return updatedPost;
    } catch (error) {
      console.error("Publish post error:", error);

      await storage.updatePostAsset(postAsset.id, {
        status: "failed",
      });

      throw new Error("Gönderi Zapier'e gönderilemedi");
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
