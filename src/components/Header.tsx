import React from 'react';
import { auth, signOut } from '../firebase';
import { User } from '../types';

export const Header = ({ user, onLogin, onSignup }: { user: User | null, onLogin: () => void, onSignup: () => void }) => {
  const handleHelp = () => {
    window.location.href = 'mailto:selim553366@gmail.com?subject=Sorun Bildir veya Şikayet';
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-white">
      <h1 className="text-xl font-bold">IdeaApp</h1>
      <div className="flex gap-4">
        <button onClick={handleHelp} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-100">
          Yardım
        </button>
        {user ? (
          <button onClick={() => signOut(auth)} className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600">
            Çıkış Yap
          </button>
        ) : (
          <>
            <button onClick={onLogin} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-100">
              Giriş Yap
            </button>
            <button onClick={onSignup} className="px-4 py-2 text-sm text-white bg-black rounded-lg hover:bg-gray-800">
              Kayıt Ol
            </button>
          </>
        )}
      </div>
    </header>
  );
};
