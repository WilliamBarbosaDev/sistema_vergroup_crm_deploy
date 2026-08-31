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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { TaskOperationalDrawer } from './TaskOperationalDrawer';
import { TaskTemplateModal } from './TaskTemplateModal';
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
    toggleTaskStatus,
    toggleTaskTimer,
    deleteTask,
  } = useApp();

  const filteredTasks = filterByBU(tasks);
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'deadline' | 'planner' | 'calendar' | 'gantt'>('list');
  const [activeTabFilter, setActiveTabFilter] = useState<'in_progress' | 'created_by_me' | 'watching' | 'overdue' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedTaskDrawerId, setSelectedTaskDrawerId] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

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

  // Filter Tasks
  const displayedTasks = filteredTasks.filter((t) => {
    if (activeTabFilter === 'in_progress' && t.status !== 'in_progress' && !t.isTimerRunning) return false;
    if (activeTabFilter === 'created_by_me' && t.creatorId !== currentUser.id) return false;
    if (activeTabFilter === 'watching' && !(t.observerIds || []).includes(currentUser.id)) return false;
    if (activeTabFilter === 'overdue' && (new Date(t.dueDate) >= new Date() || t.status === 'completed')) return false;

    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (selectedAssignee !== 'all' && t.assignedUserId !== selectedAssignee) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.projectName && t.projectName.toLowerCase().includes(q))
      );
    }
    return true;
  });

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

  // Groupings for Deadline View
  const overdueTasks = displayedTasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== 'completed');
  const todayTasks = displayedTasks.filter((t) => new Date(t.dueDate).toDateString() === new Date().toDateString());
  const futureTasks = displayedTasks.filter((t) => new Date(t.dueDate) > new Date() && new Date(t.dueDate).toDateString() !== new Date().toDateString());

  return (
    <div id="tasks-view" className="p-4 md:p-6 max-w-full space-y-4 font-sans select-none">
      
      {/* 1. TOP SUB-HEADER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#ECF8F1] text-[#0F8A4B] rounded-xl shadow-2xs">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">Central Operacional de Execução (Work)</h1>
              <span className="text-xs font-extrabold px-2.5 py-0.5 bg-[#ECF8F1] border border-[#0F8A4B]/30 text-[#0F8A4B] rounded-full">
                {displayedTasks.length} demandas
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Gestão de prazos, SLA corporativo, subtarefas, apontamento de tempo e VER AI Copilot
            </p>
          </div>
        </div>

        {/* View Selector & Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Tabs
            tabs={[
              { id: 'list', label: 'Lista' },
              { id: 'kanban', label: 'Kanban' },
              { id: 'deadline', label: 'Prazo' },
              { id: 'planner', label: 'Planejador' },
              { id: 'calendar', label: 'Calendário' },
              { id: 'gantt', label: 'Gantt' },
            ]}
            activeTab={viewMode}
            onTabChange={(id) => setViewMode(id as any)}
          />

          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-extrabold border border-slate-200 shadow-2xs cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#0F8A4B]" />
            <span>Por Modelo</span>
          </button>

          <button
            onClick={() => setQuickCreateType('task')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* 2. FILTERS BAR & SEARCH */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'TODAS', count: filteredTasks.length },
            { id: 'in_progress', label: 'EM ANDAMENTO', count: filteredTasks.filter((t) => t.status === 'in_progress' || t.isTimerRunning).length },
            { id: 'overdue', label: 'ATRASADAS', count: filteredTasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== 'completed').length },
            { id: 'created_by_me', label: 'CRIADAS POR MIM', count: filteredTasks.filter((t) => t.creatorId === currentUser.id).length },
            { id: 'watching', label: 'ACOMPANHANDO', count: filteredTasks.filter((t) => t.observerIds?.includes(currentUser.id)).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTabFilter === tab.id
                  ? 'bg-[#0F8A4B] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 font-bold">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {viewMode === 'list' && (
            <button
              onClick={() => setIsColumnConfigOpen(!isColumnConfigOpen)}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Configurar Colunas"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#0F8A4B]" />
              <span>Colunas</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por título, projeto, cliente..."
              className="w-full bg-transparent outline-none text-xs text-slate-900 font-semibold placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* 3. VIEW: LIST OPERACIONAL */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Tarefa</th>
                  {visibleColumns.client && <th className="p-3">Cliente</th>}
                  {visibleColumns.project && <th className="p-3">Projeto</th>}
                  {visibleColumns.assignee && <th className="p-3">Responsável</th>}
                  {visibleColumns.dueDate && <th className="p-3">Prazo</th>}
                  {visibleColumns.sla && <th className="p-3">SLA Status</th>}
                  {visibleColumns.priority && <th className="p-3">Prioridade</th>}
                  {visibleColumns.timeSpent && <th className="p-3">Tempo AP.</th>}
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedTasks.map((t) => {
                  const assignee = users.find((u) => u.id === t.assignedUserId);
                  const company = companies.find((c) => c.id === t.clientId);
                  const project = projects.find((p) => p.id === t.projectId);
                  const isDone = t.status === 'completed';
                  const isOverdue = new Date(t.dueDate) < new Date() && !isDone;

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTaskDrawerId(t.id)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        t.isTimerRunning ? 'bg-emerald-50/60' : ''
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleTaskStatus(t.id)}
                          className="w-4 h-4 text-[#0F8A4B] rounded border-slate-300 cursor-pointer accent-[#0F8A4B]"
                        />
                      </td>

                      <td className="p-3">
                        <div className="space-y-0.5">
                          <strong className={`block text-xs font-black ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {t.title}
                          </strong>
                          {t.checklist && t.checklist.length > 0 && (
                            <span className="text-[10px] text-slate-500 font-bold block">
                              ✓ {t.checklist.filter((i) => i.completed).length}/{t.checklist.length} itens concluídos
                            </span>
                          )}
                        </div>
                      </td>

                      {visibleColumns.client && (
                        <td className="p-3 font-semibold text-slate-800">
                          {company?.name || t.companyName || '—'}
                        </td>
                      )}

                      {visibleColumns.project && (
                        <td className="p-3 font-semibold text-slate-800">
                          {project?.name || t.projectName || '—'}
                        </td>
                      )}

                      {visibleColumns.assignee && (
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {assignee && <img src={assignee.avatar} alt={assignee.name} className="w-5 h-5 rounded-full object-cover" />}
                            <span className="font-bold text-slate-900">{assignee?.name}</span>
                          </div>
                        </td>
                      )}

                      {visibleColumns.dueDate && (
                        <td className="p-3 font-bold text-slate-900">
                          {t.deadlineLabel || new Date(t.dueDate).toLocaleDateString('pt-BR')}
                        </td>
                      )}

                      {visibleColumns.sla && (
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isDone
                              ? 'bg-slate-100 text-slate-600'
                              : isOverdue
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {isDone ? 'Concluído' : isOverdue ? 'Violado' : 'No SLA'}
                          </span>
                        </td>
                      )}

                      {visibleColumns.priority && <td className="p-3">{getPriorityBadge(t.priority)}</td>}

                      {visibleColumns.timeSpent && (
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {formatTimer(t.timerSeconds)}
                        </td>
                      )}

                      <td className="p-3 text-right">
                        <button className="text-xs font-black text-[#0F8A4B] hover:underline cursor-pointer">
                          Abrir Ficha
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

      {/* 4. VIEW: KANBAN */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[600px]">
          {[
            { id: 'pending', name: 'Pendentes' },
            { id: 'in_progress', name: 'Em Andamento' },
            { id: 'review', name: 'Em Revisão' },
            { id: 'completed', name: 'Concluídas' },
          ].map((col) => {
            const colTasks = displayedTasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="w-76 shrink-0 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col p-3 space-y-3">
                <div className="flex items-center justify-between font-black text-xs text-slate-900 uppercase">
                  <span>{col.name}</span>
                  <span className="px-2 py-0.5 bg-white rounded-full text-slate-700 shadow-2xs">{colTasks.length}</span>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 max-h-[70vh]">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskDrawerId(t.id)}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-[#0F8A4B] shadow-2xs transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                          {t.projectName || 'Geral'}
                        </span>
                        {getPriorityBadge(t.priority)}
                      </div>
                      <h4 className="text-xs font-black text-slate-900 leading-snug">{t.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. VIEW: PRAZO (AGRUPADO POR ATRASE, HOJE, FUTURO) */}
      {viewMode === 'deadline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 space-y-3">
            <h3 className="text-xs font-black text-rose-700 uppercase tracking-wider">Atrasadas ({overdueTasks.length})</h3>
            <div className="space-y-2">
              {overdueTasks.map((t) => (
                <div key={t.id} onClick={() => setSelectedTaskDrawerId(t.id)} className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs cursor-pointer">
                  <strong className="text-xs font-bold text-slate-900 block">{t.title}</strong>
                  <span className="text-[10px] font-bold text-rose-600 block mt-1">Venceu em: {t.dueDate}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
            <h3 className="text-xs font-black text-amber-800 uppercase tracking-wider">Vencem Hoje ({todayTasks.length})</h3>
            <div className="space-y-2">
              {todayTasks.map((t) => (
                <div key={t.id} onClick={() => setSelectedTaskDrawerId(t.id)} className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs cursor-pointer">
                  <strong className="text-xs font-bold text-slate-900 block">{t.title}</strong>
                  <span className="text-[10px] font-bold text-amber-700 block mt-1">Prazo final: Hoje</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3">
            <h3 className="text-xs font-black text-[#0F8A4B] uppercase tracking-wider">Próximos Dias ({futureTasks.length})</h3>
            <div className="space-y-2">
              {futureTasks.map((t) => (
                <div key={t.id} onClick={() => setSelectedTaskDrawerId(t.id)} className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs cursor-pointer">
                  <strong className="text-xs font-bold text-slate-900 block">{t.title}</strong>
                  <span className="text-[10px] font-bold text-emerald-700 block mt-1">Vencimento: {t.dueDate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAIS E DRAWER DA FICHA OPERACIONAL */}
      {selectedTaskDrawerId && (
        <TaskOperationalDrawer
          taskId={selectedTaskDrawerId}
          onClose={() => setSelectedTaskDrawerId(null)}
        />
      )}

      {isTemplateModalOpen && (
        <TaskTemplateModal
          onClose={() => setIsTemplateModalOpen(false)}
        />
      )}

    </div>
  );
};
