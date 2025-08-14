import cron from "node-cron";
import { storage } from "../storage";
import { bufferService } from "../services/bufferService";

export class SchedulerService {
  private isRunning = false;

  start(): void {
    // Run every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
      if (this.isRunning) {
        console.log("Scheduler already running, skipping...");
        return;
      }

      this.isRunning = true;
      try {
        await this.processScheduledPosts();
      } catch (error) {
        console.error("Scheduler error:", error);
      } finally {
        this.isRunning = false;
      }
    });

    console.log("Post scheduler started (runs every 5 minutes)");
  }

  private async processScheduledPosts(): Promise<void> {
    try {
      const scheduledPosts = await storage.getScheduledPosts();
      const now = new Date();

      for (const post of scheduledPosts) {
        if (!post.scheduledAt || post.scheduledAt > now) {
          continue;
        }

        try {
          console.log(`Processing scheduled post ${post.id}`);

          // Create Buffer update
          const bufferUpdate = await bufferService.createUpdate(
            `${post.caption}\n\n${post.hashtags || ""}`,
            [], // Use default profile
            undefined, // Immediate posting since it's time
            post.imageUrl || undefined
          );

          // Update post status
          await storage.updatePostAsset(post.id, {
            status: "posted",
            externalId: bufferUpdate.id,
          });

          console.log(`Post ${post.id} successfully posted to Buffer`);
        } catch (error) {
          console.error(`Failed to post ${post.id}:`, error);

          // Mark as failed
          await storage.updatePostAsset(post.id, {
            status: "failed",
          });
        }
      }
    } catch (error) {
      console.error("Error processing scheduled posts:", error);
    }
  }

  // Manual trigger for testing
  async triggerScheduledPosts(): Promise<void> {
    if (this.isRunning) {
      throw new Error("Scheduler is already running");
    }

    this.isRunning = true;
    try {
      await this.processScheduledPosts();
    } finally {
      this.isRunning = false;
    }
  }
}

export const schedulerService = new SchedulerService();
