import { Project, User } from "../types";
import { Plus, LayoutTemplate, Clock, Home, Bot, Sparkles, FolderKanban, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export function Sidebar({ 
  projects, 
  currentProject, 
  onSelectProject, 
  onNewProject,
  user,
  onToggleAI,
  onShowTemplates,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse
}: { 
  projects: Project[], 
  currentProject: Project | null, 
  onSelectProject: (p: Project | null) => void,
  onNewProject: () => void,
  user: User | null,
  onToggleAI: () => void,
  onShowTemplates: () => void,
  isOpen: boolean,
  onClose: () => void,
  isCollapsed?: boolean,
  onToggleCollapse?: () => void
}) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-50 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen shrink-0 text-zinc-300 transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 ${isCollapsed ? 'w-16' : 'w-72'}`}>
        <div className={`p-5 border-b border-zinc-800/50 flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between'}`}>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { onNewProject(); onClose(); }}
            className={`bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 group ${isCollapsed ? 'w-10 h-10 px-0' : 'flex-1 px-4'}`}
            title="Yeni Proje"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            {!isCollapsed && <span>Yeni Proje</span>}
          </motion.button>
          {!isCollapsed && (
            <button onClick={onClose} className="md:hidden ml-4 text-zinc-400 hover:text-white p-1">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-6 overflow-x-hidden">
          <div className="space-y-1">
            <motion.button
              whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onSelectProject(null); onClose(); }}
              title="Ana Sayfa"
              className={`w-full text-left py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${isCollapsed ? 'justify-center px-0' : 'px-3'} ${
                currentProject === null 
                  ? "bg-zinc-800/80 text-white" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <Home className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>Ana Sayfa</span>}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onToggleAI(); onClose(); }}
              title="Yardımcı AI"
              className={`w-full text-left py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <Bot className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>Yardımcı AI</span>}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onShowTemplates(); onClose(); }}
              title="Şablonlar"
              className={`w-full text-left py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <LayoutTemplate className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>Şablonlar</span>}
            </motion.button>
          </div>

          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <FolderKanban className="w-4 h-4" />
                Projelerim
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center mb-2">
                <FolderKanban className="w-5 h-5 text-zinc-500" title="Projelerim" />
              </div>
            )}
            
            <div className="space-y-1">
              {projects.length === 0 ? (
                !isCollapsed && (
                  <div className="px-3 py-4 text-sm text-zinc-600 text-center bg-zinc-900/50 rounded-xl border border-zinc-800/50 border-dashed">
                    Henüz proje oluşturmadınız.
                  </div>
                )
              ) : (
                projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => { onSelectProject(project); onClose(); }}
                    title={project.title || project.idea}
                    className={`w-full text-left py-2.5 rounded-xl text-sm transition-colors flex items-center gap-3 group ${isCollapsed ? 'justify-center px-0' : 'px-3'} ${
                      currentProject?.id === project.id 
                        ? "bg-zinc-800/80 text-white" 
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    }`}
                  >
                    <LayoutTemplate className={`w-4 h-4 shrink-0 ${currentProject?.id === project.id ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                    {!isCollapsed && <span className="truncate">{project.title || project.idea.substring(0, 28) + "..."}</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Collapse Toggle Button */}
        <div className="p-3 border-t border-zinc-800/50 hidden md:flex justify-end">
          <button 
            onClick={onToggleCollapse}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
            title={isCollapsed ? "Genişlet" : "Daralt"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>


        {user && !user.isPremium && !isCollapsed && (
          <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/30">
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <Sparkles className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-1 text-sm relative z-10">Premium'a Geç</h3>
              <p className="text-xs text-zinc-400 mb-4 relative z-10">Sınırsız güncelleme ve yayınlama hakkı kazan.</p>
              <button 
                onClick={() => { window.dispatchEvent(new CustomEvent('show-premium-modal')); onClose(); }}
                className="w-full bg-white text-zinc-950 hover:bg-zinc-100 font-semibold py-2 px-3 rounded-xl text-xs transition-colors relative z-10 shadow-sm"
              >
                Yükselt (399 TL/ay)
              </button>
            </div>
          </div>
        )}
        {user && !user.isPremium && isCollapsed && (
          <div className="p-3 border-t border-zinc-800/50 flex justify-center">
             <button 
                onClick={() => { window.dispatchEvent(new CustomEvent('show-premium-modal')); onClose(); }}
                className="p-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded-lg transition-colors"
                title="Premium'a Geç"
              >
                <Sparkles className="w-5 h-5" />
              </button>
          </div>
        )}
      </aside>
    </>
  );
}
