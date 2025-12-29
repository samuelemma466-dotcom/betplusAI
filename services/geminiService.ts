
import { GoogleGenAI } from "@google/genai";
import { Match } from "../types";

// Helper to safely get API key from various environments (Vite, Node, etc.)
const getApiKey = (): string | undefined => {
  try {
    // Check for Vite-style environment variables
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
    // Check for standard Node.js/Process environment variables
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (error) {
    console.warn("Environment variable access failed", error);
  }
  return undefined;
};

const apiKey = getApiKey();
let ai: GoogleGenAI | null = null;

// Initialize lazily or safely
if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Failed to initialize Gemini client:", error);
  }
} else {
  console.warn("Gemini API Key is missing. AI features will be disabled.");
}

export const getMatchPrediction = async (match: Match): Promise<string> => {
  if (!ai) {
    return "AI insights unavailable. (Missing API Key)";
  }

  try {
    const prompt = `
      You are an expert sports betting analyst. Analyze this match concisely for a betting app user.
      
      Match: ${match.homeTeam.name} vs ${match.awayTeam.name}
      League: ${match.league}
      Current Status: ${match.isLive ? `LIVE (Minute ${match.minute}) - Score: ${match.scores?.home}:${match.scores?.away}` : 'Upcoming'}
      Odds:
      - Home Win: ${match.odds.main.find(o => o.label === '1')?.value}
      - Draw: ${match.odds.main.find(o => o.label === 'X')?.value}
      - Away Win: ${match.odds.main.find(o => o.label === '2')?.value}

      Provide a short, punchy prediction or insight (max 2 sentences). Suggest a safe bet.
      Do not use markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No prediction available at the moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI insights temporarily unavailable.";
  }
};
