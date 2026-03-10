import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
    console.warn("VITE_GEMINI_API_KEY is missing. AI features will fallback to mock logic.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function askGemini(prompt: string, jsonMode: boolean = true) {
    if (!API_KEY) return null;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (jsonMode) {
            // Clean up the response if it contains markdown code blocks
            const cleanedText = text.replace(/```json|```/g, "").trim();
            return JSON.parse(cleanedText);
        }
        return text;
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return null;
    }
}
