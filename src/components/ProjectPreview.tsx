import React, { useState, useRef, useEffect } from 'react';
import { Project, User } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, Globe, RefreshCw, Edit2, Check, Settings, Maximize2, Minimize2, Circle, CheckCircle2, Bot, Send, Paperclip, X, FileText, Image as ImageIcon, File, Wand2, Sparkles } from 'lucide-react';
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
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'chat'>('preview');
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; data: string } | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const designComponents = [
    { id: 'button', icon: <Circle size={20} />, label: 'Modern Buton', prompt: 'Sayfaya son derece modern, hover efektli bir buton ekle.' },
    { id: 'search', icon: <Globe size={20} />, label: 'Arama Çubuğu', prompt: 'Üst kısma şık bir arama çubuğu ekle.' },
    { id: 'social', icon: <Paperclip size={20} />, label: 'Sosyal Medya', prompt: 'Alt kısma sosyal medya ikonları (Instagram, Twitter, LinkedIn) ekle.' },
    { id: 'card', icon: <FileText size={20} />, label: 'Özellik Kartı', prompt: 'Sayfaya yeni bir özellik kartı bölümü ekle.' },
    { id: 'form', icon: <Send size={20} />, label: 'İletişim Formu', prompt: 'Sayfanın sonuna modern bir iletişim formu ekle.' },
    { id: 'glass', icon: <Sparkles size={20} />, label: 'Cam Efekti', prompt: 'Tüm kartlara ve butonlara glassmorphism (cam) efekti uygula.' },
    { id: 'steam', icon: <Globe size={20} />, label: 'Steam Tasarımı', prompt: 'Sayfayı modern bir Steam oyun mağazası sayfasına çevir. Koyu tema, büyük bir oyun görseli, oyun detayları ve temiz bir ızgara düzeni kullan.' },
  ];

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      const base64Content = base64Data.split(',')[1];
      setSelectedFile({
        name: file.name,
        type: file.type,
        data: base64Content
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (overridePrompt?: string | React.MouseEvent | React.FormEvent) => {
    // If overridePrompt is an event object, ignore it and use chatInput
    if (overridePrompt && typeof overridePrompt === 'object' && 'preventDefault' in overridePrompt) {
      overridePrompt.preventDefault();
      overridePrompt = undefined;
    }
    
    const messageText = (typeof overridePrompt === 'string' ? overridePrompt : chatInput) || '';
    
    if (typeof messageText !== 'string') {
      console.error("messageText is not a string:", messageText);
      return;
    }

    if ((!messageText.trim() && !selectedFile) || isChatLoading) return;

    if (user && !user.isPremium && (user.updateCredits || 0) < 10) {
      window.dispatchEvent(new CustomEvent('show-premium-modal'));
      return;
    }

    const newUserMsg = { 
      role: 'user' as const, 
      text: messageText + (selectedFile ? `\n[Dosya eklendi: ${selectedFile.name}]` : '') 
    };
    const updatedMessages = [...chatMessages, newUserMsg];
    
    setChatMessages(updatedMessages);
    
    updateDoc(doc(db, 'projects', project.id), { 
      chatHistory: updatedMessages,
      updatedAt: new Date().toISOString() 
    }).catch(console.error);
    
    const currentInput = messageText;
    const currentFile = selectedFile;
    
    if (!overridePrompt) setChatInput('');
    setSelectedFile(null);
    setIsChatLoading(true);

    try {
      if (user && !user.isPremium) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          updateCredits: Math.max(0, (user.updateCredits || 0) - 10)
        });
      }

      const contents = updatedMessages.map((msg, idx) => {
        const parts: any[] = [{ text: msg.text }];
        
        // If this is the last message and there's a file, add it to parts
        if (idx === updatedMessages.length - 1 && currentFile) {
          parts.push({
            inlineData: {
              mimeType: currentFile.type,
              data: currentFile.data
            }
          });
        }
        
        return {
          role: msg.role,
          parts
        };
      });

      // Inject the current HTML code into the last message context
      const lastMsg = contents[contents.length - 1];
      const currentCode = project.code || "";
      
      const systemInstruction = `Sen bir Kıdemli Yaratıcı Teknoloji Uzmanısın.
Görevin: Kullanıcının isteğine göre web sitesini veya oyunu güncellemek.

KESİN KURALLAR:
1. ASLA SORU SORMA.
2. INCREMENTAL (KADEMELİ) GÜNCELLEME YAP: Tüm kodu yeniden yazma. Sadece kullanıcının istediği değişikliği yap, mevcut kodun geri kalanını olduğu gibi koru.
3. Eğer "oyun yap" derse: HTML5/JS/CSS kullanarak, mobil uyumlu, akıcı animasyonlara sahip, bağımlılık yapıcı ve modern bir oyun tasarla.
4. Eğer web sitesi güncelleme isterse: Glassmorphism, yumuşak gölgeler, canlı gradientler kullanarak premium bir UI oluştur.
5. ETKİLEŞİM (INTERACTIVITY): Eğer butonlar, sekmeler (tabs), modallar, açılır menüler (dropdowns) veya formlar gibi etkileşimli öğeler varsa, bunların çalışması için gerekli JavaScript kodunu da <script> etiketleri içinde HTML'e dahil et. Tüm butonlar ve etkileşimli alanlar işlevsel olmalı.
6. YANIT FORMATI (ZORUNLU):
   - Yanıtın SADECE şu iki bölümden oluşmalı:
   - <message>Yaptığın değişikliği anlatan 1 cümlelik mesaj</message>
   - <kodu_baslat>GÜNCELLENMİŞ TÜM HTML/CSS/JS KODU</kodu_bitir>
7. BAŞKA HİÇBİR AÇIKLAMA YAZMA.`;
      
      lastMsg.parts[0].text = `Mevcut HTML Kodu:\n\`\`\`html\n${currentCode}\n\`\`\`\n\nKullanıcı Mesajı: ${currentInput}`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: contents,
          systemInstruction: systemInstruction,
          model: "gpt-4o-mini"
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed');

      const responseText = data.text || '';
      
      if (!responseText) {
        throw new Error("Yapay zekadan boş cevap döndü. Lütfen tekrar deneyin.");
      }
      let newCode = project.code;
      let aiMessageText = responseText;

      const messageMatch = responseText.match(/<message>([\s\S]*?)<\/message>/i);
      if (messageMatch) {
        aiMessageText = messageMatch[1].trim();
      } else {
        // Fallback to removing code blocks if <message> tag is missing
        aiMessageText = responseText.replace(/<kodu_baslat>[\s\S]*?<\/kodu_bitir>/i, '')
                                    .replace(/```[\s\S]*?```/g, '')
                                    .replace(/(<!DOCTYPE html>[\s\S]*<\/html>|<html[\s\S]*<\/html>)/i, '')
                                    .trim() || "Kod güncellendi! Sol taraftan önizleyebilirsiniz.";
      }

      const codeMatch = responseText.match(/<kodu_baslat>([\s\S]*?)<\/kodu_bitir>/i) || responseText.match(/<kodu_baslat>([\s\S]*)/i);
      if (codeMatch) {
        newCode = codeMatch[1].trim();
      } else {
        // Fallback to old regexes
        const htmlMatch = responseText.match(/```html([\s\S]*?)```/i) || responseText.match(/```html([\s\S]*)/i);
        if (htmlMatch) {
          newCode = htmlMatch[1].trim();
        } else if (responseText.includes('```')) {
           const fallbackMatch = responseText.match(/```([\s\S]*?)```/) || responseText.match(/```([\s\S]*)/);
           if (fallbackMatch && fallbackMatch[1].includes('<html')) {
             newCode = fallbackMatch[1].trim();
           }
        } else {
           const rawHtmlMatch = responseText.match(/(<!DOCTYPE html>[\s\S]*<\/html>|<html[\s\S]*<\/html>)/i) || responseText.match(/(<!DOCTYPE html>[\s\S]*|<html[\s\S]*)/i);
           if (rawHtmlMatch) {
             newCode = rawHtmlMatch[1].trim();
           }
        }
      }

      // Clean up any remaining markdown blocks
      newCode = newCode.replace(/^```html\n?/i, '').replace(/\n?```$/i, '').trim();
      newCode = newCode.replace(/^```\n?/i, '').replace(/\n?```$/i, '').trim();

      if (newCode.length < 50) {
        newCode = project.code;
        if (aiMessageText === responseText) {
           aiMessageText = "Üzgünüm, kodu güncellerken bir hata oluştu. Lütfen tekrar deneyin.";
        }
      } else if (responseText.length > 10000 && !responseText.includes('</kodu_bitir>') && !responseText.includes('</html>') && !responseText.endsWith('```')) {
        aiMessageText += " (Uyarı: Kod çok uzun olduğu için tamamı oluşturulamadı, sayfa eksik görünebilir.)";
      }

      const newAiMsg = { role: 'model' as const, text: aiMessageText };
      const finalMessages = [...updatedMessages, newAiMsg];
      
      setChatMessages(finalMessages);
      
      await updateDoc(doc(db, 'projects', project.id), { 
        code: newCode,
        chatHistory: finalMessages,
        updatedAt: new Date().toISOString() 
      });
      
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      const errorMsg = { role: 'model' as const, text: errorMessage };
      
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
            onClick={() => setIsDesignMode(!isDesignMode)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all shadow-sm ${isDesignMode ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}
            title="Tasarım Laboratuvarı"
          >
            <Wand2 className="w-4 h-4" />
            <span className="hidden sm:inline">Tasarım Laboratuvarı</span>
          </motion.button>
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

      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 overflow-y-auto md:overflow-x-auto pb-4">
        {isDesignMode && (
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-full md:w-64 bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 flex flex-col gap-4 shrink-0"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                <Wand2 size={16} />
              </div>
              <h3 className="font-bold text-sm text-zinc-800 uppercase tracking-wider">Bileşenler</h3>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium mb-2">Sürükleyip önizleme alanına bırakın.</p>
            <div className="grid grid-cols-1 gap-2">
              {designComponents.map((comp) => (
                <motion.div
                  key={comp.id}
                  drag
                  dragSnapToOrigin
                  onDragStart={() => setDraggedComponent(comp.id)}
                  onDragEnd={(e, info) => {
                    setDraggedComponent(null);
                    if (info.point.x > 300) {
                      handleSendMessage(comp.prompt);
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileDrag={{ scale: 1.1, zIndex: 100 }}
                  className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl cursor-grab active:cursor-grabbing flex items-center gap-3 group hover:border-indigo-200 hover:bg-white transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-indigo-500 transition-colors">
                    {comp.icon}
                  </div>
                  <span className="text-xs font-semibold text-zinc-600 group-hover:text-zinc-900">{comp.label}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-auto p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-[10px] text-indigo-700 font-bold uppercase mb-1">AI Studio Özel</p>
              <p className="text-[10px] text-indigo-600 leading-relaxed">Bu modda sürüklediğiniz her bileşen AI tarafından otomatik olarak sitenize entegre edilir.</p>
            </div>
          </motion.div>
        )}

        <div className={`flex-[3] min-h-[600px] bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col relative ${activeTab === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-zinc-100 px-4 py-2 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="ml-4 text-xs text-zinc-500 font-medium">Önizleme (Test Ekranı)</div>
            </div>
            <div className="md:hidden flex bg-zinc-200 p-0.5 rounded-lg">
              <button onClick={() => setActiveTab('preview')} className={`px-3 py-1 text-xs font-medium rounded-md ${activeTab === 'preview' ? 'bg-white shadow-sm' : ''}`}>Önizleme</button>
              <button onClick={() => setActiveTab('chat')} className={`px-3 py-1 text-xs font-medium rounded-md ${activeTab === 'chat' ? 'bg-white shadow-sm' : ''}`}>Chat</button>
            </div>
          </div>
          <iframe 
            ref={iframeRef}
            srcDoc={project.code ? project.code + `
<script>
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link) {
      e.preventDefault();
    }
  });
  document.addEventListener('submit', function(e) {
    e.preventDefault();
  });
</script>` : ''}
            className="w-full flex-1 border-none bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
          
          <AnimatePresence>
            {draggedComponent && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-indigo-600/10 backdrop-blur-[1px] border-2 border-dashed border-indigo-500 flex items-center justify-center pointer-events-none z-50"
              >
                <div className="bg-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-indigo-100 animate-bounce">
                  <Sparkles className="text-indigo-500 w-5 h-5" />
                  <span className="font-bold text-indigo-600">Bileşeni Eklemek İçin Buraya Bırakın</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`flex-1 bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden max-w-md ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-800 text-sm">İdea Ai 1.0 ile Güncelle</h3>
                <p className="text-xs text-zinc-500">Ne değiştirmek istediğinizi yazın.</p>
              </div>
            </div>
            <div className="md:hidden flex bg-zinc-100 p-0.5 rounded-lg">
              <button onClick={() => setActiveTab('preview')} className={`px-3 py-1 text-xs font-medium rounded-md ${activeTab === 'preview' ? 'bg-white shadow-sm' : ''}`}>Önizleme</button>
              <button onClick={() => setActiveTab('chat')} className={`px-3 py-1 text-xs font-medium rounded-md ${activeTab === 'chat' ? 'bg-white shadow-sm' : ''}`}>Chat</button>
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
            {selectedFile && (
              <div className="mb-3 flex items-center justify-between p-2 bg-indigo-50 border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-indigo-700 overflow-hidden">
                  {selectedFile.type.startsWith('image/') ? <ImageIcon size={14} /> : <FileText size={14} />}
                  <span className="text-xs font-medium truncate">{selectedFile.name}</span>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1 text-indigo-400 hover:text-indigo-600 rounded-full hover:bg-indigo-100"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
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
                  className="w-full max-h-32 min-h-[44px] p-3 pr-10 text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                  disabled={isChatLoading}
                  rows={1}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-2 bottom-2 p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Dosya ekle"
                  disabled={isChatLoading}
                >
                  <Paperclip size={18} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf,text/*"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={isChatLoading || (!chatInput.trim() && !selectedFile)}
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
