import React from 'react';
import { auth, signOut } from '../firebase';
import { User } from '../types';
import { Sparkles, LogOut, HelpCircle, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export const Header = ({ user, onLogin, onSignup, onHelp, onPremium, onMenuClick }: { user: User | null, onLogin: () => void, onSignup: () => void, onHelp: () => void, onPremium?: () => void, onMenuClick: () => void }) => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'tr', flag: 'https://flagcdn.com/w40/tr.png', label: 'TR' },
    { code: 'en-us', flag: 'https://flagcdn.com/w40/us.png', label: 'US' },
    { code: 'en-uk', flag: 'https://flagcdn.com/w40/gb.png', label: 'UK' }
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-4 bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden p-1 -ml-1 text-zinc-600 hover:text-zinc-900">
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden sm:flex w-8 h-8 bg-indigo-600 rounded-xl items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          İdea Ai
        </h1>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex items-center gap-1.5 mr-1 md:mr-2">
          {languages.map((lang) => (
            <motion.button
              key={lang.code}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setLanguage(lang.code as any)}
              className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                language === lang.code ? 'border-indigo-500 scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              title={lang.label}
            >
              <img src={lang.flag} alt={lang.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.button>
          ))}
        </div>

        {onPremium && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPremium} 
            className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> <span className="hidden sm:inline">{t('premium')}</span>
          </motion.button>
        )}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onHelp} 
          className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">{t('help')}</span>
        </motion.button>
        {user ? (
          <div className="flex items-center gap-3 pl-2 md:pl-3 border-l border-zinc-200">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-zinc-900">{user.email?.split('@')[0]}</span>
              <span className="text-xs text-zinc-500">{user.isPremium ? '∞' : user.credits} {t('credits')}</span>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => signOut(auth)} 
              className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" 
              title={t('logout')}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-zinc-200">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogin} 
              className="px-3 md:px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              {t('login')}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignup} 
              className="px-3 md:px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
            >
              {t('signup')}
            </motion.button>
          </div>
        )}
      </div>
    </header>
  );
};
