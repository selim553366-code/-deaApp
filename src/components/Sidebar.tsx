import { Project, User } from "../types";
import { Plus, LayoutTemplate, Clock, Home } from "lucide-react";

export function Sidebar({ 
  projects, 
  currentProject, 
  onSelectProject, 
  onNewProject,
  user
}: { 
  projects: Project[], 
  currentProject: Project | null, 
  onSelectProject: (p: Project | null) => void,
  onNewProject: () => void,
  user: User | null
}) {
  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col min-h-screen shrink-0 z-10">
      <div className="p-4 border-b border-zinc-800">
        <button 
          onClick={onNewProject}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni Proje
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <button
          onClick={() => onSelectProject(null)}
          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 ${
            currentProject === null 
              ? "bg-zinc-800 text-white" 
              : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
          }`}
        >
          <Home className="w-4 h-4 shrink-0" />
          <span>Ana Sayfa</span>
        </button>

        <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-3 h-3" />
          Geçmiş Projeler
        </div>
        
        {projects.length === 0 ? (
          <div className="px-3 py-4 text-sm text-zinc-500 text-center">
            Henüz proje oluşturmadınız.
          </div>
        ) : (
          projects.map(project => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                currentProject?.id === project.id 
                  ? "bg-zinc-800 text-white" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <LayoutTemplate className="w-4 h-4 shrink-0" />
              <span className="truncate">{project.idea.substring(0, 30)}...</span>
            </button>
          ))
        )}
      </div>

      {user && !user.isPremium && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-1 text-sm">Premium'a Geç</h3>
            <p className="text-xs text-zinc-400 mb-3">Sınırsız güncelleme ve yayınlama hakkı kazan.</p>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('show-premium-modal'))}
              className="w-full bg-white text-zinc-950 hover:bg-zinc-100 font-medium py-1.5 px-3 rounded-lg text-xs transition-colors"
            >
              Yükselt (399 TL/ay)
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
