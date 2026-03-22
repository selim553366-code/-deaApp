import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { Loader2, Sparkles, X, CheckCircle2, Circle, Wand2 } from 'lucide-react';
import { User } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const loadingMessages = [
  "Fikriniz analiz ediliyor...",
  "Gerekli bileşenler belirleniyor...",
  "Veritabanı şeması tasarlanıyor...",
  "Kullanıcı arayüzü oluşturuluyor...",
  "Son dokunuşlar yapılıyor..."
];

export const IdeaInput = ({ user, onProjectCreated }: { user: User | null, onProjectCreated?: (id: string) => void }) => {
  const [idea, setIdea] = useState('');
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
    if (!idea.trim() || isFetchingQuestions || isGenerating) return;

    if (user && !user.isPremium && user.credits < 10) {
      window.dispatchEvent(new CustomEvent('show-premium-modal'));
      return;
    }
    
    setShowPreview(true);
    setPreviewMode('questions');
    setIsFetchingQuestions(true);
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Kullanıcı şu uygulamayı yapmak istiyor: "${idea}". Bu uygulamayı daha iyi tasarlayabilmek için kullanıcıya sorulacak en önemli 3 soruyu oluştur. Sorular kısa ve net olmalı. Sadece JSON formatında bir string array döndür. Örnek: ["Soru 1?", "Soru 2?", "Soru 3?"].`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      const result = JSON.parse(response.text || "[]");
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

  const handleBuild = async (finalAnswers: string[]) => {
    setPreviewMode('building');
    setIsGenerating(true);
    setLoadingStep(0);

    // Combine prompt and answers for the final prompt
    let finalPrompt = `Ana Fikir: ${idea}\n\nDetaylar:\n`;
    questions.forEach((q, i) => {
      finalPrompt += `- Soru: ${q}\n  Cevap: ${finalAnswers[i]}\n`;
    });

    try {
      // Loading simulation
      for (let i = 0; i < loadingMessages.length; i++) {
        setLoadingStep(i);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      // Set to final step after loop
      setLoadingStep(loadingMessages.length - 1);

      // Deduct credits if not premium
      if (user && !user.isPremium) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          credits: Math.max(0, user.credits - 10)
        });
      }

      // Generate code
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Kullanıcının fikri ve detayları: "${finalPrompt}". Bu fikir için tek sayfalık, modern, Tailwind CSS kullanan, işlevsel bir HTML kodu oluştur. Sadece HTML kodunu döndür, markdown işaretleri kullanma.`
      });
      
      let code = response.text || '<h1>Hata oluştu</h1>';
      code = code.replace(/```html/g, '').replace(/```/g, '').trim();

      const newProjectRef = doc(collection(db, 'projects'));
      const newProject = {
        id: newProjectRef.id,
        userId: auth.currentUser?.uid,
        title: idea.substring(0, 30) + (idea.length > 30 ? "..." : ""),
        idea: finalPrompt,
        code,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(newProjectRef, newProject);
      
      setIdea('');
      setShowPreview(false);
      setIsGenerating(false);
      
      if (onProjectCreated) {
        onProjectCreated(newProjectRef.id);
      }
    } catch (err) {
      console.error("Proje oluşturma hatası:", err);
      alert(`Bir hata oluştu: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
      setIsGenerating(false);
    }
  };

  return (
    <div className={`w-full transition-all duration-700 ease-in-out ${showPreview ? 'max-w-5xl' : 'max-w-2xl'} mx-auto flex flex-col md:flex-row gap-6`}>
      {/* Left Panel - Input */}
      <div className="w-full md:w-[600px] p-6 md:p-8 bg-white rounded-3xl shadow-xl border border-zinc-100 flex flex-col relative z-10 shrink-0">
        <h1 className="font-handwriting text-4xl md:text-5xl font-bold text-center text-indigo-600 mb-2">Düşünceni Gerçeğe Çevir.</h1>
        <h2 className="mb-6 text-xl font-medium text-center text-zinc-700">Ne oluşturmak istersin?</h2>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="w-full p-4 mb-4 text-base border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none bg-zinc-50/50"
          placeholder="Uygulama fikrini buraya yaz..."
          rows={4}
          disabled={isGenerating}
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleStart} 
            disabled={isGenerating || isFetchingQuestions || !idea.trim() || showPreview}
            className="w-full p-4 text-base text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isFetchingQuestions ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Hazırlanıyor...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Oluşturmaya Başla
              </>
            )}
          </button>
        </div>
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
          
          {previewMode === 'questions' ? (
            <>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Wand2 className="text-indigo-400 w-5 h-5" />
                Detayları Belirleyelim
              </h3>
              <div className="flex-1 flex flex-col gap-4">
                {isFetchingQuestions ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4 py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-center text-sm">Projeniz için en iyi sorular hazırlanıyor...</p>
                  </div>
                ) : questions.length > 0 ? (
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <span className="text-xs font-medium text-indigo-400 mb-1 block">
                        Soru {currentQuestionIndex + 1} / {questions.length}
                      </span>
                      <p className="text-zinc-200 font-medium">{questions[currentQuestionIndex]}</p>
                    </div>
                    
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="w-full p-3 mb-4 text-sm border border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none bg-zinc-800/50 text-white"
                      placeholder="Cevabınızı buraya yazın..."
                      rows={3}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAnswerSubmit();
                        }
                      }}
                    />
                    
                    <div className="mt-auto pt-4 flex justify-between items-center">
                      <button
                        onClick={() => handleBuild(answers.concat(Array(questions.length - answers.length).fill('Kullanıcı cevap vermedi.')))}
                        className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
                      >
                        Soruları Atla
                      </button>
                      <button
                        onClick={handleAnswerSubmit}
                        disabled={!currentAnswer.trim()}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {currentQuestionIndex < questions.length - 1 ? 'Sonraki Soru' : 'Oluşturmaya Başla'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
};
