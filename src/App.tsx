import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User, Project } from "./types";
import { Loader2 } from "lucide-react";
import { AuthForm } from "./components/AuthForm";
import { Header } from "./components/Header";
import { IdeaInput } from "./components/IdeaInput";
import { AIHelper } from "./components/AIHelper";
import { AppCreationPrompt } from "./components/AppCreationPrompt";
import { Sidebar } from "./components/Sidebar";
import { PremiumModal } from "./components/PremiumModal";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showPremium, setShowPremium] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    const handleShowPremium = () => setShowPremium(true);
    window.addEventListener('show-premium-modal', handleShowPremium);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        
        // Listen to user data changes
        const unsubUser = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser(userData as User);
          } else {
            // Create new user
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              credits: 10,
              isPremium: false,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, newUser);
            setUser(newUser);
          }
          setLoading(false);
        });
        
        return () => unsubUser();
      } else {
        setUser(null);
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
    <div className="flex min-h-screen bg-zinc-50">
      {showPremium && <PremiumModal user={user} onClose={() => setShowPremium(false)} />}
      <Sidebar 
        projects={projects} 
        currentProject={currentProject} 
        onSelectProject={setCurrentProject} 
        onNewProject={() => {}} 
        user={user} 
      />
      <div className="flex-1 overflow-y-auto">
        <Header user={user} onLogin={() => setShowAuth(true)} onSignup={() => setShowAuth(true)} />
        <main className="max-w-3xl mx-auto p-6">
          {!user ? (
            !showAuth ? (
              <AppCreationPrompt onNext={(p) => { setPrompt(p); setShowAuth(true); }} />
            ) : (
              <AuthForm prompt={prompt} />
            )
          ) : (
            currentProject ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">{currentProject.idea}</h2>
                <pre className="bg-zinc-900 text-white p-4 rounded-xl overflow-x-auto">
                  <code>{currentProject.code}</code>
                </pre>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">IdeaApp'e Hoş Geldiniz</h2>
                <p className="text-zinc-600">
                  IdeaApp, fikirlerinizi hızlıca prototiplere dönüştürmenize yardımcı olan bir platformdur.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-xl border border-zinc-200">
                    <h3 className="font-semibold mb-2">Fikirlerinizi Yönetin</h3>
                    <p className="text-sm text-zinc-500">Projelerinizi düzenleyin ve geliştirin.</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-zinc-200">
                    <h3 className="font-semibold mb-2">AI Destekli Geliştirme</h3>
                    <p className="text-sm text-zinc-500">AI asistanımızla kodunuzu yazın.</p>
                  </div>
                </div>
                <IdeaInput />
                <AIHelper />
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
