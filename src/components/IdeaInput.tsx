import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { Loader2, Sparkles, X, CheckCircle2, Circle, Wand2, Lightbulb } from 'lucide-react';
import { User } from '../types';
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from '../contexts/LanguageContext';

export const IdeaInput = ({ user, onProjectCreated, initialPrompt }: { user: User | null, onProjectCreated?: (id: string) => void, initialPrompt?: string }) => {
  const { t, language } = useLanguage();
  const [idea, setIdea] = useState(initialPrompt || '');
  const [showPreview, setShowPreview] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState<'questions' | 'building'>('questions');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);

  const loadingMessages = language === 'tr' ? [
    "Fikriniz analiz ediliyor...",
    "Gerekli bileşenler belirleniyor...",
    "Veritabanı şeması tasarlanıyor...",
    "Kullanıcı arayüzü oluşturuluyor...",
    "Son dokunuşlar yapılıyor..."
  ] : [
    "Analyzing your idea...",
    "Determining necessary components...",
    "Designing database schema...",
    "Creating user interface...",
    "Making final touches..."
  ];

  const suggestedIdeas = language === 'tr' ? [
    "Modern bir kişisel portfolyo sitesi",
    "Kahve dükkanı için şık bir menü sayfası",
    "Spor salonu üyelik ve kayıt ekranı",
    "Dijital pazarlama ajansı açılış sayfası"
  ] : [
    "A modern personal portfolio website",
    "A stylish menu page for a coffee shop",
    "Gym membership and registration screen",
    "Digital marketing agency landing page"
  ];

  useEffect(() => {
    if (initialPrompt) {
      setIdea(initialPrompt);
    }
  }, [initialPrompt]);

  const handleStart = async () => {
    if (!idea.trim() || isFetchingQuestions || isGenerating) return;

    if (user && !user.isPremium && (user.siteCreationCredits || 0) < 10) {
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
      const aiResponse = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-3-flash-preview",
          contents: `Kullanıcı şu uygulamayı yapmak istiyor: "${idea}". Bu uygulamayı daha iyi tasarlayabilmek için kullanıcıya sorulacak en önemli 3 soruyu oluştur. Sorular kısa ve net olmalı. Sadece JSON formatında bir string array döndür. Örnek: ["Soru 1?", "Soru 2?", "Soru 3?"].`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          }
        })
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "AI Soruları oluşturulamadı.");
      }
      
      const data = await aiResponse.json();
      const result = JSON.parse(data.text || "[]");
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
          siteCreationCredits: Math.max(0, (user.siteCreationCredits || 0) - 10)
        });
      }

      // Generate code
      const aiResponse = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-3-flash-preview",
          contents: `Sen uzman bir Frontend Geliştiricisi ve UI/UX Tasarımcısısın. Kullanıcının fikri ve detayları: "${finalPrompt}". 
Bu fikir için tek sayfalık, son derece modern, estetik, çok hızlı çalışan ve responsive (mobil uyumlu) bir HTML kodu oluştur. 
Tailwind CSS (CDN üzerinden) ve gerekiyorsa FontAwesome veya Lucide ikonları (CDN üzerinden) kullan. 
Modern UI trendlerini (glassmorphism, soft shadow, modern tipografi, gradientler) uygula. 
Kullanıcı deneyimi (UX) en üst düzeyde olmalı. 
Sadece ve sadece çalışabilir HTML kodunu döndür, markdown işaretleri (\`\`\`html vb.) KULLANMA. Kod <html> ile başlayıp </html> ile bitmeli.`
        })
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        throw new Error(errorData.error || "Web sitesi kodu oluşturulamadı.");
      }
      
      const data = await aiResponse.json();
      let code = data.text || '<h1>Hata oluştu</h1>';
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full transition-all duration-700 ease-in-out ${showPreview ? 'max-w-5xl' : 'max-w-2xl'} mx-auto flex flex-col md:flex-row gap-6`}
    >
      {/* Left Panel - Input */}
      <div className="w-full md:w-[480px] p-6 md:p-8 bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-indigo-500/5 border border-white flex flex-col relative z-10 shrink-0">
        <h1 className="text-lg md:text-xl font-black text-center text-zinc-900 mb-1 tracking-tighter uppercase">{t('mainTitle')}</h1>
        <h2 className="mb-6 text-xs md:text-sm font-medium text-center text-zinc-500 leading-relaxed">{t('subTitle')}</h2>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="w-full p-4 mb-4 text-sm md:text-base border-2 border-zinc-100 rounded-[24px] focus:ring-0 focus:border-indigo-500 outline-none transition-all resize-none bg-zinc-50/50 min-h-[100px] md:min-h-[120px] placeholder:text-zinc-300 font-medium"
          placeholder={t('placeholder')}
          disabled={isGenerating}
        />
        <div className="flex flex-col gap-3">
          <motion.button 
            whileHover={{ scale: 1.02, translateY: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart} 
            disabled={isGenerating || isFetchingQuestions || !idea.trim() || showPreview}
            className="w-full p-4 text-base text-white bg-indigo-600 rounded-[20px] hover:bg-indigo-700 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20"
          >
            {isFetchingQuestions ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('preparing')}
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                {t('startCreating')}
              </>
            )}
          </motion.button>
        </div>

        {/* Suggested Ideas */}
        {!showPreview && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3 text-zinc-500">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">{language === 'tr' ? 'Fikre mi ihtiyacınız var?' : 'Need an idea?'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedIdeas.map((suggestedIdea, index) => (
                <button
                  key={index}
                  onClick={() => setIdea(suggestedIdea)}
                  disabled={isGenerating || isFetchingQuestions}
                  className="text-xs md:text-sm px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors border border-zinc-200 text-left"
                >
                  {suggestedIdea}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Preview */}
      <AnimatePresence>
      {showPreview && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full md:w-[400px] bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 p-8 flex flex-col text-white relative"
        >
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
                {t('detailsTitle')}
              </h3>
              <div className="flex-1 flex flex-col gap-4">
                {isFetchingQuestions ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4 py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-center text-sm">{t('preparingQuestions')}</p>
                  </div>
                ) : questions.length > 0 ? (
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <span className="text-xs font-medium text-indigo-400 mb-1 block">
                        {t('question')} {currentQuestionIndex + 1} / {questions.length}
                      </span>
                      <p className="text-zinc-200 font-medium">{questions[currentQuestionIndex]}</p>
                    </div>
                    
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="w-full p-3 mb-4 text-sm border border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none bg-zinc-800/50 text-white"
                      placeholder={t('answerPlaceholder')}
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
                        {t('skipQuestions')}
                      </button>
                      <button
                        onClick={handleAnswerSubmit}
                        disabled={!currentAnswer.trim()}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {currentQuestionIndex < questions.length - 1 ? t('nextQuestion') : t('startCreating')}
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
                {t('preview')}
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
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};
