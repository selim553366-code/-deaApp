import React, { useState } from 'react';
import { Send, Loader2, Bot, User as UserIcon, Sparkles } from "lucide-react";
import { useLanguage } from '../contexts/LanguageContext';

export const AIChatPage = ({ onOpenPremium }: { onOpenPremium: () => void }) => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    let prompt = input;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = input.match(urlRegex);

    let fetchedContent = "";
    if (urls && urls.length > 0) {
      try {
        const response = await fetch('/api/fetch-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urls[0] })
        });
        
        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.error("URL fetch failed with non-JSON response:", text);
          data = { text: "" };
        }
        fetchedContent = data.text || "";
      } catch (err) {
        console.error("URL fetch failed", err);
      }
    }

    const newMessages = [...messages, { role: 'user' as const, text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const promptTemplate = language === 'tr' 
        ? (fetchedContent 
            ? `Aşağıdaki web sitesinden alınan verileri analiz et ve kullanıcının isteğine göre mevcut takvimi güncelle. Eski özellikleri koru ve bozma.\n\nWeb sitesi içeriği:\n${fetchedContent}\n\nKullanıcı isteği:\n${prompt}`
            : `Mevcut takvimi güncelle. Eski özellikleri koru ve bozma. Kullanıcı isteği:\n${prompt}`)
        : (fetchedContent
            ? `Analyze the data from the following website and update the current calendar according to the user's request. Keep old features and do not break them.\n\nWebsite content:\n${fetchedContent}\n\nUser request:\n${prompt}`
            : `Update the current calendar. Keep old features and do not break them. User request:\n${prompt}`);

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: promptTemplate,
          model: "gemini-3-flash-preview",
          systemInstruction: "You are a helpful assistant. Provide clear and concise answers. If asked to update code, provide the full updated code block.",
          config: {
            max_tokens: 16000
          }
        })
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Server error: ${response.status}`);
      }

      if (!response.ok) throw new Error(data.error || 'Generation failed');
      
      setMessages([...newMessages, { role: 'ai' as const, text: data.text || t('noResponse') }]);
    } catch (err: any) {
      console.error(err);
      setMessages([...newMessages, { role: 'ai' as const, text: err.message || t('errorOccurred') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl flex justify-between items-center mb-12">
        <h1 className="font-handwriting text-6xl font-bold text-zinc-900">{t('mainTitle')}</h1>
        <button 
          onClick={onOpenPremium}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {t('premium')}
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
          {loading && <div className="text-zinc-500 italic">{t('aiThinking')}</div>}
        </div>
        
        <div className="p-4 border-t border-zinc-200 flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none max-h-40 overflow-y-auto"
            placeholder={t('subTitle')}
            rows={4}
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
