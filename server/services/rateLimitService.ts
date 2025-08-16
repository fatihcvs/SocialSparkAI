import Bottleneck from 'bottleneck';

/**
 * Advanced rate limiting service for OpenAI API calls
 * Implements exponential backoff and retry logic
 */
class RateLimitService {
  private limiter: Bottleneck;
  private retryConfig = {
    maxRetries: 3,
    retryDelayMs: 1000,
    backoffMultiplier: 2,
    maxRetryDelayMs: 10000
  };

  constructor() {
    // OpenAI rate limits: 
    // - GPT-4o: 10,000 RPM (requests per minute)
    // - DALL-E: 50 requests per minute
    this.limiter = new Bottleneck({
      maxConcurrent: 5, // Max concurrent requests
      minTime: 100, // Minimum time between requests (100ms)
      reservoir: 60, // Start with 60 requests
      reservoirRefreshAmount: 60, // Refresh with 60 requests
      reservoirRefreshInterval: 60 * 1000, // Every minute
      
      // Exponential backoff for rate limit errors
      retryCount: this.retryConfig.maxRetries,
      retry: (error: any, jobInfo: any) => {
        console.log(`Rate limit retry attempt ${jobInfo.retryCount} for job ${jobInfo.options.id}`);
        
        if (error.status === 429) { // Rate limit error
          const delay = Math.min(
            this.retryConfig.retryDelayMs * Math.pow(this.retryConfig.backoffMultiplier, jobInfo.retryCount),
            this.retryConfig.maxRetryDelayMs
          );
          console.log(`Rate limited, retrying in ${delay}ms...`);
          return delay;
        }
        
        return false; // Don't retry for other errors
      }
    });

    // Event listeners for monitoring
    this.limiter.on('failed', async (error, jobInfo) => {
      console.error(`OpenAI request failed: ${error.message}, Job ID: ${jobInfo.options.id}`);
    });

    this.limiter.on('retry', (error, jobInfo) => {
      console.log(`Retrying OpenAI request, attempt ${jobInfo.retryCount}`);
    });

    this.limiter.on('depleted', (empty) => {
      console.warn('Rate limiter reservoir is empty, requests will be queued');
    });
  }

  /**
   * Execute OpenAI request with rate limiting and retry logic
   */
  async execute<T>(fn: () => Promise<T>, jobId?: string): Promise<T> {
    return this.limiter.schedule({ id: jobId || `req-${Date.now()}` }, fn);
  }

  /**
   * Get current limiter status
   */
  async getStatus() {
    const running = await this.limiter.running();
    const queued = await this.limiter.queued();
    
    return {
      running,
      queued,
      isBlocked: running >= 5 // Max concurrent is 5
    };
  }

  /**
   * Clear all queued requests (emergency stop)
   */
  stop(): Promise<void> {
    return this.limiter.stop();
  }

  /**
   * Check if request should be rate limited based on user plan
   */
  checkUserRateLimit(userId: string, userPlan: string): boolean {
    // Implement per-user rate limiting based on subscription plan
    const limits = {
      free: { dailyRequests: 10, hourlyRequests: 5 },
      pro: { dailyRequests: 1000, hourlyRequests: 100 },
      enterprise: { dailyRequests: 10000, hourlyRequests: 1000 }
    };

    // This would integrate with user usage tracking
    return true; // Placeholder
  }
}

export const rateLimitService = new RateLimitService();