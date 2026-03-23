import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ override: true });

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Using API key:", apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "undefined");
  
  if (!apiKey || apiKey.includes("MY_GEMINI_API_KEY")) {
    console.error("Error: Invalid API key in environment");
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hello",
    });
    console.log("Success:", response.text);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

test();
