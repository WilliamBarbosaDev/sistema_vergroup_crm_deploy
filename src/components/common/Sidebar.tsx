import React, { useState } from 'react';
import {
  LayoutDashboard,
  Trello,
  UserPlus,
  Users,
  Building2,
  HeartHandshake,
  CheckSquare,
  FolderKanban,
  Calendar,
  MessageSquare,
  Mail,
  PhoneCall,
  BarChart3,
  Zap,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp, NavigationTab } from '../../context/AppContext';
import { VerGroupLogo } from './VerGroupLogo';
import greenLogoAsset from '../../assets/vergroup-logo-green.png';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    deals,
    leads,
    tasks,
    whatsApps,
    emails,
    filterByBU,
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const openDealsCount = filterByBU(deals).filter((d) => d.status === 'open').length;
  const newLeadsCount = filterByBU(leads).filter((l) => l.status === 'new' || l.status === 'qualifying').length;
  const pendingTasksCount = filterByBU(tasks).filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const unreadWppCount = filterByBU(whatsApps).reduce((acc, w) => acc + w.unreadCount, 0);
  const unreadEmailCount = filterByBU(emails).filter((e) => !e.isRead).length;

  const navigationGroups: NavGroup[] = [
    {
      title: 'Início & IA',
      items: [
        { id: 'cockpit', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'cockpit', label: 'Centro de IA & Agentes', icon: Sparkles, badge: 4, badgeColor: 'bg-[#0F8A4B]' },
      ],
    },
    {
      title: 'CRM',
      items: [
        { id: 'crm-deals', label: 'Negócios & Pipelines', icon: Trello, badge: openDealsCount, badgeColor: 'bg-[#0F8A4B]' },
        { id: 'crm-leads', label: 'Leads & Prospecção', icon: UserPlus, badge: newLeadsCount, badgeColor: 'bg-sky-600' },
        { id: 'crm-contacts', label: 'Contatos', icon: Users },
        { id: 'crm-companies', label: 'Empresas & Clientes', icon: Building2 },
      ],
    },
    {
      title: 'Clientes',
      items: [
        { id: 'clients-pipeline', label: 'Pipeline de Clientes', icon: HeartHandshake },
      ],
    },
    {
      title: 'Trabalho',
      items: [
        { id: 'work-tasks', label: 'Tarefas', icon: CheckSquare, badge: pendingTasksCount, badgeColor: 'bg-amber-600' },
        { id: 'work-projects', label: 'Projetos', icon: FolderKanban },
        { id: 'work-calendar', label: 'Calendário & Agenda', icon: Calendar },
      ],
    },
    {
      title: 'Comunicação',
      items: [
        { id: 'comms-chat', label: 'Chat Interno', icon: MessageSquare },
        { id: 'comms-email', label: 'E-mail Integrado', icon: Mail, badge: unreadEmailCount > 0 ? unreadEmailCount : undefined, badgeColor: 'bg-indigo-600' },
        { id: 'comms-whatsapp', label: 'WhatsApp', icon: PhoneCall, badge: unreadWppCount > 0 ? unreadWppCount : undefined, badgeColor: 'bg-[#0F8A4B]' },
      ],
    },

    {
      title: 'Gestão',
      items: [
        { id: 'mgmt-analytics', label: 'Dashboards & BI', icon: BarChart3 },
        { id: 'mgmt-automations', label: 'Automações', icon: Zap },
        { id: 'mgmt-audit', label: 'Auditoria & Logs', icon: ShieldCheck },
      ],
    },
    {
      title: 'Administração',
      items: [
        { id: 'admin-org', label: 'Empresas & Pessoas', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      id="vergroup-sidebar"
      className={`bg-white/90 backdrop-blur-md border-r border-[#E2E6EA] flex flex-col justify-between shrink-0 transition-all duration-200 select-none z-20 shadow-[1px_0_0_rgba(15,23,42,0.03)] ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Logo Banner */}
      <div className="p-3 border-b border-[#E2E6EA] flex items-center justify-between bg-white/80">
        {!isCollapsed ? (
          <img src={greenLogoAsset} alt="VERGROUP Logo" className="h-8 w-auto object-contain shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-xl bg-[#0F8A4B] text-white flex items-center justify-center font-bold text-sm font-display shadow-sm">
            V
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-3 custom-scrollbar">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-0.5">
            {!isCollapsed && (
              <p className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em]">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-[#ECF8F1] text-[#0B6B3A] font-semibold border-l-2 border-[#0F8A4B]'
                      : 'text-slate-700 hover:bg-[#F5F7F8] hover:text-[#0B6B3A] font-medium'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#0F8A4B]' : 'text-slate-500 group-hover:text-[#0F8A4B]'
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-white ${
                        item.badgeColor || 'bg-[#0F8A4B]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse Toggle Button */}
      <div className="p-2 border-t border-[#E2E6EA] flex justify-end bg-white/80">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-[#F5F7F8] transition-colors cursor-pointer"
          title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
