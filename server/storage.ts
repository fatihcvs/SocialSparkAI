import {
  users,
  socialAccounts,
  contentIdeas,
  postAssets,
  subscriptions,
  apiUsage,
  type User,
  type InsertUser,
  type SocialAccount,
  type InsertSocialAccount,
  type ContentIdea,
  type InsertContentIdea,
  type PostAsset,
  type InsertPostAsset,
  type Subscription,
  type InsertSubscription,
  type ApiUsage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserPlan(id: string, plan: string): Promise<User>;
  listUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;

  // Social account operations
  getSocialAccount(userId: string, provider: string): Promise<SocialAccount | undefined>;
  createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateSocialAccount(id: string, updates: Partial<SocialAccount>): Promise<SocialAccount>;

  // Content idea operations
  getContentIdeas(userId: string): Promise<ContentIdea[]>;
  createContentIdea(idea: InsertContentIdea): Promise<ContentIdea>;
  getContentIdea(id: string): Promise<ContentIdea | undefined>;
  listContentIdeas(): Promise<ContentIdea[]>;
  deleteContentIdea(id: string): Promise<void>;

  // Post asset operations
  getPostAsset(id: string): Promise<PostAsset | undefined>;
  getPostAssets(userId: string, status?: string): Promise<PostAsset[]>;
  listPostAssets(): Promise<PostAsset[]>;
  createPostAsset(asset: InsertPostAsset): Promise<PostAsset>;
  updatePostAsset(id: string, updates: Partial<PostAsset>): Promise<PostAsset>;
  deletePostAsset(id: string): Promise<void>;
  getScheduledPosts(): Promise<PostAsset[]>;
  getUserStats(userId: string): Promise<{
    totalPosts: number;
    scheduledPosts: number;
    aiIdeas: number;
  }>;

  // Subscription operations
  getSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription>;
  listSubscriptions(): Promise<Subscription[]>;
  deleteSubscription(id: string): Promise<void>;

  // API usage tracking
  getApiUsage(userId: string, endpoint: string, since: Date): Promise<number>;
  incrementApiUsage(userId: string, endpoint: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPlan(id: string, plan: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ plan, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getSocialAccount(userId: string, provider: string): Promise<SocialAccount | undefined> {
    const [account] = await db
      .select()
      .from(socialAccounts)
      .where(and(eq(socialAccounts.userId, userId), eq(socialAccounts.provider, provider)));
    return account;
  }

  async createSocialAccount(accountData: InsertSocialAccount): Promise<SocialAccount> {
    const [account] = await db
      .insert(socialAccounts)
      .values({
        ...accountData,
        createdAt: new Date(),
      })
      .returning();
    return account;
  }

  async updateSocialAccount(id: string, updates: Partial<SocialAccount>): Promise<SocialAccount> {
    const [account] = await db
      .update(socialAccounts)
      .set(updates)
      .where(eq(socialAccounts.id, id))
      .returning();
    return account;
  }

  async getContentIdeas(userId: string): Promise<ContentIdea[]> {
    return await db
      .select()
      .from(contentIdeas)
      .where(eq(contentIdeas.userId, userId))
      .orderBy(desc(contentIdeas.createdAt));
  }

  async createContentIdea(ideaData: InsertContentIdea): Promise<ContentIdea> {
    const [idea] = await db
      .insert(contentIdeas)
      .values({
        ...ideaData,
        createdAt: new Date(),
      })
      .returning();
    return idea;
  }

  async getContentIdea(id: string): Promise<ContentIdea | undefined> {
    const [idea] = await db
      .select()
      .from(contentIdeas)
      .where(eq(contentIdeas.id, id));
    return idea;
  }

  async listContentIdeas(): Promise<ContentIdea[]> {
    return await db.select().from(contentIdeas).orderBy(desc(contentIdeas.createdAt));
  }

  async deleteContentIdea(id: string): Promise<void> {
    await db.delete(contentIdeas).where(eq(contentIdeas.id, id));
  }

  async getPostAsset(id: string): Promise<PostAsset | undefined> {
    const [asset] = await db
      .select()
      .from(postAssets)
      .where(eq(postAssets.id, id));
    return asset;
  }

  async getPostAssets(userId: string, status?: string): Promise<PostAsset[]> {
    const conditions = [eq(postAssets.userId, userId)];
    if (status) {
      conditions.push(eq(postAssets.status, status));
    }

    return await db
      .select()
      .from(postAssets)
      .where(and(...conditions))
      .orderBy(desc(postAssets.createdAt));
  }

  async listPostAssets(): Promise<PostAsset[]> {
    return await db.select().from(postAssets).orderBy(desc(postAssets.createdAt));
  }

  async createPostAsset(assetData: InsertPostAsset): Promise<PostAsset> {
    const [asset] = await db
      .insert(postAssets)
      .values({
        ...assetData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return asset;
  }

  async updatePostAsset(id: string, updates: Partial<PostAsset>): Promise<PostAsset> {
    const [asset] = await db
      .update(postAssets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(postAssets.id, id))
      .returning();
    return asset;
  }

  async deletePostAsset(id: string): Promise<void> {
    await db.delete(postAssets).where(eq(postAssets.id, id));
  }

  async getScheduledPosts(): Promise<PostAsset[]> {
    return await db
      .select()
      .from(postAssets)
      .where(
        and(
          eq(postAssets.status, "scheduled"),
          gte(postAssets.scheduledAt, new Date())
        )
      );
  }

  async getUserStats(userId: string): Promise<{
    totalPosts: number;
    scheduledPosts: number;
    aiIdeas: number;
  }> {
    const [totalPostsResult] = await db
      .select({ count: count() })
      .from(postAssets)
      .where(eq(postAssets.userId, userId));

    const [scheduledPostsResult] = await db
      .select({ count: count() })
      .from(postAssets)
      .where(
        and(
          eq(postAssets.userId, userId),
          eq(postAssets.status, "scheduled")
        )
      );

    const [aiIdeasResult] = await db
      .select({ count: count() })
      .from(contentIdeas)
      .where(eq(contentIdeas.userId, userId));

    return {
      totalPosts: totalPostsResult.count,
      scheduledPosts: scheduledPostsResult.count,
      aiIdeas: aiIdeasResult.count,
    };
  }

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        ...subscriptionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return subscription;
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  async listSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
  }

  async deleteSubscription(id: string): Promise<void> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  }

  async getApiUsage(userId: string, endpoint: string, since: Date): Promise<number> {
    const [result] = await db
      .select({ total: sql<number>`sum(${apiUsage.count})` })
      .from(apiUsage)
      .where(
        and(
          eq(apiUsage.userId, userId),
          eq(apiUsage.endpoint, endpoint),
          gte(apiUsage.date, since)
        )
      );

    return result?.total || 0;
  }

  async incrementApiUsage(userId: string, endpoint: string): Promise<void> {
    await db.insert(apiUsage).values({
      userId,
      endpoint,
      date: new Date(),
      count: 1,
    });
  }
}

export const storage = new DatabaseStorage();
