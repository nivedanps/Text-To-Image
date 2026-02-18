
import { GoogleGenAI } from "@google/genai";
import { ImageStyle } from "../types";

export class CreatoEngine {
  private readonly client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async synthesize(vision: string, style: ImageStyle): Promise<string> {
    const structuredPrompt = `
      Style: ${style}. 
      Subject: ${vision}. 
      Directives: Ethereal clarity, profound depth, high-fidelity textures, professional cinematic lighting. 
      Avoid: Generic artifacts, low resolution, flat lighting.
    `.trim();
    
    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: structuredPrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      const candidate = response.candidates?.[0];
      const imagePart = candidate?.content.parts.find(p => p.inlineData);

      if (!imagePart?.inlineData) {
        throw new Error("The synthesis failed to materialize in the latent space.");
      }

      const { mimeType, data } = imagePart.inlineData;
      return `data:${mimeType};base64,${data}`;
      
    } catch (error) {
      console.error("Synthesis anomaly detected:", error);
      throw error;
    }
  }
}

export const creatoService = new CreatoEngine();
