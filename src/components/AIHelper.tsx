import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Paperclip, X, FileText, Image as ImageIcon, File } from 'lucide-react';

export const AIHelper = ({ user }: { user: User | null }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<{ name: string; type: string; data: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      // Extract base64 part (remove data:image/png;base64, etc.)
      const base64Content = base64Data.split(',')[1];
      setFile({
        name: selectedFile.name,
        type: selectedFile.type,
        data: base64Content
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleAsk = async () => {
    if (!prompt.trim() && !file) return;
    
    if (user && !user.isPremium && user.credits < 10) {
      window.dispatchEvent(new CustomEvent('show-premium-modal'));
      return;
    }

    setLoading(true);
    try {
      const parts: any[] = [];
      if (prompt.trim()) {
        parts.push({ text: prompt });
      }
      if (file) {
        parts.push({
          inlineData: {
            mimeType: file.type,
            data: file.data
          }
        });
      }

      const aiResponse = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          systemInstruction: "Sen yardımcı bir AI asistanısın. Kullanıcılara web sitesi fikirleri ve teknik konularda yardımcı oluyorsun. Eğer kullanıcı bir dosya (resim, döküman vb.) gönderdiyse onu analiz et ve yardımcı ol. Kısa ve öz cevaplar ver.",
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

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={16} />;
    if (type.includes('pdf') || type.includes('text')) return <FileText size={16} />;
    return <File size={16} />;
  };

  return (
    <div className="p-6 mt-6 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-gray-800 flex items-center gap-2">
        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
        Yardımcı AI
      </h2>
      
      <div className="relative mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[100px] resize-none"
          placeholder="Fikir iste, soru sor veya dosya yükle..."
        />
        
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/pdf,text/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Dosya ekle"
          >
            <Paperclip size={20} />
          </button>
        </div>
      </div>

      {file && (
        <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="flex items-center gap-2 text-blue-700 overflow-hidden">
            {getFileIcon(file.type)}
            <span className="text-sm font-medium truncate">{file.name}</span>
          </div>
          <button
            onClick={() => setFile(null)}
            className="p-1 text-blue-400 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <button 
        onClick={handleAsk} 
        className="w-full p-4 text-white bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200" 
        disabled={loading || (!prompt.trim() && !file)}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Düşünüyor...</span>
          </div>
        ) : 'Sor'}
      </button>

      {response && (
        <div className="mt-6 p-5 bg-white border border-gray-100 rounded-xl shadow-inner animate-in fade-in slide-in-from-top-2">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">AI Yanıtı</div>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{response}</div>
        </div>
      )}
    </div>
  );
};
