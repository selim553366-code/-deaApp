import React, { useState, useEffect } from 'react';
import { X, Globe, Eye, Lock, Unlock, Copy, Check, Trash2, Edit2 } from 'lucide-react';
import { Project, User } from '../types';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Props {
  project: Project;
  user: User | null;
  onClose: () => void;
}

export const ProjectSettingsModal = ({ project, user, onClose }: Props) => {
  const [isPublished, setIsPublished] = useState(project.isPublished || false);
  const [hasPaid, setHasPaid] = useState(project.hasPaidForNameChange || false);
  const [newName, setNewName] = useState(project.title || '');
  const [views, setViews] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const siteUrl = `${window.location.origin}/p/${project.id}`;

  useEffect(() => {
    async function fetchViews() {
      try {
        const viewsRef = collection(db, 'projects', project.id, 'pageViews');
        const snapshot = await getDocs(viewsRef);
        setViews(snapshot.size);
      } catch (err) {
        console.error("Görüntülenme sayısı alınamadı", err);
      }
    }
    fetchViews();
  }, [project.id]);

  const handleTogglePublish = async () => {
    setLoading(true);
    try {
      const newStatus = !isPublished;
      await updateDoc(doc(db, 'projects', project.id), {
        isPublished: newStatus,
        updatedAt: new Date().toISOString()
      });
      setIsPublished(newStatus);
    } catch (err) {
      console.error(err);
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">Proje Ayarları</h2>
            <p className="text-sm text-zinc-500 mt-1">{project.title || 'İsimsiz Proje'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          {/* Publishing Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500" />
              Yayın Durumu
            </h3>
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                  <span className="font-medium text-zinc-900">{isPublished ? 'Yayında' : 'Yayında Değil'}</span>
                </div>
                <p className="text-sm text-zinc-500">
                  {isPublished ? 'Siteniz şu anda herkes tarafından görüntülenebilir.' : 'Siteniz gizli ve sadece sizin tarafınızdan görülebilir.'}
                </p>
              </div>
              <button
                onClick={handleTogglePublish}
                disabled={loading}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 ${
                  isPublished 
                    ? 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300' 
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
              >
                {isPublished ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                {isPublished ? 'Yayından Kaldır' : 'Yayınla'}
              </button>
            </div>

            {isPublished && (
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between gap-4">
                <div className="truncate flex-1 font-mono text-sm text-indigo-900">
                  {siteUrl}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors"
                    title="Kopyala"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Siteye Git
                  </a>
                </div>
              </div>
            )}
          </section>

          {/* Change Name Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-500" />
              Proje İsmini Değiştir
            </h3>
            {(!hasPaid && !user?.isPremium) ? (
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center justify-between gap-4">
                <p className="text-sm text-amber-800">Proje ismini değiştirmek için 50.99 TL ödemeniz gerekmektedir. (Premium üyeler için ücretsizdir)</p>
                <a
                  href={import.meta.env.VITE_LEMON_SQUEEZY_NAME_CHANGE_CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 transition-colors"
                >
                  50.99 TL Öde
                </a>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-zinc-300 text-sm"
                />
                <button
                  onClick={async () => {
                    await updateDoc(doc(db, 'projects', project.id), { title: newName });
                    alert('İsim güncellendi!');
                  }}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium"
                >
                  Kaydet
                </button>
              </div>
            )}
          </section>

          {/* Analytics Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-500" />
              Analizler
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="text-sm text-zinc-500 mb-2">Toplam Görüntülenme</div>
                <div className="text-4xl font-bold text-zinc-900">{views}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm opacity-50">
                <div className="text-sm text-zinc-500 mb-2">Tekil Ziyaretçi</div>
                <div className="text-4xl font-bold text-zinc-900">Yakında</div>
              </div>
            </div>
          </section>

          {/* Secrets / Environment Variables */}
          <section className="space-y-4 opacity-50 pointer-events-none">
            <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Ortam Değişkenleri (Secrets)
            </h3>
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <p className="text-sm text-zinc-500 mb-4">API anahtarları ve gizli değişkenleri buradan yönetebilirsiniz. (Bu özellik yakında eklenecektir)</p>
              <div className="flex gap-2">
                <input type="text" placeholder="ANAHTAR_ADI" className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 text-sm" disabled />
                <input type="text" placeholder="Değer" className="flex-[2] px-3 py-2 rounded-lg border border-zinc-300 text-sm" disabled />
                <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium" disabled>Ekle</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
