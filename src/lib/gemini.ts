import { GoogleGenerativeAI } from "@google/generative-ai";

// In a real application, VITE_GEMINI_API_KEY should be in .env
// We also check localStorage to allow user-provided keys in a demo environment
const getApiKey = () => import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('GEMINI_API_KEY');

export async function askGemini(prompt: string, jsonMode: boolean = true) {
    const key = getApiKey();
    if (!key) {
        console.warn("AI logic blocked: Gemini API Key is missing (checked .env and localStorage).");
        return null;
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        console.log("Asking Gemini API...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (jsonMode) {
            // More robust JSON extraction: find first '[' or '{' and last ']' or '}'
            const jsonMatch = text.match(/[\{\[](.|\n)*[\}\]]/);
            if (!jsonMatch) {
                console.error("Gemini failed to return valid JSON format in text:", text);
                return null;
            }

            const cleanedText = jsonMatch[0].trim();
            try {
                return JSON.parse(cleanedText);
            } catch (pErr) {
                console.error("JSON Parse Error on Gemini output:", pErr, "Raw text:", cleanedText);
                return null;
            }
        }
        return text;
    } catch (error) {
        console.error("Gemini AI Connection/Execution Error:", error);
        return null;
    }
}
