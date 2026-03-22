import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, db, signInWithPopup, googleProvider } from '../firebase';
import { collection, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import { Loader2 } from 'lucide-react';

interface Props {
  prompt: string;
  onProjectCreated?: (id: string) => void;
}

export const AuthForm = ({ prompt, onProjectCreated }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAuthSuccess = async (userCredential: any) => {
    if (prompt) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Sen uzman bir Frontend Geliştiricisi ve UI/UX Tasarımcısısın. Kullanıcının fikri: "${prompt}". Bu fikir için tek sayfalık, son derece modern, estetik, çok hızlı çalışan ve responsive (mobil uyumlu) bir HTML kodu oluştur. Tailwind CSS (CDN üzerinden) ve gerekiyorsa FontAwesome veya Lucide ikonları (CDN üzerinden) kullan. Sadece ve sadece çalışabilir HTML kodunu döndür, markdown işaretleri (\`\`\`html vb.) KULLANMA. Kod <html> ile başlayıp </html> ile bitmeli.`
      });
      
      let code = response.text || '<h1>Hata oluştu</h1>';
      code = code.replace(/```html/g, '').replace(/```/g, '').trim();

      const newProjectRef = doc(collection(db, 'projects'));
      const newProject = {
        id: newProjectRef.id,
        userId: userCredential.user.uid,
        title: prompt.substring(0, 30) + (prompt.length > 30 ? "..." : ""),
        idea: prompt,
        code,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(newProjectRef, newProject);
      if (onProjectCreated) {
        onProjectCreated(newProjectRef.id);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsGenerating(true);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      await handleAuthSuccess(userCredential);
    } catch (err: any) {
      setError(err.message);
      setIsGenerating(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGenerating(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await handleAuthSuccess(userCredential);
    } catch (err: any) {
      setError(err.message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">{isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}</h2>
        {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
        
        <button 
          onClick={handleGoogleLogin} 
          disabled={isGenerating} 
          className="w-full p-3 mb-6 text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-colors"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Google ile {isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
        </button>

        <div className="relative flex items-center py-2 mb-6">
          <div className="flex-grow border-t border-zinc-200"></div>
          <span className="flex-shrink-0 mx-4 text-zinc-400 text-sm">veya e-posta ile</span>
          <div className="flex-grow border-t border-zinc-200"></div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg"
            required
            disabled={isGenerating}
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 border rounded-lg"
            required
            disabled={isGenerating}
          />
          <button type="submit" disabled={isGenerating} className="w-full p-3 text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2">
            {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isGenerating ? 'Oluşturuluyor...' : (isSignUp ? 'Kayıt Ol' : 'Giriş Yap')}
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={isGenerating}
            className="w-full mt-4 text-sm text-gray-600 hover:underline disabled:opacity-50"
          >
            {isSignUp ? 'Zaten hesabınız var mı? Giriş yapın.' : 'Hesabınız yok mu? Kayıt olun.'}
          </button>
        </form>
      </div>
    </div>
  );
};
