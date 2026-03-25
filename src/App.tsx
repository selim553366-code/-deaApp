import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, updateDoc, onSnapshot, collection, query, where, deleteDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User, Project } from "./types";
import { motion } from "motion/react";
import { Loader2, Sparkles } from "lucide-react";
import { AuthForm } from "./components/AuthForm";
import { Header } from "./components/Header";
import { IdeaInput } from "./components/IdeaInput";
import { AIHelper } from "./components/AIHelper";
import { AppCreationPrompt } from "./components/AppCreationPrompt";
import { Sidebar } from "./components/Sidebar";
import { PremiumModal } from "./components/PremiumModal";
import { HelpModal } from "./components/HelpModal";
import { AIHelperModal } from "./components/AIHelperModal";
import { ProjectPreview } from "./components/ProjectPreview";
import { TemplatesView } from "./components/TemplatesView";
import { PolicyModal } from "./components/PolicyModal";
import { useLanguage } from "./contexts/LanguageContext";

import { Routes, Route } from "react-router-dom";
import { PublishedSite } from "./pages/PublishedSite";

function Builder() {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showPremium, setShowPremium] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templatePromptToApply, setTemplatePromptToApply] = useState('');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'terms' | 'refund' | null>(null);
  const pendingProjectIdRef = useRef<string | null>(null);

  const deleteProject = async (projectId: string) => {
    if (confirm("Bu projeyi silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, "projects", projectId));
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
    }
  };

  useEffect(() => {
    const handleShowPremium = () => setShowPremium(true);
    window.addEventListener('show-premium-modal', handleShowPremium);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        
        // Listen to user data changes
        const unsubUser = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            
            // Auto-grant premium to the creator account
            const isCreatorEmail = userData.email === "selim@gmail.com" || userData.email === "selim553366@gmail.com" || userData.email === "tamtamyilyil@gmail.com";
            const isCreatorName = userData.name?.toLowerCase() === "selim" || userData.name?.toLowerCase() === "adadda";
            
            if ((isCreatorEmail || isCreatorName) && !userData.isPremium) {
              await updateDoc(userRef, { 
                isPremium: true,
                updateCredits: 999999,
                siteCreationCredits: 999999
              });
              userData.isPremium = true;
              userData.updateCredits = 999999;
              userData.siteCreationCredits = 999999;
            } else if (!isCreatorEmail && !isCreatorName && userData.updateCredits === undefined) {
              // Migration for existing non-creator users
              await updateDoc(userRef, { 
                updateCredits: 500,
                siteCreationCredits: 50
              });
              userData.updateCredits = 500;
              userData.siteCreationCredits = 50;
            }
            
            setUser(userData);
          } else {
            // Create new user
            const isCreatorEmail = firebaseUser.email === "selim@gmail.com" || firebaseUser.email === "selim553366@gmail.com" || firebaseUser.email === "tamtamyilyil@gmail.com";
            const isCreatorName = firebaseUser.displayName?.toLowerCase() === "selim" || firebaseUser.displayName?.toLowerCase() === "adadda";
            const isCreator = isCreatorEmail || isCreatorName;
            
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              credits: 10,
              updateCredits: isCreator ? 999999 : 500,
              siteCreationCredits: isCreator ? 999999 : 50,
              isPremium: isCreator,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, newUser);
            setUser(newUser);
          }
          setLoading(false);
        });
        
        // Listen to user's projects
        const q = query(collection(db, "projects"), where("userId", "==", firebaseUser.uid));
        const unsubProjects = onSnapshot(q, (snapshot) => {
          const projs: Project[] = [];
          snapshot.forEach(doc => {
            projs.push({ id: doc.id, ...doc.data() } as Project);
          });
          projs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          setProjects(projs);
          
          // Update current project if it exists in the new data
          setCurrentProject(prev => {
            if (pendingProjectIdRef.current) {
              const pendingProj = projs.find(p => p.id === pendingProjectIdRef.current);
              if (pendingProj) {
                pendingProjectIdRef.current = null;
                return pendingProj;
              }
            }
            if (!prev) return null;
            const updated = projs.find(p => p.id === prev.id);
            return updated || prev;
          });
        });
        
        return () => {
          unsubUser();
          unsubProjects();
        };
      } else {
        setUser(null);
        setProjects([]);
        setCurrentProject(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener('show-premium-modal', handleShowPremium);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {showPremium && <PremiumModal user={user} onClose={() => setShowPremium(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showAI && <AIHelperModal onClose={() => setShowAI(false)} user={user} />}
      {policyType && <PolicyModal type={policyType} onClose={() => setPolicyType(null)} />}
      <Sidebar 
        projects={projects} 
        currentProject={currentProject} 
        onSelectProject={(p) => { setCurrentProject(p); setShowTemplates(false); setIsSidebarOpen(false); }} 
        onNewProject={() => { setCurrentProject(null); setShowTemplates(false); setIsSidebarOpen(false); }} 
        onDeleteProject={deleteProject}
        user={user} 
        onToggleAI={() => { setShowAI(!showAI); setIsSidebarOpen(false); }}
        onShowTemplates={() => { setShowTemplates(true); setCurrentProject(null); setIsSidebarOpen(false); }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          user={user} 
          onLogin={() => setShowAuth(true)} 
          onSignup={() => setShowAuth(true)} 
          onHelp={() => setShowHelp(true)} 
          onPremium={() => setShowPremium(true)} 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onPolicy={(type) => setPolicyType(type)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {!user ? (
            !showAuth ? (
              <IdeaInput user={user} initialPrompt={prompt} onProjectCreated={(id) => {
                pendingProjectIdRef.current = id;
              }} />
            ) : (
              <AuthForm prompt={prompt} onProjectCreated={(id) => {
                pendingProjectIdRef.current = id;
              }} />
            )
          ) : showTemplates ? (
            <TemplatesView 
              projects={projects}
              onSelectForNewProject={(p) => {
                setPrompt(p);
                setShowTemplates(false);
                setCurrentProject(null);
              }}
              onSelectForExistingProject={(projectId, p) => {
                const proj = projects.find(proj => proj.id === projectId);
                if (proj) {
                  setCurrentProject(proj);
                  setTemplatePromptToApply(`Lütfen bu şablonu projeme entegre et:\n\n${p}`);
                  setShowTemplates(false);
                }
              }}
            />
          ) : (
            currentProject ? (
              <ProjectPreview 
                project={currentProject} 
                user={user} 
                initialChatPrompt={templatePromptToApply}
                onClearInitialChatPrompt={() => setTemplatePromptToApply('')}
              />
            ) : (
              <div className="max-w-3xl mx-auto py-6">
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative max-w-3xl mx-auto mt-8"
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-purple-500/10 blur-3xl rounded-[40px] -z-10" />
                  <div className="bg-background/90 backdrop-blur-xl border border-border shadow-2xl shadow-primary/10 rounded-[40px] p-4 md:p-6">
                    <IdeaInput user={user} initialPrompt={prompt} onProjectCreated={(id) => {
                      const newProj = projects.find(p => p.id === id);
                      if (newProj) setCurrentProject(newProj);
                    }} />
                  </div>
                </motion.div>

                {/* Quick Stats or Features could go here */}
                <div className="grid grid-cols-3 gap-8 pt-16 overflow-x-auto">
                  {[
                    { title: "Hızlı Kurulum", desc: "Saniyeler içinde projenizi başlatın." },
                    { title: "AI Destekli", desc: "En gelişmiş yapay zeka modelleriyle kodlama." },
                    { title: "Kolay Yayınlama", desc: "Tek tıkla sitenizi dünyaya açın." }
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="p-6 rounded-3xl bg-muted border border-border hover:border-primary transition-colors group"
                    >
                      <h4 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Builder />} />
      <Route path="/p/:projectId" element={<PublishedSite />} />
    </Routes>
  );
}
