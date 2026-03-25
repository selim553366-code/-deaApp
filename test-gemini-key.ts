import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function test() {
  const token = process.env.GEMINI_API_KEY;
  console.log("Token length:", token?.length);
  console.log("Token starts with:", token?.substring(0, 5));
  
  try {
    const ai = new GoogleGenAI({ apiKey: token });
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-preview",
      contents: "Hello",
    });
    console.log("Success:", response.text);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

test();
