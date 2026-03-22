import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, X, CheckCircle2, Circle } from 'lucide-react';

interface Props {
  onNext: (prompt: string) => void;
}

const loadingMessages = [
  "Fikriniz analiz ediliyor...",
  "Gerekli bileşenler belirleniyor...",
  "Veritabanı şeması tasarlanıyor...",
  "Kullanıcı arayüzü oluşturuluyor...",
  "Son dokunuşlar yapılıyor..."
];

export const AppCreationPrompt = ({ onNext }: Props) => {
  const [prompt, setPrompt] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => {
    if (!prompt.trim() || isGenerating) return;
    
    setShowPreview(true);
    setIsGenerating(true);
    setLoadingStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < loadingMessages.length) {
        setLoadingStep(step);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onNext(prompt);
        }, 1000);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className={`w-full transition-all duration-700 ease-in-out ${showPreview ? 'max-w-5xl' : 'max-w-2xl'} flex flex-col md:flex-row gap-6`}>
        {/* Left Panel - Input */}
        <div className="w-full md:w-[600px] p-8 bg-white rounded-3xl shadow-xl border border-zinc-100 flex flex-col relative z-10 shrink-0">
          <h1 className="font-handwriting text-5xl font-bold text-center text-indigo-600 mb-2">Düşünceni Gerçeğe Çevir.</h1>
          <h2 className="mb-6 text-xl font-medium text-center text-zinc-700">Ne oluşturmak istersin?</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-4 mb-4 text-base border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none bg-zinc-50/50"
            placeholder="Uygulama fikrini buraya yaz..."
            rows={4}
            disabled={isGenerating}
          />
          <button
            onClick={handleNext}
            disabled={isGenerating || !prompt.trim()}
            className="w-full p-4 text-base text-white bg-black rounded-2xl hover:bg-zinc-800 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              'Devam Et (10 Kredi)'
            )}
          </button>
        </div>

        {/* Right Panel - Preview */}
        {showPreview && (
          <div className="w-full md:w-[400px] bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 p-8 flex flex-col text-white relative animate-in slide-in-from-right-8 fade-in duration-500">
            <button 
              onClick={() => setShowPreview(false)} 
              className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="text-indigo-400 w-5 h-5" />
              Önizleme
            </h3>
            <div className="flex-1 flex flex-col gap-5">
              {loadingMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 transition-all duration-500 ${
                    idx <= loadingStep ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'
                  }`}
                >
                  <div className="mt-0.5">
                    {idx < loadingStep ? (
                      <CheckCircle2 className="text-emerald-400" size={20} />
                    ) : idx === loadingStep ? (
                      <Loader2 className="text-indigo-400 animate-spin" size={20} />
                    ) : (
                      <Circle className="text-zinc-700" size={20} />
                    )}
                  </div>
                  <span className={`text-base ${
                    idx < loadingStep ? 'text-zinc-400' : 
                    idx === loadingStep ? 'text-white font-medium' : 
                    'text-zinc-600'
                  }`}>
                    {msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
