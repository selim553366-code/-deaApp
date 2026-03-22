import React from 'react';
import { auth, signOut } from '../firebase';
import { User } from '../types';
import { Sparkles, LogOut, HelpCircle, Globe } from 'lucide-react';

export const Header = ({ user, onLogin, onSignup, onHelp, onPremium }: { user: User | null, onLogin: () => void, onSignup: () => void, onHelp: () => void, onPremium?: () => void }) => {
  const handlePublish = () => {
    if (!user) {
      onLogin();
      return;
    }
    if (!user.isPremium) {
      window.dispatchEvent(new CustomEvent('show-premium-modal'));
    } else {
      alert('Uygulamanız başarıyla yayınlandı! (Premium Özelliği)');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          İdea Ai
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <button onClick={handlePublish} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all shadow-sm">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Yayınla</span>
          </button>
        )}
        {onPremium && (
          <button onClick={onPremium} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm">
            <Sparkles className="w-4 h-4" /> Premium
          </button>
        )}
        <button onClick={onHelp} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors">
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Yardım</span>
        </button>
        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-zinc-200">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-zinc-900">{user.email?.split('@')[0]}</span>
              <span className="text-xs text-zinc-500">{user.credits} Kredi</span>
            </div>
            <button onClick={() => signOut(auth)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Çıkış Yap">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-3 border-l border-zinc-200">
            <button onClick={onLogin} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Giriş Yap
            </button>
            <button onClick={onSignup} className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors shadow-sm">
              Kayıt Ol
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
