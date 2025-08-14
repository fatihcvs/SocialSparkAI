// AUTONOMOUS AI OPTIMIZATION - Enhanced OpenAI Service
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000,
  maxRetries: 3
});

// Enhanced content generation with retry logic for SocialSparkAI
export const generateContentWithRetry = async (prompt: string, maxRetries = 3) => {
  console.log("[OpenAI] Starting SocialSparkAI content generation with enhanced error handling");
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }]
      });
      
      console.log("[OpenAI] ✅ SocialSparkAI content generated successfully on attempt", attempt);
      return response.choices[0].message.content;
      
    } catch (error: any) {
      console.log(`[OpenAI] ❌ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        throw new Error(`OpenAI API failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Exponential backoff for SocialSparkAI reliability
      const delay = 1000 * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Enhanced DALL-E 3 with SocialSparkAI-specific error handling
export const generateImageWithFallback = async (prompt: string) => {
  try {
    console.log("[DALL-E 3] Generating SocialSparkAI image with enhanced error handling");
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard"
    });
    
    console.log("[DALL-E 3] ✅ SocialSparkAI image generated successfully");
    return response.data[0]?.url || "";
    
  } catch (error: any) {
    console.error("[DALL-E 3] ❌ SocialSparkAI image generation failed:", error.message);
    throw new Error("Image generation temporarily unavailable. Please try again.");
  }
};

export { openai };
