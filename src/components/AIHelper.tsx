import React, { useState } from 'react';
import { User } from '../types';

export const AIHelper = ({ user }: { user: User | null }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    
    if (user && !user.isPremium && user.credits < 10) {
      window.dispatchEvent(new CustomEvent('show-premium-modal'));
      return;
    }

    setLoading(true);
    try {
      const aiResponse = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction: "Sen yardımcı bir AI asistanısın. Kullanıcılara web sitesi fikirleri ve teknik konularda yardımcı oluyorsun. Kısa ve öz cevaplar ver.",
          model: "gemini-3-flash-preview"
        })
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        throw new Error(errorData.error || "Yapay zeka sunucusuna bağlanılamadı.");
      }

      const data = await aiResponse.json();
      setResponse(data.text || 'Cevap alınamadı.');
    } catch (err: any) {
      console.error(err);
      setResponse(err.message || 'Bir hata oluştu.');
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
