import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(express.json());

// AI Generation Endpoint
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { contents, systemInstruction, model = "gemini-3-flash-preview" } = req.body;
    
    const keysToTry = [
      { name: "GEMINI_API_KEY", value: process.env.GEMINI_API_KEY },
      { name: "API_KEY", value: process.env.API_KEY },
      { name: "NEXT_PUBLIC_GEMINI_API_KEY", value: process.env.NEXT_PUBLIC_GEMINI_API_KEY },
      { name: "HARDCODED_FALLBACK", value: "AIzaSyDAdxxhbE5Rq40pf7vNvUq8zmcxKASWznI" } // User provided key
    ];

    let foundKey = "";
    let debugInfo = "";

    for (const item of keysToTry) {
      let val = item.value?.trim();
      
      if (!val || val === "undefined" || val === "" || val.includes("YOUR_GEMINI_API_KEY")) {
        continue;
      }

      // Remove any accidental quotes or parentheses
      const cleanVal = val.replace(/['"()]/g, "").trim();
      
      // Check for common mistakes
      const upperVal = cleanVal.toUpperCase();
      
      if (!cleanVal.startsWith("AIza")) {
        if (upperVal.startsWith("A1ZA")) {
          debugInfo += `[${item.name}: "AIza" yerine "a1za" (1 rakamı) kullanılmış!] `;
        } else if (upperVal.startsWith("AIZA")) {
          debugInfo += `[${item.name}: Büyük/Küçük harf hatası (Tam olarak "AIza" olmalı)] `;
        } else if (cleanVal.length < 20) {
          debugInfo += `[${item.name}: Çok kısa (${cleanVal.length} karakter)] `;
        } else {
          debugInfo += `[${item.name}: "AIza" ile başlamıyor (Şu anki başlangıç: "${cleanVal.substring(0, 4)}")] `;
        }
        continue;
      }

      if (cleanVal.length < 30) {
        debugInfo += `[${item.name}: Anahtar çok kısa görünüyor, eksik kopyalanmış olabilir.] `;
        continue;
      }
      
      foundKey = cleanVal;
      break;
    }

    if (!foundKey) {
      const statusMessage = debugInfo || "Tüm anahtarlar boş veya geçersiz.";
      return res.status(500).json({ 
        error: `Geçerli bir Gemini API anahtarı bulunamadı. (Hata: API_KEY_INVALID)\n\nDurum: ${statusMessage}\n\nÇözüm:\n1. https://aistudio.google.com/app/apikey adresine gidin.\n2. "Create API key" butonuna basın.\n3. "AIza" ile başlayan kodu kopyalayın.\n4. Secrets panelindeki GEMINI_API_KEY değerini bununla değiştirin.\n5. Kaydederken başında/sonunda boşluk, parantez veya tırnak olmadığından emin olun.` 
      });
    }

    const ai = new GoogleGenAI({ apiKey: foundKey });
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({ text: response.text });
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

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  (async () => {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  })();
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Ensure the server listens in development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
