import { useState, useEffect } from "react";
import { User, Project } from "../types";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDoc, DocumentSnapshot, QuerySnapshot } from "firebase/firestore";
import { Sidebar } from "./Sidebar";
import { Preview } from "./Preview";
import { PremiumModal } from "./PremiumModal";
import { PublishModal } from "./PublishModal";
import { AIChatPage } from "./AIChatPage";
import { Send, Sparkles, LogOut, Code, Loader2, Check, Eye, EyeOff } from "lucide-react";
import { signOut } from "firebase/auth";

function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

interface AnalysisQuestion {
  question: string;
  options: string[];
}

export function IdeaApp({ user }: { user: User }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const handlePublish = async (title: string, publishToWeb: boolean) => {
    if (!currentProject) return;
    try {
      await updateDoc(doc(db, 'projects', currentProject.id), {
        title,
        isPublished: publishToWeb
      });
      setShowPublishModal(false);
      alert("Proje yayınlandı!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${currentProject.id}`);
    }
  };
  const [showReviews, setShowReviews] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [analysisQuestions, setAnalysisQuestions] = useState<AnalysisQuestion[] | null>(null);
  const [analysisAnswers, setAnalysisAnswers] = useState<string[]>([]);
  const [originalIdea, setOriginalIdea] = useState("");

  useEffect(() => {
    const handleShowPremium = () => setShowPremiumModal(true);
    window.addEventListener('show-premium-modal', handleShowPremium);
    return () => window.removeEventListener('show-premium-modal', handleShowPremium);
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "projects"),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projs);
      if (projs.length > 0 && !currentProject) {
        setCurrentProject(projs[0]);
      }
    });

    return () => unsubscribe();
  }, [user.uid]);

  const analyzePrompt = async (idea: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-3-flash-preview",
          contents: `Analyze this website idea: "${idea}". Ask 3 clarifying questions with 3-4 options each to make the website better. Return ONLY JSON in this format: [{"question": "...", "options": ["...", "..."]}].`,
          config: {
            response_format: { type: "json_object" },
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

      let jsonText = data.text || "[]";
      jsonText = jsonText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const questions = JSON.parse(jsonText);
      setAnalysisQuestions(questions);
      setAnalysisAnswers(new Array(questions.length).fill(""));
      setOriginalIdea(idea);
    } catch (error) {
      console.error("Analysis failed:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      handleGenerate(idea);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (idea: string, answers?: string[]) => {
    setIsGenerating(true);
    
    try {
      const prompt = currentProject 
        ? `Update this website based on: "${idea}". Current code: ${currentProject.code}. Return ONLY the complete, updated HTML file. No markdown formatting.`
        : `Create a modern, responsive single-page website or game about: "${idea}". ${answers ? `Additional context: ${answers.join(", ")}.` : ""} If the user asks for a 3D or FPS game, use Three.js or Babylon.js via CDN to create a working 3D environment with WASD and mouse controls. Return ONLY the raw HTML code. Do not wrap in markdown blocks.`;

      const cacheKey = hashCode(prompt);
      const cacheRef = doc(db, "cache", cacheKey);
      const cacheSnap = (await getDoc(cacheRef).catch(err => handleFirestoreError(err, OperationType.GET, `cache/${cacheKey}`))) as DocumentSnapshot;

      let code = "";

      if (cacheSnap.exists()) {
        code = cacheSnap.data().code;
      } else {
        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-3-flash-preview",
            systemInstruction: "Sen bir Kıdemli Web Geliştiricisisin. Görevin: Kullanıcının isteğine göre modern, şık ve tamamen işlevsel bir web sitesi veya oyun oluşturmak. SADECE ham HTML/CSS/JS kodunu döndür. Markdown blokları (```html gibi) kullanma. Başka hiçbir açıklama veya metin ekleme.",
            contents: prompt,
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
        
        code = data.text || "";
        // Robust cleaning: remove markdown blocks if they exist
        code = code.replace(/```html/g, '').replace(/```/g, '').trim();
        
        await setDoc(cacheRef, { code, createdAt: new Date().toISOString() }).catch(err => handleFirestoreError(err, OperationType.CREATE, `cache/${cacheKey}`));
      }

      if (currentProject && currentProject.id) {
        const projRef = doc(db, "projects", currentProject.id);
        await updateDoc(projRef, {
          code,
          updatedAt: new Date().toISOString()
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `projects/${currentProject.id}`));
      } else {
        const newProjectRef = doc(collection(db, "projects"));
        const newId = newProjectRef.id;
        const newProject: Project = {
          id: newId,
          userId: user.uid,
          title: "Yeni Proje",
          idea: idea + (answers ? ` (${answers.join(", ")})` : ""),
          code,
          isPublished: false,
          isPublic: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, "projects", newId), newProject).catch(err => handleFirestoreError(err, OperationType.CREATE, `projects/${newId}`));
        setCurrentProject(newProject);

        if (!user.isPremium) {
          await updateDoc(doc(db, "users", user.uid), {
            credits: user.credits - 10
          }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
        }
      }
    } catch (error) {
      console.error("Generation failed:", error);
      let errorMessage = "Üzgünüm, site oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.";
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
      setAnalysisQuestions(null);
    }
  };

  const startGeneration = () => {
    if (!input.trim()) return;

    if (!user.isPremium && user.credits < 10 && !currentProject) {
      setShowPremiumModal(true);
      return;
    }

    if (!user.isPremium && currentProject) {
      setShowPremiumModal(true);
      return;
    }

    if (currentProject) {
      handleGenerate(input);
      setInput("");
    } else {
      analyzePrompt(input);
      setInput("");
    }
  };

  const deleteProject = async (projectId: string) => {
    if (confirm("Bu projeyi silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, "projects", projectId)).catch(err => handleFirestoreError(err, OperationType.DELETE, `projects/${projectId}`));
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <Sidebar 
        projects={projects} 
        currentProject={currentProject} 
        onSelectProject={(p) => { setCurrentProject(p); setShowTemplates(false); }}
        onNewProject={() => { setCurrentProject(null); setShowAI(false); setShowTemplates(false); }}
        onDeleteProject={deleteProject}
        user={user}
        onToggleAI={() => setShowAI(!showAI)}
        onShowTemplates={() => setShowTemplates(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      {showAI && (
        <div className="flex-1 overflow-y-auto bg-zinc-50 z-20">
          <AIChatPage onOpenPremium={() => setShowPremiumModal(true)} />
        </div>
      )}
      
      <main className="flex-1 flex flex-col relative">
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold tracking-tight">İdea Ai</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowPremiumModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Premium
            </button>
            <button 
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
              title={isPreviewOpen ? "Önizlemeyi Kapat" : "Önizlemeyi Aç"}
            >
              {isPreviewOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <div className="text-sm font-medium bg-zinc-800 px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="text-zinc-400">Krediler:</span>
              <span className="text-indigo-400">{user.isPremium ? '1500+' : user.credits}</span>
            </div>
            {user.isPremium && (
              <div className="text-sm font-medium bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-500/30">
                Premium Aktif
              </div>
            )}
            <button 
              onClick={() => signOut(auth)}
              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className={isPreviewOpen ? "w-[400px] flex flex-col border-r border-zinc-800 bg-zinc-900/30" : "flex-1 flex flex-col"}>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-end">
              {!currentProject && !analysisQuestions && (
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Fikirlerini Gerçeğe Dönüştür</h2>
                  <p className="text-zinc-400 text-sm">Ne tür bir web sitesi oluşturmak istiyorsun? Detaylıca anlat.</p>
                </div>
              )}
              {analysisQuestions && (
                <div className="bg-zinc-800/50 rounded-xl p-6 mb-4 border border-zinc-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Siteni İyileştirelim</h3>
                  {analysisQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="mb-6">
                      <p className="text-sm text-zinc-300 mb-3">{q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => {
                              const newAnswers = [...analysisAnswers];
                              newAnswers[qIdx] = opt;
                              setAnalysisAnswers(newAnswers);
                            }}
                            className={`w-full text-left text-sm p-3 rounded-lg border transition-colors ${
                              analysisAnswers[qIdx] === opt
                                ? "bg-indigo-500/20 border-indigo-500 text-white"
                                : "bg-zinc-950 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => handleGenerate(originalIdea, analysisAnswers)}
                    disabled={analysisAnswers.some(a => !a) || isGenerating}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-700 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Siteni Oluştur
                  </button>
                </div>
              )}
              {currentProject && !analysisQuestions && (
                <div className="bg-zinc-800/50 rounded-xl p-4 mb-4 border border-zinc-700/50">
                  <p className="text-sm text-zinc-300">{currentProject.idea}</p>
                </div>
              )}
            </div>
            
            {!analysisQuestions && (
              <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                <div className="flex items-center gap-2 mb-3 text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    id="showReviews"
                    checked={showReviews}
                    onChange={(e) => setShowReviews(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-950 text-indigo-500 focus:ring-indigo-500/50"
                  />
                  <label htmlFor="showReviews">Müşteri yorumlarını göster</label>
                </div>
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        startGeneration();
                      }
                    }}
                    placeholder={currentProject ? "Bu siteyi nasıl güncelleyelim?" : "Örn: Modern bir kahve dükkanı için websitesi..."}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                    rows={3}
                    disabled={isGenerating}
                  />
                  <button
                    onClick={startGeneration}
                    disabled={!input.trim() || isGenerating}
                    className="absolute right-2 bottom-2 p-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg transition-colors"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                {currentProject && (
                  <>
                    <button
                      onClick={async () => {
                        setIsGenerating(true);
                        try {
                          const response = await fetch("/api/ai/analyze", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ html: currentProject.code })
                          });
                          const data = await response.json();
                          if (!response.ok) throw new Error(data.error || 'Analysis failed');
                          alert(JSON.stringify(data.analysis, null, 2));
                        } catch (error: any) {
                          console.error("Analysis error:", error);
                          alert(error.message || "Analysis failed.");
                        } finally {
                          setIsGenerating(false);
                        }
                      }}
                      disabled={isGenerating}
                      className="mt-2 w-full p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-sm"
                    >
                      {isGenerating ? "Analiz ediliyor..." : "SEO ve Erişilebilirlik Analizi"}
                    </button>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setShowPublishModal(true)}
                        className="flex-1 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
                      >
                        Yayınla
                      </button>
                      <button
                        onClick={async () => {
                          setIsGenerating(true);
                          try {
                            const response = await fetch("/api/ai/generate", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                contents: `Remix this website idea: "${currentProject.idea}". Code: ${currentProject.code}. Make it better.`,
                              })
                            });
                            const data = await response.json();
                            if (!response.ok) throw new Error(data.error || 'Remix failed');
                            // Handle remix result
                            alert("Remix oluşturuldu!");
                          } catch (error: any) {
                            console.error("Remix error:", error);
                            alert(error.message || "Remix başarısız.");
                          } finally {
                            setIsGenerating(false);
                          }
                        }}
                        className="flex-1 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-sm"
                      >
                        Remix
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {isPreviewOpen && (
            <div className="flex-1 bg-zinc-950 relative">
              <Preview code={currentProject?.code} isGenerating={isGenerating} isPremium={user.isPremium} />
            </div>
          )}
        </div>
      </main>

      {showPremiumModal && (
        <PremiumModal 
          user={user} 
          onClose={() => setShowPremiumModal(false)} 
        />
      )}
      {showPublishModal && currentProject && (
        <PublishModal
          project={currentProject}
          onClose={() => setShowPublishModal(false)}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
}
