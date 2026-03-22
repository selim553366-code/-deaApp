import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const IdeaInput = () => {
  const [idea, setIdea] = useState('');

  const handleSave = async () => {
    if (!idea.trim()) return;
    try {
      await addDoc(collection(db, 'ideas'), {
        idea,
        userId: auth.currentUser?.uid,
        createdAt: new Date(),
      });
      setIdea('');
      alert('Fikriniz kaydedildi!');
    } catch (err) {
      console.error(err);
      alert('Bir hata oluştu.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="mb-4 text-xl font-bold">Fikrini Yaz</h2>
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        className="w-full p-4 mb-4 border rounded-lg"
        placeholder="Fikrini buraya yaz..."
        rows={4}
      />
      <button onClick={handleSave} className="w-full p-3 text-white bg-black rounded-lg hover:bg-gray-800">
        Kaydet
      </button>
    </div>
  );
};
