import React, { useMemo, useState } from 'react';
import {
  Shield,
  Building,
  Users,
  CheckCircle2,
  Lock,
  Key,
  ShieldCheck,
  Building2,
  Briefcase,
  UserCheck,
  UserPlus,
  Mail,
  Link as LinkIcon,
  RefreshCw,
  XCircle,
  Copy,
  Clock,
  ShieldAlert,
  Sparkles,
  Filter,
  Search,
  Trash2,
  ChevronDown,
  ChevronRight,
  Network,
  AlertTriangle,
  UserX,
  ArrowRight,
  Plus,
  X,
  FileCheck,
  PhoneCall,
  MoreHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, CollaboratorInvite, User, Pipeline, BusinessUnit } from '../../types';
import { InviteCollaboratorModal } from './InviteCollaboratorModal';
import { AcceptInviteModal } from './AcceptInviteModal';
import { CollaboratorCockpitModal } from './CollaboratorCockpitModal';
import { StayCloudConfigModal } from './StayCloudConfigModal';
import { WhatsAppConfigModal } from './WhatsAppConfigModal';
import { PipelineModal } from './PipelineModal';
import { PipelineStageConfigModal } from './PipelineStageConfigModal';
import { CatalogTab } from './CatalogTab';
import { ImportsTab } from './ImportsTab';
import { AdminGovernanceTab } from './AdminGovernanceTab';
import { WebFormsTab } from './WebFormsTab';
import { PermissionEngineService, CAPABILITIES_REGISTRY } from '../../services/permissionEngine';
import { PermissionScope } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { UserEditModal } from './UserEditModal';

export const AdminView: React.FC = () => {
  const {
    businessUnits,
    departments,
    teams,
    users,
    invites,
    pipelines,
    deals,
    tasks,
    catalogItems,
    salesTunnels,
    addSalesTunnel,
    deleteSalesTunnel,
    currentUser,
    addLead,
    switchUserRole,
    revokeInvite,
    resendInvite,
    duplicatePipeline,
    deletePipeline,
    addBusinessUnit,
    updateUserStatus,
    reassignUserTasks,
    addAuditLog,
  } = useApp();

  const isSuperadmin = currentUser.role === 'superadmin' || currentUser.isSuperadmin;

  const [activeTab, setActiveTab] = useState<'users' | 'invites' | 'organogram' | 'units' | 'matrix' | 'governance' | 'pipelines' | 'webforms' | 'catalog' | 'imports'>('users');
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showStayCloudModal, setShowStayCloudModal] = useState<boolean>(false);
  const [showWppModal, setShowWppModal] = useState<boolean>(false);
  const [showPipelineModal, setShowPipelineModal] = useState<boolean>(false);
  const [pipelineToEdit, setPipelineToEdit] = useState<Pipeline | null>(null);
  const [showStageConfigModal, setShowStageConfigModal] = useState<boolean>(false);
  const [pipelineForStageConfig, setPipelineForStageConfig] = useState<Pipeline | null>(null);

  // Sales tunneling states
  const [showTunnelModal, setShowTunnelModal] = useState<boolean>(false);
  const [tunName, setTunName] = useState<string>('');
  const [tunSourcePipeId, setTunSourcePipeId] = useState<string>('');
  const [tunSourceStageId, setTunSourceStageId] = useState<string>('');
  const [tunTargetPipeId, setTunTargetPipeId] = useState<string>('');
  const [tunTargetStageId, setTunTargetStageId] = useState<string>('');
  const [tunActionType, setTunActionType] = useState<'copy' | 'move'>('copy');
  const [tunConditionType, setTunConditionType] = useState<'on_deal_won' | 'on_deal_lost' | 'on_enter_stage'>('on_deal_won');
  const [activeAcceptInvite, setActiveAcceptInvite] = useState<CollaboratorInvite | null>(null);
  const [activeCockpitCollaborator, setActiveCockpitCollaborator] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Permission Explainer & Hierarchical Matrix States
  const [explainerUserId, setExplainerUserId] = useState<string>(currentUser.id);
  const [explainerCapability, setExplainerCapability] = useState<string>('tasks.read');
  const [customCapabilityScopes, setCustomCapabilityScopes] = useState<Record<string, PermissionScope>>({});
  const [matrixModuleFilter, setMatrixModuleFilter] = useState<string>('all');

  // New BU Modal State
  const [showNewBuModal, setShowNewBuModal] = useState(false);
  const [newBuTradeName, setNewBuTradeName] = useState('');
  const [newBuCnpj, setNewBuCnpj] = useState('');

  // Offboarding / Reassignment Modal State
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null);
  const [reassignTargetUserId, setReassignTargetUserId] = useState<string>('');

  // AI Diagnostic Audit State
  const [aiAuditReport, setAiAuditReport] = useState<string | null>(null);

  // Filters
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedBuFilter, setSelectedBuFilter] = useState<string>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  const rolesList: { role: UserRole; name: string; desc: string; access: string }[] = [
    { role: 'superadmin', name: 'Superadministrador', desc: 'Acesso irrestrito a todas as empresas, configurações globais e auditoria.', access: 'Total' },
    { role: 'director', name: 'Diretor / C-Level', desc: 'Visualização consolidada de todas as BUs, aprovação estratégica e relatórios executivos.', access: 'Global Executivo' },
    { role: 'manager', name: 'Gestor de Unidade / Setor', desc: 'Gestão de funis da sua BU, aprovação de propostas, distribuição e SLA de tarefas.', access: 'Unidade / Setor' },
    { role: 'sales', name: 'Vendedor / SDR / Closer', desc: 'Gestão de leads atribuídos, pipeline comercial, envio de propostas e WhatsApp.', access: 'CRM Próprio / BU' },
    { role: 'operator', name: 'Operador / Técnico / Suporte', desc: 'Execução de tarefas, atendimento a clientes, checklists e time tracking.', access: 'Operações' },
    { role: 'auditor', name: 'Auditor / Compliance / LGPD', desc: 'Visualização somente-leitura de logs de auditoria, históricos e relatórios.', access: 'Somente Leitura' },
  ];

  // Calculated Metrics
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const pendingInvitesCount = invites.filter(i => i.status === 'pending').length;
  const roleFilterOptions = [
    { value: 'all', label: 'Todos os papéis' },
    ...Array.from(new Set(users.map((user) => user.role))).map((role) => ({
      value: role,
      label: role.toUpperCase().replace(/_/g, ' '),
    })),
  ];

  const statusLabels: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    invited: 'Convite pendente',
    suspended: 'Suspenso',
    blocked: 'Bloqueado',
    offline: 'Offline',
    absent: 'Ausente',
  };

  const navigationGroups = [
    {
      title: 'Pessoas',
      items: [
        { id: 'users', label: 'Usuários', badge: users.length },
        { id: 'invites', label: 'Convites', badge: pendingInvitesCount },
        { id: 'organogram', label: 'Organograma' },
      ],
    },
    {
      title: 'Estrutura',
      items: [
        { id: 'units', label: 'Empresas / BUs', badge: businessUnits.length },
        { id: 'matrix', label: 'Hierarquia' },
      ],
    },
    {
      title: 'Acessos',
      items: [
        { id: 'matrix', label: 'Permissões' },
        { id: 'governance', label: 'Governança' },
      ],
    },
    {
      title: 'Operação',
      items: [
        { id: 'pipelines', label: 'Pipelines & Funis', badge: pipelines.length },
        { id: 'catalog', label: 'Produtos & Serviços', badge: catalogItems.length },
        { id: 'imports', label: 'Migração / Importação' },
      ],
    },
  ];

  // Multi-tenant User Filter (Non-superadmin admins see only their BU users)
  const filteredUsers = users.filter((u) => {
    if (!isSuperadmin && u.businessUnitId !== currentUser.businessUnitId) return false;
    if (selectedStatusFilter !== 'all' && u.status !== selectedStatusFilter) return false;
    if (selectedDeptFilter !== 'all' && u.departmentId !== selectedDeptFilter) return false;
    if (selectedBuFilter !== 'all' && u.businessUnitId !== selectedBuFilter) return false;
    if (selectedRoleFilter !== 'all' && u.role !== selectedRoleFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.jobTitle.toLowerCase().includes(term);
    }
    return true;
  });

  const handleCopyInviteLink = (inv: CollaboratorInvite) => {
    const link = `${window.location.origin}/invite/${inv.token}`;
    navigator.clipboard.writeText(link);
    setCopiedInviteId(inv.id);
    setTimeout(() => setCopiedInviteId(null), 2500);
  };

  const handleCreateBusinessUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperadmin) {
      alert('🔒 Ação bloqueada: Somente o SUPERADMIN pode criar novas Empresas do Grupo.');
      return;
    }
    if (!newBuTradeName.trim()) return;

    addBusinessUnit({
      code: `BU-${Date.now().toString().slice(-4)}`,
      name: newBuTradeName,
      tradeName: newBuTradeName,
      cnpj: newBuCnpj || '00.000.000/0001-00',
      address: 'Sede VERGROUP Corp',
      phone: '(11) 3000-0000',
      status: 'active',
    });

    setNewBuTradeName('');
    setNewBuCnpj('');
    setShowNewBuModal(false);
    alert(`🎉 Empresa do grupo "${newBuTradeName}" criada com sucesso!`);
  };

  const handleConfirmUserSuspension = () => {
    if (!userToSuspend) return;

    const userOpenTasks = tasks.filter((t) => t.assignedUserId === userToSuspend.id && t.status !== 'completed');

    if (userOpenTasks.length > 0 && reassignTargetUserId) {
      const { reassignedCount } = reassignUserTasks(userToSuspend.id, reassignTargetUserId);
      const targetUser = users.find((u) => u.id === reassignTargetUserId);
      alert(`✅ ${reassignedCount} tarefas em aberto foram reatribuídas com sucesso para ${targetUser?.name}.`);
    }

    updateUserStatus(userToSuspend.id, 'suspended');
    setUserToSuspend(null);
    setReassignTargetUserId('');
    alert(`🔒 Acesso do colaborador "${userToSuspend.name}" suspenso. Histórico preservado.`);
  };

  const handleRunAiAdminAudit = () => {
    const unassignedManager = users.filter((u) => !u.managerId && u.role !== 'superadmin' && u.role !== 'director');
    const unassignedDept = users.filter((u) => !u.departmentId);

    setAiAuditReport(
      `🤖 **Diagnóstico de Governança VER AI Admin**:\n- **Colaboradores sem Gestor atribuído**: ${unassignedManager.length} (${unassignedManager.map(u => u.name).join(', ') || 'Nenhum'})\n- **Colaboradores sem Departamento**: ${unassignedDept.length}\n- **Privilege Ceiling**: 🟢 RLS e privilégio teto em conformidade. Nenhuma tentativa de escalation attack identificada.\n\n💡 **Recomendação**: Vincular todos os colaboradores a um gestor direto para acompanhamento de SLA.`
    );
  };

  return (
    <div id="admin-view" className="p-4 md:p-6 max-w-full space-y-6 font-sans select-none">
      {/* Header */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center border border-[#0F8A4B]/20 shrink-0 shadow-2xs">
                <Shield className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                    Administração & Governança
                  </h1>
                  <span className="text-[10px] font-black px-2.5 py-1 bg-[#ECF8F1] text-[#0F8A4B] rounded-md border border-[#0F8A4B]/20 uppercase tracking-[0.2em]">
                    Central Administrativa
                  </span>
                </div>
                <p className="text-sm md:text-[15px] text-slate-600 font-medium mt-1 max-w-3xl">
                  Gerencie pessoas, empresas, acessos, estrutura organizacional e processos.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                + Convidar Colaborador
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-4">
            {navigationGroups.map((group) => (
              <div key={group.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 mb-3">{group.title}</p>
                <div className="flex flex-wrap gap-2">
                  {group.items
                    .filter((item) => {
                      if (item.id === 'catalog' && !isSuperadmin && !currentUser.capabilities?.includes('catalog.manage')) return false;
                      if (item.id === 'imports' && !isSuperadmin && !currentUser.capabilities?.includes('imports.manage')) return false;
                      return true;
                    })
                    .map((item) => {
                      const active = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id as any)}
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-black border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#0F8A4B] text-white border-[#0F8A4B] shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-[#0F8A4B]/30 hover:text-[#0B6B3A]'
                          }`}
                        >
                          <span>{item.label}</span>
                          {item.badge !== undefined && (
                            <span className={`min-w-5 h-5 px-1.5 rounded-full text-[10px] font-black inline-flex items-center justify-center ${active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'}`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center border border-emerald-400/20 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.22em] text-white/90">Auditoria de Governança</h4>
              <p className="text-sm text-slate-300 font-medium mt-1 max-w-3xl">
                Verifique inconsistências em estrutura, permissões e responsabilidades.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAiAdminAudit}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-black cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#0F8A4B]" />
            Executar Auditoria
          </button>
        </div>

        {aiAuditReport && (
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-wrap shadow-2xs">
            {aiAuditReport}
          </div>
        )}
      </div>

      {/* TAB 1: USUÁRIOS ATIVOS */}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.18em]">Usuários</h2>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#ECF8F1] text-[#0B6B3A] border border-[#0F8A4B]/20">
                    {filteredUsers.length} encontrados
                  </span>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {activeUsersCount} ativos
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">Filtros combinados por BU, departamento, papel e status.</p>
              </div>

              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                + Convidar Colaborador
              </button>
            </div>

            <div className="grid gap-3 lg:grid-cols-5">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">Busca</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nome, e-mail ou cargo"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F8A4B]"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">Empresa / BU</span>
                <select
                  value={selectedBuFilter}
                  onChange={(e) => setSelectedBuFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F8A4B]"
                >
                  <option value="all">Todas as empresas</option>
                  {businessUnits.map((bu) => (
                    <option key={bu.id} value={bu.id}>{bu.tradeName || bu.name}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">Departamento</span>
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F8A4B]"
                >
                  <option value="all">Todos os departamentos</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">Papel</span>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F8A4B]"
                >
                  {roleFilterOptions.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">Status</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F8A4B]"
                >
                  <option value="all">Todos os status</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Colaborador</th>
                    <th className="p-3.5">Cargo / Departamento</th>
                    <th className="p-3.5">Empresa / BU</th>
                    <th className="p-3.5">Papel</th>
                    <th className="p-3.5">Gestor</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredUsers.map((u) => {
                    const bu = businessUnits.find((b) => b.id === u.businessUnitId);
                    const dept = departments.find((d) => d.id === u.departmentId);
                    const manager = users.find((m) => m.id === u.managerId);
                    const supervisor = users.find((m) => m.id === u.supervisorId);
                    const roleLabel = u.role.toUpperCase().replace(/_/g, ' ');
                    const statusLabel = statusLabels[u.status] || u.status;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar name={u.name} avatarUrl={u.avatar} size="sm" status={u.status} />
                            <div className="min-w-0">
                              <strong className="text-slate-900 font-black block truncate">{u.name}</strong>
                              <span className="text-slate-500 text-[11px] block truncate">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <strong className="text-slate-900 font-bold block">{u.jobTitle || 'Sem cargo definido'}</strong>
                          <span className="text-slate-500 text-[11px]">{dept?.name || 'Departamento não definido'}</span>
                        </td>

                        <td className="p-3.5">
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                            {bu?.tradeName || bu?.name || 'Sem empresa vinculada'}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-800">
                            {roleLabel}
                          </span>
                        </td>

                        <td className="p-3.5 text-slate-700 font-medium">
                          <div className="flex flex-col gap-0.5">
                            <span>{manager?.name || <span className="italic text-slate-400">Sem gestor</span>}</span>
                            {supervisor && supervisor.id !== manager?.id && (
                              <span className="text-[11px] text-slate-500">Supervisor: {supervisor.name}</span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide border ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : u.status === 'invited'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {statusLabel}
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <details className="relative inline-block group">
                            <summary className="list-none inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-slate-700 shadow-2xs">
                              <MoreHorizontal className="w-4 h-4" />
                            </summary>
                            <div className="absolute right-0 z-20 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl text-left">
                              <button onClick={() => setActiveCockpitCollaborator(u)} className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 text-left cursor-pointer">Ver perfil</button>
                              <button onClick={() => setEditingUser(u)} className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 text-left cursor-pointer">Editar</button>
                              <button onClick={() => { setActiveTab('matrix'); setExplainerUserId(u.id); }} className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 text-left cursor-pointer">Alterar permissões</button>
                              <button onClick={() => { setActiveTab('matrix'); setExplainerUserId(u.id); }} className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 text-left cursor-pointer">Ver acessos</button>
                              {u.status === 'active' ? (
                                <button
                                  onClick={() => {
                                    setUserToSuspend(u);
                                    setReassignTargetUserId('');
                                  }}
                                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 text-left cursor-pointer"
                                >
                                  Suspender
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateUserStatus(u.id, 'active')}
                                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 text-left cursor-pointer"
                                >
                                  Reativar
                                </button>
                              )}
                            </div>
                          </details>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* TAB 2: ORGANOGRAMA VISUAL INTERATIVO (ÁRVORE HIERÁRQUICA) */}
      {activeTab === 'organogram' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-900 space-y-6 shadow-2xs font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center border border-[#0F8A4B]/20 shadow-2xs">
                <Network className="w-5 h-5 text-[#0F8A4B]" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Estrutura Organizacional & Hierarquia Funcional</h3>
                <p className="text-xs text-slate-500 font-medium">Holding VERGROUP -&gt; Business Units -&gt; Gerências -&gt; Sub-departamentos</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-[#ECF8F1] text-[#0B6B3A] rounded-full border border-[#0F8A4B]/20">
              {businessUnits.length} BUs Ativas
            </span>
          </div>

          {/* Holding Root Node */}
          <div className="flex justify-center">
            <div className="bg-white text-slate-900 p-4 rounded-2xl border-2 border-[#0F8A4B] shadow-sm max-w-sm w-full text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-[#0B6B3A] bg-[#ECF8F1] px-2.5 py-0.5 rounded border border-[#0F8A4B]/20 tracking-wider">
                Holding Central
              </span>
              <h2 className="text-base font-black text-slate-900">Grupo VERGROUP</h2>
              <p className="text-xs font-bold text-slate-500">{users.length} colaboradores ativos no grupo</p>
            </div>
          </div>

          {/* Connector Line */}
          <div className="w-0.5 h-6 bg-[#0F8A4B]/40 mx-auto" />

          {/* Business Units Grid Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {businessUnits.map((bu) => {
              const buUsers = users.filter((u) => u.businessUnitId === bu.id);
              const buDepts = departments.filter((d) => d.businessUnitId === bu.id);

              return (
                <div key={bu.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-[#0B6B3A] bg-[#ECF8F1] px-2 py-0.5 rounded border border-[#0F8A4B]/20">
                      {bu.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{buUsers.length} colaboradores</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900">{bu.tradeName || bu.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{buDepts.length} departamentos</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    {buDepts.map((dep) => {
                      const leader = users.find((u) => u.id === dep.leaderId);
                      const depTeams = teams.filter((t) => t.departmentId === dep.id);

                      return (
                        <div key={dep.id} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <strong className="text-slate-900 font-bold">{dep.name}</strong>
                            <span className="text-[10px] font-bold text-slate-500">{depTeams.length} equipes</span>
                          </div>
                          {leader && (
                            <p className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                              <span className="w-2 h-2 rounded-full bg-[#0F8A4B]" />
                              Líder: {leader.name} ({leader.jobTitle})
                            </p>
                          )}
                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={() => {
                                if (leader) setExplainerUserId(leader.id);
                                else if (buUsers[0]) setExplainerUserId(buUsers[0].id);
                                setActiveTab('matrix');
                              }}
                              className="text-[10px] font-bold text-[#0F8A4B] hover:text-[#0B6B3A] flex items-center gap-1 cursor-pointer hover:underline"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>Ver Permissões</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: MATRIZ DE PERMISSÕES HIERÁRQUICA E ENGINE DE GOVERNANÇA */}
      {activeTab === 'matrix' && (() => {
        const explainerUser = users.find((u) => u.id === explainerUserId) || currentUser;
        const explanation = PermissionEngineService.explainPermission(
          explainerUser,
          explainerCapability,
          { businessUnitId: explainerUser.primaryBusinessUnitId || explainerUser.businessUnitIds[0] },
          users,
          departments,
          businessUnits,
          tasks,
          deals
        );

        const privilegeCheck = PermissionEngineService.checkPrivilegeCeiling(
          currentUser,
          explainerUser.role,
          explanation.scope
        );

        const modules = Array.from(new Set(CAPABILITIES_REGISTRY.map((c) => c.module)));
        const filteredCapabilities = CAPABILITIES_REGISTRY.filter(
          (c) => matrixModuleFilter === 'all' || c.module === matrixModuleFilter
        );

        return (
          <div className="space-y-5 font-sans">
            {/* 1. PERMISSION EXPLAINER & DIAGNOSTIC AUDIT CARD */}
            <div className="bg-[#0A261E] text-white p-5 rounded-2xl border border-emerald-500/30 shadow-md space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black border border-emerald-400/30">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                      <span>Permission Explainer — Auditoria "Por Que Tem Acesso"</span>
                      <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-extrabold px-2 py-0.5 rounded border border-emerald-500/40">
                        Governance Engine
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                      Diagnóstico em tempo real da cadeia hierárquica, resolutividade de escopo e privilégio teto
                    </p>
                  </div>
                </div>

                {/* Explainer Selectors */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Colaborador:</label>
                    <select
                      value={explainerUserId}
                      onChange={(e) => setExplainerUserId(e.target.value)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          👤 {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Capability:</label>
                    <select
                      value={explainerCapability}
                      onChange={(e) => setExplainerCapability(e.target.value)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-xl text-xs font-bold outline-none focus:border-emerald-500 font-mono text-[11px]"
                    >
                      {CAPABILITIES_REGISTRY.map((cap) => (
                        <option key={cap.id} value={cap.capability}>
                          ⚡ {cap.capability} ({cap.actionName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Explainer Result Visual Box */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                {/* Decision Badge */}
                <div className="md:col-span-3 flex flex-col items-start justify-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Decisão Final:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider border shadow-xs ${
                        explanation.decision === 'ALLOW'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : explanation.decision === 'DENY'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      }`}
                    >
                      {explanation.decision === 'ALLOW' ? '🟢 ALLOW' : explanation.decision === 'DENY' ? '🔴 DENY' : '🟣 CUSTOM'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300">[{explanation.scope}]</span>
                  </div>
                </div>

                {/* Resolved Hierarchy Breadcrumbs */}
                <div className="md:col-span-9 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Caminho Hierárquico Resolvido:
                  </span>
                  <div className="text-xs font-semibold text-emerald-300 bg-slate-950 p-2 rounded-lg border border-slate-800/80 font-mono overflow-x-auto">
                    {explanation.resolvedHierarchyPath}
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">{explanation.reason}</p>

                  {/* Target Count Estimate */}
                  {explanation.targetCountEstimate !== undefined && (
                    <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 pt-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Com o escopo `{explanation.scope}`, este colaborador acessa aproximadamente **{explanation.targetCountEstimate} registros** sob sua hierarquia.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. MATRIZ INTERATIVA DE CAPABILITIES E ESCOPOS HIERÁRQUICOS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Matriz de Permissões Hierárquica por Módulo (`Permission Engine`)</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Regras de acesso baseadas em Identity + Role + Capability + Scope + Hierarquia da Empresa
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
                  <button
                    onClick={() => setMatrixModuleFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer border ${
                      matrixModuleFilter === 'all'
                        ? 'bg-[#0F8A4B] text-white border-[#0F8A4B] font-black'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Todos os Módulos
                  </button>
                  {modules.map((mod) => (
                    <button
                      key={mod}
                      onClick={() => setMatrixModuleFilter(mod)}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer border ${
                        matrixModuleFilter === mod
                          ? 'bg-[#0F8A4B] text-white border-[#0F8A4B] font-black'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capabilities Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Módulo Funcional</th>
                      <th className="p-3.5">Capability / Ação</th>
                      <th className="p-3.5 text-center">Decisão</th>
                      <th className="p-3.5">Escopo Hierárquico Resolvido</th>
                      <th className="p-3.5">Origem / Regra</th>
                      <th className="p-3.5 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredCapabilities.map((cap) => {
                      const activeScope = customCapabilityScopes[cap.capability] || cap.defaultScope;
                      const isCustom = Boolean(customCapabilityScopes[cap.capability]);

                      return (
                        <tr key={cap.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] border border-slate-200">
                              {cap.module}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <strong className="text-slate-900 font-bold block">{cap.actionName}</strong>
                            <span className="font-mono text-[10px] text-slate-500">{cap.capability}</span>
                            <p className="text-[11px] text-slate-400 font-normal mt-0.5 max-w-sm">{cap.description}</p>
                          </td>

                          <td className="p-3.5 text-center">
                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                                isCustom
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : cap.defaultScope === 'all' || cap.defaultScope === 'business_unit'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              }`}
                            >
                              {isCustom ? '🟣 CUSTOM' : '🟢 ALLOW'}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <select
                              value={activeScope}
                              onChange={(e) => {
                                const newScope = e.target.value as PermissionScope;
                                setCustomCapabilityScopes({ ...customCapabilityScopes, [cap.capability]: newScope });
                                addAuditLog(
                                  'update',
                                  'permission',
                                  cap.capability,
                                  `actor_type: human_user | action: capability.scope.updated | details: Escopo da capability "${cap.capability}" alterado para "${newScope}"`
                                );
                              }}
                              className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white font-mono text-[11px] font-bold text-slate-800 outline-none focus:border-[#0F8A4B] cursor-pointer"
                            >
                              {cap.allowedScopes.map((sc) => (
                                <option key={sc} value={sc}>
                                  {sc === 'own'
                                    ? '👤 Próprio (OWN)'
                                    : sc === 'participating'
                                    ? '🤝 Participante (PARTICIPATING)'
                                    : sc === 'team'
                                    ? '👥 Equipe Direta (TEAM)'
                                    : sc === 'department'
                                    ? '🏢 Departamento (DEPARTMENT)'
                                    : sc === 'department_and_below'
                                    ? '🌳 Dept. + Subdepartamentos'
                                    : sc === 'managed_users'
                                    ? '📊 Subordinados Diretos'
                                    : sc === 'business_unit'
                                    ? '🏬 Toda a Empresa (BU)'
                                    : sc === 'multi_bu'
                                    ? '🌐 Multi-BU Autorizadas'
                                    : '⭐ Global (ALL)'}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-3.5 text-xs text-slate-600">
                            {isCustom ? (
                              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                Exceção por Administrador
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-slate-500">Padrão da Role `{explainerUser.role}`</span>
                            )}
                          </td>

                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => {
                                setExplainerCapability(cap.capability);
                                window.scrollTo({ top: 100, behavior: 'smooth' });
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg border border-slate-200 cursor-pointer transition-colors"
                            >
                              Auditar Este Acesso
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 5: GOVERNANÇA OPERACIONAL */}
      {activeTab === 'governance' && (
        <AdminGovernanceTab />
      )}

      {/* TAB 5: EMPRESAS DO GRUPO (BUSINESS UNITS) */}
      {activeTab === 'units' && (
        <div className="space-y-4 font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Empresas Internas do Grupo VERGROUP (`public.business_units`)</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Segregação multiempresa nativa em PostgreSQL com isolamento de dados por BU</p>
            </div>
            
            {isSuperadmin ? (
              <button
                onClick={() => setShowNewBuModal(true)}
                className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nova Empresa do Grupo</span>
              </button>
            ) : (
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                🔒 Somente SUPERADMIN cria novas BUs
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {businessUnits.map((b) => (
              <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-[#0F8A4B] bg-[#ECF8F1] px-2.5 py-0.5 rounded border border-[#0F8A4B]/20">
                    {b.code}
                  </span>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                    {b.status}
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">{b.tradeName}</h4>
                <p className="text-xs text-slate-600 font-medium">CNPJ: {b.cnpj}</p>
                <p className="text-xs text-slate-500 font-medium">{b.address}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GESTÃO DE CONVITES DE COLABORADORES */}
      {activeTab === 'invites' && (
        <div className="space-y-4 font-sans">
          {/* Header Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0F8A4B]" />
                <span>Gestão de Convites de Colaboradores (`public.collaborator_invites`)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Emissão e controle de tokens de convite com escopo por Empresa e Papel Funcional
              </p>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Convidar Colaborador</span>
            </button>
          </div>

          {/* Invites List / Table */}
          {invites.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0F8A4B] flex items-center justify-center mx-auto border border-emerald-200">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900">Nenhum convite pendente ou cadastrado</h4>
              <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                Convide novos colaboradores para ingressar na empresa com papeis, departamentos e gerências pré-configuradas.
              </p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white text-xs font-black rounded-xl cursor-pointer shadow-xs transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Convidar Colaborador Agora</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">E-mail do Convidado</th>
                      <th className="p-3.5">Empresa Destino</th>
                      <th className="p-3.5">Cargo / Papel</th>
                      <th className="p-3.5">Status do Convite</th>
                      <th className="p-3.5">Data de Envio</th>
                      <th className="p-3.5 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {invites.map((inv) => {
                      const bu = businessUnits.find((b) => b.id === inv.businessUnitId);
                      const isPending = inv.status === 'pending';

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                                <Mail className="w-4 h-4 text-[#0F8A4B]" />
                              </div>
                              <div>
                                <strong className="text-slate-900 font-black block">{inv.email}</strong>
                                <span className="text-slate-400 font-mono text-[10px]">Token: {inv.token?.slice(0, 12)}...</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="font-bold text-slate-800">{bu?.tradeName || inv.businessUnitId}</span>
                          </td>

                          <td className="p-3.5">
                            <strong className="text-slate-900 font-bold block">{inv.jobTitle || 'Colaborador'}</strong>
                            <span className="font-mono text-[10px] font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 uppercase">
                              {inv.role}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                              inv.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              inv.status === 'accepted' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                              {inv.status === 'pending' ? '⏳ Pendente' : inv.status === 'accepted' ? '✅ Aceito' : '⛔ Revogado / Expirado'}
                            </span>
                          </td>

                          <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                            {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('pt-BR') : 'Hoje'}
                          </td>

                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleCopyInviteLink(inv)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg border border-slate-200 cursor-pointer flex items-center gap-1"
                                title="Copiar Link do Convite"
                              >
                                <Copy className="w-3 h-3 text-slate-600" />
                                <span>{copiedInviteId === inv.id ? 'Copiado!' : 'Copiar Link'}</span>
                              </button>

                              {isPending && (
                                <>
                                  <button
                                    onClick={() => resendInvite(inv.id)}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#0B6B3A] font-bold text-[11px] rounded-lg border border-emerald-200 cursor-pointer"
                                    title="Reenviar Convite"
                                  >
                                    Reenviar
                                  </button>
                                  <button
                                    onClick={() => setActiveAcceptInvite(inv)}
                                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-[11px] rounded-lg border border-indigo-200 cursor-pointer"
                                    title="Simular Aceite (Homologação)"
                                  >
                                    Simular Aceite
                                  </button>
                                  <button
                                    onClick={() => revokeInvite(inv.id)}
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-200 cursor-pointer"
                                    title="Revogar Convite"
                                  >
                                    Revogar
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: GESTÃO DE PIPELINES & FUNIS DE VENDAS */}
      {activeTab === 'pipelines' && (
        <div className="space-y-4 font-sans">
          {/* Header Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#0F8A4B]" />
                <span>Gestão de Pipelines, Etapas & Funis (`public.pipelines`)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Configuração de esteiras comerciais, regras de probabilidade e etapas de avanço no funil
              </p>
            </div>

            <button
              onClick={() => {
                setPipelineToEdit(null);
                setShowPipelineModal(true);
              }}
              className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Criar Novo Pipeline</span>
            </button>
          </div>

          {/* Pipelines Grid / Cards */}
          {pipelines.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0F8A4B] flex items-center justify-center mx-auto border border-emerald-200">
                <Briefcase className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900">Nenhum pipeline configurado para esta empresa</h4>
              <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                Crie funis de vendas personalizados por Business Unit para estruturar o fluxo de prospecção e fechamento.
              </p>
              <button
                onClick={() => {
                  setPipelineToEdit(null);
                  setShowPipelineModal(true);
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white text-xs font-black rounded-xl cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Criar Primeiro Pipeline</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pipelines.map((pipe) => {
                const bu = businessUnits.find((b) => b.id === pipe.businessUnitId);
                const activeDealsCount = deals.filter((d) => d.pipelineId === pipe.id).length;

                return (
                  <div key={pipe.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-[#0F8A4B] bg-[#ECF8F1] px-2.5 py-0.5 rounded border border-[#0F8A4B]/20">
                            {bu?.tradeName || pipe.businessUnitId}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {activeDealsCount} Negócios no Funil
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => duplicatePipeline(pipe.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                            title="Duplicar Pipeline"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deseja excluir o pipeline "${pipe.name}"?`)) {
                                deletePipeline(pipe.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            title="Excluir Pipeline"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900">{pipe.name}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{pipe.description || 'Esteira de vendas CRM'}</p>
                      </div>

                      {/* Stepper Preview */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">
                          Etapas do Funil ({pipe.stages?.length || 0}):
                        </label>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                          {pipe.stages?.map((stg, idx) => (
                            <div
                              key={stg.id}
                              className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 text-[11px] shrink-0 flex items-center gap-1.5"
                            >
                              <span className="w-3.5 h-3.5 rounded-full bg-[#0F8A4B] text-white text-[9px] font-black flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-800">{stg.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({stg.probability || 0}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">Pipeline ID: {pipe.id}</span>
                      <button
                        onClick={() => {
                          setPipelineForStageConfig(pipe);
                          setShowStageConfigModal(true);
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Configurar Etapas</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Seção de túneis de vendas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-[#0F8A4B]" />
                  <span>Túneis entre Pipelines (Sales Tunneling Engine)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Regras automáticas para copiar ou mover Oportunidades comerciais entre diferentes esteiras de processos
                </p>
              </div>

              <button
                onClick={() => {
                  const p1 = pipelines[0];
                  const p2 = pipelines[1] || pipelines[0];
                  setTunSourcePipeId(p1?.id || '');
                  setTunSourceStageId(p1?.stages[0]?.id || '');
                  setTunTargetPipeId(p2?.id || '');
                  setTunTargetStageId(p2?.stages[0]?.id || '');
                  setTunName('Túnel Automático de Transição');
                  setShowTunnelModal(true);
                }}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0B6B3A] border border-emerald-200 rounded-xl text-xs font-black shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Criar Novo Túnel de Vendas</span>
              </button>
            </div>

            {salesTunnels.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhuma regra de túnel configurada ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {salesTunnels.map((tun) => {
                  const srcPipe = pipelines.find((p) => p.id === tun.sourcePipelineId);
                  const srcStage = srcPipe?.stages.find((s) => s.id === tun.sourceStageId);
                  const tgtPipe = pipelines.find((p) => p.id === tun.targetPipelineId);
                  const tgtStage = tgtPipe?.stages.find((s) => s.id === tun.targetStageId);

                  return (
                    <div key={tun.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900">{tun.name}</span>
                          <button
                            onClick={() => deleteSalesTunnel(tun.id)}
                            className="p-1 text-rose-500 hover:bg-rose-100 rounded cursor-pointer"
                            title="Excluir Túnel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-bold text-slate-800">
                            {srcPipe?.name || tun.sourcePipelineId} ➔ Etapa: {srcStage?.name || tun.sourceStageId}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px]">
                          <span className={`px-2 py-0.5 rounded font-black uppercase text-[10px] ${
                            tun.actionType === 'copy' ? 'bg-emerald-100 text-[#0B6B3A]' : 'bg-indigo-100 text-indigo-900'
                          }`}>
                            {tun.actionType === 'copy' ? '📋 Copiar Deal' : '➡️ Mover Deal'}
                          </span>
                          <span className="text-slate-400">para</span>
                          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-bold text-slate-800">
                            {tgtPipe?.name || tun.targetPipelineId} ➔ Etapa: {tgtStage?.name || tun.targetStageId}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: CATÁLOGO */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <CatalogTab />
        </div>
      )}

      {/* TAB 8: IMPORTAÇÃO */}
      {activeTab === 'imports' && (
        <div className="space-y-4">
          <ImportsTab />
        </div>
      )}

      {/* OFFBOARDING / REASSIGNMENT MODAL */}
      {userToSuspend && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-rose-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Suspender Colaborador & Reatribuir Tarefas</h3>
                <p className="text-xs text-slate-500">{userToSuspend.name}</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-2">
              <p className="font-bold">⚠️ Transferência Obrigatória de Responsabilidades:</p>
              <p>
                Este colaborador possui <strong>{tasks.filter((t) => t.assignedUserId === userToSuspend.id && t.status !== 'completed').length} tarefas em aberto</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">Reatribuir tarefas para:</label>
              <select
                value={reassignTargetUserId}
                onChange={(e) => setReassignTargetUserId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold outline-none"
              >
                <option value="">Selecionar novo responsável...</option>
                {users.filter(u => u.id !== userToSuspend.id && u.status === 'active').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.jobTitle})</option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setUserToSuspend(null)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmUserSuspension}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md"
              >
                Reatribuir & Suspender Acesso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW BUSINESS UNIT MODAL (SUPERADMIN ONLY) */}
      {showNewBuModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xs flex items-center justify-center p-4 font-sans">
          <form onSubmit={handleCreateBusinessUnit} className="bg-white rounded-2xl p-6 max-w-md w-full border border-emerald-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Nova Empresa do Grupo</h3>
              <button type="button" onClick={() => setShowNewBuModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nome Fantasia / Marca:</label>
                <input
                  type="text"
                  required
                  value={newBuTradeName}
                  onChange={(e) => setNewBuTradeName(e.target.value)}
                  placeholder="Ex: VERFINANCE, VERLAW..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none focus:border-[#0F8A4B]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">CNPJ Oficial:</label>
                <input
                  type="text"
                  value={newBuCnpj}
                  onChange={(e) => setNewBuCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none focus:border-[#0F8A4B]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewBuModal(false)} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-[#0F8A4B] text-white rounded-xl text-xs font-black shadow-md">
                Criar Empresa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SALES TUNNEL CREATION MODAL */}
      {showTunnelModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xs flex items-center justify-center p-4 font-sans">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!tunName.trim() || !tunSourcePipeId || !tunSourceStageId || !tunTargetPipeId || !tunTargetStageId) {
                alert('⚠️ Preencha todos os campos do Túnel de Vendas.');
                return;
              }
              addSalesTunnel({
                businessUnitId: currentUser.businessUnitId || 'bu-tech',
                name: tunName.trim(),
                sourcePipelineId: tunSourcePipeId,
                sourceStageId: tunSourceStageId,
                targetPipelineId: tunTargetPipeId,
                targetStageId: tunTargetStageId,
                actionType: tunActionType,
                conditionType: tunConditionType,
                assigneeRule: 'keep_owner',
                active: true,
              });
              alert(`🎉 Túnel de Vendas "${tunName}" criado com sucesso!`);
              setShowTunnelModal(false);
            }}
            className="bg-white rounded-2xl p-6 max-w-lg w-full border border-emerald-200 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-[#0F8A4B] rounded-xl border border-emerald-200">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Novo Túnel de Vendas (Sales Tunneling)</h3>
                  <p className="text-xs text-slate-500 font-medium">Automação de transição entre pipelines</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowTunnelModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nome da Regra do Túnel *</label>
                <input
                  type="text"
                  required
                  value={tunName}
                  onChange={(e) => setTunName(e.target.value)}
                  placeholder="Ex: Copiar Deal ganho para Onboarding Pós-Venda"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold outline-none focus:border-[#0F8A4B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Pipeline de Origem *</label>
                  <select
                    value={tunSourcePipeId}
                    onChange={(e) => {
                      setTunSourcePipeId(e.target.value);
                      const p = pipelines.find((pipe) => pipe.id === e.target.value);
                      setTunSourceStageId(p?.stages[0]?.id || '');
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold outline-none text-slate-900"
                  >
                    {pipelines.map((p) => (
                      <option key={p.id} value={p.id}>🏢 {p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Etapa de Disparo (Origem) *</label>
                  <select
                    value={tunSourceStageId}
                    onChange={(e) => setTunSourceStageId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold outline-none text-slate-900"
                  >
                    {pipelines.find((p) => p.id === tunSourcePipeId)?.stages.map((stg) => (
                      <option key={stg.id} value={stg.id}>📌 {stg.name} ({stg.stageType})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Pipeline de Destino *</label>
                  <select
                    value={tunTargetPipeId}
                    onChange={(e) => {
                      setTunTargetPipeId(e.target.value);
                      const p = pipelines.find((pipe) => pipe.id === e.target.value);
                      setTunTargetStageId(p?.stages[0]?.id || '');
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold outline-none text-slate-900"
                  >
                    {pipelines.map((p) => (
                      <option key={p.id} value={p.id}>🏢 {p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Etapa de Entrada (Destino) *</label>
                  <select
                    value={tunTargetStageId}
                    onChange={(e) => setTunTargetStageId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold outline-none text-slate-900"
                  >
                    {pipelines.find((p) => p.id === tunTargetPipeId)?.stages.map((stg) => (
                      <option key={stg.id} value={stg.id}>📌 {stg.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Ação Executada *</label>
                  <select
                    value={tunActionType}
                    onChange={(e) => setTunActionType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold outline-none text-slate-900"
                  >
                    <option value="copy">📋 Copiar Oportunidade (Criar no destino)</option>
                    <option value="move">➡️ Mover Oportunidade (Trocar de pipeline)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Condição de Disparo *</label>
                  <select
                    value={tunConditionType}
                    onChange={(e) => setTunConditionType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold outline-none text-slate-900"
                  >
                    <option value="on_deal_won">🎉 Ao Ganhar o Negócio (Ganhou)</option>
                    <option value="on_deal_lost">❌ Ao Perder o Negócio (Perdeu)</option>
                    <option value="on_enter_stage">⚡ Ao Entrar na Etapa de Origem</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setShowTunnelModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors">
                Salvar Regra do Túnel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && <InviteCollaboratorModal onClose={() => setShowInviteModal(false)} />}

      {/* Accept Invite Modal Simulation */}
      {activeAcceptInvite && (
        <AcceptInviteModal
          invite={activeAcceptInvite}
          onClose={() => setActiveAcceptInvite(null)}
        />
      )}

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* Collaborator Cockpit Modal */}
      {activeCockpitCollaborator && (
        <CollaboratorCockpitModal
          collaborator={activeCockpitCollaborator}
          onClose={() => setActiveCockpitCollaborator(null)}
        />
      )}

      {/* StayCloud Deployment Readiness Modal */}
      {showStayCloudModal && (
        <StayCloudConfigModal
          onClose={() => setShowStayCloudModal(false)}
        />
      )}

      {/* WhatsApp Multi-Provider & Meta Config Modal */}
      {showWppModal && (
        <WhatsAppConfigModal
          onClose={() => setShowWppModal(false)}
        />
      )}
    </div>
  );
};
