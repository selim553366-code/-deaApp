import { GoogleGenAI } from "@google/genai";

async function test() {
  const apiKey = "MY_GEMINI_API_KEY";
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hello",
    });
    console.log("Success:", response.text.substring(0, 20));
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

test();
