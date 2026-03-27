import React, { useState, useRef, useEffect } from 'react';
import { Project, User } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, Globe, RefreshCw, Edit2, Check, Settings, Maximize2, Minimize2, Circle, CheckCircle2, Bot, Send, Paperclip, X, FileText, Image as ImageIcon, File, Wand2, Sparkles, Download, ChevronLeft } from 'lucide-react';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const ProjectPreview = ({ 
  project, 
  user,
  initialChatPrompt,
  onClearInitialChatPrompt,
  onClose
}: { 
  project: Project, 
  user: User | null,
  initialChatPrompt?: string, 
  onClearInitialChatPrompt ?: () => void,
  onClose: () => void
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
      
      const systemInstruction = `Sen bir Kıdemli Web Geliştiricisisin. Görevin: Kullanıcının isteğine göre web sitesini veya oyunu güncellemek.
      
      KESİN KURALLAR:
      1. ASLA SORU SORMA.
      2. TÜM KODU YENİDEN YAZ: Kullanıcının istediği değişikliği yap ve tüm HTML/CSS/JS kodunu eksiksiz döndür.
      3. YANIT FORMATI (ZORUNLU):
         - Yanıtın SADECE şu iki bölümden oluşmalı:
         - <message>Yaptığın değişikliği anlatan 1 cümlelik mesaj</message>
         - <kodu_baslat>GÜNCELLENMİŞ TÜM HTML/CSS/JS KODU</kodu_bitir>
      4. BAŞKA HİÇBİR AÇIKLAMA VEYA METİN EKLEME.`;
      
      lastMsg.parts[0].text = `Mevcut HTML Kodu:\n\`\`\`html\n${currentCode}\n\`\`\`\n\nKullanıcı Mesajı: ${currentInput}`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: contents,
          systemInstruction: systemInstruction,
          model: "gemini-3-flash-preview",
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

  const handleExportZip = async () => {
    if (!project.code) return;
    
    const zip = new JSZip();
    
    // Add index.html
    zip.file("index.html", project.code);
    
    // Generate ZIP file
    const content = await zip.generateAsync({ type: "blob" });
    
    // Trigger download
    const safeTitle = (project.title || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    saveAs(content, `${safeTitle}.zip`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed inset-0 bg-zinc-50 z-[100] flex flex-col overflow-hidden ${isFullscreen ? 'p-0' : 'p-0 md:p-4 lg:p-6'}`}
    >
      <div className={`flex items-center justify-between bg-white border-b border-zinc-200 px-4 py-3 md:px-6 md:py-4 shrink-0 ${isFullscreen ? '' : 'md:rounded-t-3xl md:border-x md:border-t shadow-sm'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-zinc-100 rounded-xl transition-colors md:hidden">
            <ChevronLeft className="w-6 h-6 text-zinc-500" />
          </button>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                autoFocus
                className="text-lg md:text-xl font-bold text-zinc-800 border-b-2 border-indigo-500 outline-none bg-transparent w-full max-w-[150px] md:max-w-none"
              />
              <Check className="w-5 h-5 text-emerald-500 cursor-pointer" onClick={handleSaveTitle} />
            </div>
          ) : (
            <div className={`flex items-center gap-2 overflow-hidden ${(user?.isPremium || project.hasPaidForNameChange) ? 'group cursor-pointer' : ''}`} onClick={() => {
              if (user?.isPremium || project.hasPaidForNameChange) {
                setIsEditingTitle(true);
              } else {
                setShowSettings(true); // Open settings to show payment option
              }
            }}>
              <h2 className="text-base md:text-xl font-bold text-zinc-800 truncate">{title}</h2>
              {(user?.isPremium || project.hasPaidForNameChange) && (
                <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              )}
            </div>
          )}
          {project.isPublished && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] md:text-xs font-medium rounded-full shrink-0">Yayınlandı</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDesignMode(!isDesignMode)}
            className={`p-2 md:px-3 md:py-2 text-sm font-medium rounded-xl transition-all shadow-sm ${isDesignMode ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}
            title="Tasarım Laboratuvarı"
          >
            <Wand2 className="w-4 h-4" />
            <span className="hidden lg:inline ml-2">Tasarım Laboratuvarı</span>
          </motion.button>
          
          <div className="hidden md:flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 md:px-3 md:py-2 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-200 transition-all shadow-sm"
              title={isFullscreen ? "Küçült" : "Tam Ekran"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden lg:inline ml-2">{isFullscreen ? "Küçült" : "Tam Ekran"}</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className="p-2 md:px-4 md:py-2 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-200 transition-all shadow-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline ml-2">Ayarlar</span>
            </motion.button>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportZip}
            className="p-2 md:px-4 md:py-2 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-200 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden lg:inline ml-2">İndir</span>
          </motion.button>

          <button onClick={onClose} className="hidden md:flex p-2 hover:bg-zinc-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
      </div>

      <div className={`flex-1 flex flex-col md:flex-row gap-0 md:gap-4 min-h-0 bg-white md:bg-transparent ${isFullscreen ? '' : 'md:border-x md:border-b md:rounded-b-3xl shadow-sm'}`}>
        {!project.isPublished && (
          <div className="hidden"> {/* Placeholder for published state if needed */}
          </div>
        )}
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

        <div className={`flex-[3] min-h-0 bg-white md:rounded-2xl border-x-0 md:border border-zinc-200 shadow-sm overflow-hidden flex flex-col relative ${activeTab === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              </div>
              <div className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest">Canlı Önizleme</div>
            </div>
            <div className="md:hidden flex bg-zinc-200/50 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('preview')} 
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500'}`}
              >
                Önizleme
              </button>
              <button 
                onClick={() => setActiveTab('chat')} 
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'chat' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500'}`}
              >
                Chat
              </button>
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

        <div className={`flex-1 bg-white md:rounded-2xl border-x-0 md:border border-zinc-200 shadow-sm flex flex-col overflow-hidden max-w-none md:max-w-md ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3 md:p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-800 text-xs md:text-sm">İdea Ai 1.0</h3>
                <p className="text-[10px] text-zinc-500">Projeyi güncellemek için yazın.</p>
              </div>
            </div>
            <div className="md:hidden flex bg-zinc-200/50 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('preview')} 
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500'}`}
              >
                Önizleme
              </button>
              <button 
                onClick={() => setActiveTab('chat')} 
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'chat' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500'}`}
              >
                Chat
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/30 scrollbar-hide">
            {chatMessages.length === 0 && !isChatLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" />
                </div>
                <p className="text-xs md:text-sm">Projeyi güncellemek için bana ne yapmak istediğinizi söyleyin.</p>
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

          <div className="p-3 md:p-4 border-t border-zinc-100 bg-white shrink-0">
            {selectedFile && (
              <div className="mb-2 md:mb-3 flex items-center justify-between p-2 bg-indigo-50 border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-indigo-700 overflow-hidden">
                  {selectedFile.type.startsWith('image/') ? <ImageIcon size={12} /> : <FileText size={12} />}
                  <span className="text-[10px] md:text-xs font-medium truncate">{selectedFile.name}</span>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1 text-indigo-400 hover:text-indigo-600 rounded-full hover:bg-indigo-100"
                >
                  <X size={12} />
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
                  className="w-full max-h-24 md:max-h-32 min-h-[40px] md:min-h-[44px] p-2.5 md:p-3 pr-9 md:pr-10 text-xs md:text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                  disabled={isChatLoading}
                  rows={1}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-2 bottom-1.5 md:bottom-2 p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Dosya ekle"
                  disabled={isChatLoading}
                >
                  <Paperclip size={16} md:size={18} />
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
                className="p-2.5 md:p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20"
              >
                {isChatLoading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Send className="w-4 h-4 md:w-5 md:h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      {showSettings && <ProjectSettingsModal project={project} user={user} onClose={() => setShowSettings(false)} />}
    </motion.div>
  );
};
