
import { GoogleGenAI } from "@google/genai";
import { Match } from "../types";

// Using user provided API key
const ai = new GoogleGenAI({ apiKey: 'AIzaSyC7xcbx_ZRgjC_CaXK1u8Ge8lsGeDjq14w' });

export const getMatchPrediction = async (match: Match): Promise<string> => {
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

    // Correct way to call generateContent as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Extracting text output from GenerateContentResponse using .text property (not a method)
    return response.text || "No prediction available at the moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI insights temporarily unavailable.";
  }
};
