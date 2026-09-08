import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  MessageSquare,
  Tag,
  Calendar as CalendarIcon,
  Layers,
  Send,
  ChevronRight,
  Sparkles,
  Users,
  Timer,
  AlertCircle,
  Eye,
  Check,
  X,
  Trash2,
  Edit3,
  ListTodo,
  FileText,
  SlidersHorizontal,
  Bookmark,
  Building2,
  FolderKanban,
  Zap,
  RotateCcw,
  Archive,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { TaskOperationalDrawer } from './TaskOperationalDrawer';
import { TaskTemplateModal } from './TaskTemplateModal';
import { TaskAiAssistantModal } from './TaskAiAssistantModal';
import { Tabs } from '../ui/vercel-tabs';

export const TasksView: React.FC = () => {
  const {
    tasks,
    projects,
    companies,
    users,
    currentUser,
    filterByBU,
    setQuickCreateType,
    openTaskCreate,
    toggleTaskStatus,
    toggleTaskTimer,
    deleteTask,
    runCrmQualityAudit,
    runSlaTeamRisksAudit,
    runSlaSupervisorAudit,
    jobExecutionLogs,
  } = useApp();

  const filteredTasks = filterByBU(tasks);
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'deadline' | 'planner' | 'calendar' | 'gantt'>('list');
  const [activeTabFilter, setActiveTabFilter] = useState<'in_progress' | 'created_by_me' | 'watching' | 'overdue' | 'completed' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [contextFilter, setContextFilter] = useState<'all' | 'client' | 'internal' | 'no_crm'>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedTaskDrawerId, setSelectedTaskDrawerId] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showTeamRisksModal, setShowTeamRisksModal] = useState(false);

  // ADVANCED FILTER STATE (ESTILO BITRIX24)
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'all' | 'assignee' | 'owner' | 'participant' | 'observer'>('all');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('all');
  const [selectedObserverId, setSelectedObserverId] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [selectedDueDateRange, setSelectedDueDateRange] = useState<'all' | 'today' | 'tomorrow' | 'this_week' | 'overdue'>('all');
  const [selectedSlaState, setSelectedSlaState] = useState<'all' | 'normal' | 'attention' | 'risk' | 'critical' | 'breached'>('all');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Column Configuration state for List view
  const [visibleColumns, setVisibleColumns] = useState({
    client: true,
    project: true,
    assignee: true,
    creator: true,
    dueDate: true,
    sla: true,
    status: true,
    priority: true,
    timeSpent: true,
  });
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);

  // Advanced Filtering Execution Logic with Visual Archiving for Completed Tasks
  const displayedTasks = filteredTasks.filter((t) => {
    // Protocol or direct search term override (allows finding completed tasks by protocol search)
    const isDirectProtocolMatch = Boolean(
      searchTerm.trim() && t.protocolNumber?.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    // VISUAL ARCHIVING RULE: By default, completed tasks do NOT appear in active view
    if (
      t.status === 'completed' &&
      activeTabFilter !== 'completed' &&
      !selectedStatuses.includes('completed') &&
      !isDirectProtocolMatch
    ) {
      return false;
    }

    // Top Tabs Quick Filters
    if (activeTabFilter === 'in_progress' && t.status !== 'in_progress' && !t.isTimerRunning) return false;
    if (activeTabFilter === 'created_by_me' && t.creatorId !== currentUser.id) return false;
    if (activeTabFilter === 'watching' && !(t.observerIds || []).includes(currentUser.id)) return false;
    if (activeTabFilter === 'overdue' && (new Date(t.dueDate) >= new Date() || t.status === 'completed')) return false;
    if (activeTabFilter === 'completed' && t.status !== 'completed') return false;

    // Context Filters (CRM vs Internal)
    const hasCrm = Boolean(t.clientId || t.contactId || t.dealId);
    if (contextFilter === 'client' && !hasCrm && t.taskContext !== 'client') return false;
    if (contextFilter === 'internal' && (hasCrm || t.taskContext === 'client')) return false;
    if (contextFilter === 'no_crm' && hasCrm) return false;

    // Priority & Basic Selectors
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (selectedAssignee !== 'all' && t.assignedUserId !== selectedAssignee) return false;

    // Advanced Bitrix24 Filters
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(t.status)) return false;
    if (selectedRole === 'assignee' && t.assignedUserId !== currentUser.id) return false;
    if (selectedRole === 'owner' && t.ownerUserId !== currentUser.id && t.creatorId !== currentUser.id) return false;
    if (selectedRole === 'participant' && !(t.participantIds || []).includes(currentUser.id)) return false;
    if (selectedRole === 'observer' && !(t.observerIds || []).includes(currentUser.id)) return false;

    if (selectedParticipantId !== 'all' && !(t.participantIds || []).includes(selectedParticipantId)) return false;
    if (selectedObserverId !== 'all' && !(t.observerIds || []).includes(selectedObserverId)) return false;
    if (selectedProjectId !== 'all' && t.projectId !== selectedProjectId) return false;
    if (selectedCompanyId !== 'all' && t.clientId !== selectedCompanyId) return false;
    if (selectedSlaState !== 'all' && t.slaState !== selectedSlaState) return false;

    // Due Date Range Filter
    if (selectedDueDateRange === 'today') {
      if (new Date(t.dueDate).toDateString() !== new Date().toDateString()) return false;
    } else if (selectedDueDateRange === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (new Date(t.dueDate).toDateString() !== tomorrow.toDateString()) return false;
    } else if (selectedDueDateRange === 'this_week') {
      const weekDiff = Math.abs(new Date(t.dueDate).getTime() - Date.now()) / (1000 * 3600 * 24);
      if (weekDiff > 7) return false;
    } else if (selectedDueDateRange === 'overdue') {
      if (new Date(t.dueDate) >= new Date() || t.status === 'completed') return false;
    }

    // Text Search Filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.protocolNumber && t.protocolNumber.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.projectName && t.projectName.toLowerCase().includes(q)) ||
        (t.companyName && t.companyName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleResetAdvancedFilters = () => {
    setSelectedRole('all');
    setSelectedAssignee('all');
    setSelectedParticipantId('all');
    setSelectedObserverId('all');
    setSelectedProjectId('all');
    setSelectedCompanyId('all');
    setSelectedDueDateRange('all');
    setSelectedSlaState('all');
    setSelectedStatuses([]);
    setSelectedPriority('all');
    setContextFilter('all');
    setSearchTerm('');
    setActivePreset(null);
    setActiveTabFilter('all');
  };

  const handleApplyPreset = (presetKey: string) => {
    handleResetAdvancedFilters();
    setActivePreset(presetKey);

    switch (presetKey) {
      case 'in_progress':
        setSelectedStatuses(['in_progress']);
        break;
      case 'my_assigned':
        setSelectedRole('assignee');
        break;
      case 'my_owner':
        setSelectedRole('owner');
        break;
      case 'completed':
        setActiveTabFilter('completed');
        setSelectedStatuses(['completed']);
        break;
      case 'overdue':
        setSelectedDueDateRange('overdue');
        break;
      case 'crm_clients':
        setContextFilter('client');
        break;
      case 'no_crm':
        setContextFilter('no_crm');
        break;
      case 'sla_risk':
        setSelectedSlaState('risk');
        break;
    }
  };

  const activeFilterCount =
    (selectedAssignee !== 'all' ? 1 : 0) +
    (selectedRole !== 'all' ? 1 : 0) +
    (selectedParticipantId !== 'all' ? 1 : 0) +
    (selectedObserverId !== 'all' ? 1 : 0) +
    (selectedProjectId !== 'all' ? 1 : 0) +
    (selectedCompanyId !== 'all' ? 1 : 0) +
    (selectedDueDateRange !== 'all' ? 1 : 0) +
    (selectedSlaState !== 'all' ? 1 : 0) +
    (contextFilter !== 'all' ? 1 : 0) +
    (activeTabFilter !== 'all' ? 1 : 0) +
    selectedStatuses.length;

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[11px] font-bold border border-rose-200">Urgente</span>;
      case 'high':
        return <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-300">Alta</span>;
      case 'medium':
        return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-bold border border-blue-200">Média</span>;
      case 'low':
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">Baixa</span>;
    }
  };

  const formatTimer = (seconds?: number) => {
    const total = seconds || 0;
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div id="tasks-view" className="p-4 md:p-6 max-w-full space-y-4 font-sans select-none">
      
      {/* 1. TOP SUB-HEADER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F8A4B] text-white flex items-center justify-center font-black text-sm shadow-md">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Central Operacional de Execução (Work)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-[#0B6B3A] font-bold">
                {displayedTasks.length} demandas
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Gestão de prazos, SLA corporativo, arquivamento visual de concluídas e apontamento de tempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Tabs
            tabs={[
              { id: 'list', label: 'Lista' },
              { id: 'kanban', label: 'Kanban' },
              { id: 'deadline', label: 'Prazos' },
              { id: 'planner', label: 'Planejador' },
            ]}
            activeTab={viewMode}
            onTabChange={(id) => setViewMode(id as any)}
          />

          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-extrabold border border-slate-200 shadow-2xs cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#0F8A4B]" />
            <span>📋 Modelos & Recorrência</span>
          </button>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all border border-slate-700"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>🤖 Criar com IA</span>
          </button>

          <button
            onClick={() => setShowTeamRisksModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#0F493A] to-[#13604C] hover:from-[#13604C] hover:to-[#0F493A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all border border-[#197960]/50"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>⚡ VER AI — Riscos</span>
          </button>

          <button
            onClick={() => openTaskCreate()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* 2. FILTERS BAR & SEARCH COM PRESETS E ARQUIVAMENTO VISUAL */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 space-y-3 font-sans shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Preset Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'OPERACIONAIS ATIVAS', count: filteredTasks.filter((t) => t.status !== 'completed').length },
              { id: 'in_progress', label: 'EM ANDAMENTO', count: filteredTasks.filter((t) => t.status === 'in_progress' || t.isTimerRunning).length },
              { id: 'overdue', label: 'ATRASADAS', count: filteredTasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== 'completed').length },
              { id: 'created_by_me', label: 'CRIADAS POR MIM', count: filteredTasks.filter((t) => t.creatorId === currentUser.id && t.status !== 'completed').length },
              { id: 'watching', label: 'ACOMPANHANDO', count: filteredTasks.filter((t) => t.observerIds?.includes(currentUser.id) && t.status !== 'completed').length },
              { id: 'completed', label: 'CONCLUÍDAS / ARQUIVADAS', count: filteredTasks.filter((t) => t.status === 'completed').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTabFilter(tab.id as any);
                  if (tab.id === 'completed') {
                    setSelectedStatuses(['completed']);
                  } else {
                    setSelectedStatuses([]);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTabFilter === tab.id
                    ? 'bg-[#ECF8F1] text-[#0B6B3A] font-black border border-[#0F8A4B]/40 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 font-bold'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800 font-mono font-bold">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {viewMode === 'list' && (
              <button
                onClick={() => setIsColumnConfigOpen(!isColumnConfigOpen)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                title="Configurar Colunas"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#0F8A4B]" />
                <span>Colunas</span>
              </button>
            )}

            {/* BOTÃO FILTROS AVANÇADOS BITRIX24 */}
            <button
              onClick={() => setIsAdvancedFilterOpen(true)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border ${
                activeFilterCount > 0
                  ? 'bg-[#0F8A4B] text-white border-[#0B6B3A] shadow-xs'
                  : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros Avançados</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-[#0F8A4B] rounded-full font-black text-[10px]">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* BUSCA POR PROTOCOLO E TEXTO */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por protocolo (VRG-...), título..."
                className="bg-transparent text-xs text-slate-900 focus:outline-none w-full font-semibold placeholder:text-slate-400"
              />
              {activeFilterCount > 0 && (
                <button onClick={handleResetAdvancedFilters} title="Limpar Filtros" className="p-0.5 text-slate-400 hover:text-rose-600 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ACTIVE FILTER CHIPS BAR */}
        {activeFilterCount > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 font-bold text-[11px]">Filtros Ativos ({activeFilterCount}):</span>
            
            {selectedAssignee !== 'all' && (
              <span className="px-2 py-0.5 bg-emerald-50 text-[#0F493A] rounded-lg border border-emerald-200 font-bold text-[11px] flex items-center gap-1">
                Executor: {users.find(u => u.id === selectedAssignee)?.name}
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setSelectedAssignee('all')} />
              </span>
            )}

            {selectedRole !== 'all' && (
              <span className="px-2 py-0.5 bg-emerald-50 text-[#0F493A] rounded-lg border border-emerald-200 font-bold text-[11px] flex items-center gap-1">
                Papel: {selectedRole}
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setSelectedRole('all')} />
              </span>
            )}

            {selectedProjectId !== 'all' && (
              <span className="px-2 py-0.5 bg-emerald-50 text-[#0F493A] rounded-lg border border-emerald-200 font-bold text-[11px] flex items-center gap-1">
                Projeto: {projects.find(p => p.id === selectedProjectId)?.name}
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setSelectedProjectId('all')} />
              </span>
            )}

            {selectedCompanyId !== 'all' && (
              <span className="px-2 py-0.5 bg-emerald-50 text-[#0F493A] rounded-lg border border-emerald-200 font-bold text-[11px] flex items-center gap-1">
                Cliente: {companies.find(c => c.id === selectedCompanyId)?.tradeName}
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setSelectedCompanyId('all')} />
              </span>
            )}

            {selectedSlaState !== 'all' && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 font-bold text-[11px] flex items-center gap-1">
                SLA: {selectedSlaState}
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setSelectedSlaState('all')} />
              </span>
            )}

            <button
              onClick={handleResetAdvancedFilters}
              className="text-rose-600 text-[11px] font-bold hover:underline cursor-pointer ml-auto"
            >
              Limpar Todos os Filtros
            </button>
          </div>
        )}
      </div>

      {/* 3. VIEW: LIST OPERACIONAL */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Protocolo & Tarefa</th>
                  {visibleColumns.client && <th className="p-3">Cliente / CRM</th>}
                  {visibleColumns.project && <th className="p-3">Projeto</th>}
                  {visibleColumns.assignee && <th className="p-3">Responsável</th>}
                  {visibleColumns.dueDate && <th className="p-3">Prazo</th>}
                  {visibleColumns.sla && <th className="p-3">SLA</th>}
                  {visibleColumns.status && <th className="p-3">Status</th>}
                  {visibleColumns.priority && <th className="p-3">Prioridade</th>}
                  {visibleColumns.timeSpent && <th className="p-3 text-right">Tempo</th>}
                  <th className="p-3 text-center w-20">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {displayedTasks.map((t, idx) => {
                  const assignee = users.find((u) => u.id === t.assignedUserId);
                  const isOverdue = new Date(t.dueDate) < new Date() && t.status !== 'completed';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      
                      {/* PROTOCOLO & TÍTULO */}
                      <td className="p-3">
                        <div
                          onClick={() => setSelectedTaskDrawerId(t.id)}
                          className="space-y-0.5 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {t.protocolNumber && (
                              <span className="font-mono text-[10px] font-black text-[#0F8A4B] bg-[#ECF8F1] px-2 py-0.5 rounded border border-[#0F8A4B]/20">
                                📋 {t.protocolNumber}
                              </span>
                            )}
                            <strong className={`font-extrabold group-hover:text-[#0F8A4B] transition-colors ${t.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {t.title}
                            </strong>
                          </div>
                        </div>
                      </td>

                      {visibleColumns.client && (
                        <td className="p-3 text-slate-600 font-medium">
                          {companies.find((c) => c.id === t.clientId)?.tradeName || 'Interna (Sem CRM)'}
                        </td>
                      )}

                      {visibleColumns.project && (
                        <td className="p-3 text-slate-600 font-medium">
                          {projects.find((p) => p.id === t.projectId)?.name || 'Sem Projeto'}
                        </td>
                      )}

                      {visibleColumns.assignee && (
                        <td className="p-3 font-semibold text-slate-700">
                          {assignee?.name || 'Não Atribuído'}
                        </td>
                      )}

                      {visibleColumns.dueDate && (
                        <td className="p-3 font-mono text-slate-600">
                          <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                            {t.dueDate}
                          </span>
                        </td>
                      )}

                      {visibleColumns.sla && (
                        <td className="p-3 font-bold">
                          <span className={`text-[10px] px-2 py-0.5 rounded ${
                            t.slaState === 'breached' ? 'bg-red-500 text-white' :
                            t.slaState === 'critical' ? 'bg-rose-100 text-rose-800' :
                            t.slaState === 'risk' ? 'bg-orange-100 text-orange-800' :
                            t.slaState === 'attention' ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {t.slaState || 'normal'}
                          </span>
                        </td>
                      )}

                      {visibleColumns.status && (
                        <td className="p-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                            t.status === 'completed' ? 'bg-emerald-100 text-[#0B6B3A]' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      )}

                      {visibleColumns.priority && (
                        <td className="p-3">{getPriorityBadge(t.priority)}</td>
                      )}

                      {visibleColumns.timeSpent && (
                        <td className="p-3 text-right font-mono font-bold text-slate-700">
                          {formatTimer(t.timerSeconds)}
                        </td>
                      )}

                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleTaskStatus(t.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            t.status === 'completed'
                              ? 'bg-emerald-50 text-[#0F8A4B] border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title={t.status === 'completed' ? 'Reabrir Tarefa' : 'Concluir Tarefa'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADVANCED BITRIX24 FILTER DRAWER */}
      {isAdvancedFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="p-5 bg-gradient-to-r from-[#0F493A] to-[#13604C] text-white flex items-center justify-between border-b border-[#13604C] shrink-0">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#FDFCE8]" />
                <h3 className="text-base font-black text-white">Filtros Avançados de Tarefas</h3>
              </div>
              <button onClick={() => setIsAdvancedFilterOpen(false)} className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50 text-xs">
              
              {/* Seletores de Pessoas */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">Pessoas e Papéis na Tarefa</h4>
                
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Executor Responsável:</label>
                  <select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none focus:border-[#0F8A4B]"
                  >
                    <option value="all">Todos os executores</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.jobTitle})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Participante:</label>
                  <select
                    value={selectedParticipantId}
                    onChange={(e) => setSelectedParticipantId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none focus:border-[#0F8A4B]"
                  >
                    <option value="all">Qualquer participante</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CRM & Projeto */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">Vínculo com CRM e Projetos</h4>
                
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Empresa / Cliente CRM:</label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none focus:border-[#0F8A4B]"
                  >
                    <option value="all">Todas as empresas</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.tradeName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Projeto Relacionado:</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none focus:border-[#0F8A4B]"
                  >
                    <option value="all">Todos os projetos</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <button
                onClick={handleResetAdvancedFilters}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100"
              >
                Limpar Filtros
              </button>
              <button
                onClick={() => setIsAdvancedFilterOpen(false)}
                className="px-5 py-2 bg-[#0F8A4B] text-white rounded-xl text-xs font-black"
              >
                Aplicar Filtros ({displayedTasks.length})
              </button>
            </div>

          </div>
        </div>
      )}

      {/* OPERATIONAL DRAWER */}
      {selectedTaskDrawerId && (
        <TaskOperationalDrawer
          taskId={selectedTaskDrawerId}
          onClose={() => setSelectedTaskDrawerId(null)}
        />
      )}

      {/* AI ASSISTANT MODAL */}
      {isAiModalOpen && (
        <TaskAiAssistantModal
          onClose={() => setIsAiModalOpen(false)}
        />
      )}

    </div>
  );
};
