export interface BufferProfile {
  id: string;
  service: string;
  service_username: string;
}

export interface BufferUpdate {
  id: string;
  text: string;
  scheduled_at?: number;
  status: string;
  profile_ids: string[];
}

export class BufferService {
  private accessToken: string;
  private profileId: string;

  constructor() {
    this.accessToken = process.env.BUFFER_ACCESS_TOKEN || "";
    this.profileId = process.env.BUFFER_PROFILE_ID || "";

    if (!this.accessToken) {
      console.warn("BUFFER_ACCESS_TOKEN not set - Buffer integration will not work");
    }
  }

  async getProfiles(): Promise<BufferProfile[]> {
    if (!this.accessToken) {
      throw new Error("Buffer access token not configured");
    }

    try {
      const response = await fetch("https://api.bufferapp.com/1/profiles.json", {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Buffer API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Buffer profiles error:", error);
      throw new Error("Buffer profilleri alınamadı");
    }
  }

  async createUpdate(
    text: string,
    profileIds: string[] = [],
    scheduledAt?: Date,
    mediaUrl?: string
  ): Promise<BufferUpdate> {
    if (!this.accessToken) {
      throw new Error("Buffer access token not configured");
    }

    const profiles = profileIds.length > 0 ? profileIds : [this.profileId];
    if (profiles[0] === "") {
      throw new Error("Buffer profile ID not configured");
    }

    try {
      const body: any = {
        text,
        profile_ids: profiles,
      };

      if (scheduledAt) {
        body.scheduled_at = Math.floor(scheduledAt.getTime() / 1000);
      } else {
        body.now = true;
      }

      if (mediaUrl) {
        body.media = {
          link: mediaUrl,
        };
      }

      const response = await fetch("https://api.bufferapp.com/1/updates/create.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Buffer API error: ${error}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Buffer create update error:", error);
      throw new Error("Buffer gönderisi oluşturulamadı");
    }
  }

  async getUpdate(updateId: string): Promise<BufferUpdate> {
    if (!this.accessToken) {
      throw new Error("Buffer access token not configured");
    }

    try {
      const response = await fetch(`https://api.bufferapp.com/1/updates/${updateId}.json`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Buffer API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Buffer get update error:", error);
      throw new Error("Buffer gönderisi alınamadı");
    }
  }

  async deleteUpdate(updateId: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error("Buffer access token not configured");
    }

    try {
      const response = await fetch(`https://api.bufferapp.com/1/updates/${updateId}/destroy.json`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Buffer API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Buffer delete update error:", error);
      throw new Error("Buffer gönderisi silinemedi");
    }
  }
}

export const bufferService = new BufferService();
