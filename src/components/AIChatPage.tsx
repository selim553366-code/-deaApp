import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2, Bot, User as UserIcon, Sparkles } from "lucide-react";

export const AIChatPage = ({ onOpenPremium }: { onOpenPremium: () => void }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const result = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: input,
      });
      setMessages([...newMessages, { role: 'ai' as const, text: result.text || 'Cevap alınamadı.' }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'ai' as const, text: 'Bir hata oluştu.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl flex justify-between items-center mb-12">
        <h1 className="font-handwriting text-6xl font-bold text-zinc-900">Düşünceni Gerçeğe Çevir.</h1>
        <button 
          onClick={onOpenPremium}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Premium
        </button>
      </div>
      
      <div className="w-full max-w-2xl flex-1 flex flex-col bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'ai' && <Bot className="w-8 h-8 text-indigo-500" />}
              <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-900'}`}>
                {msg.text}
              </div>
              {msg.role === 'user' && <UserIcon className="w-8 h-8 text-zinc-400" />}
            </div>
          ))}
          {loading && <div className="text-zinc-500 italic">AI düşünüyor...</div>}
        </div>
        
        <div className="p-4 border-t border-zinc-200 flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Ne oluşturmak istersin?"
            rows={2}
          />
          <button 
            onClick={handleSend} 
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-zinc-400 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
