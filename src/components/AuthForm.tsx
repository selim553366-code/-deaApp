import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, db } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
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
      
      // Save the prompt after login/signup
      if (prompt) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Kullanıcının fikri: "${prompt}". Bu fikir için tek sayfalık, modern, Tailwind CSS kullanan, işlevsel bir HTML kodu oluştur. Sadece HTML kodunu döndür, markdown işaretleri kullanma.`
        });
        
        let code = response.text || '<h1>Hata oluştu</h1>';
        code = code.replace(/```html/g, '').replace(/```/g, '').trim();

        const newProject = {
          userId: userCredential.user.uid,
          title: prompt.substring(0, 30) + (prompt.length > 30 ? "..." : ""),
          idea: prompt,
          code,
          isPublished: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, 'projects'), newProject);
        if (onProjectCreated) {
          onProjectCreated(docRef.id);
        }
      }
    } catch (err: any) {
      setError(err.message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-8 bg-white rounded-xl shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">{isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}</h2>
        {error && <p className="mb-4 text-red-500">{error}</p>}
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
  );
};
