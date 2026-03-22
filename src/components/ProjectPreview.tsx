import React, { useState, useRef, useEffect } from 'react';
import { Project, User } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, Globe, RefreshCw, Edit2, Check, Settings } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { ProjectSettingsModal } from './ProjectSettingsModal';

export const ProjectPreview = ({ project, user }: { project: Project, user: User | null }) => {
  const [title, setTitle] = useState(project.title || 'İsimsiz Proje');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [updatePrompt, setUpdatePrompt] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setTitle(project.title || 'İsimsiz Proje');
  }, [project.id, project.title]);

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

  const handleUpdate = async () => {
    if (!project.isPublished) {
      alert('Güncelleme yapabilmek için önce projenizi yayınlamalısınız. Yayınlamak Premium bir özelliktir.');
      if (!user?.isPremium) {
        window.dispatchEvent(new CustomEvent('show-premium-modal'));
      }
      return;
    }
    
    if (!updatePrompt.trim()) return;

    setIsUpdating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Mevcut HTML kodu:\n\`\`\`html\n${project.code}\n\`\`\`\n\nKullanıcının güncelleme isteği: "${updatePrompt}".\nBu isteğe göre HTML kodunu güncelle. Sadece güncellenmiş HTML kodunu döndür, markdown işaretleri kullanma.`
      });
      
      let newCode = response.text || '';
      newCode = newCode.replace(/```html/g, '').replace(/```/g, '').trim();

      await updateDoc(doc(db, 'projects', project.id), { 
        code: newCode,
        updatedAt: new Date().toISOString() 
      });
      setUpdatePrompt('');
    } catch (err) {
      console.error(err);
      alert('Güncelleme sırasında bir hata oluştu.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
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
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-200 transition-all shadow-sm"
          >
            <Settings className="w-4 h-4" />
            Ayarlar & Analiz
          </button>
          {!project.isPublished && (
            <button 
              onClick={handlePublish}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm"
            >
              <Globe className="w-4 h-4" />
              Yayınla
            </button>
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

        <div className="flex-1 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col gap-4">
          <h3 className="font-semibold text-zinc-800">Projeyi Güncelle</h3>
          <p className="text-sm text-zinc-500">Uygulamanızda değiştirmek veya eklemek istediğiniz özellikleri yazın.</p>
          
          <textarea
            value={updatePrompt}
            onChange={(e) => setUpdatePrompt(e.target.value)}
            placeholder="Örn: Arka plan rengini koyu yap ve bir iletişim formu ekle..."
            className="w-full flex-1 p-3 text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
          />
          
          <button
            onClick={handleUpdate}
            disabled={isUpdating || !updatePrompt.trim()}
            className="w-full py-3 flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50 font-medium text-sm"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isUpdating ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
          
          {!project.isPublished && (
            <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              Not: Güncelleme yapabilmek için önce projeyi yayınlamanız gerekmektedir (Premium).
            </div>
          )}
        </div>
      </div>
      {showSettings && <ProjectSettingsModal project={project} user={user} onClose={() => setShowSettings(false)} />}
    </div>
  );
};
