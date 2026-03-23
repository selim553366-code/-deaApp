import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type PolicyType = 'privacy' | 'terms' | 'refund';

export const PolicyModal = ({ type, onClose }: { type: PolicyType, onClose: () => void }) => {
  const { t } = useLanguage();

  const getTitle = () => {
    if (type === 'privacy') return t('privacyPolicy');
    if (type === 'terms') return t('termsOfService');
    return t('refundPolicy');
  };

  const getContent = () => {
    if (type === 'privacy') {
      return (
        <div className="space-y-4 text-zinc-600">
          <p><strong>Gizlilik Politikası</strong></p>
          <p>İdea Ai olarak gizliliğinize önem veriyoruz. Bu politika, hizmetlerimizi kullandığınızda verilerinizin nasıl toplandığını ve kullanıldığını açıklar.</p>
          <p>1. Toplanan Veriler: E-posta adresiniz, oluşturduğunuz projeler ve kullanım istatistikleriniz.</p>
          <p>2. Veri Kullanımı: Hizmetlerimizi iyileştirmek, size destek sağlamak ve yasal yükümlülüklerimizi yerine getirmek için kullanılır.</p>
          <p>3. Veri Güvenliği: Verileriniz güvenli sunucularda saklanır ve üçüncü taraflarla paylaşılmaz.</p>
        </div>
      );
    }
    if (type === 'terms') {
      return (
        <div className="space-y-4 text-zinc-600">
          <p><strong>Kullanım Koşulları</strong></p>
          <p>İdea Ai hizmetlerini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız:</p>
          <p>1. Hizmet Kullanımı: Hizmetlerimizi yasal amaçlar için kullanmalısınız.</p>
          <p>2. Hesap Güvenliği: Hesabınızın güvenliğinden siz sorumlusunuz.</p>
          <p>3. Fikri Mülkiyet: Oluşturduğunuz içeriklerin sorumluluğu size aittir.</p>
          <p>4. Değişiklikler: Koşulları dilediğimiz zaman güncelleme hakkımız saklıdır.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4 text-zinc-600">
        <p><strong>İade Politikası</strong></p>
        <p>Müşteri memnuniyeti bizim için önemlidir.</p>
        <p>1. İade Süreci: Satın alma işleminden sonraki 14 gün içinde, kredi kullanılmamışsa iade talebinde bulunabilirsiniz.</p>
        <p>2. İstisnalar: Kullanılmış krediler veya özel kampanya dönemlerinde yapılan alımlar iade kapsamı dışındadır.</p>
        <p>3. İletişim: İade talepleriniz için destek ekibimizle iletişime geçebilirsiniz.</p>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <h2 className="text-xl font-bold text-zinc-900">{getTitle()}</h2>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-8 max-h-[70vh] overflow-y-auto">
            {getContent()}
          </div>
          <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-800 transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
