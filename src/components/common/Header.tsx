import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Building2,
  ChevronDown,
  Shield,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
  Check,
  User,
  Activity,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { UserProfileModal } from './UserProfileModal';

export const Header: React.FC = () => {
  const {
    currentBU,
    businessUnits,
    setSelectedBusinessUnitId,
    currentUser,
    userRole,
    switchUserRole,
    setIsSearchOpen,
    setQuickCreateType,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setCurrentTab,
    setSelectedDealId,
    setSelectedTaskId,
    resetAllData,
  } = useApp();

  const [isBUDropdownOpen, setIsBUDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const buDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const quickCreateRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buDropdownRef.current && !buDropdownRef.current.contains(event.target as Node)) {
        setIsBUDropdownOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (quickCreateRef.current && !quickCreateRef.current.contains(event.target as Node)) {
        setIsQuickCreateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'superadmin', label: 'Superadministrador', desc: 'Acesso total a todas as empresas, configurações e auditoria' },
    { role: 'manager', label: 'Gestor de Área', desc: 'Acompanhamento de equipes, aprovações e relatórios do setor' },
    { role: 'sales', label: 'Comercial / Vendas', desc: 'Gestão de leads, contatos, prospecção e pipeline de negócios' },
    { role: 'operations', label: 'Operações & Projetos', desc: 'Execução de clientes, onboarding, tarefas e apontamento de horas' },
    { role: 'financial', label: 'Financeiro / BPO', desc: 'Controle de valores, faturamento, contratos e conciliação' },
    { role: 'viewer', label: 'Visualizador (Auditor)', desc: 'Acesso apenas para leitura e consulta de relatórios autorizados' },
  ];

  return (
    <header id="vergroup-topbar" className="h-16 bg-white border-b border-[#DDE3E8] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Brand & Company Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F8A4B] text-white flex items-center justify-center font-bold text-base shadow-xs">
            V
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-[#17212B] tracking-tight text-base leading-none">VERGROUP</span>
            <span className="block text-[11px] text-[#5F6B76] font-medium leading-none mt-0.5">Sistema Integrado</span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#DDE3E8] hidden md:block" />

        {/* Multi-Company Dropdown */}
        <div className="relative" ref={buDropdownRef}>
          <button
            id="company-switcher-btn"
            onClick={() => setIsBUDropdownOpen(!isBUDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#F7F9FA] hover:bg-[#EAEFF3] border border-[#DDE3E8] transition-colors cursor-pointer text-[#17212B]"
            title="Alternar Unidade do Grupo"
          >
            <Building2 className="w-3.5 h-3.5 text-[#0F8A4B]" />
            <span className="max-w-[140px] sm:max-w-[200px] truncate">{currentBU.name}</span>
            <ChevronDown className="w-3 h-3 text-[#5F6B76]" />
          </button>

          {isBUDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-lg shadow-lg border border-[#DDE3E8] py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-2 border-b border-[#DDE3E8] bg-[#F7F9FA]">
                <p className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider">Empresas do Grupo VERGROUP</p>
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {businessUnits.map((bu) => {
                  const isSelected = bu.id === currentBU.id;
                  return (
                    <button
                      key={bu.id}
                      onClick={() => {
                        setSelectedBusinessUnitId(bu.id);
                        setIsBUDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors ${
                        isSelected ? 'bg-[#ECF8F1] text-[#0F8A4B] font-semibold' : 'text-[#17212B] hover:bg-[#F7F9FA]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bu.color }} />
                        <div>
                          <p className="leading-tight">{bu.name}</p>
                          {bu.cnpj && <p className="text-[10px] text-[#5F6B76]">CNPJ: {bu.cnpj}</p>}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#0F8A4B]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Global Search trigger */}
      <div className="flex-1 max-w-md mx-4 hidden lg:block">
        <button
          id="global-search-trigger-btn"
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#5F6B76] bg-[#F7F9FA] hover:bg-[#EAEFF3] border border-[#DDE3E8] rounded-md transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#5F6B76] group-hover:text-[#0F8A4B]" />
            <span>Buscar contatos, empresas, negócios, tarefas...</span>
          </div>
          <kbd className="text-[10px] font-mono bg-white px-1.5 py-0.5 border border-[#DDE3E8] rounded text-[#5F6B76] shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Notifications, Role Simulator & User Profile */}
      <div className="flex items-center gap-2.5">
        {/* Mobile Search Icon */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 text-[#5F6B76] hover:text-[#17212B] hover:bg-[#F7F9FA] rounded-md lg:hidden"
          title="Buscar"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Create Button "+ Novo" */}
        <div className="relative" ref={quickCreateRef}>
          <button
            id="quick-create-btn"
            onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
            className="flex items-center gap-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isQuickCreateOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-lg shadow-lg border border-[#DDE3E8] py-1 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-1.5 border-b border-[#DDE3E8] bg-[#F7F9FA]">
                <p className="text-[10px] font-semibold text-[#5F6B76] uppercase">Criação Rápida</p>
              </div>
              <button
                onClick={() => {
                  setQuickCreateType('deal');
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#17212B] hover:bg-[#ECF8F1] hover:text-[#0F8A4B] flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0F8A4B]" />
                <span>Novo Negócio</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateType('lead');
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#17212B] hover:bg-[#ECF8F1] hover:text-[#0F8A4B] flex items-center gap-2"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Novo Lead</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateType('contact');
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#17212B] hover:bg-[#ECF8F1] hover:text-[#0F8A4B] flex items-center gap-2"
              >
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Novo Contato</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateType('company');
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#17212B] hover:bg-[#ECF8F1] hover:text-[#0F8A4B] flex items-center gap-2"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Nova Empresa</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateType('task');
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#17212B] hover:bg-[#ECF8F1] hover:text-[#0F8A4B] flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nova Tarefa</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateType('event');
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#17212B] hover:bg-[#ECF8F1] hover:text-[#0F8A4B] flex items-center gap-2"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Novo Evento / Reunião</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            id="notifications-bell-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-[#5F6B76] hover:text-[#17212B] hover:bg-[#F7F9FA] rounded-md transition-colors relative cursor-pointer"
            title="Notificações do Sistema"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#DC2626] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-lg shadow-xl border border-[#DDE3E8] py-2 z-50 animate-in fade-in duration-100">
              <div className="px-3 pb-2 border-b border-[#DDE3E8] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#0F8A4B]" />
                  <span className="text-xs font-semibold text-[#17212B]">Notificações ({unreadNotifs.length})</span>
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-[#0F8A4B] hover:underline font-medium cursor-pointer"
                  >
                    Marcar lidas
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#F0F4F7]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#5F6B76]">Nenhuma notificação no momento.</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.linkTab) setCurrentTab(notif.linkTab);
                        if (notif.linkTab === 'crm-deals' && notif.linkId) setSelectedDealId(notif.linkId);
                        if (notif.linkTab === 'work-tasks' && notif.linkId) setSelectedTaskId(notif.linkId);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3 text-xs hover:bg-[#F7F9FA] cursor-pointer transition-colors ${
                        !notif.read ? 'bg-[#ECF8F1]/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-semibold text-[#17212B] leading-tight">{notif.title}</p>
                        <span className="text-[10px] text-[#5F6B76] shrink-0">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-[#5F6B76] mt-0.5 leading-snug">{notif.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RBAC Role Switcher & User Profile */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            id="user-profile-role-btn"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 hover:bg-[#F7F9FA] rounded-md border border-[#DDE3E8] transition-colors cursor-pointer"
            title="Simulador de Papéis RBAC e Perfil"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-[#DDE3E8]"
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-[#17212B] leading-none">{currentUser.name.split(' ')[0]}</p>
              <span className="text-[10px] font-medium text-[#0F8A4B] leading-none uppercase tracking-wider block mt-0.5">
                {currentUser.role}
              </span>
            </div>
            <Shield className="w-3 h-3 text-[#5F6B76]" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-lg shadow-xl border border-[#DDE3E8] py-1 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-2 border-b border-[#DDE3E8] bg-[#F7F9FA] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#17212B]">{currentUser.name}</p>
                  <p className="text-[11px] text-[#5F6B76]">{currentUser.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#0F8A4B] font-medium">
                    <Shield className="w-3 h-3" />
                    <span>Cargo: {currentUser.jobTitle}</span>
                  </div>
                </div>
              </div>

              <div className="p-2 border-b border-[#DDE3E8]">
                <button
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-[#ECF8F1] hover:bg-[#D4EFE0] text-[#0F8A4B] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  <span>Painel de Eficiência & Horas (Bitrix)</span>
                </button>
              </div>

              <div className="px-3 py-1.5 bg-neutral-100 border-b border-[#DDE3E8]">
                <p className="text-[10px] font-semibold text-[#5F6B76] uppercase">Simular Papel RBAC (PRD Seção 7.1)</p>
              </div>

              <div className="max-h-60 overflow-y-auto py-1">
                {rolesList.map((r) => {
                  const isActive = userRole === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchUserRole(r.role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                        isActive ? 'bg-[#ECF8F1] text-[#0F8A4B] font-semibold' : 'text-[#17212B] hover:bg-[#F7F9FA]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{r.label}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-[#0F8A4B]" />}
                      </div>
                      <p className="text-[10px] text-[#5F6B76] font-normal mt-0.5">{r.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-[#DDE3E8]">
                <button
                  onClick={resetAllData}
                  className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] text-[#5F6B76] hover:text-[#DC2626] transition-colors rounded hover:bg-red-50"
                  title="Restaurar dados iniciais do protótipo"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar dados padrão</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};
