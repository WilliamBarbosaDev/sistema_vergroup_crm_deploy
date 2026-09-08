import React, { useState } from 'react';
import {
  X,
  Building2,
  Clock,
  User,
  Plus,
  Trash2,
  AtSign,
  CheckSquare,
  ListTodo,
  ShieldCheck,
  Calendar as CalendarIcon,
  Paperclip,
  Mail,
  ArrowRight,
  Sparkles,
  Layers,
  RotateCcw,
  Bot,
  Bookmark,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskPriority, TaskStatus, ChecklistItem, TaskRecurrenceRule } from '../../types';
import { TaskAiAssistantModal } from './TaskAiAssistantModal';
import { ParsedTaskAiResult } from '../../services/taskAiService';

export const TaskCreateWorkspace: React.FC = () => {
  const {
    isTaskCreateOpen,
    closeTaskCreate,
    taskCreateContext,
    selectedBusinessUnitId,
    businessUnits,
    projects,
    companies,
    contacts,
    deals,
    tasks,
    taskTemplates,
    addTaskTemplate,
    users,
    currentUser,
    addTask,
    setSelectedTaskId,
  } = useApp();

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Recurrence State
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom'>('none');
  const [recurrenceMonthDay, setRecurrenceMonthDay] = useState<number>(10);
  const [recurrenceGenerateDaysAhead, setRecurrenceGenerateDaysAhead] = useState<number>(5);
  const [estimatedHours, setEstimatedHours] = useState<number>(2);

  if (!isTaskCreateOpen) return null;

  // Resolve BU ID
  const activeBUId = taskCreateContext?.businessUnitId || (selectedBusinessUnitId === 'bu-all' ? 'bu-tech' : selectedBusinessUnitId);
  const currentBU = businessUnits.find((b) => b.id === activeBUId) || businessUnits[0];

  // Resolve context defaults
  const initialProjectId = taskCreateContext?.projectId || '';
  const initialCompanyId = taskCreateContext?.companyId || '';
  const initialContactId = taskCreateContext?.contactId || '';
  const initialDealId = taskCreateContext?.dealId || '';
  const initialParentTaskId = taskCreateContext?.parentTaskId || '';
  const initialAssigneeId = taskCreateContext?.assignedUserId || currentUser.id;
  const initialOwnerId = taskCreateContext?.ownerUserId || currentUser.id;
  const initialTitle = taskCreateContext?.initialTitle || '';

  // Form State
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [buId, setBuId] = useState(activeBUId);
  const [ownerUserId, setOwnerUserId] = useState(initialOwnerId);
  const [assignedUserId, setAssignedUserId] = useState(initialAssigneeId);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  
  // Date & Time
  const defaultDueDate = taskCreateContext?.initialDueDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const [dueDateOnly, setDueDateOnly] = useState(defaultDueDate);
  const [dueTimeOnly, setDueTimeOnly] = useState('17:00');

  // Governance & Restrictions
  const [requireCompletionSummary, setRequireCompletionSummary] = useState(false);
  const [confirmedInternal, setConfirmedInternal] = useState(false);

  // Entities & Relations
  const [projectId, setProjectId] = useState(initialProjectId);
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [contactId, setContactId] = useState(initialContactId);
  const [dealId, setDealId] = useState(initialDealId);
  const [parentTaskId, setParentTaskId] = useState(initialParentTaskId);

  // Multi-people arrays
  const [participantIds, setParticipantIds] = useState<string[]>([initialAssigneeId]);
  const [observerIds, setObserverIds] = useState<string[]>([initialOwnerId]);
  const [tags, setTags] = useState<string[]>(['VERGROUP Tasks']);

  // Checklist Draft State
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: `chk-${Date.now()}-1`, text: 'Alinhar requisitos e premissas operacionais', completed: false },
    { id: `chk-${Date.now()}-2`, text: 'Executar a demanda conforme SLA do VERGROUP', completed: false },
  ]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Attachments Draft State
  const [draftAttachments, setDraftAttachments] = useState<{ id: string; name: string; sizeBytes: number; fileUrl: string }[]>([]);

  // Mentions Panel State
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentionPanel, setShowMentionPanel] = useState(false);

  // CRM Search Queries
  const [companySearchQuery, setCompanySearchQuery] = useState('');

  // Selected Entity Objects
  const boundProject = projects.find((p) => p.id === projectId);
  const boundCompany = companies.find((c) => c.id === companyId);
  const boundContact = contacts.find((c) => c.id === contactId);
  const boundDeal = deals.find((d) => d.id === dealId);
  const boundParentTask = tasks.find((t) => t.id === parentTaskId);

  // Preset Date Shortcut Handlers
  const handleShortcutDate = (type: 'today' | 'tomorrow' | 'end_week' | 'one_week' | 'end_month') => {
    const now = new Date();
    let target = new Date();

    if (type === 'today') {
      target = now;
    } else if (type === 'tomorrow') {
      target.setDate(now.getDate() + 1);
    } else if (type === 'end_week') {
      const day = now.getDay();
      const diff = now.getDate() + (5 - day + (day >= 5 ? 7 : 0));
      target.setDate(diff);
    } else if (type === 'one_week') {
      target.setDate(now.getDate() + 7);
    } else if (type === 'end_month') {
      target = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    setDueDateOnly(target.toISOString().split('T')[0]);
  };

  // Checklist Actions
  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems([
      ...checklistItems,
      { id: `chk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter((i) => i.id !== id));
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)));
  };

  // Attachments Actions
  const handleRemoveDraftAttachment = (id: string) => {
    setDraftAttachments(draftAttachments.filter((a) => a.id !== id));
  };

  // Mention Collaborator Insertion
  const handleInsertMention = (userName: string) => {
    setDescription((prev) => `${prev} @${userName} `);
    setShowMentionPanel(false);
    setMentionSearch('');
  };

  // Template Selection Handler
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const tmpl = taskTemplates.find((t) => t.id === templateId);
    if (!tmpl) return;

    setTitle(tmpl.title);
    if (tmpl.description) setDescription(tmpl.description);
    setPriority(tmpl.defaultPriority);
    if (tmpl.estimatedHours) setEstimatedHours(tmpl.estimatedHours);
    if (tmpl.requireCompletionSummary) setRequireCompletionSummary(true);

    if (tmpl.checklistItems && tmpl.checklistItems.length > 0) {
      setChecklistItems(
        tmpl.checklistItems.map((itemText, idx) => ({
          id: `chk-${Date.now()}-${idx}`,
          text: itemText,
          completed: false,
        }))
      );
    }

    if (tmpl.tags && tmpl.tags.length > 0) {
      setTags(tmpl.tags);
    }

    if (tmpl.recurrenceRule) {
      setRecurrenceFrequency(tmpl.recurrenceRule.frequency as any);
      if (tmpl.recurrenceRule.monthDay) setRecurrenceMonthDay(tmpl.recurrenceRule.monthDay);
      if (tmpl.recurrenceRule.generateDaysAhead) setRecurrenceGenerateDaysAhead(tmpl.recurrenceRule.generateDaysAhead);
    }
  };

  // AI Prompt Result Handler
  const handleApplyAiResult = (result: ParsedTaskAiResult) => {
    setTitle(result.title);
    setDescription(result.description);
    setPriority(result.priority);
    setEstimatedHours(result.estimatedHours);
    if (result.checklistItems && result.checklistItems.length > 0) {
      setChecklistItems(
        result.checklistItems.map((itemText, idx) => ({
          id: `chk-ai-${Date.now()}-${idx}`,
          text: itemText,
          completed: false,
        }))
      );
    }
    if (result.tags && result.tags.length > 0) {
      setTags(result.tags);
    }
    if (result.isRecurrent && result.recurrenceRule) {
      setRecurrenceFrequency(result.recurrenceRule.frequency as any);
      if (result.recurrenceRule.monthDay) setRecurrenceMonthDay(result.recurrenceRule.monthDay);
    }
  };

  // Save Current Form as Template Handler
  const handleSaveAsTemplate = () => {
    if (!title.trim()) {
      alert('⚠️ Informe um título para salvar o modelo de tarefa.');
      return;
    }

    addTaskTemplate({
      title: title.trim(),
      description: description.trim(),
      defaultPriority: priority,
      defaultSlaHours: priority === 'urgent' ? 24 : priority === 'high' ? 48 : 72,
      estimatedHours,
      checklistItems: checklistItems.map((c) => c.text),
      tags,
      recurrenceRule: recurrenceFrequency !== 'none' ? {
        frequency: recurrenceFrequency,
        monthDay: recurrenceMonthDay,
        generateDaysAhead: recurrenceGenerateDaysAhead,
        summaryLabel: `🔄 Repete ${recurrenceFrequency} todo dia ${recurrenceMonthDay}`,
      } : undefined,
      businessUnitId: buId || activeBUId,
      createdByUserId: currentUser.id,
    });

    alert(`✅ Modelo "${title}" salvo com sucesso!`);
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('⚠️ O título da tarefa é obrigatório.');
      return;
    }

    const fullDueDate = `${dueDateOnly}T${dueTimeOnly}:00`;

    const newTaskData = {
      businessUnitId: buId || activeBUId,
      title: title.trim(),
      description: description.trim(),
      creatorId: currentUser.id,
      ownerUserId,
      assignedUserId,
      status,
      priority,
      dueDate: fullDueDate,
      deadlineLabel: `${dueDateOnly.split('-').reverse().join('/')} às ${dueTimeOnly}`,
      requireCompletionSummary,
      confirmedInternal,
      projectId: projectId || undefined,
      projectName: boundProject?.name || undefined,
      clientId: companyId || undefined,
      companyName: boundCompany?.tradeName || undefined,
      contactId: contactId || undefined,
      dealId: dealId || undefined,
      parentTaskId: parentTaskId || undefined,
      participantIds: Array.from(new Set([assignedUserId, ...participantIds])),
      observerIds: Array.from(new Set([ownerUserId, ...observerIds])),
      checklist: checklistItems,
      attachments: draftAttachments.map((a) => ({
        id: a.id,
        name: a.name,
        sizeBytes: a.sizeBytes,
        fileUrl: a.fileUrl,
        uploadedByUserId: currentUser.id,
        uploadedAt: new Date().toISOString(),
      })),
      estimatedHours,
      recurrence: recurrenceFrequency,
      recurrenceRule: recurrenceFrequency !== 'none' ? {
        frequency: recurrenceFrequency,
        monthDay: recurrenceMonthDay,
        generateDaysAhead: recurrenceGenerateDaysAhead,
        summaryLabel: `🔄 Repete ${recurrenceFrequency} todo dia ${recurrenceMonthDay}`,
      } : undefined,
      tags,
    };

    // Save via context
    addTask(newTaskData as any);

    closeTaskCreate();

    // Direct Seamless Transition: open Task Operational Drawer immediately
    setTimeout(() => {
      const latestTask = tasks.find((t) => t.title === title.trim()) || tasks[0];
      if (latestTask) {
        setSelectedTaskId(latestTask.id);
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans select-none">
      <div
        className="w-full max-w-[96vw] max-h-[95vh] h-[95vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-[#ECF8F1] via-white to-[#ECF8F1] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F8A4B] text-white flex items-center justify-center border border-[#0F8A4B]/30 shadow-md">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black px-2 py-0.5 rounded bg-[#0F8A4B] text-white font-mono uppercase">
                  Tasks Core 2.0
                </span>
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  Task Create Workspace — Ficha Canônica de Tarefa
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold mt-0.5 flex-wrap">
                <span>Unidade: <strong className="text-slate-900">{currentBU.tradeName || currentBU.name}</strong></span>
                
                {boundProject && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.2 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      📁 Projeto: {boundProject.name}
                    </span>
                  </>
                )}

                {boundCompany && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.2 rounded bg-emerald-50 text-[#0F8A4B] font-bold border border-emerald-200">
                      🏢 Cliente: {boundCompany.tradeName}
                    </span>
                  </>
                )}

                {boundDeal && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.2 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                      💼 Negócio: {boundDeal.title}
                    </span>
                  </>
                )}

                {boundParentTask && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.2 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                      🔗 Subtarefa de: {boundParentTask.protocolNumber || boundParentTask.title}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeTaskCreate}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body (2-Column Desktop Layout) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start text-xs">
          
          {/* LEFT COLUMN (65% / lg:col-span-7) — CONFIGURAÇÃO E DADOS DA TAREFA */}
          <div className="lg:col-span-7 space-y-4">

            {/* PAINEL DE MODELO DE TAREFA & GERADOR DE IA */}
            <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl border border-slate-700 text-white flex flex-wrap items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#0F8A4B] rounded-xl text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-tight">Modelo Padrão & Gerador com IA</h4>
                  <p className="text-[10px] text-slate-300 font-semibold">Carregue um modelo pré-definido ou crie via comando inteligente</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleSelectTemplate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl font-bold text-xs text-white outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="">📋 Selecionar Modelo Padrão...</option>
                  {taskTemplates.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.icon || '📋'} {tmpl.title} ({tmpl.category || 'Geral'})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  🤖 Criar com IA
                </button>

                <button
                  type="button"
                  onClick={handleSaveAsTemplate}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
                  title="Salvar campos atuais como modelo reusable"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  Salvar Modelo
                </button>
              </div>
            </div>
            
            {/* CAMPO 1: NOME DA TAREFA (EM DESTAQUE NO TOPO) */}
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>1. Nome da Tarefa (Obrigatório) *</span>
                <span className="text-[10px] text-slate-500 font-normal">Seja claro e específico</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Enviar documentação fiscal referente à competência 08/2026..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:border-[#0F8A4B] focus:ring-2 focus:ring-[#0F8A4B]/20 outline-none font-bold text-sm text-slate-900"
              />
            </div>

            {/* SEÇÃO RECORRÊNCIA DA TAREFA (CONFIGURAÇÃO VISUAL & CLARA) */}
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#0F8A4B]" />
                  <span>Configuração de Recorrência & Repetição Automatizada</span>
                </label>

                {recurrenceFrequency !== 'none' && (
                  <span className="px-2.5 py-1 bg-emerald-100 text-[#0F8A4B] font-extrabold text-[10px] rounded-lg border border-emerald-300">
                    🔄 RECORRÊNCIA ATIVA
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'none', label: 'Pontual (Sem Repetição)' },
                  { id: 'daily', label: 'Diária' },
                  { id: 'weekly', label: 'Semanal' },
                  { id: 'monthly', label: 'Mensal' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRecurrenceFrequency(item.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      recurrenceFrequency === item.id
                        ? 'bg-emerald-50 border-[#0F8A4B] text-[#0F8A4B] shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {recurrenceFrequency !== 'none' && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-800 text-[10px] uppercase">Dia de Vencimento do Mês</label>
                      <select
                        value={recurrenceMonthDay}
                        onChange={(e) => setRecurrenceMonthDay(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-bold text-slate-900 bg-slate-50"
                      >
                        {Array.from({ length: 31 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Dia {i + 1} do mês
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-800 text-[10px] uppercase">Gerar com Antecedência</label>
                      <select
                        value={recurrenceGenerateDaysAhead}
                        onChange={(e) => setRecurrenceGenerateDaysAhead(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-bold text-slate-900 bg-slate-50"
                      >
                        <option value={1}>1 dia antes</option>
                        <option value={3}>3 dias antes</option>
                        <option value={5}>5 dias antes</option>
                        <option value={7}>7 dias antes</option>
                        <option value={10}>10 dias antes</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold flex items-center justify-between">
                    <span>Resumo: 🔄 Repete {recurrenceFrequency} todo dia {recurrenceMonthDay} com competência automática</span>
                    <span className="text-[10px] font-black text-[#0F8A4B] uppercase">Supervisor Worker Ativo</span>
                  </div>
                </div>
              )}
            </div>

            {/* CAMPO 2 & TOOLBAR: DESCRIÇÃO DETALHADA E RECURSOS */}
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  2. Descrição Operacional & Diretrizes
                </label>

                {/* Toolbar */}
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 text-slate-600">
                  <button
                    type="button"
                    onClick={() => setShowMentionPanel(!showMentionPanel)}
                    className="p-1.5 hover:bg-slate-100 rounded font-bold text-xs flex items-center gap-1 cursor-pointer"
                    title="Mencionar Colaborador"
                  >
                    <AtSign className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mencionar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const sampleName = prompt('Nome do arquivo para simulação de anexo:');
                      if (sampleName) {
                        setDraftAttachments([
                          ...draftAttachments,
                          { id: `att-${Date.now()}`, name: sampleName, sizeBytes: 1500000, fileUrl: '#' },
                        ]);
                      }
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded font-bold text-xs flex items-center gap-1 cursor-pointer"
                    title="Anexar Arquivo"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-[#0F8A4B]" />
                    <span>Anexar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDescription((prev) => `${prev}\n- [ ] Item pendente de validação`);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded font-bold text-xs flex items-center gap-1 cursor-pointer"
                    title="Inserir Checklist na Descrição"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                    <span>Checklist</span>
                  </button>
                </div>
              </div>

              {/* Mention Selector Panel Popup */}
              {showMentionPanel && (
                <div className="p-3 bg-white border border-blue-200 rounded-xl shadow-lg space-y-2 text-xs">
                  <span className="font-bold text-blue-900 block">Mencionar Colaborador na Tarefa:</span>
                  <input
                    type="text"
                    value={mentionSearch}
                    onChange={(e) => setMentionSearch(e.target.value)}
                    placeholder="Buscar colaborador..."
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                  />
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {users
                      .filter((u) => u.name.toLowerCase().includes(mentionSearch.toLowerCase()))
                      .map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleInsertMention(u.name)}
                          className="w-full text-left p-1.5 hover:bg-blue-50 rounded flex items-center gap-2 cursor-pointer"
                        >
                          <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                          <span className="font-bold text-slate-800">{u.name}</span>
                          <span className="text-[10px] text-slate-400">({u.jobTitle})</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhamento operacional da demanda, orientações de entrega, links relevantes ou observações..."
                className="w-full p-3 border border-slate-300 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs resize-y"
              />

              {/* Attachments Draft List */}
              {draftAttachments.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Anexos em Rascunho ({draftAttachments.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {draftAttachments.map((att) => (
                      <div key={att.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2 text-xs">
                        <Paperclip className="w-3.5 h-3.5 text-[#0F8A4B]" />
                        <span className="font-bold text-slate-800">{att.name}</span>
                        <span className="text-[10px] text-slate-400">({(att.sizeBytes / 1024 / 1024).toFixed(1)} MB)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDraftAttachment(att.id)}
                          className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SEÇÃO 3: PROPRIETÁRIO (GOVERNANÇA) VS RESPONSÁVEL (EXECUÇÃO) */}
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/80 pb-2">
                <ShieldCheck className="w-4 h-4 text-[#0F8A4B]" />
                3. Governança: Proprietário & Responsável Executor
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Proprietario */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Proprietário da Tarefa (Acompanhamento) *
                  </label>
                  <select
                    value={ownerUserId}
                    onChange={(e) => setOwnerUserId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs focus:border-[#0F8A4B]"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        👤 {u.name} ({u.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Responsavel */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Responsável Executor (Execução) *
                  </label>
                  <select
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs text-[#0F8A4B] focus:border-[#0F8A4B]"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        ⚡ {u.name} ({u.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: PRAZO COM DATA, HORA E ATALHOS */}
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#0F8A4B]" />
                  4. Planejamento Temporal & Prazo de Entrega
                </h3>

                {/* Date Shortcuts */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleShortcutDate('today')}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShortcutDate('tomorrow')}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    Amanhã
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShortcutDate('end_week')}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    Fim da Semana
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShortcutDate('one_week')}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    1 Semana
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Data Limite *</label>
                  <input
                    type="date"
                    required
                    value={dueDateOnly}
                    onChange={(e) => setDueDateOnly(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs focus:border-[#0F8A4B]"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Horário Limite *</label>
                  <input
                    type="time"
                    required
                    value={dueTimeOnly}
                    onChange={(e) => setDueTimeOnly(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs focus:border-[#0F8A4B]"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Prioridade *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs focus:border-[#0F8A4B]"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">🔴 Urgente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SEÇÃO 5: CHECKLIST DE VERIFICAÇÃO */}
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#0F8A4B]" />
                  5. Lista de Verificação (Checklist de Execução)
                </h3>
                <span className="text-[10px] font-bold text-slate-500">
                  {checklistItems.filter((i) => i.completed).length}/{checklistItems.length} Itens
                </span>
              </div>

              {/* Add item input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  placeholder="Digitar item para o checklist e pressionar Enter..."
                  className="flex-1 p-2 border border-slate-300 rounded-xl bg-white text-xs outline-none font-semibold focus:border-[#0F8A4B]"
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="px-3 py-2 bg-[#0F8A4B] text-white rounded-xl text-xs font-bold hover:bg-[#0B6B3A] cursor-pointer"
                >
                  + Adicionar
                </button>
              </div>

              {/* Items list */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklistItem(item.id)}
                        className="rounded accent-[#0F8A4B] w-4 h-4"
                      />
                      <span className={item.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-bold'}>
                        {item.text}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SEÇÃO 6: VÍNCULOS DE CRM, PROJETO E HIERARQUIA */}
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/80 pb-2">
                <Building2 className="w-4 h-4 text-[#0F8A4B]" />
                6. Vínculo com CRM (Empresa / Cliente), Projeto e Subtarefas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Empresa CRM */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Empresa do Cliente (CRM) *</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs focus:border-[#0F8A4B]"
                  >
                    <option value="">-- Tarefa Interna (Sem Cliente Vínculo) --</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        🏢 {c.tradeName} ({c.cnpj})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Projeto */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Projeto Vinculado</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs focus:border-[#0F8A4B]"
                  >
                    <option value="">-- Nenhum Projeto (Demanda Avulsa) --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        📁 {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Negocio */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Negócio / Oportunidade CRM</label>
                  <select
                    value={dealId}
                    onChange={(e) => setDealId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs focus:border-[#0F8A4B]"
                  >
                    <option value="">-- Nenhum Negócio Vinculado --</option>
                    {deals.map((d) => (
                      <option key={d.id} value={d.id}>
                        💼 {d.title} (R$ {d.value.toLocaleString('pt-BR')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tarefa Pai */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Esta é uma Subtarefa de:</label>
                  <select
                    value={parentTaskId}
                    onChange={(e) => setParentTaskId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs focus:border-[#0F8A4B]"
                  >
                    <option value="">-- Tarefa Principal Independente --</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        🔗 [{t.protocolNumber || t.id}] {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SEÇÃO 7: TRAVAS DE GOVERNANÇA */}
            <div className="bg-[#ECF8F1] p-4 rounded-2xl border border-[#0F8A4B]/30 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#0B6B3A]">
                <input
                  type="checkbox"
                  checked={requireCompletionSummary}
                  onChange={(e) => setRequireCompletionSummary(e.target.checked)}
                  className="rounded accent-[#0F8A4B] w-4 h-4 cursor-pointer"
                />
                <span>Exigir Resumo Final de Conclusão antes de encerrar esta tarefa (PRD GOV-08)</span>
              </label>
              <p className="text-[11px] text-[#0B6B3A]/80 pl-6">
                Quando ativado, o colaborador não conseguirá marcar a tarefa como concluída sem escrever o relatório do que foi realizado.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN (35% / lg:col-span-5) — CENTRAL DE COMUNICAÇÃO & TIMELINE PREVIEW */}
          <div className="lg:col-span-5 space-y-4 sticky top-0">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Central de Comunicação da Tarefa
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">Timeline, comentários e auditoria em tempo real</p>
                </div>
              </div>

              {/* Informative Preview Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900">Comunicação Habilitada Pós-Salvamento</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Assim que você salvar esta tarefa, a tela de trabalho operacional será aberta com o protocolo oficial **VRG-2026-XXXXXX**, permitindo registrar comentários, iniciar o cronômetro e enviar e-mails.
                  </p>
                </div>
              </div>

              {/* Context Summary Card */}
              <div className="p-4 bg-[#ECF8F1]/60 rounded-xl border border-[#0F8A4B]/20 space-y-2 text-xs">
                <span className="font-black text-[#0B6B3A] uppercase tracking-wider block text-[10px]">
                  Resumo do Registro Canônico
                </span>
                <div className="space-y-1 text-slate-700">
                  <p>• Empresa da BU: <strong>{currentBU.tradeName}</strong></p>
                  <p>• Proprietário: <strong>{users.find((u) => u.id === ownerUserId)?.name}</strong></p>
                  <p>• Responsável Executor: <strong className="text-[#0F8A4B]">{users.find((u) => u.id === assignedUserId)?.name}</strong></p>
                  <p>• Prazo: <strong>{dueDateOnly.split('-').reverse().join('/')} às {dueTimeOnly}</strong></p>
                  <p>• Prioridade: <strong className="uppercase">{priority}</strong></p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Bar (Fixed) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <button
            type="button"
            onClick={closeTaskCreate}
            className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors flex items-center gap-2"
          >
            <span>Salvar Tarefa (Tasks Core 2.0)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isAiModalOpen && (
        <TaskAiAssistantModal
          onClose={() => setIsAiModalOpen(false)}
          onApplyToForm={handleApplyAiResult}
        />
      )}
    </div>
  );
};
