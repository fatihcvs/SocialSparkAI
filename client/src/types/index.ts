export interface User {
  id: string;
  email: string;
  name: string;
  plan: "free" | "pro";
  role: "user" | "admin";
}

export interface ContentIdea {
  id: string;
  userId: string;
  topic: string;
  targetAudience: string;
  tone: string;
  platform: string;
  ideas: {
    calendarHints: string[];
    ideas: Array<{
      title: string;
      angle: string;
      keyPoints: string[];
      cta: string;
    }>;
  };
  createdAt: Date;
}

export interface PostAsset {
  id: string;
  userId: string;
  ideaId?: string;
  caption: string;
  hashtags?: string;
  imageUrl?: string;
  scheduledAt?: Date;
  status: "draft" | "scheduled" | "posted" | "failed";
  platform: "instagram" | "linkedin" | "x" | "tiktok";
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaptionVariant {
  variant: string;
  caption: string;
  hashtags: string[];
}

export interface UserStats {
  totalPosts: number;
  scheduledPosts: number;
  aiIdeas: number;
}
