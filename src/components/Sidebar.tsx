import { Project, User } from "../types";
import { Plus, LayoutTemplate, Clock, Home, Bot, Sparkles, FolderKanban, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";

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
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-zinc-200 flex flex-col h-screen shrink-0 text-zinc-600 transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 ${isCollapsed ? 'w-16' : 'w-72'}`}>
        <div className={`p-5 border-b border-zinc-100 flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between'}`}>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { onNewProject(); onClose(); }}
            className={`bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 group ${isCollapsed ? 'w-10 h-10 px-0' : 'flex-1 px-4'}`}
            title={t('newProject')}
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            {!isCollapsed && <span>{t('newProject')}</span>}
          </motion.button>
          {!isCollapsed && (
            <button onClick={onClose} className="md:hidden ml-4 text-zinc-400 hover:text-zinc-600 p-1">
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
              title={t('home')}
              className={`w-full text-left py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${isCollapsed ? 'justify-center px-0' : 'px-3'} ${
                currentProject === null 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <Home className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{t('home')}</span>}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onToggleAI(); onClose(); }}
              title={t('aiAssistant')}
              className={`w-full text-left py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <Bot className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{t('aiAssistant')}</span>}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onShowTemplates(); onClose(); }}
              title={t('templates')}
              className={`w-full text-left py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <LayoutTemplate className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{t('templates')}</span>}
            </motion.button>
          </div>

          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <FolderKanban className="w-4 h-4" />
                {t('projects')}
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center mb-2">
                <FolderKanban className="w-5 h-5 text-zinc-400" title={t('projects')} />
              </div>
            )}
            
            <div className="space-y-1">
              {projects.length === 0 ? (
                !isCollapsed && (
                  <div className="px-3 py-4 text-sm text-zinc-400 text-center bg-zinc-50 rounded-xl border border-zinc-100 border-dashed">
                    {t('noProjects')}
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
                        ? "bg-indigo-50 text-indigo-600" 
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <LayoutTemplate className={`w-4 h-4 shrink-0 ${currentProject?.id === project.id ? 'text-indigo-500' : 'text-zinc-400 group-hover:text-zinc-500'}`} />
                    {!isCollapsed && <span className="truncate">{project.title || project.idea.substring(0, 28) + "..."}</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Collapse Toggle Button */}
        <div className="p-3 border-t border-zinc-100 hidden md:flex justify-end">
          <button 
            onClick={onToggleCollapse}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
            title={isCollapsed ? t('expand') : t('collapse')}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>


        {user && !user.isPremium && !isCollapsed && (
          <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
            <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Sparkles className="w-12 h-12 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-zinc-900 mb-1 text-sm relative z-10">{t('upgrade')}</h3>
              <p className="text-xs text-zinc-500 mb-4 relative z-10">{t('upgradeDesc')}</p>
              <button 
                onClick={() => { window.dispatchEvent(new CustomEvent('show-premium-modal')); onClose(); }}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-semibold py-2 px-3 rounded-xl text-xs transition-colors relative z-10 shadow-sm"
              >
                {t('upgradeButton')}
              </button>
            </div>
          </div>
        )}
        {user && !user.isPremium && isCollapsed && (
          <div className="p-3 border-t border-zinc-100 flex justify-center">
             <button 
                onClick={() => { window.dispatchEvent(new CustomEvent('show-premium-modal')); onClose(); }}
                className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                title={t('upgrade')}
              >
                <Sparkles className="w-5 h-5" />
              </button>
          </div>
        )}
      </aside>
    </>
  );
}
