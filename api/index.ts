import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ override: true });

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/ai/generate", async (req, res) => {
  try {
    const { contents, systemInstruction: bodySystemInstruction, model = "gemini-3-flash-preview", config = {} } = req.body;
    
    // Extract systemInstruction from config if it exists there too
    const { systemInstruction: configSystemInstruction, ...restConfig } = config;
    const finalSystemInstruction = bodySystemInstruction || configSystemInstruction;
    
    // Check user's custom API_KEY first, fallback to default GEMINI_API_KEY
    let geminiKey = (process.env.CUSTOM_GEMINI_API_KEY || process.env.API_KEY || process.env.APİ_KEY || process.env.GEMINI_API_KEY)?.trim();
    
    // Remove any surrounding quotes if the user accidentally included them
    if (geminiKey && geminiKey.startsWith('"') && geminiKey.endsWith('"')) {
      geminiKey = geminiKey.slice(1, -1);
    }
    if (geminiKey && geminiKey.startsWith("'") && geminiKey.endsWith("'")) {
      geminiKey = geminiKey.slice(1, -1);
    }
    
    console.log("DEBUG: Gemini key start:", geminiKey?.substring(0, 10), "Length:", geminiKey?.length);
    console.log("DEBUG: Model:", model);

    if (!geminiKey) {
      console.error("No GEMINI_API_KEY found.");
      return res.status(500).json({ error: "No GEMINI_API_KEY found." });
    }

    // Validate that it's actually a Google Gemini key
    if (!geminiKey.startsWith("AIzaSy")) {
      console.error("Invalid API Key format. Starts with:", geminiKey.substring(0, 4));
      return res.status(400).json({ 
        error: "Eklediğiniz API anahtarı geçersiz formatta. Lütfen Google AI Studio'dan alınmış, 'AIzaSy' ile başlayan bir Gemini API anahtarı eklediğinizden emin olun. (Groq anahtarları 'gsk_' ile başlar ve burada çalışmaz)." 
      });
    }
    
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    
    // Default system instruction if none provided
    const defaultSystemInstruction = "You are an expert web developer. When asked to create or update a website, provide the full, functional HTML/CSS/JS code. If the user asks for a game, use HTML5 Canvas or Three.js. Ensure the code is modern, responsive, and visually appealing.";
    
    const finalConfig: any = {
      ...restConfig,
      systemInstruction: finalSystemInstruction || defaultSystemInstruction
    };

    // Handle response_format mapping for Gemini
    if (finalConfig.response_format?.type === "json_object") {
      finalConfig.responseMimeType = "application/json";
      delete finalConfig.response_format;
    }
    
    // Handle max_tokens mapping for Gemini
    if (finalConfig.max_tokens) {
      finalConfig.maxOutputTokens = finalConfig.max_tokens;
      delete finalConfig.max_tokens;
    }

    let response;
    let retries = 3;
    for (let i = 0; i < retries; i++) {
      try {
        response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: finalConfig
        });
        break; // Success, exit retry loop
      } catch (err: any) {
        const isRateLimit = err.status === 429 || (err.message && err.message.includes("429")) || (err.message && err.message.includes("Quota"));
        if (isRateLimit && i < retries - 1) {
          const waitTime = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s
          console.warn(`Rate limit hit (429). Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw err; // Re-throw if not 429 or out of retries
        }
      }
    }

    res.json({ text: response?.text });
  } catch (error: any) {
    console.error("AI Generate error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.post("/api/fetch-url", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const response = await fetch(url);
    if (!response.ok) return res.status(500).json({ error: "Failed to fetch URL" });

    const html = await response.text();
    const text = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/g, '')
                     .replace(/<style[^>]*>([\s\S]*?)<\/style>/g, '')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .trim();

    res.json({ text: text.substring(0, 5000) });
  } catch (error) {
    console.error("Fetch URL error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/checkout", async (req, res) => {
  try {
    const { userId, userEmail } = req.body;
    if (!userId || !userEmail) return res.status(400).json({ error: "Missing user info" });

    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;

    if (!apiKey || !storeId || !variantId) return res.status(500).json({ error: "Lemon Squeezy not configured" });

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: { email: userEmail, custom: { user_id: userId } }
          },
          relationships: {
            store: { data: { type: "stores", id: storeId } },
            variant: { data: { type: "variants", id: variantId } }
          }
        }
      })
    });

    if (!response.ok) return res.status(response.status).json({ error: "Failed to create checkout" });
    const data = await response.json();
    res.json({ url: data.data.attributes.url });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});

export default app;
