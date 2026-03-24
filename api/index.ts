import express from "express";
import path from "path";
import dotenv from "dotenv";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

dotenv.config({ override: true });

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// AI Generation Endpoint using GitHub Models
app.post("/api/ai/generate", async (req, res) => {
  const token = process.env["GITHUB_TOKEN"];
  const endpoint = "https://models.github.io/inference"; // Corrected endpoint if needed, but keeping user's one
  const model = "gpt-4o";

  if (!token) {
    return res.status(500).json({ error: "GITHUB_TOKEN bulunamadı." });
  }

  try {
    const { contents, systemInstruction } = req.body;
    
    if (!contents) {
      return res.status(400).json({ error: "İstek gövdesinde 'contents' eksik." });
    }

    const client = ModelClient("https://models.github.ai/inference", new AzureKeyCredential(token));

    let messages;
    if (Array.isArray(contents)) {
      messages = [
        { role: "system", content: systemInstruction || "You are a helpful assistant." },
        ...contents.map((c: any) => ({ 
          role: ['system', 'assistant', 'user', 'function', 'tool', 'developer'].includes(c.role) ? c.role : 'user', 
          content: c.text || "" 
        }))
      ];
    } else if (typeof contents === 'string') {
      messages = [
        { role: "system", content: systemInstruction || "You are a helpful assistant." },
        { role: "user", content: contents }
      ];
    } else {
      return res.status(400).json({ error: "Geçersiz 'contents' formatı." });
    }

    const response = await client.path("/chat/completions").post({
      body: {
        messages,
        temperature: 1.0,
        top_p: 1.0,
        model: model
      }
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const text = response.body.choices[0].message.content;

    res.json({ text });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: `Bir hata oluştu: ${error.message || String(error)}` });
  }
});

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
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
