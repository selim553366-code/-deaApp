import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, updateDoc, onSnapshot, collection, query, where } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User, Project } from "./types";
import { Loader2, Layout, Zap, Code2 } from "lucide-react";
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

import { Routes, Route } from "react-router-dom";
import { PublishedSite } from "./pages/PublishedSite";

function Builder() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showPremium, setShowPremium] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pendingProjectIdRef = useRef<string | null>(null);

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
            const isCreatorEmail = userData.email === "selim@gmail.com" || userData.email === "selim553366@gmail.com";
            const isCreatorName = userData.name?.toLowerCase() === "selim" || userData.name?.toLowerCase() === "adadda";
            
            if ((isCreatorEmail || isCreatorName) && !userData.isPremium) {
              await updateDoc(userRef, { isPremium: true });
              userData.isPremium = true;
            }
            
            setUser(userData);
          } else {
            // Create new user
            const isCreatorEmail = firebaseUser.email === "selim@gmail.com" || firebaseUser.email === "selim553366@gmail.com";
            const isCreatorName = firebaseUser.displayName?.toLowerCase() === "selim" || firebaseUser.displayName?.toLowerCase() === "adadda";
            const isCreator = isCreatorEmail || isCreatorName;
            
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              credits: 10,
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
    <div className="flex min-h-screen bg-zinc-50 overflow-hidden">
      {showPremium && <PremiumModal user={user} onClose={() => setShowPremium(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showAI && <AIHelperModal onClose={() => setShowAI(false)} user={user} />}
      <Sidebar 
        projects={projects} 
        currentProject={currentProject} 
        onSelectProject={(p) => { setCurrentProject(p); setIsMobileMenuOpen(false); }} 
        onNewProject={() => { setCurrentProject(null); setIsMobileMenuOpen(false); }} 
        user={user} 
        onToggleAI={() => { setShowAI(!showAI); setIsMobileMenuOpen(false); }}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 overflow-y-auto w-full">
        <Header 
          user={user} 
          onLogin={() => setShowAuth(true)} 
          onSignup={() => setShowAuth(true)} 
          onHelp={() => setShowHelp(true)} 
          onPremium={() => setShowPremium(true)} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="w-full max-w-7xl mx-auto p-4 md:p-6">
          {!user ? (
            !showAuth ? (
              <AppCreationPrompt onNext={(p) => { setPrompt(p); setShowAuth(true); }} />
            ) : (
              <AuthForm prompt={prompt} onProjectCreated={(id) => {
                pendingProjectIdRef.current = id;
              }} />
            )
          ) : (
            currentProject ? (
              <ProjectPreview project={currentProject} user={user} />
            ) : (
              <div className="space-y-10 max-w-5xl mx-auto">
                <div className="text-center space-y-4 pt-8">
                  <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900">
                    İdea Ai'ye Hoş Geldiniz
                  </h2>
                  <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
                    Fikirlerinizi saniyeler içinde çalışan prototiplere dönüştürün. Yapay zeka destekli geliştirme asistanınızla hemen üretmeye başlayın.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                      <Layout className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-zinc-900">Fikirlerinizi Yönetin</h3>
                    <p className="text-zinc-500 leading-relaxed">Projelerinizi tek bir merkezden düzenleyin, geliştirin ve takip edin.</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-zinc-900">Hızlı Prototipleme</h3>
                    <p className="text-zinc-500 leading-relaxed">Düşüncelerinizi anında görselleştirin ve çalışan uygulamalara çevirin.</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-zinc-900">AI Destekli Kodlama</h3>
                    <p className="text-zinc-500 leading-relaxed">Gelişmiş yapay zeka asistanımızla kod yazma sürecini otomatikleştirin.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100">
                  <IdeaInput user={user} onProjectCreated={(id) => {
                    const newProj = projects.find(p => p.id === id);
                    if (newProj) setCurrentProject(newProj);
                  }} />
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
