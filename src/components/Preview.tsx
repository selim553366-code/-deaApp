import { useEffect, useState } from "react";
import { Loader2, Globe, Smartphone, Monitor } from "lucide-react";

const FACTS = [
  "Bunu biliyor muydun? İlk web sitesi 1991 yılında Tim Berners-Lee tarafından yayınlandı.",
  "Bunu biliyor muydun? Dünyada şu an 1.8 milyardan fazla web sitesi var.",
  "Bunu biliyor muydun? Kullanıcıların %75'i bir şirketin güvenilirliğini web sitesi tasarımına göre yargılıyor.",
  "Bunu biliyor muydun? İlk alan adı symbolics.com 1985 yılında kaydedildi.",
  "Yapay zeka sitenizi tasarlarken renk teorisini ve modern UI prensiplerini kullanıyor..."
];

export function Preview({ code, isGenerating, isPremium }: { code?: string, isGenerating: boolean, isPremium: boolean }) {
  const [factIndex, setFactIndex] = useState(0);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showConfirmPublish, setShowConfirmPublish] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setFactIndex((prev) => (prev + 1) % FACTS.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handlePublishClick = () => {
    if (isPremium) {
      setShowConfirmPublish(true);
    } else {
      setShowPublishModal(true);
    }
  };

  if (isGenerating) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-10">
        <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 border-2 border-indigo-500 rounded-2xl animate-ping opacity-20"></div>
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Siteniz Oluşturuluyor...</h3>
        <p className="text-zinc-400 text-sm max-w-md text-center animate-pulse">
          {FACTS[factIndex]}
        </p>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
        <Globe className="w-16 h-16 mb-4 opacity-20" />
        <p>Önizleme burada görünecek</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-zinc-100">
      <div className="h-12 bg-white border-b border-zinc-200 flex items-center px-4 gap-4 justify-between shadow-sm">
        <div className="flex gap-1.5 w-24">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
        </div>
        
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
          <button 
            onClick={() => setDeviceView('desktop')}
            className={`p-1.5 rounded-md transition-colors ${deviceView === 'desktop' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setDeviceView('mobile')}
            className={`p-1.5 rounded-md transition-colors ${deviceView === 'mobile' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="w-24 flex justify-end">
          <button 
            onClick={handlePublishClick}
            className="text-xs font-medium bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md transition-colors"
          >
            Yayınla
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className={`transition-all duration-300 ease-in-out bg-white shadow-2xl rounded-xl overflow-hidden max-w-5xl mx-auto ${deviceView === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'}`}>
          <iframe 
            srcDoc={code} 
            className="w-full h-full border-none"
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>

      {/* Premium Required Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden relative p-6 text-center">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Yayınlama Özelliği</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Web sitenizi dünyaya açmak için Premium aboneliğe ihtiyacınız var.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPublishModal(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
              >
                Kapat
              </button>
              <button 
                onClick={() => {
                  setShowPublishModal(false);
                  window.dispatchEvent(new CustomEvent('show-premium-modal'));
                }}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-xl transition-colors"
              >
                Premium'a Geç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {showConfirmPublish && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden relative p-6 text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sitenizi Yayınlayın</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Siteniz yayına hazır. Onayladığınızda siteniz canlıya alınacaktır.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmPublish(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={() => {
                  setShowConfirmPublish(false);
                  alert("Siteniz başarıyla yayınlandı!");
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-xl transition-colors"
              >
                Yayınla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
