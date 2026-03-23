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
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[2px] transition-all duration-300" 
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-50 bg-background border-r border-border flex flex-col h-screen shrink-0 text-muted-foreground transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 shadow-2xl shadow-primary/10' : '-translate-x-full'} ${isCollapsed ? 'w-16' : 'w-72'}`}>
        <div className={`p-5 border-b border-border flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between'}`}>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { onNewProject(); onClose(); }}
            className={`bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 group ${isCollapsed ? 'w-10 h-10 px-0' : 'flex-1 px-4'}`}
            title={t('newProject')}
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            {!isCollapsed && <span>{t('newProject')}</span>}
          </motion.button>
          {!isCollapsed && (
            <button onClick={onClose} className="ml-4 text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-lg transition-colors">
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
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
              className={`w-full text-left py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 text-muted-foreground hover:bg-muted hover:text-foreground ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <Bot className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{t('aiAssistant')}</span>}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onShowTemplates(); onClose(); }}
              title={t('templates')}
              className={`w-full text-left py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 text-muted-foreground hover:bg-muted hover:text-foreground ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <LayoutTemplate className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{t('templates')}</span>}
            </motion.button>
          </div>

          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FolderKanban className="w-4 h-4" />
                {t('projects')}
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center mb-2">
                <FolderKanban className="w-5 h-5 text-muted-foreground" title={t('projects')} />
              </div>
            )}
            
            <div className="space-y-1">
              {projects.length === 0 ? (
                !isCollapsed && (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center bg-muted rounded-xl border border-border border-dashed">
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
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <LayoutTemplate className={`w-4 h-4 shrink-0 ${currentProject?.id === project.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    {!isCollapsed && <span className="truncate">{project.title || project.idea.substring(0, 28) + "..."}</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Collapse Toggle Button */}
        <div className="p-3 border-t border-border hidden md:flex justify-end">
          <button 
            onClick={onToggleCollapse}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title={isCollapsed ? t('expand') : t('collapse')}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>


        {user && !user.isPremium && !isCollapsed && (
          <div className="p-4 border-t border-border bg-muted/50">
            <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-sm relative z-10">{t('upgrade')}</h3>
              <p className="text-xs text-muted-foreground mb-4 relative z-10">{t('upgradeDesc')}</p>
              <button 
                onClick={() => { window.dispatchEvent(new CustomEvent('show-premium-modal')); onClose(); }}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2 px-3 rounded-xl text-xs transition-colors relative z-10 shadow-sm"
              >
                {t('upgradeButton')}
              </button>
            </div>
          </div>
        )}
        {user && !user.isPremium && isCollapsed && (
          <div className="p-3 border-t border-border flex justify-center">
             <button 
                onClick={() => { window.dispatchEvent(new CustomEvent('show-premium-modal')); onClose(); }}
                className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
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
