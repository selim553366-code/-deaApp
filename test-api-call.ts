async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-3-flash-preview",
        contents: `Kullanıcı şu uygulamayı yapmak istiyor: "test". Bu uygulamayı daha iyi tasarlayabilmek için kullanıcıya sorulacak en önemli 3 soruyu oluştur. Sorular kısa ve net olmalı. Sadece JSON formatında bir string array döndür. Örnek: ["Soru 1?", "Soru 2?", "Soru 3?"].`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: { type: "STRING" }
          }
        }
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Data:", data);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
test();
