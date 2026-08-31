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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, CollaboratorInvite } from '../../types';
import { InviteCollaboratorModal } from './InviteCollaboratorModal';
import { AcceptInviteModal } from './AcceptInviteModal';
import { CollaboratorCockpitModal } from './CollaboratorCockpitModal';
import { User } from '../../types';

export const AdminView: React.FC = () => {
  const {
    businessUnits,
    departments,
    teams,
    users,
    invites,
    onboardingTasks,
    currentUser,
    switchUserRole,
    revokeInvite,
    resendInvite,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'invites' | 'units' | 'rbac'>('users');
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [activeAcceptInvite, setActiveAcceptInvite] = useState<CollaboratorInvite | null>(null);
  const [activeCockpitCollaborator, setActiveCockpitCollaborator] = useState<User | null>(null);

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
  const expiredInvitesCount = invites.filter(i => i.status === 'expired').length;
  const externalPartnersCount = users.filter(u => u.isExternal).length + invites.filter(i => i.isExternal && i.status === 'pending').length;

  const handleCopyInviteLink = (inv: CollaboratorInvite) => {
    const link = `${window.location.origin}/invite/${inv.token}`;
    navigator.clipboard.writeText(link);
    setCopiedInviteId(inv.id);
    setTimeout(() => setCopiedInviteId(null), 2500);
  };

  const getInviteStatusBadge = (status: CollaboratorInvite['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-50 text-amber-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md border border-amber-200">Pendente</span>;
      case 'accepted':
        return <span className="bg-emerald-50 text-[#0F8A4B] font-extrabold text-[10px] px-2.5 py-0.5 rounded-md border border-emerald-200">Aceito</span>;
      case 'expired':
        return <span className="bg-rose-50 text-rose-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md border border-rose-200">Expirado</span>;
      case 'revoked':
        return <span className="bg-slate-100 text-slate-600 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md border border-slate-200">Revogado</span>;
      case 'invite_not_sent':
        return <span className="bg-purple-50 text-purple-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md border border-purple-200">Convite Não Enviado</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md border border-slate-200">{status}</span>;
    }
  };

  // Filtered Invites
  const filteredInvites = invites.filter(i => {
    if (selectedStatusFilter !== 'all' && i.status !== selectedStatusFilter) return false;
    if (selectedDeptFilter !== 'all' && i.departmentId !== selectedDeptFilter) return false;
    if (selectedBuFilter !== 'all' && i.businessUnitId !== selectedBuFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = (i.name || '').toLowerCase().includes(term);
      const matchEmail = (i.email || '').toLowerCase().includes(term);
      const matchJob = i.jobTitle.toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchJob) return false;
    }
    return true;
  });

  return (
    <div id="admin-view" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center border border-[#0F8A4B]/20 shadow-2xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                Administração & Gestão de Colaboradores
              </h1>
              <span className="text-xs font-black px-2.5 py-0.5 bg-[#ECF8F1] text-[#0F8A4B] rounded-md border border-[#0F8A4B]/20">
                VERGROUP Corp
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Entrada de colaboradores, gestão de convites, organograma funcional e controle RBAC (PRD 5.1 & 7.1)
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-sm shadow-emerald-700/20 hover:shadow-md cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Convidar Colaborador</span>
          </button>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'users' ? 'bg-white shadow-2xs text-[#0F8A4B] font-black' : 'text-slate-600'
              }`}
            >
              Usuários Ativos ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('invites')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'invites' ? 'bg-white shadow-2xs text-[#0F8A4B] font-black' : 'text-slate-600'
              }`}
            >
              Gestão de Convites ({invites.length})
            </button>

            <button
              onClick={() => setActiveTab('units')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'units' ? 'bg-white shadow-2xs text-[#0F8A4B] font-black' : 'text-slate-600'
              }`}
            >
              Unidades ({businessUnits.length})
            </button>

            <button
              onClick={() => setActiveTab('rbac')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'rbac' ? 'bg-white shadow-2xs text-[#0F8A4B] font-black' : 'text-slate-600'
              }`}
            >
              Matriz RBAC
            </button>
          </div>
        </div>
      </div>

      {/* METRICS CARDS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Usuários Ativos</span>
            <span className="text-2xl font-black text-slate-900">{activeUsersCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F8A4B] flex items-center justify-center border border-emerald-200/80">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Convites Pendentes</span>
            <span className="text-2xl font-black text-amber-600">{pendingInvitesCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Convites Expirados</span>
            <span className="text-2xl font-black text-rose-600">{expiredInvitesCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/80">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Parceiros Externos</span>
            <span className="text-2xl font-black text-purple-700">{externalPartnersCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/80">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Quadro de Colaboradores e Perfis Ativos
            </h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="text-xs text-[#0F8A4B] font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Adicionar colaborador</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Colaborador</th>
                  <th className="p-3.5">Cargo / Função</th>
                  <th className="p-3.5">Departamento & Equipe</th>
                  <th className="p-3.5">Papel RBAC</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const dept = departments.find((d) => d.id === u.departmentId);
                  const team = teams.find((t) => t.id === u.teamId);
                  const isCurrent = u.id === currentUser.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs" />
                          <div>
                            <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && <span className="text-[#0F8A4B] text-[10px] font-black">(Você)</span>}
                              {u.isExternal && (
                                <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 text-[9px] font-extrabold rounded border border-purple-200">
                                  EXTERNO
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-900 font-bold">{u.jobTitle}</td>
                      <td className="p-3.5 text-slate-600 font-semibold">
                        <p>{dept?.name || 'Geral'}</p>
                        {team && <p className="text-[10px] text-slate-400 font-medium">Equipe: {team.name}</p>}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-[#ECF8F1] text-[#0F8A4B] uppercase font-black text-[10px] px-2.5 py-0.5 rounded-md border border-[#0F8A4B]/20">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-[#0F8A4B] font-extrabold text-xs flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Ativo</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveCockpitCollaborator(u)}
                            className="px-3 py-1 bg-[#0F8A4B] text-white hover:bg-[#0B6B3A] font-extrabold rounded-lg text-[11px] transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                            title="Abrir Central Individual de Trabalho do Colaborador"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Abrir Cockpit</span>
                          </button>

                          <button
                            onClick={() => switchUserRole(u.role)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                          >
                            Simular
                          </button>
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

      {/* TAB 2: INVITES MANAGEMENT */}
      {activeTab === 'invites' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, e-mail ou cargo..."
                className="w-full bg-transparent outline-none font-semibold text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-2.5 py-1 border border-slate-200 rounded-lg bg-white outline-none cursor-pointer text-slate-800"
                >
                  <option value="all">Todos os Status</option>
                  <option value="pending">Pendente</option>
                  <option value="accepted">Aceito</option>
                  <option value="expired">Expirado</option>
                  <option value="revoked">Revogado</option>
                  <option value="invite_not_sent">Convite Não Enviado</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span>Departamento:</span>
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="px-2.5 py-1 border border-slate-200 rounded-lg bg-white outline-none cursor-pointer text-slate-800"
                >
                  <option value="all">Todos os Departamentos</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Invites Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Convidado / E-mail</th>
                    <th className="p-3.5">Método</th>
                    <th className="p-3.5">Departamento & Cargo</th>
                    <th className="p-3.5">Papel Atribuído</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvites.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                        Nenhum convite encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredInvites.map((inv) => {
                      const dept = departments.find((d) => d.id === inv.departmentId);

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <p className="font-extrabold text-slate-900">{inv.name || 'Convidado via Link'}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{inv.email || 'Link público gerado'}</p>
                          </td>
                          <td className="p-3.5 font-bold">
                            <span className="capitalize px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">
                              {inv.type}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-800 font-semibold">
                            <p>{dept?.name || 'Geral'}</p>
                            <p className="text-[10px] text-slate-500 font-normal">{inv.jobTitle}</p>
                          </td>
                          <td className="p-3.5">
                            <span className="bg-[#ECF8F1] text-[#0F8A4B] uppercase font-black text-[10px] px-2.5 py-0.5 rounded-md border border-[#0F8A4B]/20">
                              {inv.role}
                            </span>
                          </td>
                          <td className="p-3.5">{getInviteStatusBadge(inv.status)}</td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {inv.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleCopyInviteLink(inv)}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                                    title="Copiar Link Seguro de Convite"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>{copiedInviteId === inv.id ? 'Copiado!' : 'Link'}</span>
                                  </button>
                                  <button
                                    onClick={() => resendInvite(inv.id)}
                                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Reenviar</span>
                                  </button>
                                  <button
                                    onClick={() => revokeInvite(inv.id)}
                                    className="px-2.5 py-1 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-rose-700 font-bold rounded-lg text-[11px] cursor-pointer"
                                  >
                                    Revogar
                                  </button>
                                  <button
                                    onClick={() => setActiveAcceptInvite(inv)}
                                    className="px-2.5 py-1 bg-[#0F8A4B] text-white hover:bg-[#0B6B3A] font-extrabold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
                                    title="Simular Aceite do Convite pelo Colaborador"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    <span>Simular Aceite</span>
                                  </button>
                                </>
                              )}
                              {inv.status === 'invite_not_sent' && (
                                <button
                                  onClick={() => resendInvite(inv.id)}
                                  className="px-3 py-1 bg-[#0F8A4B] text-white font-extrabold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>Enviar Convite Agora</span>
                                </button>
                              )}
                              {inv.status === 'accepted' && (
                                <span className="text-[11px] text-[#0F8A4B] font-extrabold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UNITS */}
      {activeTab === 'units' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businessUnits.map((bu) => (
            <div key={bu.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ECF8F1] text-[#0F8A4B] font-black text-base flex items-center justify-center border border-[#0F8A4B]/20">
                  {bu.code}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{bu.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">CNPJ: {bu.cnpj || '—'}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{bu.segment}</p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Status: <strong className="text-[#0F8A4B]">Ativa no Grupo</strong></span>
                <span>Ambiente Seguro RLS</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: RBAC MATRIX */}
      {activeTab === 'rbac' && (
        <div className="space-y-4">
          <div className="bg-[#ECF8F1] p-4.5 rounded-2xl border border-[#0F8A4B]/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#0F8A4B] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-800">
              <p className="font-black">Simulador de Controle de Acesso Baseado em Papéis (RBAC):</p>
              <p className="text-slate-600 mt-0.5 font-medium">
                Alterne o papel ativo a qualquer momento no cabeçalho ou abaixo para verificar como as telas se adaptam para Vendedores, Gerentes, Diretores e Auditores.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rolesList.map((r) => {
              const isSelected = currentUser.role === r.role;

              return (
                <div
                  key={r.role}
                  className={`bg-white p-5 rounded-2xl border shadow-2xs space-y-3 flex flex-col justify-between transition-all ${
                    isSelected ? 'border-[#0F8A4B] ring-2 ring-[#0F8A4B]/20 bg-[#F7FAF8]' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider">{r.name}</h4>
                      {isSelected && (
                        <span className="bg-[#0F8A4B] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          Papel Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{r.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">Escopo: <strong>{r.access}</strong></span>
                    <button
                      onClick={() => switchUserRole(r.role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#0F8A4B] text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {isSelected ? 'Ativo' : 'Simular Papel'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
    </div>
  );
};
