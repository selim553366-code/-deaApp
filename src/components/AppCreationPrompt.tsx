import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, X, CheckCircle2, Circle, Wand2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

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
  const [previewMode, setPreviewMode] = useState<'questions' | 'building'>('questions');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);

  const handleStart = async () => {
    if (!prompt.trim() || isFetchingQuestions || isGenerating) return;
    
    // Redirect to login if not logged in
    onNext(prompt);
    return;
    
    setShowPreview(true);
    setPreviewMode('questions');
    setIsFetchingQuestions(true);
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Kullanıcı şu uygulamayı yapmak istiyor: "${prompt}". Bu uygulamayı daha iyi tasarlayabilmek için kullanıcıya sorulacak en önemli 3 soruyu oluştur. Sorular kısa ve net olmalı. Sadece JSON formatında bir string array döndür. Örnek: ["Soru 1?", "Soru 2?", "Soru 3?"].`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const result = JSON.parse(aiResponse.text || "[]");
      setQuestions(result.slice(0, 3)); // Ensure max 3 questions
    } catch (err) {
      console.error(err);
      // Fallback questions if API fails
      setQuestions([
        "Uygulamanın ana renk teması nasıl olmalı?",
        "Hangi temel özelliklerin kesinlikle olmasını istersiniz?",
        "Hedef kitleniz kimler?"
      ]);
    } finally {
      setIsFetchingQuestions(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) return;

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered, proceed to build
      handleBuild(newAnswers);
    }
  };

  const handleBuild = (finalAnswers: string[]) => {
    setPreviewMode('building');
    setIsGenerating(true);
    setLoadingStep(0);

    // Combine prompt and answers for the final prompt
    let finalPrompt = `Ana Fikir: ${prompt}\n\nDetaylar:\n`;
    questions.forEach((q, i) => {
      finalPrompt += `- Soru: ${q}\n  Cevap: ${finalAnswers[i]}\n`;
    });

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < loadingMessages.length) {
        setLoadingStep(step);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onNext(finalPrompt);
        }, 1000);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className={`w-full transition-all duration-700 ease-in-out ${showPreview ? 'max-w-6xl' : 'max-w-3xl'} flex flex-col md:flex-row gap-8 items-center`}>
        {/* Left Panel - Input */}
        <div className="w-full p-6 md:p-12 bg-white/80 backdrop-blur-xl rounded-[32px] md:rounded-[40px] shadow-2xl shadow-indigo-500/5 border border-white flex flex-col relative z-10 shrink-0">
          <div className="text-center mb-6 md:mb-10">
            <motion.span 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-4 md:px-5 py-1.5 md:py-2 rounded-full inline-block mb-4 md:mb-6"
            >
              Yapay Zeka ile Geleceği İnşa Et
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-7xl font-black tracking-tighter text-zinc-900 leading-[0.9] mb-4 md:mb-6"
            >
              Hayal Et,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Biz Kodlayalım.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-xl text-zinc-500 max-w-lg mx-auto leading-relaxed"
            >
              Sadece ne istediğini söyle, saniyeler içinde profesyonel web siteni hazırla. Kodlama bilmene gerek yok.
            </motion.p>
          </div>

          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 md:p-6 text-base md:text-lg border-2 border-zinc-100 rounded-[24px] md:rounded-[32px] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none bg-zinc-50/30 min-h-[120px] md:min-h-[160px] placeholder:text-zinc-300"
              placeholder="Örn: Modern bir kahve dükkanı sitesi, koyu tema ve animasyonlu menü olsun..."
              rows={4}
              disabled={isGenerating}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-zinc-400 text-[10px] md:text-xs font-medium bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-zinc-100">
              <Sparkles size={12} className="text-indigo-500" />
              AI Gücüyle
            </div>
          </div>

          <div className="mt-6 md:mt-8">
            <motion.button 
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart} 
              disabled={isGenerating || isFetchingQuestions || !prompt.trim() || showPreview}
              className="w-full p-4 md:p-6 text-base md:text-lg text-white bg-zinc-900 rounded-[20px] md:rounded-[24px] hover:bg-black font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-zinc-900/20"
            >
              {isFetchingQuestions ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Zeka Hazırlanıyor...
                </>
              ) : (
                <>
                  <Wand2 className="w-6 h-6" />
                  Sihri Başlat
                </>
              )}
            </motion.button>
            <p className="text-center text-zinc-400 text-sm mt-4">
              Kredi kartı gerekmez • Ücretsiz başlayın
            </p>
          </div>
        </div>

        {/* Right Panel - Preview (Only if showPreview is true) */}
        <AnimatePresence>
          {showPreview && (
            <motion.div 
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="w-full md:w-[440px] bg-zinc-950 rounded-[40px] shadow-2xl border border-zinc-800 p-10 flex flex-col text-white relative overflow-hidden"
            >
              {/* Glass background effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full" />
              
              <button 
                onClick={() => setShowPreview(false)} 
                className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors bg-zinc-900/50 p-2 rounded-full"
              >
                <X size={20} />
              </button>
              
              {previewMode === 'questions' ? (
                <>
                  <div className="mb-10">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/20">
                      <Wand2 className="text-indigo-400 w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      Mükemmelleştirelim
                    </h3>
                    <p className="text-zinc-400 text-sm mt-1">Fikrini daha iyi anlamam için birkaç detay...</p>
                  </div>

                  <div className="flex-1 flex flex-col gap-6">
                    {isFetchingQuestions ? (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-6 py-12">
                        <div className="relative">
                          <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                          <div className="absolute inset-0 blur-xl bg-indigo-500/30 animate-pulse" />
                        </div>
                        <p className="text-center text-sm font-medium">Yapay zeka projenizi analiz ediyor...</p>
                      </div>
                    ) : questions.length > 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col h-full"
                      >
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">
                              ADIM {currentQuestionIndex + 1} / {questions.length}
                            </span>
                          </div>
                          <p className="text-xl text-zinc-100 font-semibold leading-snug">{questions[currentQuestionIndex]}</p>
                        </div>
                        
                        <textarea
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          className="w-full p-5 mb-6 text-base border border-zinc-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none bg-zinc-900/50 text-white placeholder:text-zinc-600 transition-all"
                          placeholder="Fikrinizi paylaşın..."
                          rows={4}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAnswerSubmit();
                            }
                          }}
                        />
                        
                        <div className="mt-auto flex justify-end">
                          <button
                            onClick={handleAnswerSubmit}
                            disabled={!currentAnswer.trim()}
                            className="group flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                          >
                            {currentQuestionIndex < questions.length - 1 ? 'Devam Et' : 'Sihri Başlat'}
                            <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-10">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20">
                      <Sparkles className="text-purple-400 w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      İnşa Ediliyor
                    </h3>
                    <p className="text-zinc-400 text-sm mt-1">Yapay zeka kodları satır satır yazıyor...</p>
                  </div>

                  <div className="flex-1 flex flex-col gap-6">
                    {loadingMessages.map((msg, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ 
                          opacity: idx <= loadingStep ? 1 : 0.2,
                          x: 0
                        }}
                        className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-500 ${
                          idx === loadingStep ? 'bg-white/5 border border-white/10' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {idx < loadingStep ? (
                            <div className="bg-emerald-500/20 p-1 rounded-full">
                              <CheckCircle2 className="text-emerald-400" size={18} />
                            </div>
                          ) : idx === loadingStep ? (
                            <div className="p-1">
                              <Loader2 className="text-indigo-400 animate-spin" size={18} />
                            </div>
                          ) : (
                            <div className="p-1">
                              <Circle className="text-zinc-800" size={18} />
                            </div>
                          )}
                        </div>
                        <span className={`text-sm ${
                          idx < loadingStep ? 'text-zinc-500' : 
                          idx === loadingStep ? 'text-white font-semibold' : 
                          'text-zinc-700'
                        }`}>
                          {msg}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
