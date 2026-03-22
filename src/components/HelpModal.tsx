import React, { useState } from 'react';

export const HelpModal = ({ onClose }: { onClose: () => void }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the message to a backend or email service.
    // For now, we'll just log it and close the modal.
    console.log('Message sent:', message);
    alert('Mesajınız gönderildi!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Yardım ve Destek</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-32 p-3 border rounded-xl mb-4"
            placeholder="Sorununuzu veya önerinizi buraya yazın..."
            required
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-100">
              İptal
            </button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              Gönder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
