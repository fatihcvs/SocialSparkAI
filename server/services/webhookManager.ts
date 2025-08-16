import axios from "axios";
import { socialMediaService } from "./socialMediaService";

interface WebhookPayload {
  content: string;
  platform: string;
  userId: string;
  postId?: string;
  metadata?: any;
}

interface WebhookConfig {
  url: string;
  platform: string;
  userId: string;
  isActive: boolean;
  retryConfig: {
    maxRetries: number;
    backoffMultiplier: number;
    baseDelay: number;
  };
}

export class WebhookManager {
  private webhooks: Map<string, WebhookConfig> = new Map();
  private retryQueues: Map<string, Array<{ payload: WebhookPayload; attempt: number; nextRetry: Date }>> = new Map();

  constructor() {
    this.initializeRetryProcessor();
  }

  // Initialize retry processor to handle failed webhooks
  private initializeRetryProcessor() {
    setInterval(async () => {
      await this.processRetryQueue();
    }, 30000); // Check every 30 seconds

    console.log("🔄 Webhook retry processor initialized");
  }

  // Register a webhook endpoint
  registerWebhook(config: WebhookConfig): string {
    const webhookId = `${config.userId}-${config.platform}-${Date.now()}`;
    this.webhooks.set(webhookId, config);
    
    console.log(`📝 Registered webhook for ${config.platform}: ${webhookId}`);
    return webhookId;
  }

  // Send webhook with retry logic
  async sendWebhook(webhookId: string, payload: WebhookPayload): Promise<boolean> {
    const config = this.webhooks.get(webhookId);
    if (!config || !config.isActive) {
      throw new Error(`Webhook ${webhookId} not found or inactive`);
    }

    return await this.sendWebhookToUrl(config.url, payload, config, 0);
  }

  // Send webhook to specific URL with retry logic
  private async sendWebhookToUrl(
    url: string, 
    payload: WebhookPayload, 
    config: WebhookConfig, 
    attempt: number
  ): Promise<boolean> {
    try {
      const response = await axios.post(url, {
        ...payload,
        timestamp: new Date().toISOString(),
        attempt: attempt + 1
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SocialSparkAI-Webhook/1.0'
        }
      });

      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ Webhook sent successfully to ${config.platform}: ${response.status}`);
        
        // Record successful analytics
        if (payload.postId) {
          await this.recordWebhookAnalytics(payload, 'success', response.status);
        }
        
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error(`❌ Webhook failed (attempt ${attempt + 1}):`, error);

      // Record failed analytics
      if (payload.postId) {
        await this.recordWebhookAnalytics(payload, 'failed', 0, (error as Error).message);
      }

      // Add to retry queue if we haven't exceeded max retries
      if (attempt < config.retryConfig.maxRetries) {
        await this.addToRetryQueue(config, payload, attempt + 1);
        return false;
      }

      // Max retries exceeded
      console.error(`🚫 Max retries exceeded for webhook to ${config.platform}`);
      return false;
    }
  }

  // Add failed webhook to retry queue
  private async addToRetryQueue(config: WebhookConfig, payload: WebhookPayload, attempt: number) {
    const queueKey = `${config.userId}-${config.platform}`;
    if (!this.retryQueues.has(queueKey)) {
      this.retryQueues.set(queueKey, []);
    }

    // Calculate next retry time with exponential backoff
    const delay = config.retryConfig.baseDelay * Math.pow(config.retryConfig.backoffMultiplier, attempt - 1);
    const nextRetry = new Date(Date.now() + delay * 1000);

    this.retryQueues.get(queueKey)!.push({
      payload,
      attempt,
      nextRetry
    });

    console.log(`⏰ Added to retry queue: attempt ${attempt}, next retry at ${nextRetry.toISOString()}`);
  }

  // Process retry queue
  private async processRetryQueue() {
    const now = new Date();
    
    for (const [queueKey, queue] of Array.from(this.retryQueues.entries())) {
      const readyToRetry = queue.filter((item: any) => item.nextRetry <= now);
      
      for (const item of readyToRetry) {
        const [userId, platform] = queueKey.split('-');
        const webhookId = Array.from(this.webhooks.keys()).find(id => 
          id.includes(userId) && id.includes(platform)
        );

        if (webhookId) {
          const config = this.webhooks.get(webhookId)!;
          const success = await this.sendWebhookToUrl(
            config.url,
            item.payload,
            config,
            item.attempt
          );

          // Remove from queue regardless of success/failure
          const index = queue.indexOf(item);
          if (index > -1) {
            queue.splice(index, 1);
          }
        }
      }
    }
  }

  // Record webhook analytics
  private async recordWebhookAnalytics(
    payload: WebhookPayload,
    status: 'success' | 'failed',
    httpStatus: number,
    errorMessage?: string
  ) {
    try {
      await socialMediaService.recordAnalytics(payload.userId, {
        platform: payload.platform,
        postId: payload.postId,
        metadata: {
          webhookStatus: status,
          httpStatus,
          errorMessage,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Error recording webhook analytics:", error);
    }
  }

  // Get webhook status and stats
  getWebhookStats(webhookId: string) {
    const config = this.webhooks.get(webhookId);
    if (!config) {
      throw new Error(`Webhook ${webhookId} not found`);
    }

    const queueKey = `${config.userId}-${config.platform}`;
    const retryQueue = this.retryQueues.get(queueKey) || [];

    return {
      webhookId,
      platform: config.platform,
      isActive: config.isActive,
      pendingRetries: retryQueue.length,
      nextRetry: retryQueue.length > 0 ? retryQueue[0].nextRetry : null,
      config: {
        maxRetries: config.retryConfig.maxRetries,
        baseDelay: config.retryConfig.baseDelay
      }
    };
  }

  // Update webhook configuration
  updateWebhook(webhookId: string, updates: Partial<WebhookConfig>): boolean {
    const config = this.webhooks.get(webhookId);
    if (!config) {
      return false;
    }

    const updatedConfig = { ...config, ...updates };
    this.webhooks.set(webhookId, updatedConfig);
    
    console.log(`🔧 Updated webhook ${webhookId}`);
    return true;
  }

  // Deactivate webhook
  deactivateWebhook(webhookId: string): boolean {
    return this.updateWebhook(webhookId, { isActive: false });
  }

  // Platform-specific webhook formatting
  formatPayloadForPlatform(payload: WebhookPayload): WebhookPayload {
    const formattedContent = socialMediaService.formatContentForPlatform(
      payload.content,
      payload.platform
    );

    const platformMetadata = {
      linkedin: {
        contentType: 'professional',
        optimalLength: 1300,
        includeHashtags: true
      },
      twitter: {
        contentType: 'microblog',
        optimalLength: 280,
        includeHashtags: true
      },
      instagram: {
        contentType: 'visual',
        optimalLength: 2200,
        includeHashtags: true
      },
      facebook: {
        contentType: 'social',
        optimalLength: 500,
        includeHashtags: false
      },
      tiktok: {
        contentType: 'video',
        optimalLength: 100,
        includeHashtags: true
      }
    };

    return {
      ...payload,
      content: formattedContent,
      metadata: {
        ...payload.metadata,
        platform: platformMetadata[payload.platform.toLowerCase() as keyof typeof platformMetadata]
      }
    };
  }

  // Bulk webhook operation
  async sendBulkWebhooks(webhookId: string, payloads: WebhookPayload[]): Promise<{
    successful: number;
    failed: number;
    results: Array<{ payload: WebhookPayload; success: boolean; error?: string }>;
  }> {
    const results = [];
    let successful = 0;
    let failed = 0;

    for (const payload of payloads) {
      try {
        const success = await this.sendWebhook(webhookId, payload);
        results.push({ payload, success });
        if (success) successful++;
        else failed++;
      } catch (error) {
        results.push({ payload, success: false, error: (error as Error).message });
        failed++;
      }
    }

    return { successful, failed, results };
  }
}

export const webhookManager = new WebhookManager();