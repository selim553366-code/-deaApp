import { useState, useEffect } from "react";
import { User, Project } from "../types";
import { db, auth } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, updateDoc } from "firebase/firestore";
import { Sidebar } from "./Sidebar";
import { Preview } from "./Preview";
import { PremiumModal } from "./PremiumModal";
import { AIChatPage } from "./AIChatPage";
import { Send, Sparkles, LogOut, Code, Loader2, Check, Eye, EyeOff } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { signOut } from "firebase/auth";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  const [showReviews, setShowReviews] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [showAI, setShowAI] = useState(false);
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
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Analyze this website idea: "${idea}". Ask 3 clarifying questions with 3-4 options each to make the website better.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["question", "options"],
            },
          },
        },
      });

      const questions = JSON.parse(response.text || "[]");
      setAnalysisQuestions(questions);
      setAnalysisAnswers(new Array(questions.length).fill(""));
      setOriginalIdea(idea);
    } catch (error) {
      console.error("Analysis failed:", error);
      handleGenerate(idea);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (idea: string, answers?: string[]) => {
    setIsGenerating(true);
    
    try {
      const prompt = currentProject 
        ? `Update this website based on the following request: "${idea}". 
           Current code:
           \`\`\`html
           ${currentProject.code}
           \`\`\`
           Return ONLY the complete, updated HTML file with Tailwind CSS via CDN. Ensure it has a full <html>, <head>, and <body> structure. No markdown formatting, no explanations.`
        : `Create a modern, beautiful, responsive single-page website using HTML and Tailwind CSS (via CDN) based on this idea: "${idea}". 
           ${answers ? `Additional context: ${answers.join(", ")}.` : ""}
           ${showReviews ? "Include a customer review section." : "Do NOT include any customer review section."}
           Include a nice UI, good typography, and placeholder images if needed. 
           Ensure it has a full <html>, <head>, and <body> structure.
           Return ONLY the raw HTML code. Do not wrap in markdown blocks like \`\`\`html.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      let code = response.text || "";
      if (code.startsWith("```html")) {
        code = code.replace(/^```html\n/, "").replace(/\n```$/, "");
      } else if (code.startsWith("```")) {
        code = code.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      if (currentProject && currentProject.id) {
        const projRef = doc(db, "projects", currentProject.id);
        await updateDoc(projRef, {
          code,
          updatedAt: new Date().toISOString()
        });
      } else {
        const newProjectRef = doc(collection(db, "projects"));
        const newId = newProjectRef.id;
        const newProject: Project = {
          id: newId,
          userId: user.uid,
          idea: idea + (answers ? ` (${answers.join(", ")})` : ""),
          code,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, "projects", newId), newProject);
        setCurrentProject(newProject);

        if (!user.isPremium) {
          await updateDoc(doc(db, "users", user.uid), {
            credits: user.credits - 10
          });
        }
      }
    } catch (error) {
      console.error("Generation failed:", error);
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

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <Sidebar 
        projects={projects} 
        currentProject={currentProject} 
        onSelectProject={setCurrentProject}
        onNewProject={() => { setCurrentProject(null); setShowAI(false); }}
        user={user}
        onToggleAI={() => setShowAI(!showAI)}
        onShowTemplates={() => {}} // Dummy function as it's not used in IdeaApp
        isOpen={true} // Dummy value
        onClose={() => {}} // Dummy function
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
              <span className="text-indigo-400">{user.isPremium ? '∞' : user.credits}</span>
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
    </div>
  );
}
