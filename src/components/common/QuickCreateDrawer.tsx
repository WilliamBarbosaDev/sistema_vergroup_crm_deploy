import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskPriority } from '../../types';

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
    projects,
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

  // Form states
  // 1. Deal
  const [dealTitle, setDealTitle] = useState('');
  const [dealValue, setDealValue] = useState('50000');
  const [dealPipelineId, setDealPipelineId] = useState(pipelines[0]?.id || 'pipe-tech-sales');
  const [dealContactId, setDealContactId] = useState(contacts[0]?.id || '');
  const [dealCompanyId, setDealCompanyId] = useState(companies[0]?.id || '');
  const [dealService, setDealService] = useState('Licenciamento SaaS');

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
  const [taskAssigneeId, setTaskAssigneeId] = useState(users[0]?.id || '');
  const [taskProjectId, setTaskProjectId] = useState('');
  const [taskChecklist1, setTaskChecklist1] = useState('');
  const [taskChecklist2, setTaskChecklist2] = useState('');

  // 6. Event
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDate, setEvtDate] = useState(new Date().toISOString().split('T')[0]);
  const [evtStartTime, setEvtStartTime] = useState('14:00');
  const [evtEndTime, setEvtEndTime] = useState('15:00');
  const [evtLocation, setEvtLocation] = useState('Google Meet');

  // 7. Project
  const [projName, setProjName] = useState('');
  const [projCode, setProjCode] = useState(`PRJ-${Math.floor(1000 + Math.random() * 9000)}`);
  const [projCompanyId, setProjCompanyId] = useState(companies[0]?.id || '');
  const [projService, setProjService] = useState('Implantação de Software');
  const [projManagerId, setProjManagerId] = useState(users[0]?.id || '');
  const [projStartDate, setProjStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [projEndDate, setProjEndDate] = useState(new Date(Date.now() + 86400000 * 45).toISOString().split('T')[0]);
  const [projBudget, setProjBudget] = useState('50000');

  if (!quickCreateType) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (quickCreateType === 'deal') {
      if (!dealTitle.trim()) return;
      const targetPipeline = pipelines.find((p) => p.id === dealPipelineId) || pipelines[0];
      addDeal({
        businessUnitId: activeBUId,
        pipelineId: dealPipelineId,
        stageId: targetPipeline.stages[0]?.id || 'stg-1',
        title: dealTitle,
        value: Number(dealValue) || 0,
        contactId: dealContactId || undefined,
        companyId: dealCompanyId || undefined,
        assignedUserId: users[0]?.id || 'usr-william',
        expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: 'open',
        serviceCategory: dealService,
        tags: ['Novo'],
      });
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
      const checklist = [];
      if (taskChecklist1.trim()) checklist.push({ id: `chk-${Date.now()}-1`, text: taskChecklist1.trim(), completed: false });
      if (taskChecklist2.trim()) checklist.push({ id: `chk-${Date.now()}-2`, text: taskChecklist2.trim(), completed: false });

      addTask({
        businessUnitId: activeBUId,
        title: taskTitle,
        description: taskDesc || undefined,
        status: 'pending',
        priority: taskPriority,
        dueDate: taskDueDate,
        estimatedHours: 4,
        spentHours: 0,
        assignedUserId: taskAssigneeId || users[0]?.id || 'usr-william',
        participantIds: [],
        observerIds: [],
        projectId: taskProjectId || undefined,
        checklist,
        tags: ['Operação'],
      });
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

  const getTitle = () => {
    switch (quickCreateType) {
      case 'deal': return { icon: Sparkles, text: 'Novo Negócio no Funil' };
      case 'lead': return { icon: UserCheck, text: 'Novo Lead Comercial' };
      case 'contact': return { icon: Building2, text: 'Novo Contato' };
      case 'company': return { icon: Building2, text: 'Nova Empresa' };
      case 'task': return { icon: CheckCircle2, text: 'Nova Tarefa' };
      case 'event': return { icon: Clock, text: 'Novo Evento na Agenda' };
      case 'project': return { icon: FolderKanban, text: 'Novo Projeto Operacional' };
      default: return { icon: Sparkles, text: 'Criar Registro' };
    }
  };

  const { icon: HeaderIcon, text: headerText } = getTitle();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4.5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ECF8F1] text-[#0F8A4B] rounded-xl border border-[#0F8A4B]/20 shadow-2xs">
              <HeaderIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{headerText}</h2>
              <p className="text-xs text-slate-500 font-semibold">Unidade: {businessUnits.find(b => b.id === activeBUId)?.name}</p>
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
        <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* DEAL FORM */}
          {quickCreateType === 'deal' && (
            <>
              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Título do Negócio *</label>
                <input
                  type="text"
                  required
                  value={dealTitle}
                  onChange={(e) => setDealTitle(e.target.value)}
                  placeholder="Ex: Expansão de Licenças e Suporte 24/7"
                  className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Valor Estimado (R$) *</label>
                  <input
                    type="number"
                    required
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Pipeline / Funil</label>
                  <select
                    value={dealPipelineId}
                    onChange={(e) => setDealPipelineId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md bg-white focus:border-[#0F8A4B] outline-none"
                  >
                    {pipelines.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Empresa Relacionada</label>
                  <select
                    value={dealCompanyId}
                    onChange={(e) => setDealCompanyId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md bg-white focus:border-[#0F8A4B] outline-none"
                  >
                    <option value="">Nenhuma / A definir</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.tradeName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Contato Principal</label>
                  <select
                    value={dealContactId}
                    onChange={(e) => setDealContactId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md bg-white focus:border-[#0F8A4B] outline-none"
                  >
                    <option value="">Nenhum / A definir</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Categoria de Serviço</label>
                <input
                  type="text"
                  value={dealService}
                  onChange={(e) => setDealService(e.target.value)}
                  placeholder="Ex: SaaS / BPO Financeiro / Consultoria"
                  className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                />
              </div>
            </>
          )}

          {/* LEAD FORM */}
          {quickCreateType === 'lead' && (
            <>
              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Título do Interesse *</label>
                <input
                  type="text"
                  required
                  value={leadTitle}
                  onChange={(e) => setLeadTitle(e.target.value)}
                  placeholder="Ex: Interesse em migração do Bitrix24"
                  className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Nome do Prospect *</label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Ex: Marcelo Pires"
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Empresa</label>
                  <input
                    type="text"
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    placeholder="Ex: Inovar Logística"
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="marcelo@empresa.com.br"
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="+55 11 99999-0000"
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Canal de Origem</label>
                  <select
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value as 'website' | 'whatsapp' | 'email' | 'referral')}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md bg-white focus:border-[#0F8A4B] outline-none"
                  >
                    <option value="whatsapp">WhatsApp (W-API)</option>
                    <option value="website">Formulário do Site</option>
                    <option value="email">E-mail Direto</option>
                    <option value="referral">Indicação / Parceiro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Valor Estimado (R$)</label>
                  <input
                    type="number"
                    value={leadEstValue}
                    onChange={(e) => setLeadEstValue(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* CONTACT FORM */}
          {quickCreateType === 'contact' && (
            <>
              {contactDupWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2 text-amber-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div className="text-[11px]">
                    <p className="font-semibold">Possível Duplicidade Detectada (PRD CRM-04):</p>
                    <p>{contactDupWarning}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ex: Juliana Mendes"
                  className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => {
                      setContactEmail(e.target.value);
                      const dup = checkDuplicate(e.target.value, contactPhone, contactDoc);
                      setContactDupWarning(dup);
                    }}
                    placeholder="juliana@nexuslog.com.br"
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Telefone *</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => {
                      setContactPhone(e.target.value);
                      const dup = checkDuplicate(contactEmail, e.target.value, contactDoc);
                      setContactDupWarning(dup);
                    }}
                    placeholder="+55 11 98765-4321"
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Empresa</label>
                  <select
                    value={contactCompanyId}
                    onChange={(e) => setContactCompanyId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md bg-white focus:border-[#0F8A4B] outline-none"
                  >
                    <option value="">Nenhuma / Autônomo</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.tradeName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Cargo</label>
                  <input
                    type="text"
                    value={contactJob}
                    onChange={(e) => setContactJob(e.target.value)}
                    placeholder="Ex: Gerente de TI"
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={contactTags}
                  onChange={(e) => setContactTags(e.target.value)}
                  placeholder="Decisor, TI, VIP"
                  className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                />
              </div>
            </>
          )}

          {/* COMPANY FORM */}
          {quickCreateType === 'company' && (
            <>
              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Nome Fantasia *</label>
                <input
                  type="text"
                  required
                  value={compTradeName}
                  onChange={(e) => setCompTradeName(e.target.value)}
                  placeholder="Ex: Delta Logística"
                  className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Razão Social</label>
                <input
                  type="text"
                  value={compCorpName}
                  onChange={(e) => setCompCorpName(e.target.value)}
                  placeholder="Ex: Delta Transportes e Logística S.A."
                  className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={compCnpj}
                    onChange={(e) => setCompCnpj(e.target.value)}
                    placeholder="12.345.678/0001-90"
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Segmento</label>
                  <input
                    type="text"
                    value={compSegment}
                    onChange={(e) => setCompSegment(e.target.value)}
                    placeholder="Logística, Saúde, Varejo..."
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* TASK FORM */}
          {quickCreateType === 'task' && (
            <>
              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Título da Demanda *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Ex: Revisar minuta contratual e enviar para assinatura"
                  className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Descrição / Instruções</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Detalhes adicionais e contexto da atividade..."
                  className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Prioridade</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md bg-white focus:border-[#0F8A4B] outline-none"
                  >
                    <option value="urgent">🔴 Urgente (SLA Crítico)</option>
                    <option value="high">🟠 Alta</option>
                    <option value="medium">🟡 Média</option>
                    <option value="low">🟢 Baixa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Prazo de Entrega</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Responsável</label>
                  <select
                    value={taskAssigneeId}
                    onChange={(e) => setTaskAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md bg-white focus:border-[#0F8A4B] outline-none"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Vincular a Projeto</label>
                  <select
                    value={taskProjectId}
                    onChange={(e) => setTaskProjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md bg-white focus:border-[#0F8A4B] outline-none"
                  >
                    <option value="">Sem projeto / Operação Avulsa</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Checklist Inicial (Subtarefas)</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={taskChecklist1}
                    onChange={(e) => setTaskChecklist1(e.target.value)}
                    placeholder="1. Ex: Obter aprovação jurídica"
                    className="w-full px-3 py-1.5 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none text-xs"
                  />
                  <input
                    type="text"
                    value={taskChecklist2}
                    onChange={(e) => setTaskChecklist2(e.target.value)}
                    placeholder="2. Ex: Colher assinaturas das partes"
                    className="w-full px-3 py-1.5 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none text-xs"
                  />
                </div>
              </div>
            </>
          )}

          {/* EVENT FORM */}
          {quickCreateType === 'event' && (
            <>
              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Título da Reunião / Evento *</label>
                <input
                  type="text"
                  required
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  placeholder="Ex: Kickoff Operacional com Direção Médica"
                  className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Data</label>
                  <input
                    type="date"
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Início</label>
                  <input
                    type="time"
                    value={evtStartTime}
                    onChange={(e) => setEvtStartTime(e.target.value)}
                    className="w-full px-2.5 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Término</label>
                  <input
                    type="time"
                    value={evtEndTime}
                    onChange={(e) => setEvtEndTime(e.target.value)}
                    className="w-full px-2.5 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Local ou Link</label>
                <input
                  type="text"
                  value={evtLocation}
                  onChange={(e) => setEvtLocation(e.target.value)}
                  placeholder="Google Meet / Sede VERGROUP Faria Lima"
                  className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                />
              </div>
            </>
          )}

          {/* PROJECT FORM */}
          {quickCreateType === 'project' && (
            <>
              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Nome do Projeto *</label>
                <input
                  type="text"
                  required
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="Ex: Implantação CRM Holding 2026"
                  className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Código do Projeto</label>
                  <input
                    type="text"
                    value={projCode}
                    onChange={(e) => setProjCode(e.target.value)}
                    placeholder="PRJ-1020"
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Cliente / Empresa</label>
                  <select
                    value={projCompanyId}
                    onChange={(e) => setProjCompanyId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md bg-white focus:border-[#0F8A4B] outline-none"
                  >
                    <option value="">Projeto Interno (Sem Cliente)</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.tradeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Gerente do Projeto</label>
                  <select
                    value={projManagerId}
                    onChange={(e) => setProjManagerId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md bg-white focus:border-[#0F8A4B] outline-none"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Categoria de Serviço</label>
                  <input
                    type="text"
                    value={projService}
                    onChange={(e) => setProjService(e.target.value)}
                    placeholder="Ex: Consultoria / SaaS"
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Data Início</label>
                  <input
                    type="date"
                    value={projStartDate}
                    onChange={(e) => setProjStartDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Data Término</label>
                  <input
                    type="date"
                    value={projEndDate}
                    onChange={(e) => setProjEndDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Orçamento (R$)</label>
                  <input
                    type="number"
                    value={projBudget}
                    onChange={(e) => setProjBudget(e.target.value)}
                    placeholder="50000"
                    className="w-full px-2.5 py-2 border border-[#DDE3E8] rounded-md focus:border-[#0F8A4B] outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#DDE3E8] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setQuickCreateType(null)}
              className="px-3 py-2 border border-[#DDE3E8] text-[#5F6B76] hover:bg-[#F7F9FA] rounded-md font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-md font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Registro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
