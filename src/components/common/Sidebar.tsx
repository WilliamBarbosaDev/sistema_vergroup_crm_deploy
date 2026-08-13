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
} from 'lucide-react';
import { useApp, NavigationTab } from '../../context/AppContext';

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
      title: 'Início',
      items: [
        { id: 'cockpit', label: 'Visão Geral (Cockpit)', icon: LayoutDashboard },
      ],
    },
    {
      title: 'CRM',
      items: [
        { id: 'crm-deals', label: 'Negócios & Pipelines', icon: Trello, badge: openDealsCount, badgeColor: 'bg-[#0F8A4B]' },
        { id: 'crm-leads', label: 'Leads & Prospecção', icon: UserPlus, badge: newLeadsCount, badgeColor: 'bg-blue-600' },
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
        { id: 'comms-whatsapp', label: 'WhatsApp (W-API)', icon: PhoneCall, badge: unreadWppCount > 0 ? unreadWppCount : undefined, badgeColor: 'bg-[#0F8A4B]' },
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
      className={`bg-white border-r border-[#DDE3E8] flex flex-col justify-between shrink-0 transition-all duration-200 select-none z-20 ${
        isCollapsed ? 'w-18' : 'w-62'
      }`}
    >
      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-0.5">
            {!isCollapsed && (
              <p className="px-3 py-1 text-[10px] font-bold text-[#5F6B76] uppercase tracking-wider">
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
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer group ${
                    isActive
                      ? 'bg-[#ECF8F1] text-[#0F8A4B] font-semibold'
                      : 'text-[#17212B] hover:bg-[#F7F9FA] hover:text-[#0F8A4B]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                      isActive ? 'text-[#0F8A4B]' : 'text-[#5F6B76] group-hover:text-[#0F8A4B]'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] text-white px-1.5 py-0.2 rounded-full font-bold leading-tight ${
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

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-[#DDE3E8] bg-[#F7F9FA] flex items-center justify-between">
        {!isCollapsed && (
          <div className="px-2">
            <span className="text-[11px] font-semibold text-[#17212B] block">VERGROUP SIG</span>
            <span className="text-[10px] text-[#5F6B76]">v1.0 • Produção</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-[#5F6B76] hover:text-[#17212B] hover:bg-white rounded-md border border-transparent hover:border-[#DDE3E8] transition-colors cursor-pointer ml-auto"
          title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
