import React, { useState } from 'react';

interface Props {
  onNext: (prompt: string) => void;
}

export const AppCreationPrompt = ({ onNext }: Props) => {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">Ne oluşturmak istersin?</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-4 mb-4 border rounded-lg"
          placeholder="Uygulama fikrini buraya yaz..."
          rows={4}
        />
        <button
          onClick={() => onNext(prompt)}
          className="w-full p-3 text-white bg-black rounded-lg hover:bg-gray-800"
        >
          Devam Et
        </button>
      </div>
    </div>
  );
};
