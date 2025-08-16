import { Router, Request } from "express";
import { z } from "zod";
import { socialMediaService } from "../services/socialMediaService";
import { schedulingService } from "../services/schedulingService";
import { webhookManager } from "../services/webhookManager";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

// Schedule post schema
const schedulePostSchema = z.object({
  content: z.string().min(1, "Content is required"),
  platforms: z.array(z.string()).min(1, "At least one platform is required"),
  scheduledAt: z.string().transform(str => new Date(str)),
  zapierHookUrl: z.string().url().optional(),
  recurring: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional()
  }).optional()
});

// Analytics record schema
const analyticsSchema = z.object({
  platform: z.string(),
  postId: z.string().optional(),
  engagementRate: z.number().optional(),
  reach: z.number().optional(),
  impressions: z.number().optional(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  shares: z.number().optional(),
  metadata: z.any().optional()
});

// PHASE 6: Schedule a post
router.post("/schedule", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const data = schedulePostSchema.parse(req.body);

    const post = await schedulingService.scheduleAdvancedPost(
      userId,
      data.content,
      data.platforms,
      data.scheduledAt,
      { recurring: data.recurring }
    );

    res.json({
      success: true,
      post: {
        id: post.id,
        content: post.content,
        platforms: post.platforms,
        scheduledAt: post.scheduledAt,
        status: post.status
      }
    });
  } catch (error) {
    console.error("Error scheduling post:", error);
    res.status(400).json({
      error: {
        code: "SCHEDULING_ERROR",
        message: error instanceof Error ? error.message : "Failed to schedule post"
      }
    });
  }
});

// Get scheduled posts
router.get("/scheduled", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;

    const posts = await socialMediaService.getScheduledPosts(userId, limit);

    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error("Error fetching scheduled posts:", error);
    res.status(500).json({
      error: {
        code: "FETCH_ERROR",
        message: "Failed to fetch scheduled posts"
      }
    });
  }
});

// Get suggested posting times
router.get("/optimal-times/:platform", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { platform } = req.params;
    const timezone = req.query.timezone as string || 'UTC';

    const suggestions = schedulingService.getSuggestedPostingTimes(platform, timezone);

    res.json({
      success: true,
      platform,
      timezone,
      suggestions
    });
  } catch (error) {
    console.error("Error getting optimal times:", error);
    res.status(500).json({
      error: {
        code: "TIMING_ERROR",
        message: "Failed to get optimal posting times"
      }
    });
  }
});

// Record analytics data
router.post("/analytics", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const data = analyticsSchema.parse(req.body);

    await socialMediaService.recordAnalytics(userId, data);

    res.json({
      success: true,
      message: "Analytics recorded successfully"
    });
  } catch (error) {
    console.error("Error recording analytics:", error);
    res.status(400).json({
      error: {
        code: "ANALYTICS_ERROR",
        message: error instanceof Error ? error.message : "Failed to record analytics"
      }
    });
  }
});

// Get analytics data
router.get("/analytics", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const platform = req.query.platform as string;
    const days = parseInt(req.query.days as string) || 30;

    const analytics = await socialMediaService.getAnalytics(userId, platform, days);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      error: {
        code: "ANALYTICS_FETCH_ERROR",
        message: "Failed to fetch analytics"
      }
    });
  }
});

// Bulk schedule posts
router.post("/bulk-schedule", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { posts } = req.body;

    if (!Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "Posts array is required"
        }
      });
    }

    const postsWithUserId = posts.map(post => ({
      userId,
      ...post,
      scheduledAt: new Date(post.scheduledAt)
    }));

    const results = await schedulingService.bulkSchedulePosts(postsWithUserId);

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error("Error bulk scheduling posts:", error);
    res.status(500).json({
      error: {
        code: "BULK_SCHEDULE_ERROR",
        message: "Failed to bulk schedule posts"
      }
    });
  }
});

// Platform-specific content formatting
router.post("/format-content", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { content, platform } = req.body;

    if (!content || !platform) {
      return res.status(400).json({
        error: {
          code: "MISSING_FIELDS",
          message: "Content and platform are required"
        }
      });
    }

    const formattedContent = socialMediaService.formatContentForPlatform(content, platform);
    const optimalTimes = socialMediaService.getOptimalPostingTimes(platform);

    res.json({
      success: true,
      original: content,
      formatted: formattedContent,
      platform,
      optimalTimes,
      metadata: {
        characterCount: formattedContent.length,
        platformLimits: {
          twitter: 280,
          linkedin: 3000,
          instagram: 2200,
          facebook: 63206,
          tiktok: 2200
        }
      }
    });
  } catch (error) {
    console.error("Error formatting content:", error);
    res.status(500).json({
      error: {
        code: "FORMAT_ERROR",
        message: "Failed to format content"
      }
    });
  }
});

// Update post status
router.patch("/posts/:postId/status", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { postId } = req.params;
    const { status } = req.body;

    if (!["pending", "sent", "failed"].includes(status)) {
      return res.status(400).json({
        error: {
          code: "INVALID_STATUS",
          message: "Status must be pending, sent, or failed"
        }
      });
    }

    await socialMediaService.updatePostStatus(postId, status);

    res.json({
      success: true,
      message: "Post status updated successfully"
    });
  } catch (error) {
    console.error("Error updating post status:", error);
    res.status(500).json({
      error: {
        code: "UPDATE_ERROR",
        message: "Failed to update post status"
      }
    });
  }
});

// Get platform insights
router.get("/insights/:platform", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { platform } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    const analytics = await socialMediaService.getAnalytics(userId, platform, days);
    const optimalTimes = socialMediaService.getOptimalPostingTimes(platform);

    res.json({
      success: true,
      platform,
      insights: {
        performance: analytics.summary,
        optimalTimes,
        recommendations: [
          `Your best engagement rate is ${analytics.summary.avgEngagementRate}%`,
          `Total reach of ${analytics.summary.totalReach} users in the last ${days} days`,
          `Consider posting at ${optimalTimes.join(', ')} for optimal engagement`
        ]
      }
    });
  } catch (error) {
    console.error("Error fetching platform insights:", error);
    res.status(500).json({
      error: {
        code: "INSIGHTS_ERROR",
        message: "Failed to fetch platform insights"
      }
    });
  }
});

export default router;