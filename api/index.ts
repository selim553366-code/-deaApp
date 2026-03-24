import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ override: true });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// AI Generation Endpoint using Hugging Face
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { contents, systemInstruction } = req.body;
    
    if (!contents) {
      return res.status(400).json({ error: "İstek gövdesinde 'contents' eksik." });
    }

    const token = process.env.HUGGING_FACE_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "HUGGING_FACE_TOKEN bulunamadı. Lütfen Secrets panelinden ekleyin." });
    }

    // Hugging Face API URL
    const modelId = "Qwen/Qwen3-Coder-Next";
    const apiUrl = `https://router.huggingface.co/hf-inference/models/${modelId}`;

    // Combine system instruction and contents
    const prompt = systemInstruction ? `${systemInstruction}\n\n${contents}` : contents;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 4000, return_full_text: false },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face Error:", errorText);
      throw new Error(`Hugging Face API hatası (${response.status}).`);
    }
    
    const data = await response.json();
    // Hugging Face returns an array of objects
    const text = Array.isArray(data) ? data[0].generated_text : data.generated_text;

    res.json({ text });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: error.message || "Yapay zeka yanıt verirken bir hata oluştu." });
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
    // Simple text extraction
    const text = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/g, '')
                     .replace(/<style[^>]*>([\s\S]*?)<\/style>/g, '')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .trim();

    res.json({ text: text.substring(0, 5000) }); // Limit to 5000 chars
  } catch (error) {
    console.error("Fetch URL error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Lemon Squeezy Checkout Creation
app.post("/api/checkout", async (req, res) => {
  try {
    const { userId, userEmail } = req.body;
    
    if (!userId || !userEmail) {
      return res.status(400).json({ error: "Missing user info" });
    }

    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;

    if (!apiKey || !storeId || !variantId) {
      return res.status(500).json({ error: "Lemon Squeezy not configured" });
    }

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
            checkout_data: {
              email: userEmail,
              custom: {
                user_id: userId
              }
            }
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: storeId
              }
            },
            variant: {
              data: {
                type: "variants",
                id: variantId
              }
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lemon Squeezy Error:", errorText);
      return res.status(response.status).json({ error: "Failed to create checkout" });
    }

    const data = await response.json();
    res.json({ url: data.data.attributes.url });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = 3000;

async function startServer() {
  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
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
  }

  // SPA fallback for production (must be after API routes and static files)
  if (process.env.NODE_ENV === "production") {
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Unmatched request: ${req.method} ${req.url}`);
  next();
});

startServer().catch(err => {
  console.error("Failed to start server:", err);
});

export default app;
