import { Project, User } from "../types";
import { Plus, LayoutTemplate, Clock, Home, Bot, Sparkles, FolderKanban } from "lucide-react";

export function Sidebar({ 
  projects, 
  currentProject, 
  onSelectProject, 
  onNewProject,
  user,
  onToggleAI
}: { 
  projects: Project[], 
  currentProject: Project | null, 
  onSelectProject: (p: Project | null) => void,
  onNewProject: () => void,
  user: User | null,
  onToggleAI: () => void
}) {
  return (
    <aside className="w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col min-h-screen shrink-0 z-20 text-zinc-300">
      <div className="p-5 border-b border-zinc-800/50">
        <button 
          onClick={onNewProject}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Yeni Proje
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        <div className="space-y-1">
          <button
            onClick={() => onSelectProject(null)}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${
              currentProject === null 
                ? "bg-zinc-800/80 text-white" 
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Ana Sayfa</span>
          </button>

          <button
            onClick={onToggleAI}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
          >
            <Bot className="w-5 h-5 shrink-0" />
            <span>Yardımcı AI</span>
          </button>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <FolderKanban className="w-4 h-4" />
            Projelerim
          </div>
          
          <div className="space-y-1">
            {projects.length === 0 ? (
              <div className="px-3 py-4 text-sm text-zinc-600 text-center bg-zinc-900/50 rounded-xl border border-zinc-800/50 border-dashed">
                Henüz proje oluşturmadınız.
              </div>
            ) : (
              projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-3 group ${
                    currentProject?.id === project.id 
                      ? "bg-zinc-800/80 text-white" 
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  }`}
                >
                  <LayoutTemplate className={`w-4 h-4 shrink-0 ${currentProject?.id === project.id ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                  <span className="truncate">{project.idea.substring(0, 28)}...</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {user && !user.isPremium && (
        <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/30">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <Sparkles className="w-12 h-12 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-white mb-1 text-sm relative z-10">Premium'a Geç</h3>
            <p className="text-xs text-zinc-400 mb-4 relative z-10">Sınırsız güncelleme ve yayınlama hakkı kazan.</p>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('show-premium-modal'))}
              className="w-full bg-white text-zinc-950 hover:bg-zinc-100 font-semibold py-2 px-3 rounded-xl text-xs transition-colors relative z-10 shadow-sm"
            >
              Yükselt (399 TL/ay)
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
