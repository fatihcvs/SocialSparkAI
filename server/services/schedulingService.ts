import { socialMediaService } from "./socialMediaService";
import { zapierService } from "./zapierService";
import cron from "node-cron";

interface ScheduleOptions {
  timezone?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  };
}

export class SchedulingService {
  private cronJobs: Map<string, any> = new Map();

  constructor() {
    this.initializeScheduler();
  }

  // Initialize the cron scheduler to check for pending posts
  private initializeScheduler() {
    // Check every minute for posts to publish
    cron.schedule('* * * * *', async () => {
      await this.processPendingPosts();
    });

    console.log("📅 Scheduling service initialized - checking every minute");
  }

  // Process pending posts that are ready to be published
  private async processPendingPosts() {
    try {
      const pendingPosts = await socialMediaService.getPendingPosts();
      const now = new Date();

      for (const post of pendingPosts) {
        if (post.scheduledAt <= now && post.status === 'pending') {
          await this.publishPost(post);
        }
      }
    } catch (error) {
      console.error("Error processing pending posts:", error);
    }
  }

  // Publish a single post to its platforms
  private async publishPost(post: any) {
    try {
      console.log(`📤 Publishing post ${post.id} to platforms:`, post.platforms);

      // Format content for each platform and send via Zapier
      for (const platform of post.platforms) {
        const formattedContent = socialMediaService.formatContentForPlatform(
          post.content, 
          platform
        );

        // Send to Zapier webhook if available
        if (post.zapierHookUrl) {
          await zapierService.publishContent({
            content: formattedContent,
            platforms: [platform]
          });
        } else {
          // Use default Zapier hook
          await zapierService.publishContent({
            content: formattedContent,
            platforms: [platform]
          });
        }
      }

      // Update post status to sent
      await socialMediaService.updatePostStatus(post.id, "sent");
      
      console.log(`✅ Post ${post.id} published successfully`);

    } catch (error) {
      console.error(`❌ Error publishing post ${post.id}:`, error);
      
      // Update post status to failed
      await socialMediaService.updatePostStatus(post.id, "failed");
    }
  }

  // Schedule a post with advanced options
  async scheduleAdvancedPost(
    userId: string,
    content: string,
    platforms: string[],
    scheduledAt: Date,
    options: ScheduleOptions = {}
  ) {
    try {
      // Schedule the initial post
      const post = await socialMediaService.schedulePost({
        userId,
        content,
        platforms,
        scheduledAt,
        metadata: { options }
      });

      // Handle recurring posts
      if (options.recurring) {
        await this.setupRecurringPost(userId, content, platforms, scheduledAt, options.recurring);
      }

      return post;
    } catch (error) {
      console.error("Error scheduling advanced post:", error);
      throw error;
    }
  }

  // Set up recurring post schedule
  private async setupRecurringPost(
    userId: string,
    content: string,
    platforms: string[],
    initialDate: Date,
    recurring: NonNullable<ScheduleOptions['recurring']>
  ) {
    const jobId = `recurring-${userId}-${Date.now()}`;
    
    let cronPattern: string;
    let nextDate = new Date(initialDate);

    switch (recurring.frequency) {
      case 'daily':
        cronPattern = `${nextDate.getMinutes()} ${nextDate.getHours()} * * *`;
        break;
      
      case 'weekly':
        const dayOfWeek = recurring.dayOfWeek || nextDate.getDay();
        cronPattern = `${nextDate.getMinutes()} ${nextDate.getHours()} * * ${dayOfWeek}`;
        break;
      
      case 'monthly':
        const dayOfMonth = recurring.dayOfMonth || nextDate.getDate();
        cronPattern = `${nextDate.getMinutes()} ${nextDate.getHours()} ${dayOfMonth} * *`;
        break;
      
      default:
        throw new Error("Invalid recurring frequency");
    }

    // Create cron job for recurring posts
    const job = cron.schedule(cronPattern, async () => {
      try {
        await socialMediaService.schedulePost({
          userId,
          content,
          platforms,
          scheduledAt: new Date(),
          metadata: { recurring: true, originalJobId: jobId }
        });
      } catch (error) {
        console.error(`Error creating recurring post for job ${jobId}:`, error);
      }
    });

    this.cronJobs.set(jobId, job);
    
    console.log(`🔄 Recurring post scheduled with pattern: ${cronPattern}`);
    
    return jobId;
  }

  // Cancel a recurring post
  cancelRecurringPost(jobId: string): boolean {
    const job = this.cronJobs.get(jobId);
    if (job) {
      job.destroy();
      this.cronJobs.delete(jobId);
      console.log(`🛑 Cancelled recurring post job: ${jobId}`);
      return true;
    }
    return false;
  }

  // Get suggested posting times for optimal engagement
  getSuggestedPostingTimes(platform: string, timezone: string = 'UTC') {
    const optimalTimes = socialMediaService.getOptimalPostingTimes(platform);
    const today = new Date();
    const suggestions = [];

    // Generate suggestions for the next 7 days
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);

      for (const time of optimalTimes) {
        const [hours, minutes] = time.split(':').map(Number);
        const suggestedDate = new Date(date);
        suggestedDate.setHours(hours, minutes, 0, 0);

        // Only suggest future times
        if (suggestedDate > new Date()) {
          suggestions.push({
            date: suggestedDate,
            platform,
            engagementScore: this.calculateEngagementScore(platform, hours),
            reason: this.getTimingReason(platform, hours)
          });
        }
      }
    }

    return suggestions.sort((a, b) => b.engagementScore - a.engagementScore);
  }

  // Calculate engagement score based on platform and time
  private calculateEngagementScore(platform: string, hour: number): number {
    const scores = {
      linkedin: { 8: 0.9, 12: 0.95, 17: 1.0 },
      twitter: { 9: 0.85, 15: 0.9, 18: 0.95 },
      instagram: { 11: 0.85, 14: 0.9, 19: 1.0 },
      facebook: { 13: 0.8, 15: 0.9, 20: 0.95 },
      tiktok: { 6: 0.8, 10: 0.9, 19: 1.0 }
    };

    const platformScores = scores[platform.toLowerCase() as keyof typeof scores];
    return platformScores?.[hour as keyof typeof platformScores] || 0.5;
  }

  // Get reasoning for timing recommendation
  private getTimingReason(platform: string, hour: number): string {
    const reasons = {
      linkedin: {
        8: "Early morning professional check-ins",
        12: "Lunch break browsing",
        17: "End of workday engagement"
      },
      twitter: {
        9: "Morning news consumption",
        15: "Afternoon social breaks",
        18: "Evening social activity"
      },
      instagram: {
        11: "Pre-lunch browsing",
        14: "Afternoon leisure time",
        19: "Evening social media time"
      }
    };

    const platformReasons = reasons[platform.toLowerCase() as keyof typeof reasons];
    return platformReasons?.[hour as keyof typeof platformReasons] || "General optimal engagement time";
  }

  // Bulk schedule multiple posts
  async bulkSchedulePosts(posts: Array<{
    userId: string;
    content: string;
    platforms: string[];
    scheduledAt: Date;
    options?: ScheduleOptions;
  }>) {
    const results = [];
    
    for (const postData of posts) {
      try {
        const post = await this.scheduleAdvancedPost(
          postData.userId,
          postData.content,
          postData.platforms,
          postData.scheduledAt,
          postData.options
        );
        results.push({ success: true, post });
      } catch (error) {
        results.push({ success: false, error: (error as Error).message });
      }
    }

    return results;
  }
}

export const schedulingService = new SchedulingService();