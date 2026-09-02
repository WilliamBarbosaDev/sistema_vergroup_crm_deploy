import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  UserCheck,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Check,
  FolderKanban,
  User,
  Search,
  Plus,
  FileCheck,
  AlertCircle,
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
    addDeal,
    addLead,
    addContact,
    addCompany,
    addTask,
    generateTaskProtocol,
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

  // Autocomplete Searches for Contact & Company
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [cnpjDupWarning, setCnpjDupWarning] = useState<string | null>(null);

  // 2. Lead
  const [leadTitle, setLeadTitle] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadSource, setLeadSource] = useState<'website' | 'whatsapp' | 'email' | 'referral'>('whatsapp');
  const [leadEstValue, setLeadEstValue] = useState('30000');

  // 3. Contact
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactDoc, setContactDoc] = useState('');
  const [contactCompanyId, setContactCompanyId] = useState('');
  const [contactJob, setContactJob] = useState('');
  const [contactTags, setContactTags] = useState('Decisor');
  const [contactDupWarning, setContactDupWarning] = useState<string | null>(null);

  // 4. Company
  const [compTradeName, setCompTradeName] = useState('');
  const [compCorpName, setCompCorpName] = useState('');
  const [compCnpj, setCompCnpj] = useState('');
  const [compSegment, setCompSegment] = useState('Tecnologia e Serviços');
  const [compEmail, setCompEmail] = useState('');
  const [compPhone, setCompPhone] = useState('');

  // 5. Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueDate, setTaskDueDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [taskOwnerId, setTaskOwnerId] = useState(users[0]?.id || 'usr-william');
  const [taskAssigneeId, setTaskAssigneeId] = useState(users[0]?.id || 'usr-william');
  const [taskContactId, setTaskContactId] = useState('');
  const [taskProjectId, setTaskProjectId] = useState('');
  const [taskChecklist1, setTaskChecklist1] = useState('');
  const [taskChecklist2, setTaskChecklist2] = useState('');
  const [showCrmAiModal, setShowCrmAiModal] = useState(false);
  const [detectedKeyword, setDetectedKeyword] = useState('');
  const [aiCrmCandidates, setAiCrmCandidates] = useState<any[]>([]);

  // 6. Event
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDate, setEvtDate] = useState(new Date().toISOString().split('T')[0]);
  const [evtStartTime, setEvtStartTime] = useState('14:00');
  const [evtEndTime, setEvtEndTime] = useState('15:00');
  const [evtLocation, setEvtLocation] = useState('Google Meet');

  // 7. Project
  const [projName, setProjName] = useState('');
  const [projCode, setProjCode] = useState('');
  const [projCompanyId, setProjCompanyId] = useState('');
  const [projService, setProjService] = useState('Implantação de Software');
  const [projManagerId, setProjManagerId] = useState(users[0]?.id || 'usr-william');
  const [projStartDate, setProjStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [projEndDate, setProjEndDate] = useState(new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0]);
  const [projBudget, setProjBudget] = useState('50000');

  const activePipeline = pipelines.find((p) => p.id === dealPipelineId) || pipelines[0];

  // Auto-select linked company when contact is selected
  const handleSelectContact = (contactId: string) => {
    setDealContactId(contactId);
    const selectedContact = contacts.find((c) => c.id === contactId);
    if (selectedContact && selectedContact.companyId) {
      setDealCompanyId(selectedContact.companyId);
    }
  };

  if (!quickCreateType) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (quickCreateType === 'deal') {
      if (!dealTitle.trim()) {
        alert('⚠️ Preencha o título do negócio.');
        return;
      }

      // MANDATORY CONTACT REQUIREMENT: Deal MUST have a contact_id selected
      if (!dealContactId) {
        alert('⚠️ Selecione um contato responsável já cadastrado no CRM antes de salvar o negócio.');
        return;
      }

      const targetPipeline = pipelines.find((p) => p.id === dealPipelineId) || pipelines[0];
      const targetStage = dealStageId || targetPipeline.stages[0]?.id || 'stg-1';

      // Check required custom fields
      if (targetPipeline.customFields) {
        for (const cf of targetPipeline.customFields) {
          if (cf.isRequired && !dealCustomFieldValues[cf.id]) {
            alert(`⚠️ O campo personalizado "${cf.name}" é obrigatório para este pipeline.`);
            return;
          }
        }
      }

      addDeal({
        businessUnitId: activeBUId,
        pipelineId: dealPipelineId,
        stageId: targetStage,
        title: dealTitle,
        value: Number(dealValue) || 0,
        contactId: dealContactId,
        companyId: dealCompanyId || undefined,
        assignedUserId: dealAssigneeId || currentUser.id,
        expectedCloseDate: dealCloseDate,
        status: 'open',
        serviceCategory: dealService,
        customFields: dealCustomFieldValues,
        tags: ['Novo'],
      });

      alert(`🎉 Negócio "${dealTitle}" criado com sucesso e vinculado ao Contato oficial!`);
    } else if (quickCreateType === 'lead') {
      if (!leadTitle.trim() || !leadName.trim()) return;
      addLead({
        businessUnitId: activeBUId,
        title: leadTitle,
        name: leadName,
        email: leadEmail || `${leadName.toLowerCase().replace(/\s+/g, '')}@empresa.com.br`,
        phone: leadPhone || '+55 11 98888-0000',
        companyName: leadCompany || undefined,
        source: leadSource,
        status: 'new',
        estimatedValue: Number(leadEstValue) || 0,
        assignedUserId: users[0]?.id,
      });
    } else if (quickCreateType === 'contact') {
      if (!contactName.trim()) return;
      const res = addContact({
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
      if (!res.success) {
        setContactDupWarning(res.duplicateWarning || 'Registro duplicado');
        return;
      }
    } else if (quickCreateType === 'company') {
      if (!compTradeName.trim()) return;
      addCompany({
        businessUnitId: activeBUId,
        tradeName: compTradeName,
        corporateName: compCorpName || `${compTradeName} S.A.`,
        cnpj: compCnpj || '00.000.000/0001-00',
        segment: compSegment,
        size: 'medium',
        email: compEmail || `contato@${compTradeName.toLowerCase().replace(/\s+/g, '')}.com.br`,
        phone: compPhone || '+55 11 3000-0000',
        assignedUserId: users[0]?.id || 'usr-william',
        status: 'active',
        healthScore: 'green',
        tags: ['Novo Cliente'],
      });
    } else if (quickCreateType === 'task') {
      if (!taskTitle.trim()) return;
      confirmCreateTask(false);
      return;
    } else if (quickCreateType === 'event') {
      if (!evtTitle.trim()) return;
      addCalendarEvent({
        businessUnitId: activeBUId,
        title: evtTitle,
        start: `${evtDate}T${evtStartTime}:00Z`,
        end: `${evtDate}T${evtEndTime}:00Z`,
        type: 'meeting',
        location: evtLocation,
        organizerId: users[0]?.id || 'usr-william',
        attendeeIds: [users[0]?.id || 'usr-william'],
      });
    } else if (quickCreateType === 'project') {
      if (!projName.trim()) return;
      addProject({
        businessUnitId: activeBUId,
        name: projName,
        code: projCode || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
        companyId: projCompanyId || undefined,
        serviceCategory: projService,
        managerId: projManagerId || users[0]?.id || 'usr-william',
        memberIds: [projManagerId || users[0]?.id || 'usr-william'],
        startDate: projStartDate,
        targetEndDate: projEndDate,
        status: 'in_progress',
        health: 'on_track',
        progressPercentage: 0,
        budget: Number(projBudget) || 0,
        milestones: [
          { id: `m-${Date.now()}-1`, title: 'Kickoff Inicial e Escopo', dueDate: projStartDate, completed: false },
          { id: `m-${Date.now()}-2`, title: 'Entrega Final e Homologação', dueDate: projEndDate, completed: false },
        ],
      });
    }

    setQuickCreateType(null);
  };

  const confirmCreateTask = (asInternal: boolean) => {
    const checklist = [];
    if (taskChecklist1.trim()) checklist.push({ id: `chk-${Date.now()}-1`, text: taskChecklist1.trim(), completed: false });
    if (taskChecklist2.trim()) checklist.push({ id: `chk-${Date.now()}-2`, text: taskChecklist2.trim(), completed: false });

    const selectedContact = contacts.find((c) => c.id === taskContactId);

    addTask({
      businessUnitId: activeBUId,
      title: taskTitle,
      description: taskDesc || undefined,
      status: 'pending',
      priority: taskPriority,
      dueDate: taskDueDate,
      estimatedHours: 4,
      spentHours: 0,
      creatorId: currentUser.id,
      ownerUserId: taskOwnerId || currentUser.id,
      assignedUserId: taskAssigneeId || users[0]?.id || 'usr-william',
      contactId: taskContactId || undefined,
      clientId: selectedContact?.companyId || undefined,
      taskContext: taskContactId ? 'client' : 'internal',
      confirmedInternal: asInternal,
      participantIds: [],
      observerIds: [],
      projectId: taskProjectId || undefined,
      checklist,
      tags: ['Operação'],
    });

    setShowCrmAiModal(false);
    setQuickCreateType(null);
  };

  // Filtered contacts and companies for autocomplete
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

  const filteredCompanies = companies.filter((comp) => {
    if (!companySearchQuery.trim()) return true;
    const q = companySearchQuery.toLowerCase();
    return (
      comp.tradeName.toLowerCase().includes(q) ||
      comp.corporateName.toLowerCase().includes(q) ||
      comp.cnpj.toLowerCase().includes(q)
    );
  });

  const selectedContact = contacts.find((c) => c.id === dealContactId);
  const selectedCompany = companies.find((c) => c.id === dealCompanyId);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-100 font-sans">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150"
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
                {quickCreateType === 'deal' ? 'Novo Negócio no CRM (Formulário Amplo)' : 'Criar Registro'}
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
          
          {/* DEAL FORM — 5 BLOCOS ESTRUTURADOS */}
          {quickCreateType === 'deal' && (
            <>
              {/* BLOCO 1: DADOS DO NEGÓCIO */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0F8A4B]" />
                  Bloco 1 — Dados Básicos do Negócio
                </h3>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Título do Negócio *</label>
                  <input
                    type="text"
                    required
                    value={dealTitle}
                    onChange={(e) => setDealTitle(e.target.value)}
                    placeholder="Ex: Expansão de Licenças e Suporte 24/7"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Pipeline / Funil *</label>
                    <select
                      value={dealPipelineId}
                      onChange={(e) => {
                        setDealPipelineId(e.target.value);
                        const pipe = pipelines.find((p) => p.id === e.target.value);
                        if (pipe) setDealStageId(pipe.stages[0]?.id || '');
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                    >
                      {pipelines.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Etapa Inicial *</label>
                    <select
                      value={dealStageId}
                      onChange={(e) => setDealStageId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                    >
                      {activePipeline?.stages.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Valor Estimado (R$) *</label>
                    <input
                      type="number"
                      required
                      value={dealValue}
                      onChange={(e) => setDealValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-black text-xs text-[#0F8A4B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Responsável Comercial *</label>
                    <select
                      value={dealAssigneeId}
                      onChange={(e) => setDealAssigneeId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.jobTitle})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Previsão de Fechamento *</label>
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

              {/* BLOCO 2: CONTATO RESPONSÁVEL (MANDATORY) */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-[#0B6B3A] uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#0F8A4B]" />
                    Bloco 2 — Contato Responsável (Obrigatório)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setQuickCreateType('contact')}
                    className="text-xs font-bold text-[#0F8A4B] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Criar Novo Contato</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-800 font-bold mb-1">Buscar Contato Existente (`public.contacts`) *</label>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={contactSearchQuery}
                      onChange={(e) => setContactSearchQuery(e.target.value)}
                      placeholder="Pesquisar por nome, e-mail, telefone ou CPF..."
                      className="bg-transparent text-xs text-slate-900 focus:outline-none w-full font-semibold"
                    />
                  </div>

                  <select
                    required
                    value={dealContactId}
                    onChange={(e) => handleSelectContact(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                  >
                    <option value="">-- Selecione o Contato Obrigatório --</option>
                    {filteredContacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email} • {c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedContact && (
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-slate-900 font-bold block">{selectedContact.name}</strong>
                      <p className="text-slate-500 text-[11px]">{selectedContact.email} • {selectedContact.phone}</p>
                      <p className="text-slate-500 text-[11px]">Cargo: {selectedContact.jobTitle || 'N/A'}</p>
                    </div>
                    <span className="text-[10px] font-black text-[#0B6B3A] bg-[#ECF8F1] px-2 py-0.5 rounded border border-[#0F8A4B]/20 uppercase">
                      Contato Ativo
                    </span>
                  </div>
                )}
              </div>

              {/* BLOCO 3: EMPRESA / CLIENTE CRM */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0F8A4B]" />
                    Bloco 3 — Empresa / Cliente CRM
                  </h3>
                  <button
                    type="button"
                    onClick={() => setQuickCreateType('company')}
                    className="text-xs font-bold text-[#0F8A4B] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Criar Nova Empresa</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-800 font-bold mb-1">Empresa Relacionada (`public.companies`):</label>
                  <select
                    value={dealCompanyId}
                    onChange={(e) => setDealCompanyId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
                  >
                    <option value="">Nenhuma / A definir</option>
                    {filteredCompanies.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.tradeName} ({comp.cnpj})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCompany && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <strong className="text-slate-900 font-bold block">{selectedCompany.tradeName}</strong>
                    <p className="text-slate-500 text-[11px]">CNPJ: {selectedCompany.cnpj} • Segmento: {selectedCompany.segment}</p>
                  </div>
                )}
              </div>

              {/* BLOCO 4: INFORMAÇÕES DO PIPELINE (CUSTOM FIELDS) */}
              {activePipeline?.customFields && activePipeline.customFields.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#0F8A4B]" />
                    Bloco 4 — Campos Especificos do Pipeline [{activePipeline.name}]
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activePipeline.customFields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-slate-800 font-bold mb-1">
                          {field.name} {field.isRequired && <span className="text-rose-600">*</span>}
                        </label>
                        <input
                          type={field.fieldType === 'number' ? 'number' : 'text'}
                          required={field.isRequired}
                          value={dealCustomFieldValues[field.id] || ''}
                          onChange={(e) => setDealCustomFieldValues({ ...dealCustomFieldValues, [field.id]: e.target.value })}
                          placeholder={field.description || `Preencha ${field.name}`}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BLOCO 5: OBSERVAÇÕES E NOTAS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-slate-800 font-bold">Bloco 5 — Observações & Notas Internas:</label>
                <textarea
                  rows={2}
                  value={dealNotes}
                  onChange={(e) => setDealNotes(e.target.value)}
                  placeholder="Anotações comerciais, briefing inicial ou expectativas do cliente..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs resize-none"
                />
              </div>
            </>
          )}

          {/* OTHER FORMS UNTOUCHED */}
          {quickCreateType === 'contact' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nome Completo do Contato *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">E-mail Principal *</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="joao@empresa.com.br"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+55 11 99999-8888"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none"
                />
              </div>
            </div>
          )}

          {quickCreateType === 'company' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nome Fantasia *</label>
                <input
                  type="text"
                  required
                  value={compTradeName}
                  onChange={(e) => setCompTradeName(e.target.value)}
                  placeholder="Ex: Alfa Comércio Ltda"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">CNPJ *</label>
                <input
                  type="text"
                  required
                  value={compCnpj}
                  onChange={(e) => setCompCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none"
                />
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
            Salvar Registro
          </button>
        </div>
      </div>
    </div>
  );
};
