
import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API key is missing. AI insights will be mocked.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getSecurityInsight = async (userName: string) => {
  try {
    const ai = getAI();
    if (!ai) throw new Error("No AI initialized");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User: ${userName}. Context: Security Dashboard. Task: Provide a hyper-professional, reassuring security summary and one actionable safety tip. Format: One concise paragraph. Tone: Elite, Precise, Modern. Length: Max 50 words.`,
      config: {
        temperature: 0.65,
        topP: 0.9,
      }
    });

    return response.text?.trim() || "Your digital perimeter is robust. We recommend rotating your root access keys every 90 days to maintain peak protocol integrity.";
  } catch (error) {
    console.error("Gemini Service Error:", error);
    // Dynamic fallback based on common security advice
    const fallbacks = [
      "Welcome back. All encryption protocols are active. Remember to verify any unusual login attempts via your mobile authenticator app.",
      "Protocols nominal. Security Tip: Enable hardware-based security keys for your most critical administrative accounts.",
      "Active protection enabled. Tip: Review your connected third-party applications weekly to ensure minimal data exposure."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
};
