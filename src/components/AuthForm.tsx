import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface Props {
  prompt: string;
}

export const AuthForm = ({ prompt }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      // Save the prompt after login/signup
      if (prompt) {
        await addDoc(collection(db, 'ideas'), {
          idea: prompt,
          userId: userCredential.user.uid,
          createdAt: new Date(),
        });
      }
    } catch (err: any) {
      setError(err.message);
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
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border rounded-lg"
          required
        />
        <button type="submit" className="w-full p-3 text-white bg-black rounded-lg hover:bg-gray-800">
          {isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
        </button>
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-4 text-sm text-gray-600 hover:underline"
        >
          {isSignUp ? 'Zaten hesabınız var mı? Giriş yapın.' : 'Hesabınız yok mu? Kayıt olun.'}
        </button>
      </form>
    </div>
  );
};
