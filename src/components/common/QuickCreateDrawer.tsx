import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  UserCheck,
  Building2,
  CheckCircle2,
  Clock,
  Check,
  FolderKanban,
  User,
  Search,
  Plus,
  FileCheck,
  AlertCircle,
  MapPin,
  PhoneCall,
  DollarSign,
  Share2,
  Globe,
  Mail,
  HelpCircle,
  Lock,
  Eye,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskPriority } from '../../types';
import { AiToolRegistryService } from '../../services/aiToolRegistry';

export const QuickCreateDrawer: React.FC = () => {
  const {
    quickCreateType,
    setQuickCreateType,
    selectedBusinessUnitId,
    businessUnits,
    pipelines,
    contacts,
    companies,
    users,
    currentUser,
    projects,
    tasks,
    deals,
    leads,
    addDeal,
    addLead,
    addContact,
    addCompany,
    addTask,
    addProject,
    addCalendarEvent,
    checkDuplicate,
  } = useApp();

  const activeBUId = selectedBusinessUnitId === 'bu-all' ? 'bu-tech' : selectedBusinessUnitId;

  // Form states - 1. Deal (5 Blocos Estruturados)
  const [dealTitle, setDealTitle] = useState('');
  const [dealValue, setDealValue] = useState('50000');
  const [dealPipelineId, setDealPipelineId] = useState(pipelines[0]?.id || 'pipe-ver-clientes');
  const [dealStageId, setDealStageId] = useState('');
  const [dealContactId, setDealContactId] = useState('');
  const [dealCompanyId, setDealCompanyId] = useState('');
  const [dealAssigneeId, setDealAssigneeId] = useState(users[0]?.id || 'usr-william');
  const [dealCloseDate, setDealCloseDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [dealService, setDealService] = useState('Licenciamento SaaS & BPO');
  const [dealNotes, setDealNotes] = useState('');
  const [dealCustomFieldValues, setDealCustomFieldValues] = useState<Record<string, string>>({});
  const [dealBUId, setDealBUId] = useState(activeBUId);
  const [dealSource, setDealSource] = useState('Outbound Comercial / SDR');
  const [dealProbability, setDealProbability] = useState('50');
  const [dealPriority, setDealPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  // Autocomplete Searches for Contact & Company
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [companySearchQuery, setCompanySearchQuery] = useState('');

  // 2. Lead (7 BLOCOS ESTRUTURADOS CRM 2.0)
  const [leadTitle, setLeadTitle] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadWhatsapp, setLeadWhatsapp] = useState('');
  const [leadDoc, setLeadDoc] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadJob, setLeadJob] = useState('');
  const [leadCity, setLeadCity] = useState('');
  const [leadState, setLeadState] = useState('');
  const [leadSource, setLeadSource] = useState<any>('whatsapp');
  const [leadService, setLeadService] = useState('BPO Financeiro / SaaS');
  const [leadPlan, setLeadPlan] = useState('Padrão');
  const [leadMainNeed, setLeadMainNeed] = useState('');
  const [leadEstValue, setLeadEstValue] = useState('30000');
  const [leadRevenue, setLeadRevenue] = useState('100000');
  const [leadEmployees, setLeadEmployees] = useState('15');
  const [leadPriority, setLeadPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [leadCloseDate, setLeadCloseDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [leadAssigneeId, setLeadAssigneeId] = useState(users[0]?.id || 'usr-william');
  const [leadBUId, setLeadBUId] = useState(activeBUId);
  const [leadPipelineId, setLeadPipelineId] = useState(pipelines[0]?.id || 'pipe-ver-clientes');
  const [leadStageId, setLeadStageId] = useState('');
  const [leadNotes, setLeadNotes] = useState('');
  const [leadDupWarning, setLeadDupWarning] = useState<string | null>(null);

  // 3. PROJECT FORM (5 BLOCOS ESTRUTURADOS DE PROJETO)
  const [projName, setProjName] = useState('');
  const [projObjective, setProjObjective] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projBUId, setProjBUId] = useState(activeBUId);
  const [projCode, setProjCode] = useState(`PRJ-${new Date().getFullYear()}-${String(projects.length + 1).padStart(4, '0')}`);
  const [projOwnerId, setProjOwnerId] = useState(currentUser.id);
  const [projModeratorIds, setProjModeratorIds] = useState<string[]>([]);
  const [projMemberIds, setProjMemberIds] = useState<string[]>([currentUser.id]);
  const [projPrivacy, setProjPrivacy] = useState<'public' | 'private'>('private');
  const [projCompanyId, setProjCompanyId] = useState('');
  const [projServiceCat, setProjServiceCat] = useState('Operacional / Implantação');
  const [projStartDate, setProjStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [projEndDate, setProjEndDate] = useState(new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]);
  const [projBudget, setProjBudget] = useState('100000');

  // 4. Contact
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactDoc, setContactDoc] = useState('');
  const [contactCompanyId, setContactCompanyId] = useState('');
  const [contactJob, setContactJob] = useState('');
  const [contactTags, setContactTags] = useState('Decisor');

  // 5. Company
  const [compTradeName, setCompTradeName] = useState('');
  const [compCorpName, setCompCorpName] = useState('');
  const [compCnpj, setCompCnpj] = useState('');
  const [compSegment, setCompSegment] = useState('Tecnologia e Serviços');
  const [compSize, setCompSize] = useState<'micro' | 'small' | 'medium' | 'large' | 'enterprise'>('medium');
  const [compEmail, setCompEmail] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compWebsite, setCompWebsite] = useState('');
  const [compStateReg, setCompStateReg] = useState('');
  const [compMuniReg, setCompMuniReg] = useState('');
  const [compCnae, setCompCnae] = useState('');
  const [compRevenue, setCompRevenue] = useState('150000');
  const [compChannel, setCompChannel] = useState('Outbound / Comercial');
  const [compNotes, setCompNotes] = useState('');

  const activePipeline = pipelines.find((p) => p.id === (quickCreateType === 'lead' ? leadPipelineId : dealPipelineId)) || pipelines[0];

  const handleSelectContact = (contactId: string) => {
    setDealContactId(contactId);
    const selectedContact = contacts.find((c) => c.id === contactId);
    if (selectedContact && selectedContact.companyId) {
      setDealCompanyId(selectedContact.companyId);
    }
  };

  useEffect(() => {
    if (quickCreateType === 'lead' && (leadEmail || leadPhone)) {
      const existingContact = contacts.find(
        (c) =>
          (leadEmail && c.email.toLowerCase() === leadEmail.toLowerCase()) ||
          (leadPhone && c.phone.replace(/\D/g, '') === leadPhone.replace(/\D/g, ''))
      );
      if (existingContact) {
        setLeadDupWarning(`⚠️ Contato existente encontrado: "${existingContact.name}" (${existingContact.email}). O lead será vinculado a este contato oficial.`);
      } else {
        setLeadDupWarning(null);
      }
    }
  }, [leadEmail, leadPhone, quickCreateType, contacts]);

  if (!quickCreateType) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (quickCreateType === 'deal') {
      if (!dealTitle.trim()) {
        alert('⚠️ Preencha o título do negócio.');
        return;
      }

      const targetPipeline = pipelines.find((p) => p.id === dealPipelineId) || pipelines[0];
      const targetStage = dealStageId || targetPipeline.stages[0]?.id || 'stg-1';

      addDeal({
        businessUnitId: dealBUId || activeBUId,
        pipelineId: dealPipelineId || targetPipeline.id,
        stageId: targetStage,
        title: dealTitle,
        value: Number(dealValue) || 0,
        contactId: dealContactId || undefined,
        companyId: dealCompanyId || undefined,
        assignedUserId: dealAssigneeId || currentUser.id,
        expectedCloseDate: dealCloseDate,
        status: 'open',
        serviceCategory: dealService,
        leadSource: dealSource,
        notes: dealNotes || undefined,
        customFields: dealCustomFieldValues,
        tags: [dealPriority === 'urgent' ? 'Urgente' : 'Novo'],
      });

      alert(`🎉 Oportunidade / Negócio "${dealTitle}" criado com sucesso no pipeline!`);
      setQuickCreateType(null);
      setDealTitle('');
      setDealNotes('');
      return;
    } else if (quickCreateType === 'project') {
      if (!projName.trim()) {
        alert('⚠️ Preencha o nome do projeto.');
        return;
      }

      addProject({
        businessUnitId: projBUId || activeBUId,
        name: projName,
        code: projCode || `PRJ-${Date.now().toString().slice(-4)}`,
        objective: projObjective || undefined,
        description: projDesc || undefined,
        managerId: projOwnerId || currentUser.id,
        moderatorIds: projModeratorIds,
        memberIds: projMemberIds.length > 0 ? projMemberIds : [currentUser.id],
        privacy: projPrivacy,
        companyId: projCompanyId || undefined,
        serviceCategory: projServiceCat,
        startDate: projStartDate,
        targetEndDate: projEndDate,
        status: 'in_progress',
        health: 'on_track',
        progressPercentage: 0,
        budget: Number(projBudget) || 0,
        milestones: [
          { id: `m1-${Date.now()}`, title: 'Kickoff e Definição do Escopo', dueDate: projStartDate, completed: false },
          { id: `m2-${Date.now()}`, title: 'Homologação e Validação Final', dueDate: projEndDate, completed: false },
        ],
      });

      alert(`🎉 Projeto "${projName}" criado com sucesso na unidade ${projBUId}!`);
    } else if (quickCreateType === 'lead') {
      if (!leadName.trim()) {
        alert('⚠️ Preencha o nome do Lead.');
        return;
      }

      const targetPipeline = pipelines.find((p) => p.id === leadPipelineId) || pipelines[0];
      const targetStage = leadStageId || targetPipeline.stages[0]?.id || 'stg-1';

      let linkedContactId = contacts.find(
        (c) =>
          (leadEmail && c.email.toLowerCase() === leadEmail.toLowerCase()) ||
          (leadPhone && c.phone.replace(/\D/g, '') === leadPhone.replace(/\D/g, ''))
      )?.id;

      let linkedCompanyId = companies.find(
        (comp) => leadCompany && comp.tradeName.toLowerCase() === leadCompany.toLowerCase()
      )?.id;

      addLead({
        businessUnitId: leadBUId || activeBUId,
        title: leadTitle || `Oportunidade Comercial — ${leadName}`,
        name: leadName,
        email: leadEmail || `${leadName.toLowerCase().replace(/\s+/g, '')}@lead.com.br`,
        phone: leadPhone || '+55 11 98888-0000',
        whatsapp: leadWhatsapp || leadPhone,
        document: leadDoc || undefined,
        jobTitle: leadJob || undefined,
        city: leadCity || undefined,
        state: leadState || undefined,
        companyName: leadCompany || undefined,
        contactId: linkedContactId,
        companyId: linkedCompanyId,
        pipelineId: leadPipelineId,
        stageId: targetStage,
        source: leadSource,
        serviceCategory: leadService,
        clientPlan: leadPlan,
        mainNeed: leadMainNeed || undefined,
        status: 'new',
        estimatedValue: Number(leadEstValue) || 0,
        approximateRevenue: Number(leadRevenue) || undefined,
        employeeCount: Number(leadEmployees) || undefined,
        priority: leadPriority,
        expectedCloseDate: leadCloseDate,
        assignedUserId: leadAssigneeId || currentUser.id,
        notes: leadNotes || undefined,
      });

      alert(`🎉 Lead "${leadName}" cadastrado com sucesso no Pipeline de Leads [${targetPipeline.name}]!`);
    } else if (quickCreateType === 'contact') {
      if (!contactName.trim()) return;
      addContact({
        businessUnitId: activeBUId,
        name: contactName,
        email: contactEmail || `${contactName.toLowerCase().replace(/\s+/g, '')}@exemplo.com.br`,
        phone: contactPhone || '+55 11 99999-8888',
        document: contactDoc || undefined,
        companyId: contactCompanyId || undefined,
        jobTitle: contactJob || 'Representante',
        tags: contactTags.split(',').map((t) => t.trim()).filter(Boolean),
        assignedUserId: users[0]?.id || 'usr-william',
      });
    } else if (quickCreateType === 'company') {
      if (!compTradeName.trim()) return;
      addCompany({
        businessUnitId: activeBUId,
        tradeName: compTradeName,
        corporateName: compCorpName || `${compTradeName} S.A.`,
        cnpj: compCnpj || '00.000.000/0001-00',
        segment: compSegment,
        size: compSize,
        email: compEmail || `contato@${compTradeName.toLowerCase().replace(/\s+/g, '')}.com.br`,
        phone: compPhone || '+55 11 3000-0000',
        website: compWebsite || undefined,
        stateRegistration: compStateReg || undefined,
        municipalRegistration: compMuniReg || undefined,
        cnaePrimary: compCnae || undefined,
        approximateRevenue: Number(compRevenue) || undefined,
        acquisitionChannel: compChannel || undefined,
        commercialNotes: compNotes || undefined,
        assignedUserId: users[0]?.id || 'usr-william',
        status: 'active',
        healthScore: 'green',
        tags: ['Novo Cliente CRM 2.0'],
      });
    }

    setQuickCreateType(null);
  };

  const filteredContacts = contacts.filter((c) => {
    if (!contactSearchQuery.trim()) return true;
    const q = contactSearchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.document && c.document.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-100 font-sans select-none">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4.5 border-b border-slate-200 flex items-center justify-between bg-[#ECF8F1]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-[#0F8A4B] rounded-xl border border-[#0F8A4B]/20 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {quickCreateType === 'project' ? 'Cadastro de Novo Projeto (CRM 2.0 Operations)' :
                 quickCreateType === 'deal' ? 'Novo Cliente / Nova Oportunidade (CRM 2.0)' :
                 quickCreateType === 'lead' ? 'Assistente de Entrada de Novo Lead (CRM 2.0)' :
                 quickCreateType === 'company' ? 'Cadastro Completo de Empresa (CRM 2.0)' : 'Criar Registro'}
              </h2>
              <p className="text-xs text-slate-600 font-semibold">Unidade: {businessUnits.find(b => b.id === activeBUId)?.tradeName || activeBUId}</p>
            </div>
          </div>
          <button
            onClick={() => setQuickCreateType(null)}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          
          {/* PROJECT FORM — 5 BLOCOS ESTRUTURADOS DE PROJETO */}
          {quickCreateType === 'project' && (
            <>
              {/* BLOCO 1: IDENTIFICAÇÃO DO PROJETO */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-[#0F8A4B]" />
                  Bloco 1 — Identificação Básica & Código do Projeto
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-slate-800 font-bold mb-1">Nome do Projeto *</label>
                    <input
                      type="text"
                      required
                      value={projName}
                      onChange={(e) => setProjName(e.target.value)}
                      placeholder="Ex: Implantação do Sistema de BPO Contábil"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Código Oficial do Projeto *</label>
                    <input
                      type="text"
                      required
                      value={projCode}
                      onChange={(e) => setProjCode(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-mono font-bold text-xs text-[#0F8A4B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Objetivo Específico do Projeto *</label>
                  <input
                    type="text"
                    required
                    value={projObjective}
                    onChange={(e) => setProjObjective(e.target.value)}
                    placeholder="Ex: Centralizar todas as rotinas operacionais e obrigações da VERCONTÁBIL"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Detalhamento do Escopo & Descrição:</label>
                  <textarea
                    rows={2}
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    placeholder="Detalhamento das entregas, normas e diretrizes operacionais do projeto..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs resize-none"
                  />
                </div>
              </div>

              {/* BLOCO 2: GOVERNANÇA E EQUIPE */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0F8A4B]" />
                  Bloco 2 — Governança: Proprietário, Moderadores & Membros
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Empresa do Grupo (BU Proprietária) *</label>
                    <select
                      value={projBUId}
                      onChange={(e) => setProjBUId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                    >
                      {businessUnits.map((bu) => (
                        <option key={bu.id} value={bu.id}>🏢 {bu.tradeName || bu.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Proprietário Principal (Governança) *</label>
                    <select
                      value={projOwnerId}
                      onChange={(e) => setProjOwnerId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.jobTitle})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Seleção de Moderadores & Membros */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Moderadores do Projeto (Auxiliam a Gestão)</label>
                    <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-white space-y-1">
                      {users.map((u) => (
                        <label key={u.id} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={projModeratorIds.includes(u.id)}
                            onChange={(e) => {
                              if (e.target.checked) setProjModeratorIds([...projModeratorIds, u.id]);
                              else setProjModeratorIds(projModeratorIds.filter((id) => id !== u.id));
                            }}
                            className="rounded accent-[#0F8A4B]"
                          />
                          <span>{u.name} ({u.jobTitle})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Membros Operacionais Participantes *</label>
                    <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-white space-y-1">
                      {users.map((u) => (
                        <label key={u.id} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={projMemberIds.includes(u.id)}
                            onChange={(e) => {
                              if (e.target.checked) setProjMemberIds([...projMemberIds, u.id]);
                              else setProjMemberIds(projMemberIds.filter((id) => id !== u.id));
                            }}
                            className="rounded accent-[#0F8A4B]"
                          />
                          <span>{u.name} ({u.jobTitle})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOCO 3: PRIVACIDADE & REGRAS DE VISIBILIDADE */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-3">
                <h3 className="text-xs font-black text-[#0B6B3A] uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#0F8A4B]" />
                  Bloco 3 — Visibilidade & Regra de Privacidade das Tarefas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    onClick={() => setProjPrivacy('private')}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      projPrivacy === 'private' ? 'bg-white border-[#0F8A4B] shadow-xs' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Lock className="w-5 h-5 text-[#0F8A4B] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">🔒 Projeto Privado (Recomendado)</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                        Visível exclusivamente para o Proprietário, Moderadores, Membros e Administradores com scope na BU. **Tarefas do projeto ficam protegidas.**
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setProjPrivacy('public')}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      projPrivacy === 'public' ? 'bg-white border-[#0F8A4B] shadow-xs' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Eye className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">🌐 Projeto Público da BU</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                        Visível para todos os colaboradores autorizados da Business Unit `{projBUId}`.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* BLOCO 4: VÍNCULO CORPORATIVO E DATAS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0F8A4B]" />
                  Bloco 4 — Vínculo de Cliente & Planejamento Temporal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Cliente / Empresa CRM (Opcional)</label>
                    <select
                      value={projCompanyId}
                      onChange={(e) => setProjCompanyId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                    >
                      <option value="">-- Projeto Interno (Sem Cliente Vínculo) --</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>🏢 {c.tradeName} ({c.cnpj})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Categoria de Serviço</label>
                    <input
                      type="text"
                      value={projServiceCat}
                      onChange={(e) => setProjServiceCat(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Data de Início *</label>
                    <input
                      type="date"
                      required
                      value={projStartDate}
                      onChange={(e) => setProjStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Data Prevista de Término *</label>
                    <input
                      type="date"
                      required
                      value={projEndDate}
                      onChange={(e) => setProjEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Orçamento Planejado (R$)</label>
                    <input
                      type="number"
                      value={projBudget}
                      onChange={(e) => setProjBudget(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-black text-xs text-[#0F8A4B]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* LEAD FORM — 7 BLOCOS ESTRUTURADOS CRM 2.0 */}
          {quickCreateType === 'lead' && (
            <>
              {leadDupWarning && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{leadDupWarning}</span>
                </div>
              )}

              {/* BLOCO 1: DADOS DO LEAD */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0F8A4B]" />
                  Bloco 1 — Identificação Pessoal & Empresa do Prospect
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Nome Completo do Prospect *</label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Ex: Marcelo Pires"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Nome da Empresa (Se souber)</label>
                    <input
                      type="text"
                      value={leadCompany}
                      onChange={(e) => setLeadCompany(e.target.value)}
                      placeholder="Ex: Inovar Logística Ltda"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">E-mail Principal</label>
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="marcelo@inovar.com.br"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Telefone Principal</label>
                    <input
                      type="text"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="+55 11 98888-0000"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">WhatsApp Direct</label>
                    <input
                      type="text"
                      value={leadWhatsapp}
                      onChange={(e) => setLeadWhatsapp(e.target.value)}
                      placeholder="+55 11 98888-0000"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* DEAL FORM — 5 BLOCOS ESTRUTURADOS CRM 2.0 */}
          {quickCreateType === 'deal' && (
            <>
              {/* BLOCO 1: DADOS BÁSICOS & CÓDIGO DA OPORTUNIDADE */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0F8A4B]" />
                  Bloco 1 — Identificação da Oportunidade & Contrato
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-slate-800 font-bold mb-1">Título do Negócio / Contrato *</label>
                    <input
                      type="text"
                      required
                      value={dealTitle}
                      onChange={(e) => setDealTitle(e.target.value)}
                      placeholder="Ex: Expansão de Licenças SaaS e Suporte 24/7"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Empresa do Grupo (BU Proprietária) *</label>
                    <select
                      value={dealBUId}
                      onChange={(e) => setDealBUId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                    >
                      {businessUnits.map((bu) => (
                        <option key={bu.id} value={bu.id}>🏢 {bu.tradeName || bu.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Valor Estimado do Negócio / MRR (R$) *</label>
                    <input
                      type="number"
                      required
                      value={dealValue}
                      onChange={(e) => setDealValue(e.target.value)}
                      placeholder="50000"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-black text-xs text-[#0F8A4B]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-800 font-bold mb-1">Categoria de Serviço / Solução *</label>
                    <select
                      value={dealService}
                      onChange={(e) => setDealService(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                    >
                      <option value="BPO Contábil & Fiscal">BPO Contábil & Fiscal</option>
                      <option value="BPO Financeiro & Faturamento">BPO Financeiro & Faturamento</option>
                      <option value="Licenciamento SaaS & Suporte">Licenciamento SaaS & Suporte</option>
                      <option value="Consultoria Tributária & Societária">Consultoria Tributária & Societária</option>
                      <option value="Departamento Pessoal / eSocial">Departamento Pessoal / eSocial</option>
                      <option value="Solução Integrada VERGROUP">Solução Integrada VERGROUP</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BLOCO 2: VÍNCULO COM EMPRESA & CONTATO PRINCIPAL */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0F8A4B]" />
                  Bloco 2 — Vínculo com Empresa Cliente & Contato Decisor (Ficha 360º)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Empresa Cliente (Razão Social / Fantasia)</label>
                    <select
                      value={dealCompanyId}
                      onChange={(e) => setDealCompanyId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                    >
                      <option value="">Nenhuma empresa vinculada (Definir depois)</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>🏭 {c.tradeName} ({c.cnpj})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Contato Principal / Interlocutor</label>
                    <select
                      value={dealContactId}
                      onChange={(e) => handleSelectContact(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                    >
                      <option value="">Nenhum contato selecionado</option>
                      {contacts.map((ct) => (
                        <option key={ct.id} value={ct.id}>👤 {ct.name} ({ct.email})</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-800 font-bold mb-1">Origem do Lead / Canal de Aquisição</label>
                    <select
                      value={dealSource}
                      onChange={(e) => setDealSource(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                    >
                      <option value="Outbound Comercial / SDR">Outbound Comercial / SDR</option>
                      <option value="Indicação Direta">Indicação Direta</option>
                      <option value="WhatsApp Direct">WhatsApp Direct</option>
                      <option value="Website / Form Inbound">Website / Form Inbound</option>
                      <option value="Base de Clientes Existente">Base de Clientes Existente</option>
                      <option value="Evento / Network">Evento / Network</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BLOCO 3: FUNIL COMERCIAL & ESTÁGIO INICIAL */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#0F8A4B]" />
                  Bloco 3 — Funil Comercial & Estágio Inicial no Pipeline
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-slate-800 font-bold mb-1">Pipeline / Funil Comercial *</label>
                    <select
                      value={dealPipelineId}
                      onChange={(e) => {
                        setDealPipelineId(e.target.value);
                        const selPipe = pipelines.find((p) => p.id === e.target.value);
                        if (selPipe && selPipe.stages.length > 0) {
                          setDealStageId(selPipe.stages[0].id);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                    >
                      {pipelines.map((p) => (
                        <option key={p.id} value={p.id}>🎯 {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Estágio Inicial *</label>
                    <select
                      value={dealStageId}
                      onChange={(e) => setDealStageId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                    >
                      {activePipeline?.stages?.map((stg) => (
                        <option key={stg.id} value={stg.id}>{stg.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-slate-800 font-bold mb-1">Probabilidade Estimada de Fechamento (%)</label>
                    <select
                      value={dealProbability}
                      onChange={(e) => setDealProbability(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                    >
                      <option value="10">10% — Prospecção Inicial</option>
                      <option value="30">30% — Qualificação Concluída</option>
                      <option value="50">50% — Proposta Comercial Enviada</option>
                      <option value="70">70% — Em Negociação Avançada</option>
                      <option value="90">90% — Minuta Contratual em Aprovação</option>
                      <option value="100">100% — Contrato Assinado / Ganho</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BLOCO 4: GOVERNANÇA COMERCIAL & PREVISÃO */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0F8A4B]" />
                  Bloco 4 — Governança Comercial, Responsável & Previsão
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Executivo Responsável (Closer) *</label>
                    <select
                      value={dealAssigneeId}
                      onChange={(e) => setDealAssigneeId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>👤 {u.name} ({u.jobTitle})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Data Prevista de Fechamento *</label>
                    <input
                      type="date"
                      required
                      value={dealCloseDate}
                      onChange={(e) => setDealCloseDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Prioridade / Criticidade</label>
                    <select
                      value={dealPriority}
                      onChange={(e) => setDealPriority(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Normal</option>
                      <option value="high">Alta</option>
                      <option value="urgent">🔥 Urgente / Estratégica</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BLOCO 5: OBSERVAÇÕES & REQUISITOS ESPECIAIS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#0F8A4B]" />
                  Bloco 5 — Escopo, Requisitos & Observações da Oportunidade
                </h3>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Detalhamento do Escopo & Observações:</label>
                  <textarea
                    rows={3}
                    value={dealNotes}
                    onChange={(e) => setDealNotes(e.target.value)}
                    placeholder="Registrar necessidades técnicas, expectativas do cliente, condições de pagamento e diretrizes comerciais..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs resize-none"
                  />
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <button
            type="button"
            onClick={() => setQuickCreateType(null)}
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="px-5 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors"
          >
            Salvar Registro CRM 2.0
          </button>
        </div>
      </div>
    </div>
  );
};
