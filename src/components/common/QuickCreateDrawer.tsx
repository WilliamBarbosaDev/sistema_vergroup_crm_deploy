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
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskPriority } from '../../types';
import { AiToolRegistryService } from '../../services/aiToolRegistry';
import { DealCompanyContactSelector } from '../crm/DealCompanyContactSelector';

export const QuickCreateDrawer: React.FC = () => {
  const {
    quickCreateType,
    setQuickCreateType,
    selectedDealId,
    setSelectedDealId,
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
    openTaskCreate,
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
  const [dealPaymentCondition, setDealPaymentCondition] = useState('Faturamento Mensal (30 dias)');
  const [dealPlan, setDealPlan] = useState('Plano Corp / Enterprise');
  const [dealParticipantIds, setDealParticipantIds] = useState<string[]>([]);
  const [dealInitialTaskTitle, setDealInitialTaskTitle] = useState('');

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

  useEffect(() => {
    if (quickCreateType === 'task') {
      setQuickCreateType(null);
      openTaskCreate();
    }
  }, [quickCreateType]);

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

      const newDeal = addDeal({
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
        customFields: {
          ...dealCustomFieldValues,
          'Condição de Pagamento': dealPaymentCondition,
          'Plano Contratado': dealPlan,
        },
        tags: [dealPriority === 'urgent' ? 'Urgente' : 'Novo'],
      });

      // Add initial task if entered
      if (dealInitialTaskTitle.trim()) {
        addTask({
          businessUnitId: newDeal.businessUnitId,
          title: dealInitialTaskTitle.trim(),
          description: `Próxima ação criada na abertura do negócio "${newDeal.title}"`,
          status: 'pending',
          priority: 'high',
          dueDate: newDeal.expectedCloseDate,
          assignedUserId: newDeal.assignedUserId,
          dealId: newDeal.id,
          clientId: newDeal.companyId,
          tags: ['Próxima Ação', 'Comercial'],
        });
      }

      setQuickCreateType(null);
      setDealTitle('');
      setDealNotes('');
      setDealInitialTaskTitle('');

      // Seamless Transition to complete Operational Workspace
      setSelectedDealId(newDeal.id);
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
        className={`${
          quickCreateType === 'deal' ? 'w-full max-w-[96vw] max-h-[95vh] h-[95vh]' : 'w-full max-w-3xl max-h-[92vh]'
        } bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-[#ECF8F1] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white text-[#0F8A4B] rounded-xl border border-[#0F8A4B]/20 shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>
                    {quickCreateType === 'project' ? 'Cadastro de Novo Projeto (CRM 2.0 Operations)' :
                     quickCreateType === 'deal' ? 'Ficha de Novo Negócio / Nova Oportunidade (CRM 2.0)' :
                     quickCreateType === 'lead' ? 'Assistente de Entrada de Novo Lead (CRM 2.0)' :
                     quickCreateType === 'company' ? 'Cadastro Completo de Empresa (CRM 2.0)' : 'Criar Registro'}
                  </span>
                  {quickCreateType === 'deal' && (
                    <span className="text-xs font-bold px-2.5 py-0.5 bg-white text-[#0F8A4B] rounded-md border border-[#0F8A4B]/30 font-mono">
                      Funil: {activePipeline?.name || 'CRM Vendas'}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Unidade do Grupo: {businessUnits.find(b => b.id === activeBUId)?.tradeName || activeBUId}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setQuickCreateType(null)}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Pipeline Stage Stepper for Deal Creation */}
          {quickCreateType === 'deal' && activePipeline && (
            <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-2 shrink-0">Avanço no Funil:</span>
              {(() => {
                const currentStageId = dealStageId || activePipeline.stages[0]?.id;
                const selectedIdx = activePipeline.stages.findIndex((s) => s.id === currentStageId);
                const activeIdx = selectedIdx >= 0 ? selectedIdx : 0;

                return activePipeline.stages.map((stg, idx) => {
                  const isCurrent = idx === activeIdx;
                  const isPassed = idx < activeIdx;

                  return (
                    <button
                      key={stg.id}
                      type="button"
                      onClick={() => setDealStageId(stg.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                        isCurrent
                          ? 'bg-[#0F8A4B] text-white border-[#0F8A4B] font-black shadow-2xs'
                          : isPassed
                          ? 'bg-emerald-50 text-[#0F8A4B] border-emerald-300 font-extrabold hover:bg-emerald-100'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 font-medium'
                      }`}
                      title={isCurrent ? `Etapa Atual: ${stg.name}` : isPassed ? `Etapa Percorrida: ${stg.name}` : `Etapa Futura: ${stg.name}`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[10px] ${
                        isCurrent ? 'bg-white/20 text-white font-bold' : isPassed ? 'bg-emerald-200/60 text-[#0F8A4B] font-bold' : 'bg-slate-200/60 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <span>{stg.name}</span>
                      {(isCurrent || isPassed) && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                });
              })()}
            </div>
          )}
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

          {/* DEAL FORM — FICHA AMPLA CRM 2.0 (LAYOUT EM 2 GRANDES COLUNAS) */}
          {quickCreateType === 'deal' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* COLUNA ESQUERDA (65% / lg:col-span-7) — FICHA CADASTRAL & COMERCIAL */}
              <div className="lg:col-span-7 space-y-4">
                {/* SEÇÃO 1: SOBRE O NEGÓCIO */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/80 pb-2">
                    <Sparkles className="w-4 h-4 text-[#0F8A4B]" />
                    1. Sobre o Negócio & Contrato
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
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
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
                      <label className="block text-slate-800 font-bold mb-1">Valor Estimado / MRR (R$) *</label>
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

                {/* SEÇÃO 2: SEÇÃO FINANCEIRA */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/80 pb-2">
                    <DollarSign className="w-4 h-4 text-[#0F8A4B]" />
                    2. Condições Financeiras & Plano
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1">Condição de Pagamento:</label>
                      <select
                        value={dealPaymentCondition}
                        onChange={(e) => setDealPaymentCondition(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                      >
                        <option value="Faturamento Mensal (30 dias)">Faturamento Mensal (30 dias)</option>
                        <option value="Boleto Recorrente Automatizado">Boleto Recorrente Automatizado</option>
                        <option value="PIX / Cartão Recorrente">PIX / Cartão Recorrente</option>
                        <option value="Pagamento Trimestral Antecipado">Pagamento Trimestral Antecipado</option>
                        <option value="Pagamento Anual com Desconto">Pagamento Anual com Desconto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1">Plano Contratado (Plano ≠ Etapa):</label>
                      <select
                        value={dealPlan}
                        onChange={(e) => setDealPlan(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs text-indigo-900"
                      >
                        <option value="Plano Econômico / Essencial">Plano Econômico / Essencial</option>
                        <option value="Plano Profissional / Growth">Plano Profissional / Growth</option>
                        <option value="Plano Corp / Enterprise">Plano Corp / Enterprise</option>
                        <option value="Personalizado / Sob Demanda">Personalizado / Sob Demanda</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SEÇÃO 3: EMPRESA CLIENTE & CONTATO OFICIAL (COMPANIES & CONTACTS) */}
                <DealCompanyContactSelector
                  businessUnitId={dealBUId}
                  selectedCompanyId={dealCompanyId}
                  onSelectCompany={(compGoalId) => setDealCompanyId(compGoalId)}
                  selectedContactId={dealContactId}
                  onSelectContact={(contGoalId) => setDealContactId(contGoalId)}
                  additionalParticipantIds={dealParticipantIds}
                  onUpdateParticipants={(partIds) => setDealParticipantIds(partIds)}
                />

                {/* SEÇÃO 4: COMERCIAL & GOVERNANÇA */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/80 pb-2">
                    <ShieldCheck className="w-4 h-4 text-[#0F8A4B]" />
                    4. Governança Comercial & Previsão de Fechamento
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1">Origem do Lead / Canal:</label>
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
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1">Closer Responsável *</label>
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
                  </div>
                </div>

                {/* SEÇÃO 5: CAMPOS PERSONALIZADOS DO PIPELINE (`pipeline_custom_fields`) */}
                {activePipeline && activePipeline.customFields && activePipeline.customFields.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/80 pb-2">
                      <Tag className="w-4 h-4 text-[#0F8A4B]" />
                      5. Campos Personalizados do Pipeline ({activePipeline.name})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activePipeline.customFields.map((cf) => (
                        <div key={cf.id}>
                          <label className="block text-slate-800 font-bold mb-1">{cf.name} {cf.required && '*'}</label>
                          <input
                            type="text"
                            value={dealCustomFieldValues[cf.name] || ''}
                            onChange={(e) => setDealCustomFieldValues({ ...dealCustomFieldValues, [cf.name]: e.target.value })}
                            placeholder={`Preencher ${cf.name}...`}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SEÇÃO 6: ESCOPO & OBSERVAÇÕES */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/80 pb-2">
                    <FileCheck className="w-4 h-4 text-[#0F8A4B]" />
                    6. Detalhamento do Escopo & Observações
                  </h3>

                  <div>
                    <textarea
                      rows={3}
                      value={dealNotes}
                      onChange={(e) => setDealNotes(e.target.value)}
                      placeholder="Registrar premissas do projeto, necessidades técnicas do cliente, prazos especiais ou notas comerciais..."
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* COLUNA DIREITA (35% / lg:col-span-5) — CENTRAL DE ATIVIDADES & REGISTROS DE ABERTURA */}
              <div className="lg:col-span-5 space-y-4 sticky top-0">
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Central de Atividades Pré-Salvamento</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Ações e agendamentos vinculados ao negócio</p>
                    </div>
                  </div>

                  {/* Campo Próxima Ação */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#0F8A4B]" />
                      <span>O que precisa ser feito agora? (Próxima Ação / Tarefa)</span>
                    </label>
                    <input
                      type="text"
                      value={dealInitialTaskTitle}
                      onChange={(e) => setDealInitialTaskTitle(e.target.value)}
                      placeholder="Ex: Agendar demonstração da solução com o diretor financeiro..."
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                    />
                  </div>

                  {/* Mensagem Explicativa de Produção */}
                  <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-xs text-[#0B6B3A] space-y-1 font-medium leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-4 h-4 text-[#0F8A4B] shrink-0" />
                      <span>Ficha Operacional de Produção (CRM 2.0)</span>
                    </div>
                    <p className="text-[11px]">
                      Ao salvar este formulário amplo, a oportunidade é criada e a tela abre **imediatamente na Central Operacional Completa** com timeline em tempo real, integração com WhatsApp, e-mail e tarefas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
