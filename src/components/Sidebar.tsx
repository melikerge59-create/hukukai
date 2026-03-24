import { Scale, MessageSquare, BookOpen, Search, FileSearch, FileText, Calculator,
         Briefcase, FolderOpen, Clock, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export type DashboardPage =
  | 'ai-advisor'
  | 'law-guide'
  | 'jurisprudence'
  | 'contract-analysis'
  | 'documents'
  | 'calculators'
  | 'case-tracking'
  | 'files'
  | 'history'
  | 'settings';

interface SidebarProps {
  currentPage: DashboardPage;
  onNavigate: (page: DashboardPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_ITEMS: { page: DashboardPage; icon: React.ElementType; label: string }[] = [
  { page: 'ai-advisor',        icon: MessageSquare, label: 'AI Danışman' },
  { page: 'law-guide',         icon: BookOpen,      label: 'Kanun Rehberi' },
  { page: 'jurisprudence',     icon: Search,        label: 'İçtihat Arama' },
  { page: 'contract-analysis', icon: FileSearch,    label: 'Sözleşme Analizi' },
  { page: 'documents',         icon: FileText,      label: 'Belge & Dilekçe' },
  { page: 'calculators',       icon: Calculator,    label: 'Hesaplayıcılar' },
  { page: 'case-tracking',     icon: Briefcase,     label: 'Dava Takibi' },
  { page: 'files',             icon: FolderOpen,    label: 'Belgeler' },
  { page: 'history',           icon: Clock,         label: 'Sohbet Geçmişi' },
];

export function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  const { user, userPlan, signOut } = useAuth();
  const initials = (user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Kullanıcı';
  const planLabel = (userPlan?.plan_type || 'free').toUpperCase();

  return (
    <aside
      className={`relative flex flex-col h-full bg-white dark:bg-surface-dcard
        border-r border-border-light dark:border-border-dark
        transition-all duration-300 shrink-0
        ${collapsed ? 'w-16' : 'w-60'}`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-border-light dark:border-border-dark
        ${collapsed ? 'justify-center' : 'space-x-3'}`}>
        <div className="p-1.5 bg-primary-DEFAULT rounded-lg shrink-0">
          <Scale size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-serif text-xl font-bold text-primary-DEFAULT dark:text-white">
            HukukAI
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        <div className={`space-y-0.5 ${collapsed ? 'px-1.5' : 'px-3'}`}>
          {NAV_ITEMS.map(({ page, icon: Icon, label }) => {
            const active = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-150
                  ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'}
                  ${active
                    ? 'sidebar-active text-primary-DEFAULT dark:text-primary-300'
                    : 'text-text-2 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-DEFAULT dark:hover:text-white border-l-[3px] border-l-transparent'
                  }`}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className={`my-3 border-t border-border-light dark:border-border-dark ${collapsed ? 'mx-2' : 'mx-4'}`} />

        {/* Settings */}
        <div className={collapsed ? 'px-1.5' : 'px-3'}>
          <button
            onClick={() => onNavigate('settings')}
            title={collapsed ? 'Ayarlar' : undefined}
            className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-150
              ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'}
              ${currentPage === 'settings'
                ? 'sidebar-active text-primary-DEFAULT dark:text-primary-300'
                : 'text-text-2 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-DEFAULT dark:hover:text-white border-l-[3px] border-l-transparent'
              }`}
          >
            <Settings size={20} className="shrink-0" />
            {!collapsed && <span>Ayarlar</span>}
          </button>
        </div>
      </nav>

      {/* User area */}
      <div className={`border-t border-border-light dark:border-border-dark p-3
        ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <button
            onClick={() => signOut()}
            title="Çıkış Yap"
            className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={18} />
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-DEFAULT to-primary-light
              flex items-center justify-center text-white text-sm font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text dark:text-white truncate">{displayName}</p>
              <p className="text-[10px] text-accent-DEFAULT font-medium">{planLabel} Plan</p>
            </div>
            <button
              onClick={() => signOut()}
              title="Çıkış Yap"
              className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-surface-dcard
          border border-border-light dark:border-border-dark shadow-card-md
          flex items-center justify-center text-text-muted hover:text-primary-DEFAULT
          hover:border-primary-200 transition-all duration-200 z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
