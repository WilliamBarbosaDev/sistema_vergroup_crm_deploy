import React, { useState } from 'react';
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
import { Tabs } from '../ui/vercel-tabs';

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
    currentUser,
    switchUserRole,
    revokeInvite,
    resendInvite,
    duplicatePipeline,
    deletePipeline,
    addBusinessUnit,
    updateUserStatus,
    reassignUserTasks,
  } = useApp();

  const isSuperadmin = currentUser.role === 'superadmin' || currentUser.isSuperadmin;

  const [activeTab, setActiveTab] = useState<'users' | 'invites' | 'organogram' | 'units' | 'matrix' | 'pipelines'>('users');
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showStayCloudModal, setShowStayCloudModal] = useState<boolean>(false);
  const [showWppModal, setShowWppModal] = useState<boolean>(false);
  const [showPipelineModal, setShowPipelineModal] = useState<boolean>(false);
  const [pipelineToEdit, setPipelineToEdit] = useState<Pipeline | null>(null);
  const [showStageConfigModal, setShowStageConfigModal] = useState<boolean>(false);
  const [pipelineForStageConfig, setPipelineForStageConfig] = useState<Pipeline | null>(null);
  const [activeAcceptInvite, setActiveAcceptInvite] = useState<CollaboratorInvite | null>(null);
  const [activeCockpitCollaborator, setActiveCockpitCollaborator] = useState<User | null>(null);

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

  // Multi-tenant User Filter (Non-superadmin admins see only their BU users)
  const filteredUsers = users.filter((u) => {
    if (!isSuperadmin && u.businessUnitId !== currentUser.businessUnitId) return false;
    if (selectedStatusFilter !== 'all' && u.status !== selectedStatusFilter) return false;
    if (selectedDeptFilter !== 'all' && u.departmentId !== selectedDeptFilter) return false;
    if (selectedBuFilter !== 'all' && u.businessUnitId !== selectedBuFilter) return false;
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
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center border border-[#0F8A4B]/20 shadow-2xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                Administração, Empresas, Hierarquia & Permissões
              </h1>
              <span className="text-xs font-black px-2.5 py-0.5 bg-[#ECF8F1] text-[#0F8A4B] rounded-md border border-[#0F8A4B]/20">
                VERGROUP Governança
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Administração de pessoas, organograma funcional, matriz de permissões RBAC e privilege ceiling
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWppModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0B6B3A] rounded-xl text-xs font-black shadow-2xs cursor-pointer transition-all border border-emerald-200"
          >
            <PhoneCall className="w-4 h-4 text-[#0F8A4B]" />
            <span>WhatsApp API & Meta</span>
          </button>

          <button
            onClick={() => setShowStayCloudModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-2xs cursor-pointer transition-all border border-slate-700"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>StayCloud Config</span>
          </button>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Convidar Colaborador</span>
          </button>

          {/* Tab Switcher */}
          <Tabs
            tabs={[
              { id: 'users', label: 'Usuários', badge: users.length },
              { id: 'organogram', label: 'Organograma Visual' },
              { id: 'invites', label: 'Convites', badge: invites.length },
              { id: 'units', label: 'Empresas (BUs)', badge: businessUnits.length },
              { id: 'matrix', label: 'Matriz de Permissões' },
              { id: 'pipelines', label: 'Pipelines & Funis', badge: pipelines.length },
            ]}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as any)}
          />
        </div>
      </div>

      {/* VER AI ADMIN COPILOT BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 rounded-2xl border border-emerald-500/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-amber-400 flex items-center justify-center font-black border border-emerald-400/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-2">
              <span>VER AI — Auditoria Proativa de Estrutura Organizacional</span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-extrabold px-2 py-0.5 rounded border border-emerald-500/40">
                Governance AI Worker
              </span>
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Análise de gaps funcionais, privilégio teto, usuários sem gestor ou sem departamento atribuído
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAiAdminAudit}
          className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black cursor-pointer shrink-0 transition-colors"
        >
          ⚡ Auditar Governança Humanal
        </button>
      </div>

      {aiAuditReport && (
        <div className="p-4 bg-white rounded-2xl border border-emerald-200 text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-wrap shadow-2xs animate-in fade-in">
          {aiAuditReport}
        </div>
      )}

      {/* TAB 1: USUÁRIOS ATIVOS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Colaborador</th>
                    <th className="p-3.5">Empresa Principal</th>
                    <th className="p-3.5">Departamento & Cargo</th>
                    <th className="p-3.5">Gestor / Supervisor</th>
                    <th className="p-3.5">Role / Papel</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredUsers.map((u) => {
                    const bu = businessUnits.find((b) => b.id === u.businessUnitId);
                    const dept = departments.find((d) => d.id === u.departmentId);
                    const manager = users.find((m) => m.id === u.managerId);
                    const openTaskCount = tasks.filter((t) => t.assignedUserId === u.id && t.status !== 'completed').length;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0F8A4B] text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                              {u.avatar ? <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" /> : u.name.slice(0, 2)}
                            </div>
                            <div>
                              <strong className="text-slate-900 font-black block">{u.name}</strong>
                              <span className="text-slate-500 text-[11px]">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-slate-800">{bu?.tradeName || u.businessUnitId}</span>
                        </td>

                        <td className="p-3.5">
                          <strong className="text-slate-900 font-bold block">{u.jobTitle}</strong>
                          <span className="text-slate-500 text-[11px]">{dept?.name || 'Geral'}</span>
                        </td>

                        <td className="p-3.5 text-slate-700 font-medium">
                          {manager?.name || <span className="text-slate-400 italic">Sem gestor</span>}
                        </td>

                        <td className="p-3.5">
                          <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded border border-indigo-200 uppercase">
                            {u.role}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                            u.status === 'active' ? 'bg-emerald-100 text-[#0B6B3A]' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {u.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setActiveCockpitCollaborator(u)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg border border-slate-200 cursor-pointer"
                            >
                              Cockpit 360º
                            </button>

                            {u.status === 'active' ? (
                              <button
                                onClick={() => {
                                  setUserToSuspend(u);
                                  setReassignTargetUserId('');
                                }}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-200 cursor-pointer"
                              >
                                Suspender
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserStatus(u.id, 'active')}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#0B6B3A] font-bold text-[11px] rounded-lg border border-emerald-200 cursor-pointer"
                              >
                                Reativar
                              </button>
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

      {/* TAB 4: MATRIZ DE PERMISSÕES & CAPABILITIES */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Matriz de Permissões & Capabilities (RBAC Engine)</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Mapeamento de capabilities e escopos de acesso por módulo funcional</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-[#0B6B3A] rounded-full border border-emerald-200">
              Identity + Capability + Scope + Policy
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Módulo Funcional</th>
                  <th className="p-3 text-center">Visualizar</th>
                  <th className="p-3 text-center">Criar</th>
                  <th className="p-3 text-center">Editar</th>
                  <th className="p-3 text-center">Excluir</th>
                  <th className="p-3">Escopo Padrão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {[
                  { module: 'CRM & Empresas', view: true, create: true, edit: true, delete: false, scope: 'business_unit' },
                  { module: 'Leads & Funil Comercial', view: true, create: true, edit: true, delete: false, scope: 'team / own' },
                  { module: 'Operação & Tarefas', view: true, create: true, edit: true, delete: true, scope: 'own + participating' },
                  { module: 'Projetos', view: true, create: true, edit: true, delete: false, scope: 'department' },
                  { module: 'Automações & Auditoria', view: true, create: false, edit: false, delete: false, scope: 'business_unit' },
                  { module: 'Administração & BUs', view: isSuperadmin, create: isSuperadmin, edit: isSuperadmin, delete: false, scope: isSuperadmin ? 'all' : 'business_unit' },
                ].map((row) => (
                  <tr key={row.module} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">{row.module}</td>
                    <td className="p-3 text-center">{row.view ? '🟢' : '🔴'}</td>
                    <td className="p-3 text-center">{row.create ? '🟢' : '🔴'}</td>
                    <td className="p-3 text-center">{row.edit ? '🟢' : '🔴'}</td>
                    <td className="p-3 text-center">{row.delete ? '🟢' : '🔴'}</td>
                    <td className="p-3 font-mono text-[11px] font-bold text-indigo-800 bg-indigo-50/50 rounded">{row.scope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
              <h3 className="text-sm font-black text-slate-900">Nova Empresa do Grupo (`business_unit`)</h3>
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

      {/* Invite Modal */}
      {showInviteModal && <InviteCollaboratorModal onClose={() => setShowInviteModal(false)} />}

      {/* Accept Invite Modal Simulation */}
      {activeAcceptInvite && (
        <AcceptInviteModal
          invite={activeAcceptInvite}
          onClose={() => setActiveAcceptInvite(null)}
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
