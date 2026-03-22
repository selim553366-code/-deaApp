import { useState } from "react";
import { User } from "../types";
import { X, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function PremiumModal({ user, onClose }: { user: User, onClose: () => void }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    window.location.href = "https://ideaapp.lemonsqueezy.com/checkout/buy/5586ebec-86da-48d0-bd8a-92ef7da8bb05";
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{t('upgradeToPremium')}</h2>
          <p className="text-zinc-400 mb-8">{t('premiumDesc')}</p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <span className="text-zinc-300">{t('featureUnlimitedSites')}</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <span className="text-zinc-300">{t('featureUnlimitedUpdates')}</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <span className="text-zinc-300">{t('featurePublishing')}</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <span className="text-zinc-300">{t('featurePrioritySupport')}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-indigo-500/20"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : t('premiumPrice')}
          </button>
          
          <p className="text-center text-zinc-500 text-xs mt-4">
            {t('cancelAnytime')}
          </p>
        </div>
      </div>
    </div>
  );
}
