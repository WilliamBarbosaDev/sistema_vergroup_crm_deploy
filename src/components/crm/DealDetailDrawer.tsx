import React, { useState } from 'react';
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  CheckCircle2,
  XCircle,
  Plus,
  Send,
  Sparkles,
  Clock,
  Tag,
  FileText,
  UploadCloud,
  ExternalLink,
  FolderKanban,
  DollarSign,
  CheckSquare,
  Filter,
  ShieldCheck,
  AlertCircle,
  MessageCircle,
  Check,
  Paperclip,
  Share2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DealDocument } from '../../types';

type DealDrawerTab = 'overview' | 'timeline' | 'tasks' | 'comms' | 'documents' | 'project' | 'contacts';

export const DealDetailDrawer: React.FC = () => {
  const {
    selectedDealId,
    setSelectedDealId,
    deals,
    pipelines,
    contacts,
    companies,
    users,
    tasks,
    activities,
    projects,
    clientAccounts,
    businessUnits,
    moveDealStage,
    markDealWon,
    markDealLost,
    addActivity,
    addDealDocument,
    linkContactToDeal,
    unlinkContactFromDeal,
    openTaskCreate,
    addTask,
    toggleTaskStatus,
    toggleChecklistItem,
    addTimeSpent,
    addTaskComment,
    sendEmail,
    sendWhatsAppMessage,
    whatsApps,
    emails,
    setCurrentTab,
    setSelectedTaskId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<DealDrawerTab>('overview');
  const [timelineFilter, setTimelineFilter] = useState<string>('all');
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'call' | 'meeting'>('note');
  
  // Modals
  const [lossReasonModal, setLossReasonModal] = useState(false);
  const [lossReasonInput, setLossReasonInput] = useState('');
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [selectedNewContactId, setSelectedNewContactId] = useState('');
  const [newContactRole, setNewContactRole] = useState('Patrocinador Técnico');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('usr-fernanda');
  const [newTaskDue, setNewTaskDue] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<DealDocument['type']>('proposal');

  if (!selectedDealId) return null;

  const deal = deals.find((d) => d.id === selectedDealId);
  if (!deal) return null;

  const pipeline = pipelines.find((p) => p.id === deal.pipelineId) || pipelines[0];
  const currentStage = pipeline?.stages.find((s) => s.id === deal.stageId) || pipeline?.stages[0];
  const bu = businessUnits.find((b) => b.id === deal.businessUnitId) || businessUnits[1];
  const primaryContact = contacts.find((c) => c.id === deal.contactId);
  const company = companies.find((c) => c.id === deal.companyId);
  const commercialLead = users.find((u) => u.id === deal.assignedUserId);
  const operationalLead = users.find((u) => u.id === (deal.operationalUserId || 'usr-rodrigo'));
  
  const relatedTasks = tasks.filter((t) => t.dealId === deal.id || (deal.companyId && t.clientId === deal.companyId));
  const relatedActivities = activities.filter((a) => a.entityId === deal.id);
  const relatedEmails = emails.filter((e) => e.relatedDealId === deal.id);
  const relatedWhatsApp = whatsApps.find((w) => w.dealId === deal.id || (primaryContact && w.contactName.includes(primaryContact.name.split(' ')[0])));
  const generatedProject = projects.find((p) => p.dealId === deal.id);
  const generatedClient = clientAccounts.find((c) => c.dealIdOrigin === deal.id);

  // Financial status helper
  const getFinancialStatusBadge = (status?: string) => {
    switch (status) {
      case 'paid':
        return <span className="bg-emerald-50 text-[#0F8A4B] border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">Pago</span>;
      case 'invoiced':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold">Faturado</span>;
      case 'contract_signed':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[11px] font-semibold">Contrato Assinado</span>;
      case 'contract_sent':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">Contrato Enviado</span>;
      default:
        return <span className="bg-neutral-100 text-neutral-700 border border-neutral-200 px-2 py-0.5 rounded text-[11px] font-semibold">Pendente Financeiro</span>;
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    addActivity({
      entityType: 'deal',
      entityId: deal.id,
      businessUnitId: deal.businessUnitId,
      userId: commercialLead?.id || 'usr-william',
      type: noteType,
      title: noteType === 'call' ? 'Registro de Chamada Telefônica' : noteType === 'meeting' ? 'Registro de Reunião com Cliente' : 'Nota Interna Registrada',
      description: newNote.trim(),
    });
    setNewNote('');
  };

  const handleConfirmLoss = () => {
    if (!lossReasonInput.trim()) return;
    markDealLost(deal.id, lossReasonInput.trim());
    setLossReasonModal(false);
    setSelectedDealId(null);
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewContactId) return;
    linkContactToDeal(deal.id, selectedNewContactId, newContactRole);
    setShowAddContactModal(false);
    setSelectedNewContactId('');
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      businessUnitId: deal.businessUnitId,
      title: newTaskTitle.trim(),
      description: `Tarefa associada ao negócio "${deal.title}"`,
      status: 'pending',
      priority: 'high',
      dueDate: newTaskDue,
      assignedUserId: newTaskAssignee,
      participantIds: [deal.assignedUserId],
      observerIds: ['usr-william'],
      dealId: deal.id,
      checklist: [
        { id: `chk-${Date.now()}-1`, text: 'Alinhar com o contato do cliente', completed: false },
        { id: `chk-${Date.now()}-2`, text: 'Registrar evidência na linha do tempo', completed: false },
      ],
      tags: ['CRM', 'Negócio'],
    });
    setNewTaskTitle('');
    setShowAddTaskModal(false);
  };

  const handleSendEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !primaryContact?.email) return;
    sendEmail(primaryContact.email, emailSubject.trim(), emailBody.trim(), deal.id);
    setEmailSubject('');
    setEmailBody('');
    setShowEmailModal(false);
  };

  const handleUploadDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    addDealDocument(deal.id, {
      name: docName.trim(),
      type: docType,
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
    });
    setDocName('');
    setShowUploadModal(false);
  };

  // Filter activities
  const filteredActivities = relatedActivities.filter((act) => {
    if (timelineFilter === 'all') return true;
    if (timelineFilter === 'note') return act.type === 'note';
    if (timelineFilter === 'stage') return act.type === 'stage_change';
    if (timelineFilter === 'email') return act.type === 'email';
    if (timelineFilter === 'meetings') return act.type === 'meeting' || act.type === 'call';
    if (timelineFilter === 'system') return act.type === 'system_automation' || act.type === 'file_upload' || act.type === 'status_change';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div
        className="w-full max-w-[96vw] max-h-[95vh] bg-white rounded-2xl shadow-2xl border border-[#DDE3E8] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 border-b border-[#DDE3E8] flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center border border-[#0F8A4B]/20 shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {bu.code}
                </span>
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">{deal.title}</h1>
                {deal.status === 'won' && (
                  <span className="bg-emerald-50 text-[#0F8A4B] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
                    ✓ Venda Ganha
                  </span>
                )}
                {deal.status === 'lost' && (
                  <span className="bg-red-50 text-red-700 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-red-200">
                    ✕ Perdido
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Funil: <strong className="text-slate-800 font-bold">{pipeline?.name}</strong></span>
                <span>•</span>
                <span>Valor: <strong className="text-[#0F8A4B] font-black">R$ {deal.value.toLocaleString('pt-BR')}</strong></span>
                <span>•</span>
                <span>Origem: <strong className="text-slate-700 font-semibold capitalize">{deal.leadSource || 'WhatsApp'}</strong></span>
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2">
            {deal.status === 'open' && (
              <>
                <button
                  id="deal-drawer-mark-won-btn"
                  onClick={() => markDealWon(deal.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-lg text-xs font-extrabold shadow-sm shadow-emerald-700/20 hover:shadow-md cursor-pointer transition-all"
                  title="Ganhar negócio e disparar automaticamente o Onboarding e Projeto de Execução"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Venda Ganha</span>
                </button>
                <button
                  id="deal-drawer-mark-lost-btn"
                  onClick={() => setLossReasonModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:border-rose-300 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-lg text-xs font-bold cursor-pointer transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Perdido</span>
                </button>
              </>
            )}
            <button
              id="deal-drawer-close-btn"
              onClick={() => setSelectedDealId(null)}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pipeline Stage Bar */}
        <div className="px-4 py-2 bg-slate-50/80 border-b border-[#DDE3E8] flex items-center gap-1.5 overflow-x-auto">
          {(() => {
            const currentStageIdx = pipeline?.stages.findIndex((s) => s.id === deal.stageId) ?? 0;
            const activeIdx = currentStageIdx >= 0 ? currentStageIdx : 0;

            return pipeline?.stages.map((stage, idx) => {
              const isCurrent = idx === activeIdx;
              const isPassed = idx < activeIdx;

              return (
                <button
                  key={stage.id}
                  onClick={() => moveDealStage(deal.id, stage.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border cursor-pointer ${
                    isCurrent
                      ? 'bg-[#0F8A4B] text-white border-[#0F8A4B] font-black shadow-2xs'
                      : isPassed
                      ? 'bg-emerald-50 text-[#0F8A4B] border-emerald-300 font-extrabold hover:bg-emerald-100'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 font-medium'
                  }`}
                  title={isCurrent ? `Etapa Atual: ${stage.name}` : isPassed ? `Etapa Percorrida: ${stage.name}` : `Etapa Futura: ${stage.name}`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[10px] ${
                    isCurrent ? 'bg-white/20 text-white font-bold' : isPassed ? 'bg-emerald-200/60 text-[#0F8A4B] font-bold' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <span>{stage.name}</span>
                  {(isCurrent || isPassed) && <Check className="w-3.5 h-3.5 shrink-0" />}
                  <span className="text-[10px] opacity-80 font-normal">({stage.probability}%)</span>
                </button>
              );
            });
          })()}
        </div>

        {/* Tabs Bar */}
        <div className="px-4 py-2 bg-white border-b border-[#DDE3E8] flex items-center gap-2 text-xs font-bold text-slate-600 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#0F8A4B] text-white font-extrabold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100/80 font-semibold'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Dados Estruturados (360°)</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-[#0F8A4B] text-white font-extrabold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100/80 font-semibold'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Linha do Tempo ({relatedActivities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-[#0F8A4B] text-white font-extrabold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100/80 font-semibold'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tarefas ({relatedTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comms')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'comms'
                ? 'bg-[#0F8A4B] text-white font-extrabold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100/80 font-semibold'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>E-mails & WhatsApp ({relatedEmails.length + (relatedWhatsApp ? 1 : 0)})</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-[#0F8A4B] text-white font-extrabold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100/80 font-semibold'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documentos ({(deal.documents || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-[#0F8A4B] text-white font-extrabold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100/80 font-semibold'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Contatos ({(deal.additionalContacts || []).length})</span>
          </button>

          {deal.status === 'won' && (
            <button
              onClick={() => setActiveTab('project')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'project'
                  ? 'bg-[#0F8A4B] text-white font-extrabold shadow-2xs'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold border border-emerald-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Projeto de Execução</span>
            </button>
          )}
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/60">
          {/* TAB 1: OVERVIEW / DADOS ESTRUTURADOS */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Core Cards */}
              <div className="md:col-span-7 space-y-4">
                {/* Financial & Contract Overview */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3.5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Termos Comerciais & Financeiros
                    </span>
                    {getFinancialStatusBadge(deal.financialStatus)}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 bg-[#ECF8F1] rounded-xl border border-[#0F8A4B]/20">
                      <span className="text-[11px] font-bold text-[#0F8A4B]/80 block">Valor Total do Negócio</span>
                      <span className="text-2xl font-black text-[#0F8A4B]">R$ {deal.value.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-500 block">Previsão de Fechamento</span>
                      <span className="text-base font-extrabold text-slate-900">{deal.expectedCloseDate}</span>
                    </div>
                  </div>
                  <div className="text-xs space-y-2 pt-1">
                    <div className="flex justify-between text-slate-600 pb-1 border-b border-slate-100">
                      <span>Plano / Categoria de Serviço:</span>
                      <strong className="text-slate-900 font-extrabold">{deal.serviceCategory}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 pb-1 border-b border-slate-100">
                      <span>Empresa do Grupo (Unidade):</span>
                      <strong className="text-slate-900 font-extrabold">{bu.name}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Data de Entrada no CRM:</span>
                      <strong className="text-slate-900 font-extrabold">{new Date(deal.createdAt).toLocaleDateString('pt-BR')}</strong>
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3.5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-700" />
                      <span>Empresa do Cliente</span>
                    </span>
                    {company && (
                      <span className="text-[11px] px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-bold">
                        {company.segment}
                      </span>
                    )}
                  </div>

                  {company ? (
                    <div className="space-y-3 text-xs">
                      <div>
                        <h4 className="text-base font-black text-slate-900">{company.tradeName}</h4>
                        <p className="text-slate-500 font-medium">{company.corporateName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">CNPJ</span>
                          <span className="font-extrabold text-slate-800">{company.cnpj}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Health Score</span>
                          <span className="font-extrabold text-emerald-700 flex items-center gap-1 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{company.healthScore.toUpperCase()} ({company.npsScore || 90} NPS)</span>
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">E-mail Corporativo</span>
                          <span className="font-semibold text-slate-800 truncate block">{company.email}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Telefone</span>
                          <span className="font-semibold text-slate-800">{company.phone}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Nenhuma empresa associada.</p>
                  )}
                </div>

                {/* Custom Fields & Technical Parameters */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 hover:shadow-sm transition-shadow">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Campos Personalizados & Escopo Técnico
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] text-slate-500 font-bold block">SLA Contratado</span>
                      <strong className="text-slate-900 font-extrabold">4 Horas (Crítico) / 12h Padrão</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] text-slate-500 font-bold block">Tipo de Cobrança</span>
                      <strong className="text-slate-900 font-extrabold">Mensal Recorrente (MRR)</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] text-slate-500 font-bold block">Ambiente Operacional</span>
                      <strong className="text-slate-900 font-extrabold">Nuvem Dedicada + API W-API</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] text-slate-500 font-bold block">Auditoria & Compliance</span>
                      <strong className="text-slate-900 font-extrabold">Rastreabilidade Total LGPD</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: People & Team */}
              <div className="md:col-span-5 space-y-4">
                {/* Primary Contact Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3.5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Contato Principal</span>
                    </span>
                    <button
                      onClick={() => setShowEmailModal(true)}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Enviar E-mail</span>
                    </button>
                  </div>

                  {primaryContact ? (
                    <div className="space-y-3 text-xs">
                      <div>
                        <h4 className="text-base font-black text-slate-900">{primaryContact.name}</h4>
                        <p className="text-slate-500 font-medium">{primaryContact.jobTitle || 'Contato Decisor'}</p>
                      </div>
                      <div className="space-y-2 pt-1 text-slate-700">
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                          <Phone className="w-4 h-4 text-[#0F8A4B]" />
                          <span className="font-bold text-[#0F8A4B]">{primaryContact.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <span className="font-semibold text-slate-800 truncate">{primaryContact.email}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Nenhum contato principal associado.</p>
                  )}
                </div>

                {/* Internal Responsible Team */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3.5 hover:shadow-sm transition-shadow">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Equipe Interna Responsável
                  </span>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Responsável Comercial</span>
                        <strong className="text-slate-900 font-extrabold text-sm">{commercialLead?.name}</strong>
                        <p className="text-[11px] text-slate-500 font-medium">{commercialLead?.jobTitle}</p>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 bg-blue-50 text-blue-700 font-extrabold rounded-md border border-blue-200">
                        Vendas
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Líder Operacional / Implantação</span>
                        <strong className="text-slate-900 font-extrabold text-sm">{operationalLead?.name}</strong>
                        <p className="text-[11px] text-slate-500 font-medium">{operationalLead?.jobTitle}</p>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 bg-purple-50 text-purple-700 font-extrabold rounded-md border border-purple-200">
                        Operações
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2.5 hover:shadow-sm transition-shadow">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Tags do Negócio
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {deal.tags.map((t) => (
                      <span key={t} className="bg-slate-100 text-slate-800 border border-slate-200 text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs">
                        <Tag className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UNIFIED TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Quick Note Registration Bar */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-800">Registrar Evento na Linha do Tempo:</span>
                    <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setNoteType('note')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${noteType === 'note' ? 'bg-white font-bold text-neutral-900 shadow-xs' : 'text-neutral-600'}`}
                      >
                        Nota Interna
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoteType('call')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${noteType === 'call' ? 'bg-white font-bold text-neutral-900 shadow-xs' : 'text-neutral-600'}`}
                      >
                        Ligação Feita
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoteType('meeting')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${noteType === 'meeting' ? 'bg-white font-bold text-neutral-900 shadow-xs' : 'text-neutral-600'}`}
                      >
                        Reunião Realizada
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={
                      noteType === 'call'
                        ? 'Resumo da ligação telefônica com o cliente...'
                        : noteType === 'meeting'
                        ? 'Ata ou pontos decididos na reunião...'
                        : 'Comentário ou anotação importante para a equipe...'
                    }
                    className="flex-1 px-3.5 py-2 border border-neutral-300 rounded-lg text-xs outline-none focus:border-[#0F8A4B] focus:ring-1 focus:ring-[#0F8A4B]"
                  />
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Registrar</span>
                  </button>
                </form>
              </div>

              {/* Timeline Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-neutral-500 font-semibold flex items-center gap-1 shrink-0">
                  <Filter className="w-3.5 h-3.5" /> Filtrar:
                </span>
                {[
                  { id: 'all', label: 'Todos os Eventos' },
                  { id: 'note', label: 'Notas' },
                  { id: 'stage', label: 'Mudanças de Etapa' },
                  { id: 'email', label: 'E-mails' },
                  { id: 'meetings', label: 'Reuniões & Ligações' },
                  { id: 'system', label: 'Automações & Sistema' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTimelineFilter(f.id)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                      timelineFilter === f.id
                        ? 'bg-neutral-800 text-white font-bold'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Activity Timeline List */}
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs space-y-4">
                {filteredActivities.length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-500">
                    Nenhuma atividade correspondente aos filtros selecionados.
                  </div>
                ) : (
                  filteredActivities.map((act) => {
                    const userObj = users.find((u) => u.id === act.userId);
                    const isCall = act.type === 'call' || act.callRecord;
                    const call = act.callRecord;

                    return (
                      <div key={act.id} className="flex items-start gap-3 text-xs border-l-2 border-[#0F8A4B] pl-3 relative">
                        <div className="w-3 h-3 rounded-full bg-[#0F8A4B] absolute -left-[7px] top-1.5 ring-4 ring-white" />
                        <div className="flex-1 bg-white p-4 rounded-xl border border-[#DDE3E8] shadow-2xs space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {isCall ? (
                                <span className={`p-1.5 rounded-md ${call?.status === 'missed' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-[#0F8A4B]'}`}>
                                  <Phone className="w-4 h-4" />
                                </span>
                              ) : (
                                <span className="p-1.5 rounded-md bg-neutral-100 text-neutral-700">
                                  <FileText className="w-4 h-4" />
                                </span>
                              )}
                              <div>
                                <span className="font-bold text-[#17212B] text-xs block">{act.title}</span>
                                {call && (
                                  <span className="text-[11px] text-[#5F6B76]">
                                    {call.callerName} • {call.carrier || 'Fale Fácil VoIP'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] text-[#5F6B76] shrink-0 font-medium">
                              {new Date(act.createdAt).toLocaleDateString('pt-BR')} às {new Date(act.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {act.description && <p className="text-[#17212B] text-xs leading-relaxed">{act.description}</p>}

                          {/* VoIP Audio Player Widget */}
                          {call && call.durationSeconds > 0 && (
                            <div className="mt-3 p-3 bg-[#F7F9FA] rounded-lg border border-[#DDE3E8] space-y-2.5">
                              <div className="flex items-center justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Simulated play toggle
                                    const audioElem = document.getElementById(`audio-play-${act.id}`);
                                    if (audioElem) {
                                      audioElem.classList.toggle('playing');
                                    }
                                  }}
                                  className="w-8 h-8 rounded-full bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                                >
                                  <span className="text-xs">▶</span>
                                </button>

                                {/* Waveform graphic */}
                                <div id={`audio-play-${act.id}`} className="flex-1 flex items-center gap-1 h-6 px-2 bg-white rounded border border-[#DDE3E8]">
                                  {[40, 60, 20, 80, 100, 75, 45, 90, 65, 30, 85, 95, 70, 50, 80, 60, 40, 25, 90, 70, 50, 30, 60, 80].map((h, i) => (
                                    <div
                                      key={i}
                                      className="flex-1 bg-[#0F8A4B]/40 rounded-full transition-all duration-300 hover:bg-[#0F8A4B]"
                                      style={{ height: `${h}%` }}
                                    />
                                  ))}
                                </div>

                                <div className="text-[11px] font-mono font-bold text-[#17212B] shrink-0">
                                  00:00 / 00:{call.durationSeconds < 10 ? `0${call.durationSeconds}` : call.durationSeconds}
                                </div>
                              </div>

                              {/* AI Transcription preview */}
                              {call.aiTranscription && (
                                <div className="p-2.5 bg-white rounded border border-emerald-100 text-xs text-[#17212B] space-y-1">
                                  <div className="flex items-center justify-between text-[10px] text-[#0F8A4B] font-bold uppercase tracking-wider">
                                    <span className="flex items-center gap-1">
                                      <Sparkles className="w-3 h-3" /> Transcrição Inteligente (IA)
                                    </span>
                                    <span>Avaliação: 5.0 ⭐</span>
                                  </div>
                                  <p className="italic text-[#5F6B76]">"{call.aiTranscription}"</p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="pt-1 text-[10px] text-[#5F6B76] flex items-center justify-between">
                            <span>Registrado por: <strong>{userObj?.name || 'Sistema VERGROUP'}</strong></span>
                            {call && (
                              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                                Gravado via Fale Fácil VoIP
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Tarefas Vinculadas ao Negócio</h3>
                  <p className="text-xs text-neutral-500">Acompanhamento de entregas comerciais e operacionais</p>
                </div>
                <button
                  id="deal-drawer-new-task-btn"
                  onClick={() => openTaskCreate({ dealId: deal.id, companyId: deal.companyId, contactId: deal.contactId, businessUnitId: deal.businessUnitId })}
                  className="px-3 py-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Tarefa</span>
                </button>
              </div>

              <div className="space-y-3">
                {relatedTasks.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center text-xs text-neutral-500 border border-neutral-200">
                    Nenhuma tarefa criada para este negócio ainda.
                  </div>
                ) : (
                  relatedTasks.map((t) => {
                    const taskAssignee = users.find((u) => u.id === t.assignedUserId);
                    const completedItems = t.checklist.filter((i) => i.completed).length;
                    const totalItems = t.checklist.length;
                    return (
                      <div key={t.id} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={t.status === 'completed'}
                              onChange={() => toggleTaskStatus(t.id)}
                              className="w-4 h-4 rounded text-[#0F8A4B] focus:ring-[#0F8A4B] mt-0.5 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {t.protocolNumber && (
                                  <span className="font-mono text-[10px] font-black text-[#0F8A4B] bg-[#ECF8F1] px-1.5 py-0.2 rounded border border-[#0F8A4B]/20">
                                    📋 {t.protocolNumber}
                                  </span>
                                )}
                                <h4 className={`text-xs font-bold ${t.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                                  {t.title}
                                </h4>
                              </div>
                              {t.description && <p className="text-xs text-neutral-500 mt-0.5">{t.description}</p>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] px-2 py-0.5 bg-neutral-100 rounded text-neutral-700 font-semibold">
                              Prazo: {t.dueDate}
                            </span>
                            <button
                              onClick={() => addTimeSpent(t.id, 0.5)}
                              className="text-[11px] px-2 py-0.5 bg-emerald-50 text-[#0F8A4B] rounded border border-emerald-200 font-bold hover:bg-emerald-100 cursor-pointer"
                              title="Adicionar 30 min de tempo gasto"
                            >
                              +30m ({t.spentHours || 0}h)
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTaskId(t.id);
                                setCurrentTab('work-tasks');
                              }}
                              className="p-1 hover:bg-neutral-100 rounded text-neutral-500"
                              title="Abrir no painel de tarefas"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Checklist */}
                        {totalItems > 0 && (
                          <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200/60 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600">
                              <span>Checklist de Execução ({completedItems}/{totalItems})</span>
                              <span>{Math.round((completedItems / totalItems) * 100)}%</span>
                            </div>
                            <div className="space-y-1">
                              {t.checklist.map((item) => (
                                <label key={item.id} className="flex items-center gap-2 cursor-pointer text-neutral-700">
                                  <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() => toggleChecklistItem(t.id, item.id)}
                                    className="w-3.5 h-3.5 text-[#0F8A4B] rounded cursor-pointer"
                                  />
                                  <span className={item.completed ? 'line-through text-neutral-400' : ''}>{item.text}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                          <span>Responsável: <strong className="text-neutral-800">{taskAssignee?.name}</strong></span>
                          <span>Prioridade: <strong className="uppercase text-amber-700">{t.priority}</strong></span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COMMS (EMAIL & WHATSAPP) */}
          {activeTab === 'comms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Comunicações Integradas</h3>
                  <p className="text-xs text-neutral-500">Histórico de e-mails corporativos e mensagens do WhatsApp</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="px-3 py-1.5 bg-[#0F8A4B] text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-[#0B6B3A]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Escrever E-mail</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp Card if active */}
              {relatedWhatsApp && (
                <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-3 bg-emerald-50/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-[#0F8A4B]" />
                      <span>Conversa de WhatsApp Ativa ({relatedWhatsApp.contactName})</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded uppercase">
                      {relatedWhatsApp.status}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-neutral-200 text-xs space-y-2 max-h-48 overflow-y-auto">
                    {relatedWhatsApp.messages.map((m) => (
                      <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2 rounded-lg max-w-[80%] ${m.sender === 'user' ? 'bg-[#0F8A4B] text-white' : 'bg-neutral-100 text-neutral-800'}`}>
                          <p>{m.text}</p>
                          <span className="text-[9px] opacity-70 block text-right mt-0.5">
                            {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Emails */}
              <div className="space-y-3">
                {relatedEmails.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center text-xs text-neutral-500 border border-neutral-200">
                    Nenhum e-mail vinculado a este negócio. Use o botão acima para enviar uma mensagem oficial.
                  </div>
                ) : (
                  relatedEmails.map((eml) => (
                    <div key={eml.id} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900 text-sm">{eml.subject}</span>
                        <span className="text-[11px] text-neutral-500">
                          {new Date(eml.receivedAt).toLocaleDateString('pt-BR')} {new Date(eml.receivedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-neutral-500">De: <strong>{eml.from.name}</strong> &lt;{eml.from.email}&gt;</p>
                      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-neutral-800 whitespace-pre-wrap leading-relaxed">
                        {eml.body}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Documentos, Propostas & Contratos</h3>
                  <p className="text-xs text-neutral-500">Repositório de arquivos vinculados a esta negociação</p>
                </div>
                <button
                  id="deal-drawer-upload-doc-btn"
                  onClick={() => setShowUploadModal(true)}
                  className="px-3 py-1.5 bg-[#0F8A4B] text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-[#0B6B3A]"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Anexar Documento</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(deal.documents || []).length === 0 ? (
                  <div className="col-span-2 bg-white rounded-xl p-8 text-center text-xs text-neutral-500 border border-neutral-200">
                    Nenhum documento anexado ainda. Anexe propostas comerciais, NDAs ou minutas de contrato.
                  </div>
                ) : (
                  deal.documents?.map((doc) => (
                    <div key={doc.id} className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <h4 className="font-bold text-neutral-900 truncate">{doc.name}</h4>
                        <p className="text-neutral-500 text-[11px]">Tipo: <strong className="uppercase">{doc.type}</strong> • {doc.size}</p>
                        <p className="text-neutral-400 text-[10px] mt-1">Enviado por {doc.uploadedBy} em {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Múltiplos Contatos Vinculados</h3>
                  <p className="text-xs text-neutral-500">Decisores, patrocinadores técnicos e operadores que participam da negociação</p>
                </div>
                <button
                  id="deal-drawer-add-contact-btn"
                  onClick={() => setShowAddContactModal(true)}
                  className="px-3 py-1.5 bg-[#0F8A4B] text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-[#0B6B3A]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Vincular Contato</span>
                </button>
              </div>

              <div className="space-y-3">
                {/* Primary contact first */}
                {primaryContact && (
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                        {primaryContact.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-neutral-900">{primaryContact.name}</h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
                            CONTATO PRINCIPAL
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">{primaryContact.jobTitle} • {primaryContact.phone} • {primaryContact.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional contacts */}
                {(deal.additionalContacts || []).map((ac) => {
                  const cont = contacts.find((c) => c.id === ac.contactId);
                  if (!cont) return null;
                  return (
                    <div key={ac.contactId} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold text-xs">
                          {cont.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-neutral-900">{cont.name}</h4>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700 font-semibold">
                              {ac.role}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500">{cont.jobTitle} • {cont.phone} • {cont.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => unlinkContactFromDeal(deal.id, ac.contactId)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Desvincular
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: GENERATED PROJECT (WHEN WON) */}
          {activeTab === 'project' && deal.status === 'won' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-[#0F8A4B] rounded-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">Projeto Operacional Criado Automaticamente</h3>
                    <p className="text-xs text-emerald-800">
                      Venda Ganha disparou a transição da equipe comercial para a equipe de implantação e CS
                    </p>
                  </div>
                </div>
                {generatedProject && (
                  <button
                    onClick={() => {
                      setCurrentTab('work-projects');
                      setSelectedDealId(null);
                    }}
                    className="px-3.5 py-2 bg-[#0F8A4B] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 hover:bg-[#0B6B3A] cursor-pointer"
                  >
                    <span>Abrir no Módulo Projetos</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {generatedProject && (
                <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-neutral-400 block">{generatedProject.code}</span>
                      <h4 className="text-base font-bold text-neutral-900">{generatedProject.name}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-neutral-400 block">Progresso Geral</span>
                      <span className="text-lg font-bold text-[#0F8A4B]">{generatedProject.progressPercentage}%</span>
                    </div>
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                      Marcos de Implantação (SLA de Onboarding)
                    </span>
                    <div className="space-y-1.5">
                      {generatedProject.milestones.map((m) => (
                        <div key={m.id} className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-xs">
                          <span className={m.completed ? 'line-through text-neutral-400 font-medium' : 'text-neutral-900 font-semibold'}>
                            {m.title}
                          </span>
                          <span className="text-[11px] text-neutral-500 font-medium">Prazo: {m.dueDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* LOSS REASON MODAL */}
        {lossReasonModal && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-neutral-200 space-y-4">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>Descartar Negócio (Motivo Obrigatório - PRD DEAL-05)</span>
              </div>
              <p className="text-xs text-neutral-600">
                Para auditoria e cálculo de conversão, registre o motivo de perda do negócio <strong>"{deal.title}"</strong>:
              </p>
              <textarea
                rows={3}
                required
                value={lossReasonInput}
                onChange={(e) => setLossReasonInput(e.target.value)}
                placeholder="Ex: Preço acima do budget do cliente / Escolheu concorrente / Projeto postergado para 2027"
                className="w-full p-3 border border-neutral-300 rounded-lg text-xs outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLossReasonModal(false)}
                  className="px-3.5 py-2 border border-neutral-300 text-xs font-medium rounded-lg hover:bg-neutral-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!lossReasonInput.trim()}
                  onClick={handleConfirmLoss}
                  className="px-4 py-2 bg-red-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Confirmar Perda
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADD CONTACT MODAL */}
        {showAddContactModal && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-neutral-200 space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Vincular Contato Adicional</h3>
              <form onSubmit={handleAddContactSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Selecione o Contato:</label>
                  <select
                    value={selectedNewContactId}
                    onChange={(e) => setSelectedNewContactId(e.target.value)}
                    required
                    className="w-full p-2.5 border border-neutral-300 rounded-lg outline-none focus:border-[#0F8A4B]"
                  >
                    <option value="">Selecione...</option>
                    {contacts
                      .filter((c) => c.id !== deal.contactId && !(deal.additionalContacts || []).some((ac) => ac.contactId === c.id))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.jobTitle || 'Sem cargo'})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Papel na Negociação:</label>
                  <select
                    value={newContactRole}
                    onChange={(e) => setNewContactRole(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg outline-none focus:border-[#0F8A4B]"
                  >
                    <option value="Decisor Financeiro">Decisor Financeiro</option>
                    <option value="Patrocinador Técnico">Patrocinador Técnico</option>
                    <option value="Jurídico / Compliance">Jurídico / Compliance</option>
                    <option value="Usuário Chave (Key User)">Usuário Chave (Key User)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddContactModal(false)}
                    className="px-3.5 py-2 border border-neutral-300 text-xs font-medium rounded-lg hover:bg-neutral-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedNewContactId}
                    className="px-4 py-2 bg-[#0F8A4B] text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Salvar Vínculo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE TASK MODAL */}
        {showAddTaskModal && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-neutral-200 space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Nova Tarefa para o Negócio</h3>
              <form onSubmit={handleCreateTaskSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Título da Tarefa:</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Ex: Enviar minuta revisada de proposta comercial"
                    className="w-full p-2.5 border border-neutral-300 rounded-lg outline-none focus:border-[#0F8A4B]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Responsável:</label>
                    <select
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded-lg"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Data Limite:</label>
                    <input
                      type="date"
                      value={newTaskDue}
                      onChange={(e) => setNewTaskDue(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModal(false)}
                    className="px-3.5 py-2 border border-neutral-300 text-xs font-medium rounded-lg hover:bg-neutral-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="px-4 py-2 bg-[#0F8A4B] text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Criar Tarefa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EMAIL COMPOSER MODAL */}
        {showEmailModal && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 border border-neutral-200 space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Enviar E-mail Corporativo</h3>
              <form onSubmit={handleSendEmailSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Destinatário:</label>
                  <input
                    type="text"
                    disabled
                    value={`${primaryContact?.name || ''} <${primaryContact?.email || 'sem e-mail'}>`}
                    className="w-full p-2.5 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-600"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Assunto:</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Ex: Proposta Comercial Atualizada - VERGROUP"
                    className="w-full p-2.5 border border-neutral-300 rounded-lg outline-none focus:border-[#0F8A4B]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Mensagem:</label>
                  <textarea
                    rows={5}
                    required
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Olá, prezado(a), segue a minuta acordada..."
                    className="w-full p-2.5 border border-neutral-300 rounded-lg outline-none focus:border-[#0F8A4B]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-3.5 py-2 border border-neutral-300 text-xs font-medium rounded-lg hover:bg-neutral-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!emailSubject.trim() || !primaryContact?.email}
                    className="px-4 py-2 bg-[#0F8A4B] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar E-mail</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* UPLOAD DOCUMENT MODAL */}
        {showUploadModal && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-neutral-200 space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Anexar Documento ao Negócio</h3>
              <form onSubmit={handleUploadDocSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Nome do Arquivo:</label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="Ex: Proposta_Comercial_v2_NexusLog.pdf"
                    className="w-full p-2.5 border border-neutral-300 rounded-lg outline-none focus:border-[#0F8A4B]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Tipo de Documento:</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DealDocument['type'])}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg outline-none focus:border-[#0F8A4B]"
                  >
                    <option value="proposal">Proposta Comercial</option>
                    <option value="contract">Minuta / Contrato</option>
                    <option value="briefing">Briefing Técnico</option>
                    <option value="nda">Termo de Confidencialidade (NDA)</option>
                    <option value="other">Outro Arquivo</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-3.5 py-2 border border-neutral-300 text-xs font-medium rounded-lg hover:bg-neutral-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!docName.trim()}
                    className="px-4 py-2 bg-[#0F8A4B] text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Anexar Arquivo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
