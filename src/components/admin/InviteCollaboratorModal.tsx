import React, { useState, useMemo } from 'react';
import {
  X,
  Link,
  Mail,
  UserPlus,
  ShieldAlert,
  Users,
  UserCheck,
  CheckCircle2,
  Copy,
  Plus,
  Sparkles,
  Shield,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, InviteType } from '../../types';

interface InviteCollaboratorModalProps {
  onClose: () => void;
}

export const InviteCollaboratorModal: React.FC<InviteCollaboratorModalProps> = ({ onClose }) => {
  const {
    businessUnits,
    departments,
    teams,
    users,
    currentUser,
    createInvite,
    createUserDirectly,
    addDepartment,
    addTeam,
  } = useApp();

  const [activeTab, setActiveTab] = useState<InviteType>('link');

  // Derive the best default BU (current user's BU, or first available)
  const defaultBuId = useMemo(() => {
    if (currentUser.primaryBusinessUnitId && businessUnits.some(b => b.id === currentUser.primaryBusinessUnitId)) {
      return currentUser.primaryBusinessUnitId;
    }
    return businessUnits[0]?.id || '';
  }, [currentUser, businessUnits]);

  // Form State
  const [selectedBuId, setSelectedBuId] = useState<string>(defaultBuId);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('collaborator');
  const [jobTitle, setJobTitle] = useState<string>('Analista / Colaborador');
  const [managerId, setManagerId] = useState<string>(currentUser.id);

  // Link Options
  const [expirationDays, setExpirationDays] = useState<number>(7);
  const [maxUses, setMaxUses] = useState<number>(1);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Email / Batch Options
  const [emailBatch, setEmailBatch] = useState<{ email: string; name: string; phone: string }[]>([
    { email: '', name: '', phone: '' },
  ]);

  // Direct User Options
  const [directName, setDirectName] = useState<string>('');
  const [directEmail, setDirectEmail] = useState<string>('');
  const [sendInviteImmediately, setSendInviteImmediately] = useState<boolean>(true);

  // External Partner Options
  const [externalEmail, setExternalEmail] = useState<string>('');
  const [externalName, setExternalName] = useState<string>('');
  const [externalAccessDays, setExternalAccessDays] = useState<number>(30);
  const [allowedResources, setAllowedResources] = useState<string>('Projeto Específico & Tarefas atribuídas');

  // Quick Department Creation State
  const [showAddDept, setShowAddDept] = useState<boolean>(false);
  const [newDeptName, setNewDeptName] = useState<string>('');

  // Quick Team Creation State
  const [showAddTeam, setShowAddTeam] = useState<boolean>(false);
  const [newTeamName, setNewTeamName] = useState<string>('');

  // Success Feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtered lists based on selected BU
  const availableDepts = useMemo(() => {
    if (!selectedBuId) return departments;
    return departments.filter(d => d.businessUnitId === selectedBuId);
  }, [departments, selectedBuId]);

  const availableTeams = useMemo(() => {
    if (!selectedDeptId) return [];
    return teams.filter(t => t.departmentId === selectedDeptId);
  }, [teams, selectedDeptId]);

  // Update dept selection when BU changes
  const handleBuChange = (buId: string) => {
    setSelectedBuId(buId);
    const deptsForBu = departments.filter(d => d.businessUnitId === buId);
    setSelectedDeptId(deptsForBu[0]?.id || '');
    setSelectedTeamId('');
    setGeneratedLink(null);
  };

  // Generate Invite Link
  const handleGenerateLink = () => {
    const invite = createInvite({
      type: 'link',
      businessUnitId: selectedBuId || 'sem-bu',
      departmentId: selectedDeptId || 'sem-dept',
      teamId: selectedTeamId || undefined,
      jobTitle: jobTitle,
      role: selectedRole,
      managerId: managerId || undefined,
      status: 'pending',
      expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString(),
      maxUses: maxUses,
      invitedByUserId: currentUser.id,
    });

    const link = `${window.location.origin}/invite/${invite.token}`;
    setGeneratedLink(link);
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink).catch(() => {
        // Fallback for environments without clipboard API
        const el = document.createElement('textarea');
        el.value = generatedLink;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      });
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Send Email / Batch Invites
  const handleSendEmailInvites = (e: React.FormEvent) => {
    e.preventDefault();
    const validEmails = emailBatch.filter(item => item.email.trim() !== '');
    if (validEmails.length === 0) return;

    validEmails.forEach(item => {
      createInvite({
        type: 'email',
        email: item.email,
        name: item.name || undefined,
        phone: item.phone || undefined,
        businessUnitId: selectedBuId || 'sem-bu',
        departmentId: selectedDeptId || 'sem-dept',
        teamId: selectedTeamId || undefined,
        jobTitle: jobTitle,
        role: selectedRole,
        managerId: managerId || undefined,
        status: 'pending',
        expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString(),
        invitedByUserId: currentUser.id,
      });
    });

    setSuccessMessage(`✅ ${validEmails.length} convite(s) registrado(s) com sucesso! O envio real de e-mail requer integração com provedor SMTP.`);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 3000);
  };

  // Direct User Creation
  const handleCreateDirectUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directName || !directEmail) return;

    createUserDirectly(
      {
        name: directName,
        email: directEmail,
        role: selectedRole,
        primaryBusinessUnitId: selectedBuId || undefined,
        businessUnitIds: selectedBuId ? [selectedBuId] : [],
        departmentId: selectedDeptId || undefined,
        teamId: selectedTeamId || undefined,
        jobTitle: jobTitle,
        managerId: managerId || undefined,
      },
      sendInviteImmediately
    );

    setSuccessMessage(
      sendInviteImmediately
        ? `✅ Usuário ${directName} cadastrado e ativado no sistema!`
        : `✅ Usuário ${directName} cadastrado. Convite pendente de envio.`
    );
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 2500);
  };

  // External Partner Invite
  const handleInviteExternal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalEmail || !externalName) return;

    createInvite({
      type: 'external',
      email: externalEmail,
      name: externalName,
      businessUnitId: selectedBuId || 'sem-bu',
      departmentId: selectedDeptId || 'sem-dept',
      jobTitle: `Parceiro Externo / ${jobTitle}`,
      role: 'viewer',
      status: 'pending',
      expiresAt: new Date(Date.now() + externalAccessDays * 24 * 60 * 60 * 1000).toISOString(),
      isExternal: true,
      externalAccessDays: externalAccessDays,
      accessExpiresAt: new Date(Date.now() + externalAccessDays * 24 * 60 * 60 * 1000).toISOString(),
      invitedByUserId: currentUser.id,
    });

    setSuccessMessage(`✅ Convite para ${externalName} registrado com acesso restrito e expiração em ${externalAccessDays} dias.`);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 2500);
  };

  // Quick Create Department
  const handleQuickAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    const newDept = addDepartment({
      name: newDeptName.trim(),
      businessUnitId: selectedBuId || 'sem-bu',
      leaderId: currentUser.id,
    });
    setSelectedDeptId(newDept.id);
    setNewDeptName('');
    setShowAddDept(false);
  };

  // Quick Create Team
  const handleQuickAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    const newTeam = addTeam({
      name: newTeamName.trim(),
      departmentId: selectedDeptId,
      businessUnitId: selectedBuId || 'sem-bu',
      leaderId: currentUser.id,
    });
    setSelectedTeamId(newTeam.id);
    setNewTeamName('');
    setShowAddTeam(false);
  };

  const inputCls = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0F8A4B] focus:ring-1 focus:ring-[#0F8A4B]/30 font-semibold text-slate-800 text-xs transition-all';
  const labelCls = 'block text-slate-700 font-extrabold mb-1 text-xs';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center border border-[#0F8A4B]/20 shadow-2xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                Convidar Colaborador ou Parceiro
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Entrada segura com mapeamento organizacional, papéis RBAC e rastreabilidade total
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 py-2 bg-slate-50/80 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {([
            { id: 'link', label: '1. Por Link Seguro', icon: Link },
            { id: 'email', label: '2. Por E-mail / Em Massa', icon: Mail },
            { id: 'direct', label: '3. Criar Diretamente', icon: UserCheck },
            { id: 'external', label: '4. Parceiro Externo', icon: ShieldAlert },
          ] as { id: InviteType; label: string; icon: React.ElementType }[]).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#0F8A4B] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/40 text-xs">
          {/* Success Message */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0F8A4B] font-bold flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Empty State Warning if no BUs configured */}
          {businessUnits.length === 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-semibold flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-black">Nenhuma Business Unit cadastrada</p>
                <p className="text-[11px] mt-0.5 text-amber-700">Vá em <strong>Administração → Business Units</strong> e cadastre ao menos uma empresa antes de convidar colaboradores.</p>
              </div>
            </div>
          )}

          {/* ORGANIZATIONAL DESTINATION SELECTOR (COMMON TO ALL FLOWS) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider block flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#0F8A4B]" />
              Destino Organizacional & Permissões RBAC
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Business Unit Selector */}
              <div>
                <label className={labelCls}>
                  <Building2 className="w-3 h-3 inline mr-1 text-slate-400" />
                  Empresa / Business Unit *
                </label>
                {businessUnits.length === 0 ? (
                  <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 text-xs font-medium">
                    Nenhuma BU cadastrada
                  </div>
                ) : (
                  <select
                    value={selectedBuId}
                    onChange={(e) => handleBuChange(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Selecione a empresa...</option>
                    {businessUnits.map((bu) => (
                      <option key={bu.id} value={bu.id}>
                        {bu.tradeName || bu.name} ({bu.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Department Selector with Quick Create */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-extrabold text-xs">
                    Departamento
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddDept(!showAddDept)}
                    className="text-[11px] text-[#0F8A4B] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Criar departamento</span>
                  </button>
                </div>

                {showAddDept ? (
                  <form onSubmit={handleQuickAddDepartment} className="flex gap-1.5">
                    <input
                      type="text"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="Nome do departamento..."
                      className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0F8A4B]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#0F8A4B] text-white font-bold rounded-lg hover:bg-[#0B6B3A] cursor-pointer text-xs"
                    >
                      Criar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddDept(false); setNewDeptName(''); }}
                      className="px-2 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 cursor-pointer text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </form>
                ) : (
                  <select
                    value={selectedDeptId}
                    onChange={(e) => { setSelectedDeptId(e.target.value); setSelectedTeamId(''); }}
                    className={inputCls}
                  >
                    <option value="">Sem departamento específico</option>
                    {availableDepts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Team Selector with Quick Create */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-extrabold text-xs">
                    <Users className="w-3 h-3 inline mr-1 text-slate-400" />
                    Equipe / Grupo de Trabalho
                  </label>
                  {selectedDeptId && (
                    <button
                      type="button"
                      onClick={() => setShowAddTeam(!showAddTeam)}
                      className="text-[11px] text-[#0F8A4B] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Criar equipe</span>
                    </button>
                  )}
                </div>

                {showAddTeam ? (
                  <form onSubmit={handleQuickAddTeam} className="flex gap-1.5">
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Nome da equipe..."
                      className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0F8A4B]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#0F8A4B] text-white font-bold rounded-lg hover:bg-[#0B6B3A] cursor-pointer text-xs"
                    >
                      Criar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddTeam(false); setNewTeamName(''); }}
                      className="px-2 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg cursor-pointer text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </form>
                ) : (
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className={inputCls}
                    disabled={!selectedDeptId}
                  >
                    <option value="">Nenhuma equipe específica</option>
                    {availableTeams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Role RBAC Selector */}
              <div>
                <label className={labelCls}>
                  <Shield className="w-3 h-3 inline mr-1 text-slate-400" />
                  Papel de Segurança (RBAC) *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className={inputCls}
                >
                  <option value="collaborator">Colaborador / Operador</option>
                  <option value="sales">Vendedor / SDR / Closer</option>
                  <option value="operator">Operador Técnico / Suporte</option>
                  <option value="manager">Gestor de Setor / Unidade</option>
                  <option value="director">Diretor / C-Level</option>
                  <option value="auditor">Auditor / Compliance</option>
                  <option value="viewer">Visualizador (somente leitura)</option>
                </select>
              </div>

              {/* Job Title */}
              <div>
                <label className={labelCls}>Cargo / Função Organizacional *</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex: Analista Fiscal Sr., Designer, SDR..."
                  className={inputCls}
                />
              </div>

              {/* Manager Selector */}
              <div>
                <label className={labelCls}>Gestor Direto *</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Sem gestor definido</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.jobTitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── TAB 1: LINK INVITE ── */}
          {activeTab === 'link' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                Configurações do Link Criptográfico
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelCls}>Validade do Convite</label>
                  <select
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(Number(e.target.value))}
                    className={inputCls}
                  >
                    <option value={1}>24 Horas</option>
                    <option value={3}>3 Dias</option>
                    <option value={7}>7 Dias (Recomendado)</option>
                    <option value={30}>30 Dias</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Limite de Usos do Link</label>
                  <select
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className={inputCls}
                  >
                    <option value={1}>Uso Único (1 Pessoa)</option>
                    <option value={5}>Até 5 Pessoas</option>
                    <option value={10}>Até 10 Pessoas</option>
                    <option value={50}>Múltiplos (Até 50 Pessoas)</option>
                  </select>
                </div>
              </div>

              {!generatedLink ? (
                <button
                  type="button"
                  onClick={handleGenerateLink}
                  className="w-full py-3 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <Link className="w-4 h-4" />
                  <span>Gerar Link Seguro de Convite</span>
                </button>
              ) : (
                <div className="space-y-3 pt-2 animate-in fade-in">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-emerald-800 truncate flex-1">{generatedLink}</span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shrink-0 text-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedLink ? '✓ Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Link gerado com token único criptograficamente seguro e rastreável.
                  </p>
                  <button
                    type="button"
                    onClick={() => setGeneratedLink(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium underline cursor-pointer"
                  >
                    Gerar novo link
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: EMAIL / BATCH INVITE ── */}
          {activeTab === 'email' && (
            <form onSubmit={handleSendEmailInvites} className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Envio Direto por E-mail (Em Massa)
                </span>
                <button
                  type="button"
                  onClick={() => setEmailBatch([...emailBatch, { email: '', name: '', phone: '' }])}
                  className="text-xs text-[#0F8A4B] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Adicionar pessoa</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {emailBatch.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/70 relative group">
                    <input
                      type="email"
                      required
                      placeholder="E-mail do colaborador *"
                      value={item.email}
                      onChange={(e) => {
                        const updated = [...emailBatch];
                        updated[idx].email = e.target.value;
                        setEmailBatch(updated);
                      }}
                      className={inputCls}
                    />
                    <input
                      type="text"
                      placeholder="Nome completo (opcional)"
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...emailBatch];
                        updated[idx].name = e.target.value;
                        setEmailBatch(updated);
                      }}
                      className={inputCls}
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Telefone / WhatsApp"
                        value={item.phone}
                        onChange={(e) => {
                          const updated = [...emailBatch];
                          updated[idx].phone = e.target.value;
                          setEmailBatch(updated);
                        }}
                        className={inputCls}
                      />
                      {emailBatch.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setEmailBatch(emailBatch.filter((_, i) => i !== idx))}
                          className="shrink-0 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar Convites por E-mail ({emailBatch.filter(i => i.email).length})</span>
              </button>
            </form>
          )}

          {/* ── TAB 3: DIRECT USER CREATION ── */}
          {activeTab === 'direct' && (
            <form onSubmit={handleCreateDirectUser} className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                Cadastro Direto de Usuário no Sistema
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelCls}>Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    placeholder="Ex: Roberto da Silva"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>E-mail Corporativo *</label>
                  <input
                    type="email"
                    required
                    value={directEmail}
                    onChange={(e) => setDirectEmail(e.target.value)}
                    placeholder="roberto@vergroup.com.br"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center gap-3">
                <input
                  type="checkbox"
                  id="dont-send-invite-checkbox"
                  checked={!sendInviteImmediately}
                  onChange={(e) => setSendInviteImmediately(!e.target.checked)}
                  className="w-4 h-4 accent-[#0F8A4B] cursor-pointer shrink-0"
                />
                <label htmlFor="dont-send-invite-checkbox" className="text-xs text-amber-900 font-semibold cursor-pointer leading-relaxed">
                  Cadastrar sem enviar convite agora (status: <em>Convite Pendente</em>)
                </label>
              </div>

              <div className="p-3.5 bg-blue-50/60 border border-blue-200/60 rounded-xl flex items-start gap-2 text-blue-800 text-[11px] font-medium">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                <span>O usuário será criado com perfil ativo no sistema e acesso imediato ao painel VERGROUP. Ele receberá tarefas de onboarding automaticamente.</span>
              </div>

              <button
                type="submit"
                disabled={!directName || !directEmail}
                className="w-full py-3 bg-[#0F8A4B] hover:bg-[#0B6B3A] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <UserCheck className="w-4 h-4" />
                <span>Cadastrar Usuário Direto</span>
              </button>
            </form>
          )}

          {/* ── TAB 4: EXTERNAL PARTNER ── */}
          {activeTab === 'external' && (
            <form onSubmit={handleInviteExternal} className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wider block flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Convidar Parceiro / Colaborador Externo (Mínimo Privilégio)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelCls}>Nome do Parceiro / Empresa *</label>
                  <input
                    type="text"
                    required
                    value={externalName}
                    onChange={(e) => setExternalName(e.target.value)}
                    placeholder="Ex: Dr. Fernando (Auditor LGPD)"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>E-mail do Parceiro *</label>
                  <input
                    type="email"
                    required
                    value={externalEmail}
                    onChange={(e) => setExternalEmail(e.target.value)}
                    placeholder="parceiro@empresaexterna.com"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Expiração do Acesso Externo</label>
                  <select
                    value={externalAccessDays}
                    onChange={(e) => setExternalAccessDays(Number(e.target.value))}
                    className={inputCls}
                  >
                    <option value={30}>30 Dias</option>
                    <option value={60}>60 Dias</option>
                    <option value={90}>90 Dias (Padrão Consultoria)</option>
                    <option value={180}>180 Dias</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Recursos Autorizados</label>
                  <input
                    type="text"
                    value={allowedResources}
                    onChange={(e) => setAllowedResources(e.target.value)}
                    placeholder="Ex: Projeto LGPD & Tarefas atribuídas"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-100 rounded-xl text-[11px] text-slate-600 font-medium leading-relaxed">
                🔒 <strong>Mínimo Privilégio Ativo:</strong> Parceiros externos não possuem acesso global a finanças, RH ou auditorias. Acesso limitado apenas aos recursos atribuídos e expira automaticamente após o período selecionado.
              </div>

              <button
                type="submit"
                disabled={!externalEmail || !externalName}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Enviar Convite Restrito a Parceiro Externo</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
