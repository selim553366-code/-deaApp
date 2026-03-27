import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Project } from '../types';

interface PublishModalProps {
  project: Project;
  onClose: () => void;
  onPublish: (title: string, publishToWeb: boolean) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ project, onClose, onPublish }) => {
  const [title, setTitle] = useState(project.title || '');
  const [publishToWeb, setPublishToWeb] = useState(project.isPublished);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md border border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Projeyi Yayınla</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X /></button>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Proje Başlığı"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 mb-4 text-white"
        />
        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2 text-zinc-300">
            <input type="checkbox" checked={publishToWeb} onChange={(e) => setPublishToWeb(e.target.checked)} />
            Web sitesi olarak yayınla
          </label>
        </div>
        <button
          onClick={() => onPublish(title, publishToWeb)}
          className="w-full bg-indigo-600 text-white rounded-lg p-2 hover:bg-indigo-700"
        >
          Yayınla
        </button>
      </div>
    </div>
  );
};
