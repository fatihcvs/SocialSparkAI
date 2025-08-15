
import { openaiService } from "./openaiService";
import { zapierService } from "./zapierService";

interface Post {
  id: string;
  title: string;
  content: string;
  platform: string;
  status: "draft" | "scheduled" | "published";
  userId: string;
  createdAt: Date;
  scheduledAt?: Date;
  publishedAt?: Date;
}

class ContentService {
  private posts: Post[] = [];

  async createPost(data: Omit<Post, "id" | "createdAt">): Promise<Post> {
    const post: Post = {
      ...data,
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.posts.push(post);
    return post;
  }

  async getAllPosts(userId?: string): Promise<Post[]> {
    if (userId) {
      return this.posts.filter(post => post.userId === userId);
    }
    return this.posts;
  }

  async getPostById(id: string): Promise<Post | null> {
    return this.posts.find(post => post.id === id) || null;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
    const index = this.posts.findIndex(post => post.id === id);
    if (index === -1) return null;

    this.posts[index] = { ...this.posts[index], ...updates };
    return this.posts[index];
  }

  async deletePost(id: string): Promise<boolean> {
    const index = this.posts.findIndex(post => post.id === id);
    if (index === -1) return false;

    this.posts.splice(index, 1);
    return true;
  }

  async publishPost(id: string): Promise<Post | null> {
    const post = await this.getPostById(id);
    if (!post) return null;

    try {
      await zapierService.publishContent({
        content: post.content,
        platforms: [post.platform]
      });

      return await this.updatePost(id, {
        status: "published",
        publishedAt: new Date()
      });
    } catch (error) {
      console.error("Yayınlama hatası:", error);
      throw error;
    }
  }

  async schedulePost(id: string, scheduledAt: Date): Promise<Post | null> {
    return await this.updatePost(id, {
      status: "scheduled",
      scheduledAt
    });
  }

  async getPostStats(userId?: string): Promise<{
    total: number;
    published: number;
    scheduled: number;
    drafts: number;
  }> {
    const posts = await this.getAllPosts(userId);
    
    return {
      total: posts.length,
      published: posts.filter(p => p.status === "published").length,
      scheduled: posts.filter(p => p.status === "scheduled").length,
      drafts: posts.filter(p => p.status === "draft").length,
    };
  }
}

export const contentService = new ContentService();
