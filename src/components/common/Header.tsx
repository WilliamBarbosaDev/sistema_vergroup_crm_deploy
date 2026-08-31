import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Building2,
  ChevronDown,
  ChevronRight,
  Shield,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
  Check,
  User,
  Activity,
  Pause,
  Square,
  Pencil,
  Box,
  QrCode,
  Smartphone,
  Palette,
  Users,
  LogOut,
  ShieldCheck,
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
  const [showRbacSimulator, setShowRbacSimulator] = useState(false);

  // Active Work Timer State (Bitrix24 Timecard)
  const [isWorking, setIsWorking] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [secondsWorked, setSecondsWorked] = useState<number>(16156); // ~ 04:29:16
  const [secondsPaused, setSecondsPaused] = useState<number>(9358);  // ~ 02:35:58

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
        setShowRbacSimulator(false);
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

  // Timer Ticker Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isWorking && !isPaused) {
      interval = setInterval(() => {
        setSecondsWorked((prev) => prev + 1);
      }, 1000);
    } else if (isWorking && isPaused) {
      interval = setInterval(() => {
        setSecondsPaused((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorking, isPaused]);

  const formatHMS = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'superadmin', label: 'Superadministrador', desc: 'Acesso total a todas as empresas, configurações e auditoria' },
    { role: 'manager', label: 'Gestor de Área', desc: 'Acompanhamento de equipes, aprovações e relatórios do setor' },
    { role: 'sales', label: 'Comercial / Vendas', desc: 'Gestão de leads, contatos, prospecção e pipeline de negócios' },
    { role: 'operations', label: 'Operações & Projetos', desc: 'Execução de clientes, onboarding, tarefas e apontamento de horas' },
    { role: 'financial', label: 'Financeiro / BPO', desc: 'Controle de valores, faturamento, contratos e conciliação' },
    { role: 'viewer', label: 'Visualizador (Auditor)', desc: 'Acesso apenas para leitura e consulta de relatórios autorizados' },
  ];

  return (
    <header id="vergroup-topbar" className="h-16 bg-white border-b border-[#DDE3E8] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs font-sans">
      {/* Left: Brand & Company Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F8A4B] text-white flex items-center justify-center font-black text-base shadow-xs">
            V
          </div>
          <div className="hidden sm:block">
            <span className="font-black text-[#17212B] tracking-tight text-base leading-none">VERGROUP</span>
            <span className="block text-[11px] text-[#5F6B76] font-semibold leading-none mt-0.5">Sistema Integrado</span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#DDE3E8] hidden md:block" />

        {/* Multi-Company Dropdown */}
        <div className="relative" ref={buDropdownRef}>
          <button
            id="company-switcher-btn"
            onClick={() => setIsBUDropdownOpen(!isBUDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F7F9FA] hover:bg-[#EAEFF3] border border-[#DDE3E8] transition-colors cursor-pointer text-[#17212B]"
            title="Alternar Unidade do Grupo"
          >
            <Building2 className="w-4 h-4 text-[#0F8A4B]" />
            <span className="max-w-[140px] sm:max-w-[200px] truncate">{currentBU.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5F6B76]" />
          </button>

          {isBUDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-[#DDE3E8] py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-2 border-b border-[#DDE3E8] bg-[#F7F9FA]">
                <p className="text-[11px] font-black text-[#5F6B76] uppercase tracking-wider">Empresas do Grupo VERGROUP</p>
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
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#ECF8F1] text-[#0F8A4B] font-extrabold' : 'text-[#17212B] hover:bg-[#F7F9FA]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bu.color }} />
                        <div>
                          <p className="leading-tight">{bu.name}</p>
                          {bu.cnpj && <p className="text-[10px] text-[#5F6B76] font-normal">CNPJ: {bu.cnpj}</p>}
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
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#5F6B76] bg-[#F7F9FA] hover:bg-[#EAEFF3] border border-[#DDE3E8] rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2 font-medium">
            <Search className="w-3.5 h-3.5 text-[#5F6B76] group-hover:text-[#0F8A4B]" />
            <span>Buscar contatos, empresas, negócios, tarefas...</span>
          </div>
          <kbd className="text-[10px] font-mono bg-white px-1.5 py-0.5 border border-[#DDE3E8] rounded-md text-[#5F6B76] shadow-2xs font-bold">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Mobile Search Icon */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 text-[#5F6B76] hover:text-[#17212B] hover:bg-[#F7F9FA] rounded-xl lg:hidden cursor-pointer"
          title="Buscar"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Create Button "+ Novo" */}
        <div className="relative" ref={quickCreateRef}>
          <button
            id="quick-create-btn"
            onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
            className="flex items-center gap-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isQuickCreateOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-[#DDE3E8] py-1 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-1.5 border-b border-[#DDE3E8] bg-[#F7F9FA]">
                <p className="text-[10px] font-black text-[#5F6B76] uppercase">Criação Rápida</p>
              </div>
              <button
                onClick={() => {
                  setQuickCreateType('deal');
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#17212B] hover:bg-[#ECF8F1] hover:text-[#0F8A4B] font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0F8A4B]" />
                <span>Novo Negócio</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateType('lead');
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#17212B] hover:bg-[#ECF8F1] hover:text-[#0F8A4B] font-semibold flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Novo Lead</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateType('contact');
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#17212B] hover:bg-[#ECF8F1] hover:text-[#0F8A4B] font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Novo Contato</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateType('company');
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#17212B] hover:bg-[#ECF8F1] hover:text-[#0F8A4B] font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Nova Empresa</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateType('task');
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#17212B] hover:bg-[#ECF8F1] hover:text-[#0F8A4B] font-semibold flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nova Tarefa</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateType('event');
                  setIsQuickCreateOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#17212B] hover:bg-[#ECF8F1] hover:text-[#0F8A4B] font-semibold flex items-center gap-2 cursor-pointer"
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
            className="p-2 text-[#5F6B76] hover:text-[#17212B] hover:bg-[#F7F9FA] rounded-xl transition-colors relative cursor-pointer"
            title="Notificações do Sistema"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-[#DDE3E8] py-2 z-50 animate-in fade-in duration-100">
              <div className="px-3 pb-2 border-b border-[#DDE3E8] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#0F8A4B]" />
                  <span className="text-xs font-black text-[#17212B]">Notificações ({unreadNotifs.length})</span>
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-[#0F8A4B] hover:underline font-extrabold cursor-pointer"
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
                        <p className="font-extrabold text-[#17212B] leading-tight">{notif.title}</p>
                        <span className="text-[10px] text-[#5F6B76] shrink-0 font-medium">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-[#5F6B76] mt-0.5 leading-snug font-medium">{notif.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* LOGGED-IN USER PILL & BITRIX24 PROFILE DROPDOWN CARD */}
        <div className="relative" ref={roleDropdownRef}>
          {/* Top Bar Pill Button matching User Reference */}
          <button
            id="user-profile-role-btn"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
            title="Perfil e Controle de Ponto"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="text-left hidden sm:block leading-tight">
              <p className="text-xs font-black text-slate-900 leading-none">{currentUser.name.split(' ')[0]}</p>
              <span className="text-[10px] font-black text-[#0F8A4B] leading-none uppercase tracking-wider block mt-0.5">
                {currentUser.role}
              </span>
            </div>
            <Shield className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* BITRIX24 PROFILE POPUP CARD MATCHING REFERENCE 3 */}
          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-84 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3.5 font-sans z-50 animate-in fade-in zoom-in-95 duration-150">
              
              {/* 1. Header Row: Avatar + Name + Title */}
              <div
                onClick={() => {
                  setIsRoleDropdownOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs"
                  />
                  <div className="text-left">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-1">
                      <span>{currentUser.name}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">{currentUser.jobTitle}</p>
                  </div>
                </div>
              </div>

              {/* 2. Work Timecard Box ("No trabalho | 04:29:16") */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-800 font-extrabold">
                  <div className="flex items-center gap-1.5">
                    <span>{isWorking ? 'No trabalho' : 'Dia finalizado'}</span>
                    <span>|</span>
                    <span className="font-mono text-slate-900 text-sm">{formatHMS(secondsWorked)}</span>
                    <Pencil className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700 cursor-pointer ml-0.5" title="Editar hora" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="text-[11px] text-slate-500 font-semibold">
                  Duração do intervalo: <span className="font-mono text-slate-700">{formatHMS(secondsPaused)}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsPaused(!isPaused)}
                    className={`w-1/2 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isPaused
                        ? 'bg-amber-50 border border-amber-300 text-amber-800'
                        : 'border border-[#0F8A4B] text-[#0F8A4B] hover:bg-emerald-50'
                    }`}
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>{isPaused ? 'Retomar' : 'Pausar'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWorking(!isWorking)}
                    className={`w-1/2 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs ${
                      isWorking
                        ? 'bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>{isWorking ? 'Finalizar' : 'Iniciar'}</span>
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                </div>
              </div>

              {/* 3. Quick Feature Grid Cards (Segurança & Extensões) */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowRbacSimulator(!showRbacSimulator)}
                  className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-1.5 text-slate-800 font-extrabold cursor-pointer transition-colors shadow-2xs"
                >
                  <ShieldCheck className="w-5 h-5 text-[#0F8A4B]" />
                  <span>Segurança</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-1.5 text-slate-800 font-extrabold cursor-pointer transition-colors shadow-2xs"
                >
                  <Box className="w-5 h-5 text-blue-600" />
                  <span>Extensões</span>
                </button>
              </div>

              {/* Nested RBAC Role Simulator Selector (shown if clicked Segurança or switch account) */}
              {showRbacSimulator && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500">
                    <span>Simular Papel RBAC</span>
                    <button onClick={() => setShowRbacSimulator(false)} className="text-slate-400 hover:text-slate-700">Fechar</button>
                  </div>
                  <div className="space-y-1">
                    {rolesList.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchUserRole(r.role);
                          setShowRbacSimulator(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between ${
                          userRole === r.role ? 'bg-[#0F8A4B] text-white' : 'hover:bg-slate-200/70 text-slate-700'
                        }`}
                      >
                        <span>{r.label}</span>
                        {userRole === r.role && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Options List Card */}
              <div className="p-1.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-0.5 text-xs font-extrabold text-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full px-3 py-2 hover:bg-white rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <QrCode className="w-4 h-4 text-slate-500" />
                    <span>Login rápido pelo celular</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full px-3 py-2 hover:bg-white rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    <span>Aplicativos instalados</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* 5. Theme & Account List Card */}
              <div className="p-1.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-0.5 text-xs font-extrabold text-slate-800">
                <button
                  type="button"
                  className="w-full px-3 py-2 hover:bg-white rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Palette className="w-4 h-4 text-slate-500" />
                    <span>Tema visual</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowRbacSimulator(!showRbacSimulator)}
                  className="w-full px-3 py-2 hover:bg-white rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>Trocar conta / Simular papel</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* 6. Footer Links */}
              <div className="pt-1 flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    setCurrentTab('cockpit');
                  }}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  Pulso da Empresa
                </button>

                <button
                  type="button"
                  onClick={resetAllData}
                  className="hover:text-rose-600 cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
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
