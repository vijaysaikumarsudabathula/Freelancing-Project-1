
import { GoogleGenAI } from "@google/genai";

// Use the key you provided directly for local testing
const ai = new GoogleGenAI({ apiKey: "AIzaSyDwWlpkUWFTadpPTT8bnd-BR4rUeQ8iHvQ" });

export async function getEcoAdvice(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: "You are an eco-friendly dining expert for Deepthi Enterprises. You provide advice on sustainable living, caring for the environment, and choosing plastic-free biodegradable tableware. Keep responses concise and encouraging.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to my eco-knowledge base right now. Choosing eco-friendly products is always a great step for the environment though!";
  }
}

export async function refineImagePrompt(productName: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, descriptive professional photography prompt for an e-commerce product image of: ${productName}. Focus on organic leaf textures, natural wood backgrounds, and soft, warm lighting. Keep it to one sentence.`,
      config: {
        systemInstruction: "You are a creative director for a high-end sustainable tableware brand.",
      }
    });
    return response.text || `High-quality studio shot of ${productName} on a natural surface.`;
  } catch (error) {
    return `Professional product shot of ${productName} with natural lighting.`;
  }
}

export async function generateProductImage(prompt: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `An extremely high-quality, professional 4k product photograph for a premium sustainable e-commerce store. Focus: ${prompt}. Aesthetic: Artisan, organic, earth tones, soft shadows, extremely sharp detail on natural leaf grain.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
}
