import NodeCache from 'node-cache';

/**
 * Advanced caching service for OpenAI responses
 * Implements multiple cache layers and TTL strategies
 */
class CacheService {
  public cache: NodeCache;
  private readonly DEFAULT_TTL = 3600; // 1 hour
  private readonly LONG_TTL = 86400; // 24 hours
  private readonly SHORT_TTL = 1800; // 30 minutes

  constructor() {
    this.cache = new NodeCache({
      stdTTL: this.DEFAULT_TTL,
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false, // Better performance
      maxKeys: 1000 // Limit memory usage
    });

    // Log cache statistics
    this.cache.on('set', (key, value) => {
      console.log(`Cache SET: ${key}`);
    });

    this.cache.on('expired', (key, value) => {
      console.log(`Cache EXPIRED: ${key}`);
    });
  }

  /**
   * Generate cache key for content ideas
   */
  generateIdeasKey(topic: string, platform: string, targetAudience: string, tone: string, quantity: number): string {
    return `ideas:${topic}:${platform}:${targetAudience}:${tone}:${quantity}`.toLowerCase();
  }

  /**
   * Generate cache key for captions
   */
  generateCaptionsKey(idea: string, platform: string, tone: string, keywords?: string[]): string {
    const keywordStr = keywords?.join(',') || 'none';
    return `captions:${idea.substring(0, 50)}:${platform}:${tone}:${keywordStr}`.toLowerCase();
  }

  /**
   * Generate cache key for images (shorter TTL due to DALL-E URL expiration)
   */
  generateImageKey(prompt: string, aspectRatio: string, styleHints?: string): string {
    return `image:${prompt.substring(0, 100)}:${aspectRatio}:${styleHints || 'none'}`.toLowerCase();
  }

  /**
   * Cache content ideas with long TTL
   */
  cacheIdeas(key: string, data: any): void {
    this.cache.set(key, data, this.LONG_TTL);
  }

  /**
   * Cache captions with default TTL
   */
  cacheCaptions(key: string, data: any): void {
    this.cache.set(key, data, this.DEFAULT_TTL);
  }

  /**
   * Cache images with short TTL (DALL-E URLs expire)
   */
  cacheImage(key: string, data: any): void {
    this.cache.set(key, data, this.SHORT_TTL);
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.del(key) > 0;
  }

  /**
   * Legacy support methods for compatibility
   */
  setItem(key: string, value: any, ttl?: number): void {
    this.cache.set(key, value, ttl ?? this.DEFAULT_TTL);
  }

  getItem<T>(key: string): T | undefined {
    return this.get<T>(key);
  }

  deleteItem(key: string): boolean {
    return this.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.flushAll();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      keys: this.cache.keys().length,
      hits: this.cache.getStats().hits,
      misses: this.cache.getStats().misses,
      ksize: this.cache.getStats().ksize,
      vsize: this.cache.getStats().vsize
    };
  }

  /**
   * Warm up cache with popular content patterns
   */
  async warmupCache(): Promise<void> {
    console.log('Cache warmup started...');
    // This could be enhanced to pre-populate with popular requests
    console.log('Cache warmup completed');
  }
}

// Singleton instance
const cacheService = new CacheService();
export default cacheService;
export { cacheService as getCacheService };