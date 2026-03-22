import React, { useState, useRef, useEffect } from 'react';
import { Project, User } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, Globe, RefreshCw, Edit2, Check, Settings, Maximize2, Minimize2, Circle, CheckCircle2, Bot, Send } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { motion, AnimatePresence } from 'motion/react';

export const ProjectPreview = ({ 
  project, 
  user,
  initialChatPrompt,
  onClearInitialChatPrompt
}: { 
  project: Project, 
  user: User | null,
  initialChatPrompt?: string,
  onClearInitialChatPrompt?: () => void
}) => {
  const [title, setTitle] = useState(project.title || 'İsimsiz Proje');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sadece proje ID değiştiğinde chat geçmişini sıfırla/yükle
  useEffect(() => {
    setTitle(project.title || 'İsimsiz Proje');
    setChatMessages(project.chatHistory || []);
  }, [project.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  useEffect(() => {
    if (initialChatPrompt) {
      setChatInput(initialChatPrompt);
      if (onClearInitialChatPrompt) {
        onClearInitialChatPrompt();
      }
    }
  }, [initialChatPrompt, onClearInitialChatPrompt]);

  const handleSaveTitle = async () => {
    setIsEditingTitle(false);
    if (title !== project.title) {
      await updateDoc(doc(db, 'projects', project.id), { title, updatedAt: new Date().toISOString() });
    }
  };

  const handlePublish = async () => {
    if (!user?.isPremium) {
      window.dispatchEvent(new CustomEvent('show-premium-modal'));
      return;
    }
    await updateDoc(doc(db, 'projects', project.id), { isPublished: true, updatedAt: new Date().toISOString() });
    alert('Projeniz başarıyla yayınlandı!');
  };

  const handleSendMessage = async () => {
    if (!project.isPublished) {
      alert('Güncelleme yapabilmek için önce projenizi yayınlamalısınız. Yayınlamak Premium bir özelliktir.');
      if (!user?.isPremium) {
        window.dispatchEvent(new CustomEvent('show-premium-modal'));
      }
      return;
    }
    
    if (!chatInput.trim() || isChatLoading) return;

    const newUserMsg = { role: 'user' as const, text: chatInput };
    
    // Use functional state update to ensure we have the latest messages
    setChatMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newUserMsg];
      
      // Update database asynchronously without blocking UI
      updateDoc(doc(db, 'projects', project.id), { 
        chatHistory: updatedMessages,
        updatedAt: new Date().toISOString() 
      }).catch(console.error);

      return updatedMessages;
    });
    
    setChatInput('');
    setIsChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // We need to build contents from the latest state, so we construct it here
      const currentMessages = [...chatMessages, newUserMsg];
      const contents = currentMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      // Inject the current HTML code into the last message context
      contents[contents.length - 1].parts[0].text = `Mevcut HTML Kodu:\n\`\`\`html\n${project.code}\n\`\`\`\n\nKullanıcı Mesajı: ${newUserMsg.text}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: contents,
        config: {
          systemInstruction: "Sen uzman bir Frontend Geliştiricisi ve UI/UX Tasarımcısısın. Kullanıcıyla sohbet ederek web sitesini nasıl güncelleyeceğinizi tartışın. Gerekirse web'de araştırma yapabilirsin.\n\nÖNEMLİ KURAL: Cevapların her zaman ÇOK KISA, ÖZ ve NET olmalı. Uzun açıklamalar yapma, en fazla 1-2 cümle kullan.\n\nKullanıcı bir değişiklik istediğinde kısaca ne yapacağını söyle ve 'Uygulamamı ister misin?' diye sor. Kullanıcı kesin bir şekilde 'evet', 'güncelle', 'kodu yaz', 'uygula', 'yap' gibi net bir onay vermeden KESİNLİKLE HTML kodu üretme! Sadece sohbet et, fikir ver, plan yap.\n\nKullanıcı onay verdiğinde ve anlaştığınızda, tüm güncellenmiş çalışabilir HTML kodunu ```html ve ``` etiketleri arasına yazarak cevap ver. Sohbet ediyorsan normal metin yaz, kod bloğu kullanma. Türkçe konuş.",
          tools: [{ googleSearch: {} }]
        }
      });
      
      let responseText = response.text || '';
      const htmlMatch = responseText.match(/```html([\s\S]*?)```/);
      
      let newCode = project.code;
      let aiMessageText = responseText;

      if (htmlMatch) {
        newCode = htmlMatch[1].trim();
        aiMessageText = responseText.replace(/```html[\s\S]*?```/, '').trim() || "Kod güncellendi! Sol taraftan önizleyebilirsiniz.";
      } else if (responseText.includes('```')) {
         const fallbackMatch = responseText.match(/```([\s\S]*?)```/);
         if (fallbackMatch && fallbackMatch[1].includes('<html')) {
           newCode = fallbackMatch[1].trim();
           aiMessageText = responseText.replace(/```[\s\S]*?```/, '').trim() || "Kod güncellendi! Sol taraftan önizleyebilirsiniz.";
         }
      }

      const newAiMsg = { role: 'model' as const, text: aiMessageText };
      
      setChatMessages(prevMessages => {
        const finalMessages = [...prevMessages, newAiMsg];
        
        updateDoc(doc(db, 'projects', project.id), { 
          code: newCode,
          chatHistory: finalMessages,
          updatedAt: new Date().toISOString() 
        }).catch(console.error);

        return finalMessages;
      });
      
    } catch (err) {
      console.error(err);
      const errorMsg = { role: 'model' as const, text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' };
      
      setChatMessages(prevMessages => {
        const finalMessages = [...prevMessages, errorMsg];
        
        updateDoc(doc(db, 'projects', project.id), { 
          chatHistory: finalMessages,
          updatedAt: new Date().toISOString() 
        }).catch(console.error);

        return finalMessages;
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col gap-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-zinc-50 p-4 md:p-6 h-screen' : 'h-[calc(100vh-8rem)]'}`}
    >
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="px-3 py-1 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              />
              <button onClick={handleSaveTitle} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md">
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className={`flex items-center gap-2 ${(user?.isPremium || project.hasPaidForNameChange) ? 'group cursor-pointer' : ''}`} onClick={() => {
              if (user?.isPremium || project.hasPaidForNameChange) {
                setIsEditingTitle(true);
              } else {
                setShowSettings(true); // Open settings to show payment option
              }
            }}>
              <h2 className="text-xl font-bold text-zinc-800">{title}</h2>
              {(user?.isPremium || project.hasPaidForNameChange) && (
                <Edit2 className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          )}
          {project.isPublished && (
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Yayınlandı</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-200 transition-all shadow-sm"
            title={isFullscreen ? "Küçült" : "Tam Ekran"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? "Küçült" : "Tam Ekran"}</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-200 transition-all shadow-sm"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Ayarlar & Analiz</span>
          </motion.button>
          {!project.isPublished && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePublish}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Yayınla</span>
            </motion.button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        <div className="flex-[2] bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col relative">
          <div className="bg-zinc-100 px-4 py-2 border-b border-zinc-200 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="ml-4 text-xs text-zinc-500 font-medium">Önizleme (Test Ekranı)</div>
          </div>
          <iframe 
            ref={iframeRef}
            srcDoc={project.code}
            className="w-full flex-1 border-none bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden max-w-md">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 text-sm">AI Asistan ile Güncelle</h3>
              <p className="text-xs text-zinc-500">Ne değiştirmek istediğinizi yazın veya fikir alışverişi yapın.</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/30">
            {chatMessages.length === 0 && !isChatLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-3">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-zinc-400" />
                </div>
                <p className="text-sm">Projeyi güncellemek için bana ne yapmak istediğinizi söyleyin. Gerekirse web'de araştırma yapabilirim.</p>
              </div>
            )}
            
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-zinc-200 text-zinc-700 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-white border border-zinc-200 text-zinc-700 rounded-tl-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-zinc-500">AI Düşünüyor...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-zinc-100 bg-white">
            {!project.isPublished && (
              <div className="mb-3 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-2">
                <Globe className="w-4 h-4 shrink-0" />
                <span>Güncelleme yapabilmek için önce projeyi yayınlamanız gerekmektedir (Premium).</span>
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Mesajınızı yazın..."
                className="w-full max-h-32 min-h-[44px] p-3 text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                disabled={isChatLoading}
                rows={1}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
              >
                {isChatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      {showSettings && <ProjectSettingsModal project={project} user={user} onClose={() => setShowSettings(false)} />}
    </motion.div>
  );
};
