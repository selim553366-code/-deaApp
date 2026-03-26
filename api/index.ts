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
    const { contents, systemInstruction, model = "gemini-3-flash-preview", config } = req.body;
    
    const geminiKey = (process.env.MY_AI_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY)?.trim();

    if (!geminiKey) {
      console.error("No API key found in environment variables (checked MY_AI_KEY, GEMINI_API_KEY, and API_KEY).");
      return res.status(500).json({ error: "No API key found in environment variables." });
    }
    
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    
    // Format contents for Gemini
    let formattedContents: any;
    
    if (Array.isArray(contents)) {
      formattedContents = contents.map((msg: any) => {
        if (typeof msg === 'string') {
          return { role: 'user', parts: [{ text: msg }] };
        }
        
        const parts = Array.isArray(msg.parts) 
          ? msg.parts.map((p: any) => typeof p === 'string' ? { text: p } : p)
          : [{ text: msg.text || "" }];
          
        return {
          role: msg.role === 'ai' || msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
          parts
        };
      });
    } else if (typeof contents === 'string') {
      formattedContents = [{ role: 'user', parts: [{ text: contents }] }];
    } else if (contents.parts) {
       formattedContents = [contents];
    }

    const generateConfig: any = {
      ...(config || {})
    };
    
    if (systemInstruction) {
      generateConfig.systemInstruction = systemInstruction;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: formattedContents,
      config: generateConfig
    });

    res.json({ text: response.text });
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
