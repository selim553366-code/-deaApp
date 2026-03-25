import express from "express";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config({ override: true });

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/ai/generate", async (req, res) => {
  try {
    const { contents, systemInstruction, model = "gpt-4o" } = req.body;
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      return res.status(500).json({ error: "GITHUB_TOKEN is not configured in environment variables." });
    }

    const client = new OpenAI({
      apiKey: githubToken,
      baseURL: "https://models.inference.ai.azure.com"
    });

    // Convert contents to OpenAI format
    const messages: any[] = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }

    if (Array.isArray(contents)) {
      contents.forEach((msg: any) => {
        if (typeof msg === 'string') {
          messages.push({ role: "user", content: msg });
        } else if (msg.parts && Array.isArray(msg.parts)) {
          const content = msg.parts.map((p: any) => p.text).join("\n");
          messages.push({ role: msg.role === 'ai' ? 'assistant' : 'user', content });
        } else if (msg.role && msg.text) {
          messages.push({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.text });
        }
      });
    } else if (typeof contents === 'string') {
      messages.push({ role: "user", content: contents });
    }

    const response = await client.chat.completions.create({
      messages,
      model: model === "gemini-3.1-pro-preview" ? "gpt-4o" : "gpt-4o-mini",
      temperature: 1,
      max_tokens: 4096,
      top_p: 1
    });

    res.json({ text: response.choices[0].message.content });
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
