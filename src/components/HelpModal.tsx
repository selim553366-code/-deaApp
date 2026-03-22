import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const HelpModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useLanguage();
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the message to a backend or email service.
    // For now, we'll just log it and close the modal.
    console.log('Message sent:', message);
    alert(t('messageSent'));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{t('helpAndSupport')}</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-32 p-3 border rounded-xl mb-4"
            placeholder={t('helpPlaceholder')}
            required
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-100">
              {t('cancel')}
            </button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              {t('send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
