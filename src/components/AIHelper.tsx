import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

export const AIHelper = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setResponse(result.text || 'Cevap alınamadı.');
    } catch (err) {
      console.error(err);
      setResponse('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mt-6 bg-gray-100 rounded-xl">
      <h2 className="mb-4 text-xl font-bold">Yardımcı AI</h2>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-3 mb-4 border rounded-lg"
        placeholder="Fikir iste veya soru sor..."
      />
      <button onClick={handleAsk} className="w-full p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700" disabled={loading}>
        {loading ? 'Düşünüyor...' : 'Sor'}
      </button>
      {response && <div className="mt-4 p-4 bg-white rounded-lg">{response}</div>}
    </div>
  );
};
